'use strict';

import { ArrayHandler } from './ArrayHandler.ts';
import { Path } from '../../Path.ts';
import { AnyChain, AnyChainConfig, AnyChainCtorParams } from '../any/AnyChain.ts';
import { ArrayProcessor } from './ArrayProcessor.ts';

type SortComparator = (a: unknown, b: unknown) => -1 | 0 | 1;

/** Configuration options for array chains. */
export type ArrayChainConfig = AnyChainConfig & {
    castSingle: boolean;
    stripEmpties: boolean;
};

/** Constructor options for an array chain. */
export type ArrayChainCtorParams = AnyChainCtorParams<ArrayChainConfig, ArrayHandler>;

/** Chain of validators and transforms for array values. */
class ArrayChain extends AnyChain<ArrayChainCtorParams> {

    /** Creates an array chain with the supplied configuration. */
    public constructor(args: Partial<ArrayChainCtorParams> = {}) {
        super(Object.assign({ chainHandlerCtor: ArrayHandler }, args));
        
        const {
            castSingle = true,
            stripEmpties = true,
        } = args;

        const { config } = this;
        config.castSingle = castSingle;
        config.stripEmpties = stripEmpties;
    }

    /** Creates the processor that handles this array chain. */
    public override createProcessor(): ArrayProcessor {
        return new ArrayProcessor({
            field: this,
        });
    }

    // Configurators

    /** Configures whether a non-array value is cast to a one-item array. */
    public castSingle(castSingle: boolean = true): this {
        return this.clone({ castSingle });
    }

    /** Configures whether empty values are removed before validation. */
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
            ? new Path(pathStringOrComparator, this.config.pathDelims)
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
            ? new Path(pathString, this.config.pathDelims)
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
            ? new Path(pathStringOrComparator, this.config.pathDelims)
            : pathStringOrComparator;
        return this.addStepToChain('stripDuplicates', [pathOrComparator]);
    }


}

export { ArrayChain };

