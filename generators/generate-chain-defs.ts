'use strict';

import fs from 'node:fs';
import path from 'node:path';

type HandlerMethod = {
    name: string;
    params: string;
    jsdoc: string | null;
};

const workspaceRoot = process.cwd();
const fieldsDir = path.join(workspaceRoot, 'lib', 'fields');
const handlersDir = path.join(workspaceRoot, 'lib', 'handlers');

function getHandlerPath(chainName: string): string | null {
    const baseName = `${chainName}Handler`;
    const jsPath = path.join(handlersDir, `${baseName}.js`);
    const tsPath = path.join(handlersDir, `${baseName}.ts`);
    if (fs.existsSync(jsPath)) return jsPath;
    if (fs.existsSync(tsPath)) return tsPath;
    return null;
}

function splitTopLevelCsv(input: string): string[] {
    const items: string[] = [];
    let depthParen = 0;
    let depthBracket = 0;
    let depthBrace = 0;
    let current = '';

    for (let i = 0; i < input.length; i++) {
        const ch = input[i];

        if (ch === ',' && depthParen === 0 && depthBracket === 0 && depthBrace === 0) {
            if (current.trim()) {
                items.push(current.trim());
            }
            current = '';
            continue;
        }

        if (ch === '(') depthParen++;
        if (ch === ')') depthParen--;
        if (ch === '[') depthBracket++;
        if (ch === ']') depthBracket--;
        if (ch === '{') depthBrace++;
        if (ch === '}') depthBrace--;

        current += ch;
    }

    if (current.trim()) {
        items.push(current.trim());
    }

    return items;
}

function getParamName(rawParam: string): string {
    const cleaned = rawParam
        .replace(/^\s*\.\.\./, '')
        .replace(/\s*=.*$/, '')
        .replace(/\?.*$/, '')
        .replace(/:.+$/, '')
        .trim();

    if (!cleaned) {
        return 'arg';
    }

    const match = cleaned.match(/[A-Za-z_$][\w$]*/);
    return match ? match[0] : 'arg';
}

function toDeclarationParam(rawParam: string): string {
    const trimmed = rawParam.trim();
    const isRest = trimmed.startsWith('...');
    const hasDefault = trimmed.includes('=');
    const name = getParamName(trimmed);

    if (isRest) {
        return `...${name}: any[]`;
    }

    return hasDefault
        ? `${name}?: any`
        : `${name}: any`;
}

function removeFirstParamFromJsDoc(jsdoc: string | null, firstParamName: string | null): string | null {
    if (!jsdoc) {
        return null;
    }

    if (!firstParamName) {
        return jsdoc;
    }

    const lines = jsdoc.split('\n');
    const paramRegex = new RegExp(`@param\\s+(?:\\{[^}]*\\}\\s+)?(?:\\[)?${firstParamName}(?:[\\].=][^\\]]*)?(?:\\])?\\b`);

    const filtered = lines.filter((line): boolean => !paramRegex.test(line));
    const hasUsefulContent = filtered.some((line): boolean => {
        const text = line.replace(/^\s*\/\*\*?\s?/, '').replace(/^\s*\*\s?/, '').replace(/\*\/\s*$/, '').trim();
        return text.length > 0;
    });

    return hasUsefulContent ? filtered.join('\n') : null;
}

function normalizeJsDocIndentation(jsdoc: string): string {
    const lines = jsdoc.split('\n');
    return lines.map((line): string => line.trimStart()).join('\n');
}

function rewriteJsDocReturns(jsdoc: string | null, fullChainName: string): string | null {
    if (!jsdoc) {
        return null;
    }

    // Keep generated declaration docs aligned with fluent-chain return signatures.
    return jsdoc
        .replace(/(@returns?\s*\{)\s*ChainHandlerResult\s*(\})/g, `$1${fullChainName}$2`)
        .replace(/(@returns?\s+)ChainHandlerResult\b/g, `$1${fullChainName}`);
}

function getImmediateJsDocBefore(source: string, startIndex: number): string | null {
    const prefix = source.slice(0, startIndex);
    const commentEnd = prefix.lastIndexOf('*/');

    if (commentEnd === -1) {
        return null;
    }

    const trailingBetween = prefix.slice(commentEnd + 2).replace(/^[ \t]*\/\/.*$/gm, '').trim();

    if (trailingBetween !== '') {
        return null;
    }

    const commentStart = prefix.lastIndexOf('/**', commentEnd);

    if (commentStart === -1) {
        return null;
    }

    return normalizeJsDocIndentation(prefix.slice(commentStart, commentEnd + 2));
}

