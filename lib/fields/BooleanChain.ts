'use strict';

import { BooleanHandler } from '../handlers/BooleanHandler.ts';
import { Chain, ChainProps } from './Chain.ts';

type BoolishPair = [truthy: unknown, falsy: unknown];

export type BooleanChainProps = ChainProps<typeof BooleanHandler> & {
    allowBoolish?: boolean;
    boolishPairs?: BoolishPair[];
};

class BooleanChain extends Chain<BooleanChainProps> {
    protected _allowBoolish: boolean;
    protected _boolishPairs: BoolishPair[];

    constructor(props: BooleanChainProps) {
        super(props);
        const {
            allowBoolish = false,
            boolishPairs = []
        } = props;

        this._allowBoolish = allowBoolish;
        this._boolishPairs = boolishPairs;
    }

    public override clone(props: Partial<BooleanChainProps> = {}): this {
        const clone = super.clone(props);
        const {
            allowBoolish = this._allowBoolish,
            boolishPairs = this._boolishPairs,
        } = props;

        clone._allowBoolish = allowBoolish;
        clone._boolishPairs = boolishPairs;
        return clone;
    }

    // Configurators

    /**
     * Enables or disables boolish mode for accepting string/numeric boolean equivalents.
     * @param {boolean} [boolish=true] - Whether to enable boolish parsing
     * @returns {BooleanChain} Returns this chain for method chaining
     * @example
     * schema.boolean().configBoolish(true) // Accepts 'yes', 'no', 1, 0, etc.
     */
    public configBoolish(allowBoolish: boolean = true, addBoolishPairs: BoolishPair[] = []): this {
        this.getProp('allowBoolish');
        const existingPairs = (this.getProp('boolishPairs') as BoolishPair[] | undefined) || [];
        return this.clone({
            allowBoolish,
            boolishPairs: [...existingPairs, ...addBoolishPairs]
        });
    }

    // Validators

    /**
     * Validates that the value is true or a truthy equivalent.
     * When boolish mode is enabled, accepts configured truthy values.
     * @returns {BooleanChain} Returns this chain for method chaining
     * @example
     * schema.boolean().truthy()
     * // With boolish: accepts 'yes', 1, 'true', etc.
     */
    public truthy(): this {
        return this.addStep('truthy', (function (this: BooleanChain): unknown[] {
            const { allowBoolish, boolishPairs = [] } = this.props;
            return [allowBoolish ? boolishPairs.map(([truthy,]: [unknown, unknown]): unknown => truthy) : []];
        }));
    }

    /**
     * Validates that the value is false or a falsy equivalent.
     * When boolish mode is enabled, accepts configured falsy values.
     * @returns {BooleanChain} Returns this chain for method chaining
     * @example
     * schema.boolean().falsy()
     * // With boolish: accepts 'no', 0, 'false', etc.
     */
    public falsy(): this {
        return this.addStep('falsy', (function (this: BooleanChain): unknown[] {
            const { allowBoolish, boolishPairs = [] } = this.props;
            return [allowBoolish ? boolishPairs.map(([, falsy]: [unknown, unknown]): unknown => falsy) : []];
        }));
    }

    // Transformers

    /**
     * Inverts the boolean value (true becomes false, false becomes true).
     * When boolish mode is enabled, uses configured boolish pairs for conversion.
     * @returns {BooleanChain} Returns this chain for method chaining
     * @example
     * schema.boolean().invert()
     * // true -> false, false -> true
     * // With boolish: 'yes' -> 'no', 1 -> 0, etc.
     */
    invert(): this {
        return this.addStep('invert', (function (this: BooleanChain): unknown[] {
            const { allowBoolish, boolishPairs = [] } = this.props;
            return [allowBoolish ? boolishPairs : []];
        }));
    }

}

export { BooleanChain };