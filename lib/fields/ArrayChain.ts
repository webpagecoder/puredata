'use strict';

import { ArrayHandler } from '../handlers/ArrayHandler.ts';
import { Path } from '../Path.ts';
import { Chain, ChainProps } from './Chain.ts';

type SortComparator = (a: unknown, b: unknown) => -1 | 0 | 1;

export type ArrayChainProps = ChainProps<ArrayHandler> & {
    castSingle?: boolean;
    maxLength?: number;
    removeEmpties?: boolean;
};

class ArrayChain extends Chain<ArrayChainProps> {
    protected _castSingle: boolean;
    protected _maxLength: number
    protected _removeEmpties: boolean;

    constructor(props: ArrayChainProps) {
        super(props);
        const {
            castSingle = true,
            maxLength = -1,
            removeEmpties = false,
        } = props;

        this._castSingle = castSingle;
        this._maxLength = maxLength;
        this._removeEmpties = removeEmpties;
    }

    public override clone(props: Partial<ArrayChainProps> = {}): this {
        const clone = super.clone(props);
        const {
            castSingle = this._castSingle,
            maxLength = this._maxLength,
            removeEmpties = this._removeEmpties,
        } = props;

        clone._castSingle = castSingle;
        clone._maxLength = maxLength;
        clone._removeEmpties = removeEmpties;
        return clone;
    }

    // Configurators

    /**
     * Configures automatic removal of empty values from arrays during preprocessing
     * @param {boolean} [removeEmpties=true] - Whether to remove empty values from arrays
     * @param {Array} [addEmptyValues=[]] - Additional values to consider as empty beyond the default empty values
     * @returns {ArrayChain} Returns this chain for method chaining
     * @example
     * // Configure to remove empty values including custom empties
     * array([1, null, 2, '', 3, 'N/A']).configRemoveEmpties(true, ['N/A'])
     * // Results in: [1, 2, 3] after preprocessing
     */
    public configRemoveEmpties(removeEmpties: boolean = true, addEmptyValues: unknown[] = []): this {
        return this.clone({
            removeEmpties,
            emptyValues: [...this.props.emptyValues, ...addEmptyValues],
        });
    }

    /**
     * Configures automatic casting of single values to arrays during preprocessing
     * @param {boolean} [castSingle=true] - Whether to cast single non-array values to arrays
     * @returns {ArrayChain} Returns this chain for method chaining
     * @example
     * // Configure to cast single values to arrays
     * array('hello').configCastSingle(true)
     * // Input 'hello' becomes ['hello'] during preprocessing
     * 
     * // Disable automatic casting
     * array('hello').configCastSingle(false)
     * // Would fail validation since 'hello' is not an array
     */
    public configCastSingle(castSingle: boolean = true): this {
        return this.clone({ castSingle } as any);
    }

    // Validators

    /**
     * Validates that array elements are unique
     * @param {string|Function} [pathStringOrComparator] - Property path or comparator
     * @returns {ArrayChain} Returns this chain for method chaining
     * @example
     * array([1, 2, 3]).unique() // passes
     * array([1, 2, 1]).unique() // fails
     */
   public unique(pathStringOrComparator?: string | SortComparator): this {
        const pathOrComparator = typeof pathStringOrComparator === 'string'
            //todo: check this out...create
            ? Path.create(pathStringOrComparator)
            : pathStringOrComparator;
        return this.addStep('unique', [pathOrComparator]);
    }

    // Transformers

    /**
     * Groups array elements by a property path or value
     * @param {string} pathString - Path to property for grouping
     * @returns {ArrayChain} Returns this chain for method chaining
     * @example
     * array([{type: 'A', val: 1}, {type: 'B', val: 2}]).group('type')
     */
    public group(pathString: string | null): this {
        const path = typeof pathString === 'string'
            ? Path.create(pathString)
            : null;
        return this.addStep('group', [path]);
    }

    /**
     * Removes duplicate values from array
     * @param {string|Function} [pathStringOrComparator] - Property path or comparator function
     * @returns {ArrayChain} Returns this chain for method chaining
     * @example
     * array([1, 2, 2, 3]).removeDuplicates() // [1, 2, 3]
     * array([{id: 1}, {id: 1}]).removeDuplicates('id') // [{id: 1}]
     */
    public removeDuplicates(pathStringOrComparator?: string | SortComparator): this {
        const pathOrComparator = typeof pathStringOrComparator === 'string'
            ? Path.create(pathStringOrComparator)
            : pathStringOrComparator;
        return this.addStep('removeDuplicates', [pathOrComparator]);
    }

    /**
     * Removes empty values from array
     * @returns {ArrayChain} Returns this chain for method chaining
     * @example
     * array([1, null, 2, '', 3]).removeEmpties() // [1, 2, 3]
     */
    public removeEmpties(): this {
        return this.addStep('removeEmpties', function (this: Chain): unknown[] {
            return [this.props.emptyValues];
        });
    }

}

export { ArrayChain };