function extractHandlerMethods(handlerSource: string): HandlerMethod[] {
    const methods: HandlerMethod[] = [];
    const methodRegex = /^[ \t]*static\s+([A-Za-z_$][\w$]*)\s*\(([^)]*)\)\s*(?::\s*[^\{]+)?\{/gm;
    let match: RegExpExecArray | null;

    while ((match = methodRegex.exec(handlerSource)) !== null) {
        const name = match[1];
        const params = match[2] || '';
        const jsdoc = getImmediateJsDocBefore(handlerSource, match.index);

        methods.push({ name, params, jsdoc });
    }

    return methods;
}

function extractChainMethodNames(chainSource: string): Set<string> {
    const withoutBlockComments = chainSource.replace(/\/\*[\s\S]*?\*\//g, '');
    const withoutLineComments = withoutBlockComments.replace(/^\s*\/\/.*$/gm, '');

    const names = new Set<string>();
    // Match methods with an explicit return type (e.g. `: this {`) or plain methods (e.g. `alpha() {`)
    const methodRegex = /^[ \t]+(?:override\s+)?([A-Za-z_$][\w$]*)\s*\([^\n]*\)\s*(?::\s*[^{]+)?\{/gm;

    let match: RegExpExecArray | null;
    while ((match = methodRegex.exec(withoutLineComments)) !== null) {
        names.add(match[1]);
    }

    return names;
}

function generateDefinitions(fullChainName: string, methods: HandlerMethod[]): string {
    const methodLines: string[] = [];

    for (const method of methods) {
        const params = splitTopLevelCsv(method.params);
        const firstParamName = params.length > 0 ? getParamName(params[0]) : null;
        const remainingParams = params.slice(1);
        const declarationParams = remainingParams.map(toDeclarationParam).join(', ');
        const filteredJsDoc = rewriteJsDocReturns(
            removeFirstParamFromJsDoc(method.jsdoc, firstParamName),
            fullChainName
        );

        if (filteredJsDoc) {
            const jsDocLines = filteredJsDoc.split('\n').map((line): string => `        ${line}`);
            methodLines.push(...jsDocLines);
        }

        methodLines.push(`        ${method.name}(${declarationParams}): ${fullChainName};`);
        methodLines.push('');
    }

    const interfaceName = `${fullChainName}GeneratedMethods`;

    const buildModuleAugmentation = (modulePath: string): string[] => {
        return [
            `declare module '${modulePath}' {`,
            `    interface ${fullChainName} extends ${interfaceName} {}`,
            '}',
            ''
        ];
    };

    const chainBaseName = fullChainName; // e.g. 'ArrayChain'
    const handlerBaseName = fullChainName.replace(/Chain$/, 'Handler'); // e.g. 'ArrayHandler'

    const lines: string[] = [
        '// AUTO-GENERATED FILE. DO NOT EDIT DIRECTLY.',
        `// Source: lib/handlers/${handlerBaseName}.(js|ts) + lib/fields/${chainBaseName}.ts`,
        `// Run: tsx ./generator/generate-arraychain-definitions.ts`,
        '',
        `interface ${interfaceName} {`,
        ...methodLines,
        '}',
        '',
        ...buildModuleAugmentation(`./${chainBaseName}.ts`),
        ...buildModuleAugmentation(`./${chainBaseName}.js`),
        'export { };',
        ''
    ];

    return lines.join('\n');
}

function processChain(chainFile: string): void {
    const fullChainName = chainFile.replace(/\.ts$/, ''); // e.g. 'ArrayChain'
    const chainName = fullChainName.replace(/Chain$/, ''); // e.g. 'Array'

    const handlerPath = getHandlerPath(chainName);
    if (!handlerPath) {
        console.log(`Skipping ${fullChainName}: no corresponding handler found.`);
        return;
    }

    const chainFilePath = path.join(fieldsDir, chainFile);
    const outputPath = path.join(fieldsDir, `${fullChainName}.generated.d.ts`);

    const handlerSource = fs.readFileSync(handlerPath, 'utf8');
    const chainSource = fs.readFileSync(chainFilePath, 'utf8');
    const handlerMethods = extractHandlerMethods(handlerSource);
    const chainMethodNames = extractChainMethodNames(chainSource);
    const missingMethods = handlerMethods.filter((method): boolean => !chainMethodNames.has(method.name));
    const output = generateDefinitions(fullChainName, missingMethods);

    fs.writeFileSync(outputPath, output, 'utf8');

    const relativeOutput = path.relative(workspaceRoot, outputPath);
    console.log(`Generated ${relativeOutput} with ${missingMethods.length} methods from ${path.basename(handlerPath)}.`);
}

function main(): void {
    const chainFiles = fs.readdirSync(fieldsDir)
        .filter((f): boolean => /Chain\.ts$/.test(f));

    for (const chainFile of chainFiles) {
        processChain(chainFile);
    }
}

main();
