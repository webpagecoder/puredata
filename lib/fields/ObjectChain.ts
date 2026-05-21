'use strict';

import { ObjectHandler } from '../handlers/ObjectHandler.ts';
//todo: need to add a "clone" option to all methods that modify the object...
import { Overwrite } from '../types.ts';
import { Chain, ChainConfig, ChainConstructorParams } from './Chain.ts';

export type ObjectChainConfig = Overwrite<ChainConfig, {
    cloneObject?: boolean;
    ensurePlain?: boolean;
    maxDepth?: number;
    maxKeyCount?: number;
}>;

export type ObjectChainConstructorParams<C extends ObjectChainConfig = ObjectChainConfig> = ChainConstructorParams<ObjectHandler, C>;

class ObjectChain extends Chain<ObjectChainConfig, ObjectChainConstructorParams> {

    constructor(args: ObjectChainConstructorParams) {
        super(args);
        const {
            cloneObject = false,
            ensurePlain = false,
            maxDepth,
            maxKeyCount
        } = args;

        const config = this._config;
        config.cloneObject = cloneObject;
        config.ensurePlain = ensurePlain;
        config.maxDepth = maxDepth;
        config.maxKeyCount = maxKeyCount;
    }

    // Transformers

    /**
     * Removes keys with empty values (null, undefined, empty string, empty array, empty object).
     * @returns {ObjectChain} Returns the chain for method chaining
     * @example
     * object.removeEmpties() // Removes keys with falsy or empty values
     */
    public removeEmpties(): this {
        return this.clone({ cloneObject: true }).addStep('removeEmpties', function (this: ObjectChain): unknown[] {
            return [this._config.emptyValues];
        });
    }

    /**
     * Recursively removes keys with empty values throughout nested objects.
     * @returns {ObjectChain} Returns the chain for method chaining
     * @example
     * object.removeEmptiesRecursive() // Deep clean of empty values in nested objects
     */
    public removeEmptiesRecursive(): this {
        return this.clone({ cloneObject: true }).addStep('removeEmptiesRecursive', function (this: ObjectChain): unknown[] {
            return [this._config.emptyValues];
        });
    }

}

export { ObjectChain };

