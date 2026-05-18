'use strict';
import { ObjectHandler } from '../handlers/ObjectHandler.ts';
//todo: need to add a "clone" option to all methods that modify the object...
import { Path } from '../Path.ts';
import { Chain, ChainProps } from './Chain.ts';

export type ObjectChainProps = ChainProps<ObjectHandler> & {
    cloneObject?: boolean;
    ensurePlain?: boolean;
    maxDepth?: number;
    maxKeyCount?: number;
};

class ObjectChain<P extends ObjectChainProps = ObjectChainProps> extends Chain<P> {
    protected _cloneObject: boolean;
    protected _ensurePlain: boolean;
    protected _maxDepth?: number;
    protected _maxKeyCount?: number;

    constructor(props: P) {
        super(props);
        const {
            cloneObject = false,
            ensurePlain = false,
            maxDepth,
            maxKeyCount
        } = props;

        this._cloneObject = cloneObject;
        this._ensurePlain = ensurePlain;
        this._maxDepth = maxDepth;
        this._maxKeyCount = maxKeyCount;
    }

    public override clone(props: Partial<P> = {}): this {
        const clone = super.clone(props);
        const {
            cloneObject = this._cloneObject,
            ensurePlain = this._ensurePlain,
            maxDepth = this._maxDepth,
            maxKeyCount = this._maxKeyCount
        } = props;

        clone._cloneObject = cloneObject;
        clone._ensurePlain = ensurePlain;
        clone._maxDepth = maxDepth;
        clone._maxKeyCount = maxKeyCount;
        return clone;
    }

    // Configurators
    public configClone(clone: boolean): this {
        return this.clone({ cloneObject: clone } as Partial<P>);
    }

    // Transformers

    /**
     * Removes keys with empty values (null, undefined, empty string, empty array, empty object).
     * @returns {ObjectChain} Returns the chain for method chaining
     * @example
     * object.removeEmpties() // Removes keys with falsy or empty values
     */
    public removeEmpties(): this {
        return this.clone({ cloneObject: true } as Partial<P>).addStep('removeEmpties', function (this: ObjectChain): unknown[] {
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
        return this.clone({ cloneObject: true } as Partial<P>).addStep('removeEmptiesRecursive', function (this: ObjectChain): unknown[] {
            return [this._emptyValues];
        });
    }

    public get ensurePlain(): boolean {
        return this._ensurePlain;
    }

    public get cloneObject(): boolean {
        return this._cloneObject;
    }

    public get maxDepth(): number | undefined {
        return this._maxDepth;
    }

    public get maxKeyCount(): number | undefined {
        return this._maxKeyCount;
    }

}

export { ObjectChain };
