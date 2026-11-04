'use strict';

import { StringHandler } from './StringHandler.ts';
import { AnyChain, AnyChainCtorParams, AnyChainConfig } from '../any/AnyChain.ts';
import { StringProcessor } from './StringProcessor.ts';
import { GlobalConfig } from '../../GlobalConfig.ts';

/** Configuration options for string chains. */
export type StringChainConfig = AnyChainConfig & {
    // General options
    maxLen: number | null;
    trim: boolean;
    truncate: boolean;

    // Matching options
    ignoreCase: boolean;
    mode: 'strict' | 'loose';
    normalize: boolean;
    stripDelims: string;
};

/** Constructor options for a string chain. */
export type StringChainCtorParams = AnyChainCtorParams<StringChainConfig, StringHandler>;

/** Chain of validators and transformations for string values. */
class StringChain extends AnyChain<StringChainCtorParams> {

    /** Creates a string chain with the supplied configuration. */
    constructor(args: Partial<StringChainCtorParams> = {}) {
        super(Object.assign({
            chainHandler: new StringHandler(),
        }, args));

        const {
            ignoreCase = false,
            mode = 'loose',
            normalize = true,
            stripDelims = ' ',
            trim = true
        } = args;

        const { config } = this;

        config.ignoreCase = ignoreCase;
        config.mode = mode;
        config.normalize = normalize;
        config.stripDelims = stripDelims;
        config.trim = trim;

        this.chainHandler.configMatchingDefaults({
            ignoreCase,
            mode,
            normalize,
            stripDelims,
        });
    }

    // ========================================
    // Processor wiring
    // ========================================

    /** Creates the processor that handles this string chain. */
    public override createProcessor(): StringProcessor {
        return new StringProcessor({
            field: this,
        });
    }

    // ========================================
    // Configurators
    // ========================================

    /** Configures whether string values are trimmed before validation. */
    public trim(trim: boolean = true): this {
        return this.clone({ trim });
    }
}

export { StringChain };
