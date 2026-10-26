'use strict';

import { StringHandler } from './StringHandler.ts';
import { AnyChain, AnyChainCtorParams, AnyChainConfig } from '../any/AnyChain.ts';
import { StringProcessor } from './StringProcessor.ts';

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
        super(Object.assign({ chainHandlerCtor: StringHandler }, args));

        const {
            trim = true,
            
            ignoreCase = false,
            mode = 'strict',
            normalize = false,
            stripDelims = ''
        } = args;

        const { config } = this;
        config.trim = trim;

        config.ignoreCase = ignoreCase;
        config.mode = mode;
        config.normalize = normalize;
        config.stripDelims = stripDelims;

        this.chainHandler.configMatchingDefaults({
            ignoreCase,
            mode,
            normalize,
            stripDelims,
        });
    }

    /** Creates the processor that handles this string chain. */
    public override createProcessor(): StringProcessor {
        return new StringProcessor({
            field: this,
        });
    }

    // Configurators

    /** Configures whether string values are trimmed before validation. */
    public trim(trim: boolean = true): this {
        return this.clone({ trim });
    }
}

export { StringChain };
