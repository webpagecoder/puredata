// AUTO-GENERATED FILE. DO NOT EDIT DIRECTLY.
// Source: lib/handlers/ObjectHandler.(js|ts) + lib/fields/ObjectChain.ts
// Run: tsx ./generator/generate-arraychain-definitions.ts

interface ObjectChainGeneratedMethods {
        /**
        * Executes the empty handler step.
        * @param {any} empties
        * @returns {ObjectChain}
        */
        empty(empties?: any): ObjectChain;

        /**
        * Executes the notEmpty handler step.
        * @param {any} empties
        * @returns {ObjectChain}
        */
        notEmpty(empties?: any): ObjectChain;

        /**
        * Executes the property handler step.
        * @param {any} property
        * @returns {ObjectChain}
        */
        property(property: any): ObjectChain;

        /**
        * Executes the instanceOf handler step.
        * @param {any} constructor
        * @returns {ObjectChain}
        */
        instanceOf(constructor: any): ObjectChain;

        /**
        * Executes the maxDepth handler step.
        * @param {any} maxDepth
        * @returns {ObjectChain}
        */
        maxDepth(maxDepth: any): ObjectChain;

        /**
        * Executes the minDepth handler step.
        * @param {any} minDepth
        * @returns {ObjectChain}
        */
        minDepth(minDepth: any): ObjectChain;

        /**
        * Executes the depth handler step.
        * @param {any} depth
        * @returns {ObjectChain}
        */
        depth(depth: any): ObjectChain;

        /**
        * Executes the maxKeyCount handler step.
        * @param {any} maxKeyCount
        * @returns {ObjectChain}
        */
        maxKeyCount(maxKeyCount: any): ObjectChain;

        /**
        * Executes the maxKeyCountRecursive handler step.
        * @param {any} maxKeyCount
        * @returns {ObjectChain}
        */
        maxKeyCountRecursive(maxKeyCount: any): ObjectChain;

        /**
        * Executes the minKeyCount handler step.
        * @param {any} minKeyCount
        * @returns {ObjectChain}
        */
        minKeyCount(minKeyCount: any): ObjectChain;

        /**
        * Executes the minKeyCountRecursive handler step.
        * @param {any} minKeyCount
        * @returns {ObjectChain}
        */
        minKeyCountRecursive(minKeyCount: any): ObjectChain;

        /**
        * Executes the keyCount handler step.
        * @param {any} keyCount
        * @returns {ObjectChain}
        */
        keyCount(keyCount: any): ObjectChain;

        /**
        * Executes the keyCountRecursive handler step.
        * @param {any} keyCount
        * @returns {ObjectChain}
        */
        keyCountRecursive(keyCount: any): ObjectChain;

        /**
        * Executes the noneOfPaths handler step.
        * @param {any} paths
        * @returns {ObjectChain}
        */
        noneOfPaths(paths?: any): ObjectChain;

        /**
        * Executes the someOfPaths handler step.
        * @param {any} paths
        * @returns {ObjectChain}
        */
        someOfPaths(paths?: any): ObjectChain;

        /**
        * Executes the allOfPaths handler step.
        * @param {any} paths
        * @returns {ObjectChain}
        */
        allOfPaths(paths?: any): ObjectChain;

        /**
        * Executes the exactlyPaths handler step.
        * @param {any} paths
        * @returns {ObjectChain}
        */
        exactlyPaths(paths?: any): ObjectChain;

        /**
        * Executes the onlyPaths handler step.
        * @param {any} paths
        * @returns {ObjectChain}
        */
        onlyPaths(paths?: any): ObjectChain;

        /**
        * Executes the pathsOtherThan handler step.
        * @param {any} paths
        * @returns {ObjectChain}
        */
        pathsOtherThan(paths?: any): ObjectChain;

        /**
        * Executes the xOfPaths handler step.
        * @param {any} count
        * @param {any} paths
        * @returns {ObjectChain}
        */
        xOfPaths(count: any, paths?: any): ObjectChain;

        /**
        * Executes the allOfButXOfPaths handler step.
        * @param {any} count
        * @param {any} paths
        * @returns {ObjectChain}
        */
        allOfButXOfPaths(count: any, paths?: any): ObjectChain;

        /**
        * Executes the plain handler step.
        * @returns {ObjectChain}
        */
        plain(): ObjectChain;

        /**
        * Executes the pickRandom handler step.
        * @param {any} count
        * @returns {ObjectChain}
        */
        pickRandom(count: any): ObjectChain;

        /**
        * Executes the renameKeys handler step.
        * @param {any} fromRegex
        * @param {any} toRegex
        * @param {any} param4
        * @returns {ObjectChain}
        */
        renameKeys(fromRegex: any, toRegex: any, deleteOriginalKey?: any): ObjectChain;

        /**
        * Executes the removePaths handler step.
        * @param {any} paths
        * @returns {ObjectChain}
        */
        removePaths(paths?: any): ObjectChain;

        /**
        * Executes the setPaths handler step.
        * @param {any} pathValues
        * @param {any} overwrite
        * @param {any} create
        * @returns {ObjectChain}
        */
        setPaths(pathValues?: any, overwrite?: any, create?: any): ObjectChain;

        /**
        * Executes the stripKeys handler step.
        * @param {any} exceptFor
        * @returns {ObjectChain}
        */
        stripKeys(exceptFor?: any): ObjectChain;

}

declare module './ObjectChain.ts' {
    interface ObjectChain extends ObjectChainGeneratedMethods {}
}

declare module './ObjectChain.js' {
    interface ObjectChain extends ObjectChainGeneratedMethods {}
}

export { };
