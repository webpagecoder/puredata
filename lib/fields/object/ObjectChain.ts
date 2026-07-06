'use strict';

import { ObjectHandler } from './ObjectHandler.ts';
import { AnyChain, AnyChainProps, AnyChainCtorParams, AnyChainCloneParams } from '../any/AnyChain.ts';

export type ObjectChainProps = AnyChainProps<ObjectHandler> & {
    cloneObject: boolean;
    ensurePlain: boolean;
    maxDepth: number | null;
    maxKeyCount: number | null;
};

export type ObjectChainCtorParams<C extends ObjectChainProps =
    ObjectChainProps> = AnyChainCtorParams<C>;

class ObjectChain<C extends ObjectChainProps = ObjectChainProps> extends AnyChain<C> {

    constructor(args: ObjectChainCtorParams<C>) {
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

    // Transformers

    /**
     * Removes keys with empty values (null, undefined, empty string, empty array, empty object).
     * @returns {ObjectChain} Returns the chain for method chaining
     * @example
     * object.removeEmpties() // Removes keys with falsy or empty values
     */
    public removeEmpties(): this {
        return this.clone({ cloneObject: true } as AnyChainCloneParams<C>).addStep('removeEmpties', () => {
            return [this.props.emptyValues];
        });
    }

    /**
     * Recursively removes keys with empty values throughout nested objects.
     * @returns {ObjectChain} Returns the chain for method chaining
     * @example
     * object.removeEmptiesRecursive() // Deep clean of empty values in nested objects
     */
    public removeEmptiesRecursive(): this {
        return this.clone({ cloneObject: true } as AnyChainCloneParams<C>).addStep('removeEmptiesRecursive', () => {
            return [this.props.emptyValues];
        });
    }

}

export { ObjectChain };

