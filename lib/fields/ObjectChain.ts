'use strict';
import { ObjectHandler } from '../handlers/ObjectHandler.ts';
//todo: need to add a "clone" option to all methods that modify the object...
import { Path } from '../Path.ts';
import { Chain, ResolvedChainProps, ChainProps } from './Chain.ts';

type RenameKeyOptions = {
    deleteOriginalKey?: boolean;
    overrideExistingKey?: boolean;
};
export type ResolvedObjectChainProps = ResolvedChainProps;

type PathOrString = Path | string;

export type ObjectChainProps = ChainProps<typeof ObjectHandler> & {
    cloneObject?: boolean;
    ensurePlain?: boolean;
};

class ObjectChain extends Chain<ObjectChainProps> {
    protected _cloneObject: boolean;
    protected _ensurePlain: boolean;

    constructor(props: ObjectChainProps) {
        super(props);
        const {
            cloneObject = false,
            ensurePlain = false,
        } = props;

        this._cloneObject = cloneObject;
        this._ensurePlain = ensurePlain;
    }

    public override clone(props: Partial<ObjectChainProps> = {}): this {
        const clone = super.clone(props);
        const {
            cloneObject = this._cloneObject,
            ensurePlain = this._ensurePlain,
        } = props;

        clone._cloneObject = cloneObject;
        clone._ensurePlain = ensurePlain;
        return clone;
    }

    // Configurators
    public configClone(clone: boolean): this {
        return this.clone({ cloneObject: clone });
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
            return [this._emptyValues];
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
            return [this._emptyValues];
        });
    }

}

export { ObjectChain };
