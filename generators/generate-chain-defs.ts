'use strict';

import fs from 'node:fs';
import path from 'node:path';
import ts from 'typescript';

type HandlerMethod = {
    name: string;
    params: ts.ParameterDeclaration[];
    jsdoc: string | null;
};

const workspaceRoot = process.cwd();
const fieldsDir = path.join(workspaceRoot, 'lib', 'fields');

function walkDirRecursive(dir: string): string[] {
    const out: string[] = [];

    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            out.push(...walkDirRecursive(fullPath));
            continue;
        }
        out.push(fullPath);
    }

    return out;
}

function getChainFiles(): string[] {
    return walkDirRecursive(fieldsDir)
        .filter((filePath): boolean => filePath.endsWith('Chain.ts'))
        .filter((filePath): boolean => !filePath.endsWith('.generated.d.ts'));
}

function parseSourceFile(filePath: string): ts.SourceFile {
    const source = fs.readFileSync(filePath, 'utf8');
    return ts.createSourceFile(filePath, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
}

function findClassDeclaration(sourceFile: ts.SourceFile, className: string): ts.ClassDeclaration {
    for (const statement of sourceFile.statements) {
        if (!ts.isClassDeclaration(statement) || !statement.name) {
            continue;
        }
        if (statement.name.text === className) {
            return statement;
        }
    }

    throw new Error(`Class '${className}' not found in ${sourceFile.fileName}`);
}

function hasModifier(node: ts.Node, kind: ts.SyntaxKind): boolean {
    return !!node.modifiers?.some((modifier): boolean => modifier.kind === kind);
}

function getMethodJsDoc(sourceFile: ts.SourceFile, method: ts.MethodDeclaration): string | null {
    const docs = ts.getJSDocCommentsAndTags(method).filter(ts.isJSDoc);
    if (docs.length === 0) {
        return null;
    }

    const chunks = docs.map((doc): string => sourceFile.text.slice(doc.pos, doc.end).trim());
    return chunks.join('\n');
}

function getImportPathForIdentifier(sourceFile: ts.SourceFile, identifier: string): string | null {
    for (const statement of sourceFile.statements) {
        if (!ts.isImportDeclaration(statement)) {
            continue;
        }
        if (!statement.importClause || !statement.moduleSpecifier || !ts.isStringLiteral(statement.moduleSpecifier)) {
            continue;
        }

        const specifier = statement.moduleSpecifier.text;
        const namedBindings = statement.importClause.namedBindings;
        if (!namedBindings || !ts.isNamedImports(namedBindings)) {
            continue;
        }

        for (const namedImport of namedBindings.elements) {
            const localName = namedImport.name.text;
            const importedName = namedImport.propertyName?.text || localName;
            if (localName === identifier || importedName === identifier) {
                return specifier;
            }
        }
    }

    return null;
}

function resolveImportPath(sourceFilePath: string, importPath: string): string {
    const candidate = path.resolve(path.dirname(sourceFilePath), importPath);
    const ext = path.extname(candidate);

    if (ext) {
        return candidate;
    }

    const withTs = `${candidate}.ts`;
    if (fs.existsSync(withTs)) {
        return withTs;
    }

    const withJs = `${candidate}.js`;
    if (fs.existsSync(withJs)) {
        return withJs;
    }

    return candidate;
}

function isHandlerResultReturnType(method: ts.MethodDeclaration): boolean {
    if (!method.type) {
        return false;
    }

    const returnTypeText = method.type.getText();
    return /HandlerResult/.test(returnTypeText);
}

function collectOwnPublicHandlerMethods(filePath: string, className: string): {
    sourceFile: ts.SourceFile;
    classDecl: ts.ClassDeclaration;
    methods: HandlerMethod[];
} {
    const sourceFile = parseSourceFile(filePath);
    const classDecl = findClassDeclaration(sourceFile, className);

    const methods: HandlerMethod[] = [];

    for (const member of classDecl.members) {
        if (!ts.isMethodDeclaration(member)) {
            continue;
        }

        if (!member.name || !ts.isIdentifier(member.name)) {
            continue;
        }

        if (hasModifier(member, ts.SyntaxKind.StaticKeyword)) {
            continue;
        }

        if (hasModifier(member, ts.SyntaxKind.PrivateKeyword) || hasModifier(member, ts.SyntaxKind.ProtectedKeyword)) {
            continue;
        }

        if (!isHandlerResultReturnType(member)) {
            continue;
        }

        methods.push({
            name: member.name.text,
            params: [...member.parameters],
            jsdoc: getMethodJsDoc(sourceFile, member),
        });
    }

    return { sourceFile, classDecl, methods };
}

function collectHandlerMethodsWithInheritance(handlerPath: string, handlerClassName: string, seen = new Set<string>()): Map<string, HandlerMethod> {
    const cacheKey = `${handlerPath}::${handlerClassName}`;
    if (seen.has(cacheKey)) {
        return new Map();
    }
    seen.add(cacheKey);

    const { sourceFile, classDecl, methods } = collectOwnPublicHandlerMethods(handlerPath, handlerClassName);

    const out = new Map<string, HandlerMethod>();

    const heritage = classDecl.heritageClauses?.find((clause): boolean => clause.token === ts.SyntaxKind.ExtendsKeyword);
    const baseType = heritage?.types?.[0];
    if (baseType && ts.isIdentifier(baseType.expression)) {
        const baseClassName = baseType.expression.text;
        const importPath = getImportPathForIdentifier(sourceFile, baseClassName);
        if (importPath) {
            const basePath = resolveImportPath(handlerPath, importPath);
            if (fs.existsSync(basePath)) {
                const inherited = collectHandlerMethodsWithInheritance(basePath, baseClassName, seen);
                for (const [name, method] of inherited) {
                    out.set(name, method);
                }
            }
        }
    }

    for (const method of methods) {
        out.set(method.name, method);
    }

    return out;
}

function extractChainMethodNames(chainPath: string, chainClassName: string): Set<string> {
    const sourceFile = parseSourceFile(chainPath);
    const classDecl = findClassDeclaration(sourceFile, chainClassName);
    const names = new Set<string>();

    for (const member of classDecl.members) {
        if (!ts.isMethodDeclaration(member)) {
            continue;
        }
        if (!member.name || !ts.isIdentifier(member.name)) {
            continue;
        }
        names.add(member.name.text);
    }

    return names;
}

function getParamName(param: ts.ParameterDeclaration, index: number): string {
    if (ts.isIdentifier(param.name)) {
        return param.name.text;
    }
    return `arg${index + 1}`;
}

function normalizeJsDocForChain(jsdoc: string | null, chainClassName: string, valueParamName: string | null): string | null {
    if (!jsdoc) {
        return null;
    }

    const lines = jsdoc.split('\n');
    const filtered = lines.filter((line): boolean => {
        if (!valueParamName) {
            return true;
        }

        const trimmed = line.trim();
        return !new RegExp(`^\\*\\s*@param\\s+(?:\\{[^}]*\\}\\s+)?${valueParamName}\\b`).test(trimmed);
    });

    const rewritten = filtered
        .join('\n')
        .replace(/(@returns?\s*\{)\s*HandlerResult[^}]*\}/g, `$1${chainClassName}}`)
        .replace(/(@returns?\s+)HandlerResult\b[^\n]*/g, `$1${chainClassName}`);

    const meaningful = rewritten
        .replace(/\/\*\*|\*\//g, '')
        .split('\n')
        .map((line): string => line.replace(/^\s*\*\s?/, '').trim())
        .some((line): boolean => line.length > 0);

    return meaningful ? rewritten : null;
}

function generateDefinitionFile(chainPath: string): { outputPath: string; generatedMethodCount: number } | null {
    const chainClassName = path.basename(chainPath, '.ts');
    const chainNameWithoutSuffix = chainClassName.replace(/Chain$/, '');
    const chainDir = path.dirname(chainPath);
    const handlerClassName = `${chainNameWithoutSuffix}Handler`;
    const handlerPath = path.join(chainDir, `${handlerClassName}.ts`);

    if (!fs.existsSync(handlerPath)) {
        return null;
    }

    const chainMethodNames = extractChainMethodNames(chainPath, chainClassName);
    const handlerMethods = collectHandlerMethodsWithInheritance(handlerPath, handlerClassName);

    const methodsToGenerate = [...handlerMethods.values()]
        .filter((method): boolean => !chainMethodNames.has(method.name))
        .sort((a, b): number => a.name.localeCompare(b.name));

    const interfaceName = `${chainClassName}GeneratedMethods`;
    const handlerImportPath = `./${handlerClassName}.ts`;

    const methodLines: string[] = [];
    for (const method of methodsToGenerate) {
        const valueParamName = method.params.length > 0 ? getParamName(method.params[0], 0) : null;
        const jsdoc = normalizeJsDocForChain(method.jsdoc, chainClassName, valueParamName);

        if (jsdoc) {
            for (const line of jsdoc.split('\n')) {
                methodLines.push(`    ${line.trimStart()}`);
            }
        }

        methodLines.push(`    ${method.name}(...args: DropFirst<Parameters<${handlerClassName}['${method.name}']>>): ${chainClassName};`);
        methodLines.push('');
    }

    const outputPath = path.join(chainDir, `${chainClassName}.generated.d.ts`);
    const relativeChainPath = path.relative(workspaceRoot, chainPath).replace(/\\/g, '/');
    const relativeHandlerPath = path.relative(workspaceRoot, handlerPath).replace(/\\/g, '/');

    const output = [
        '// AUTO-GENERATED FILE. DO NOT EDIT DIRECTLY.',
        `// Source: ${relativeHandlerPath} + ${relativeChainPath}`,
        '// Run: npm run generate:chain-defs',
        '',
        `import type { ${handlerClassName} } from '${handlerImportPath}';`,
        '',
        'type DropFirst<T extends unknown[]> = T extends [unknown, ...infer R] ? R : [];',
        '',
        `interface ${interfaceName} {`,
        ...methodLines,
        '}',
        '',
        `declare module './${chainClassName}.ts' {`,
        `    interface ${chainClassName} extends ${interfaceName} {}`,
        '}',
        '',
        `declare module './${chainClassName}.js' {`,
        `    interface ${chainClassName} extends ${interfaceName} {}`,
        '}',
        '',
        'export {};',
        '',
    ].join('\n');

    fs.writeFileSync(outputPath, output, 'utf8');

    return {
        outputPath,
        generatedMethodCount: methodsToGenerate.length,
    };
}

function main(): void {
    const chainFiles = getChainFiles();
    let generatedCount = 0;

    for (const chainPath of chainFiles) {
        const result = generateDefinitionFile(chainPath);
        if (!result) {
            continue;
        }

        generatedCount += 1;
        const relativeOutput = path.relative(workspaceRoot, result.outputPath).replace(/\\/g, '/');
        console.log(`Generated ${relativeOutput} (${result.generatedMethodCount} methods).`);
    }

    if (generatedCount === 0) {
        console.log('No chain definitions generated.');
    }
}

main();
