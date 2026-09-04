'use strict';

import { ObjectHandler } from './ObjectHandler.ts';
import { AnyChain, AnyChainConfig, AnyChainCtorParams } from '../any/AnyChain.ts';
import { ObjectProcessor } from './ObjectProcessor.ts';

export type ObjectChainConfig = AnyChainConfig & {
    cloneObject: boolean;
    ensurePlain: boolean;
    maxDepth: number | null;
    maxKeyCount: number | null;
};

export type ObjectChainCtorParams<C extends ObjectChainConfig = ObjectChainConfig> = 
    AnyChainCtorParams<C, ObjectHandler>;

class ObjectChain<P extends ObjectChainCtorParams = ObjectChainCtorParams> extends AnyChain<P> {

    constructor(args: Partial<P> = {}) {
        super(args);

        const {
            cloneObject = false,
            ensurePlain = false,
            maxDepth = null,
            maxKeyCount = null
        } = args;

        const { props } = this;
        props.cloneObject = cloneObject;
        props.ensurePlain = ensurePlain;
        props.maxDepth = maxDepth;
        props.maxKeyCount = maxKeyCount;
    }

    public override createProcessor(): ObjectProcessor {
        return new ObjectProcessor({
            field: this,
        });
    }

    // Transformers

    /**
     * Removes keys with empty values (null, undefined, empty string, empty array, empty object).
     * @returns {ObjectChain} Returns the chain for method chaining
     * @example
     * object.removeEmpties() // Removes keys with falsy or empty values
     */
    public removeEmpties(): this {
        return this.clone({ cloneObject: true } as Partial<P>).addHandlerStep('removeEmpties', () => {
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
        return this.clone({ cloneObject: true } as Partial<P>).addHandlerStep('removeEmptiesRecursive', () => {
            return [this._config.emptyValues];
        });
    }

}

export { ObjectChain };

