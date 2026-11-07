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

    /**
     * Creates an array chain with the supplied configuration.
     *
     * @param args Initial configuration overrides for the array chain.
     */
    public constructor(args: Partial<ArrayChainCtorParams> = {}) {
        super(Object.assign({
            chainHandler: new ArrayHandler(),
        }, args));
        
        const {
            castSingle = true,
            stripEmpties = true,
        } = args;

        const { config } = this;
        config.castSingle = castSingle;
        config.stripEmpties = stripEmpties;
    }

    // ========================================
    // Processor wiring
    // ========================================

    /**
     * Creates the processor that handles this array chain.
     *
     * @returns Processor configured for this array chain.
     */
    public override createProcessor(): ArrayProcessor {
        return new ArrayProcessor({
            field: this,
        });
    }

    // ========================================
    // Configurators
    // ========================================

    /**
     * Configures whether a non-array value is cast to a one-item array.
     *
     * @param castSingle Whether to cast non-array values to single-item arrays.
     * @returns Cloned chain with updated cast behavior.
     */
    public castSingle(castSingle: boolean = true): this {
        return this.clone({ castSingle });
    }

    /**
     * Configures whether empty values are removed before validation.
     *
     * @param stripEmpties Whether to remove empty values from input arrays.
     * @returns Cloned chain with updated empty-value stripping behavior.
     */
    public stripEmpties(stripEmpties: boolean = true): this {
        return this.clone({ stripEmpties });
    }


    // ========================================
    // Validators
    // ========================================

    /**
     * Validates that array elements are unique.
     *
     * @param pathStringOrComparator Property path or comparator used to compare values.
     * @returns Cloned chain with a `unique` validator step.
     * @example
     * array([1, 2, 3]).unique() // passes
     * array([1, 2, 1]).unique() // fails
     */
    public unique(pathStringOrComparator?: string | SortComparator): this {
        const pathOrComparator = typeof pathStringOrComparator === 'string'
            //todo: check this out...create
            ? new Path(pathStringOrComparator, this.config.pathDelims)
            : pathStringOrComparator;
        return this.appendToPipeline('unique', [pathOrComparator]);
    }

    // ========================================
    // Transformers
    // ========================================

    /**
     * Groups array elements by a property path or value.
     *
     * @param pathString Path to the property used for grouping, or `null` to group by item values.
     * @returns Cloned chain with a `group` transformer step.
     * @example
     * array([{type: 'A', val: 1}, {type: 'B', val: 2}]).group('type')
     */
    public group(pathString: string | null): this {
        const path = typeof pathString === 'string'
            ? new Path(pathString, this.config.pathDelims)
            : null;
        return this.appendToPipeline('group', [path]);
    }

    /**
     * Removes duplicate values from an array.
     *
     * @param pathStringOrComparator Property path or comparator used to detect duplicates.
     * @returns Cloned chain with a `stripDuplicates` transformer step.
     * @example
     * array([1, 2, 2, 3]).stripDuplicates() // [1, 2, 3]
     * array([{id: 1}, {id: 1}]).stripDuplicates('id') // [{id: 1}]
     */
    public stripDuplicates(pathStringOrComparator?: string | SortComparator): this {
        const pathOrComparator = typeof pathStringOrComparator === 'string'
            ? new Path(pathStringOrComparator, this.config.pathDelims)
            : pathStringOrComparator;
        return this.appendToPipeline('stripDuplicates', [pathOrComparator]);
    }


}

export { ArrayChain };
