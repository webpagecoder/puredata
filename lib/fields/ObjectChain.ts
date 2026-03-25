'use strict';
//todo: need to add a "clone" option to all methods that modify the object...
import { Path } from '../Path.ts';
import { Chain, ResolvedChainProps, ChainProps } from './Chain.ts';

type RenameKeyOptions = {
    deleteOriginalKey?: boolean;
    overrideExistingKey?: boolean;
};
export type ResolvedObjectChainProps = ResolvedChainProps;
export type ObjectChainProps = ChainProps;
type PathOrString = Path | string;

class ObjectChain extends Chain {

    declare props: ResolvedObjectChainProps & {
        clone: boolean;
    };

    constructor(props: ChainProps = {}) {
        super(props);
        this.props.clone = false;
    }

    // Configurators
    configClone(clone: boolean = true): this {
        return this.setProps({ clone });
    }

    // Transformers

    /**
     * Removes keys with empty values (null, undefined, empty string, empty array, empty object).
     * @returns {ObjectChain} Returns the chain for method chaining
     * @example
     * object.removeEmpties() // Removes keys with falsy or empty values
     */
    removeEmpties(): this {
        return this.setProps({ clone: true }).addStep('removeEmpties', function (this: ObjectChain): unknown[] {
            return [this.props.emptyValues];
        });
    }

    /**
     * Recursively removes keys with empty values throughout nested objects.
     * @returns {ObjectChain} Returns the chain for method chaining
     * @example
     * object.removeEmptiesRecursive() // Deep clean of empty values in nested objects
     */
    removeEmptiesRecursive(): this {
        return this.setProps({ clone: true }).addStep('removeEmptiesRecursive', function (this: ObjectChain): unknown[] {
            return [this.props.emptyValues];
        });
    }

}

export { ObjectChain };
