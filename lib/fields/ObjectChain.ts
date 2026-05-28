'use strict';

import { ObjectHandler } from '../handlers/ObjectHandler.ts';
//todo: need to add a "clone" option to all methods that modify the object...
import { Chain, ChainConfig, ChainConstructorParams } from './Chain.ts';

export type ObjectChainConfig = ChainConfig<ObjectHandler> & {
    cloneObject: boolean;
    ensurePlain: boolean;
    maxDepth: number | null;
    maxKeyCount: number | null;
};

export type ObjectChainConstructorParams<C extends ObjectChainConfig =
    ObjectChainConfig> = ChainConstructorParams<C>;

class ObjectChain<C extends ObjectChainConfig = ObjectChainConfig> extends Chain<C> {

    constructor(args: ObjectChainConstructorParams<C>) {
        super(args);
        const {
            cloneObject = false,
            ensurePlain = false,
            maxDepth = null,
            maxKeyCount = null
        } = args;

        const { _config } = this;
        _config.cloneObject = cloneObject;
        _config.ensurePlain = ensurePlain;
        _config.maxDepth = maxDepth;
        _config.maxKeyCount = maxKeyCount;
    }

    // Transformers

    /**
     * Removes keys with empty values (null, undefined, empty string, empty array, empty object).
     * @returns {ObjectChain} Returns the chain for method chaining
     * @example
     * object.removeEmpties() // Removes keys with falsy or empty values
     */
    public removeEmpties(): this {
        return this.clone({ cloneObject: true } as L).addStep('removeEmpties', function (this: ObjectChain): unknown[] {
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
        return this.clone({ cloneObject: true } as L).addStep('removeEmptiesRecursive', function (this: ObjectChain): unknown[] {
            return [this._config.emptyValues];
        });
    }

}

export { ObjectChain };

