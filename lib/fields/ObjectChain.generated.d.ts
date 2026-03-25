// AUTO-GENERATED FILE. DO NOT EDIT DIRECTLY.
// Source: lib/handlers/ObjectHandler.(js|ts) + lib/fields/ObjectChain.ts
// Run: tsx ./generator/generate-arraychain-definitions.ts

interface ObjectChainGeneratedMethods {
        empty(empties?: any): ObjectChain;

        notEmpty(empties?: any): ObjectChain;

        property(property: any): ObjectChain;

        instanceOf(constructor: any): ObjectChain;

        maxDepth(maxDepth: any): ObjectChain;

        minDepth(minDepth: any): ObjectChain;

        depth(depth: any): ObjectChain;

        maxKeyCount(maxKeyCount: any): ObjectChain;

        maxKeyCountRecursive(maxKeyCount: any): ObjectChain;

        minKeyCount(minKeyCount: any): ObjectChain;

        minKeyCountRecursive(minKeyCount: any): ObjectChain;

        keyCount(keyCount: any): ObjectChain;

        keyCountRecursive(keyCount: any): ObjectChain;

        noneOfPaths(paths?: any): ObjectChain;

        someOfPaths(paths?: any): ObjectChain;

        allOfPaths(paths?: any): ObjectChain;

        exactlyPaths(paths?: any): ObjectChain;

        onlyPaths(paths?: any): ObjectChain;

        pathsOtherThan(paths?: any): ObjectChain;

        xOfPaths(count: any, paths?: any): ObjectChain;

        allOfButXOfPaths(count: any, paths?: any): ObjectChain;

        plain(): ObjectChain;

        pickRandom(count: any): ObjectChain;

        renameKeys(fromRegex: any, toRegex: any, deleteOriginalKey?: any): ObjectChain;

        removePaths(paths?: any): ObjectChain;

        setPaths(pathValues?: any, overwrite?: any, create?: any): ObjectChain;

        stripUnknownKeys(knownKeys?: any): ObjectChain;

}

declare module './ObjectChain.ts' {
    interface ObjectChain extends ObjectChainGeneratedMethods {}
}

declare module './ObjectChain.js' {
    interface ObjectChain extends ObjectChainGeneratedMethods {}
}

export { };
