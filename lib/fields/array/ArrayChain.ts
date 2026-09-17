'use strict';

import { ArrayHandler } from './ArrayHandler.ts';
import { Path } from '../../Path.ts';
import { AnyChain, AnyChainConfig, AnyChainCtorParams } from '../any/AnyChain.ts';
import { ArrayProcessor } from './ArrayProcessor.ts';

type SortComparator = (a: unknown, b: unknown) => -1 | 0 | 1;

export type ArrayChainConfig = AnyChainConfig & {
    castSingle: boolean;
    stripEmpties: boolean;
};
export type ArrayChainCtorParams = AnyChainCtorParams<ArrayChainConfig, ArrayHandler>;

class ArrayChain extends AnyChain<ArrayChainCtorParams> {

    public constructor(args: Partial<ArrayChainCtorParams> = {}) {
        super(Object.assign({ chainHandlerCtor: ArrayHandler }, args));
        
        const {
            castSingle = true,
            stripEmpties = true,
        } = args;

        const { _config } = this;
        _config.castSingle = castSingle;
        _config.stripEmpties = stripEmpties;
    }

    public override createProcessor(): ArrayProcessor {
        return new ArrayProcessor({
            field: this,
        });
    }

    // Configurators

    public castSingle(castSingle: boolean = true): this {
        return this.clone({ castSingle });
    }

    public stripEmpties(stripEmpties: boolean = true): this {
        return this.clone({ stripEmpties });
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
            ? new Path(pathStringOrComparator, this._config.pathDelims)
            : pathStringOrComparator;
        return this.addStepToChain('unique', [pathOrComparator]);
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
            ? new Path(pathString, this._config.pathDelims)
            : null;
        return this.addStepToChain('group', [path]);
    }

    /**
     * Removes duplicate values from array
     * @param {string|Function} [pathStringOrComparator] - Property path or comparator function
     * @returns {ArrayChain} Returns this chain for method chaining
     * @example
     * array([1, 2, 2, 3]).stripDuplicates() // [1, 2, 3]
     * array([{id: 1}, {id: 1}]).stripDuplicates('id') // [{id: 1}]
     */
    public stripDuplicates(pathStringOrComparator?: string | SortComparator): this {
        const pathOrComparator = typeof pathStringOrComparator === 'string'
            ? new Path(pathStringOrComparator, this._config.pathDelims)
            : pathStringOrComparator;
        return this.addStepToChain('stripDuplicates', [pathOrComparator]);
    }

    // /**
    //  * Removes empty values from array
    //  * @returns {ArrayChain} Returns this chain for method chaining
    //  * @example
    //  * array([1, null, 2, '', 3]).stripEmpties() // [1, 2, 3]
    //  */
    // public stripEmpties(): this {
    //     return this.addHandlerStep('stripEmpties', () => {
    //         return [this._config.emptyValues];
    //     });
    // }

}

export { ArrayChain };


