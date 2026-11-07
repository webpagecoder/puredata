'use strict';

import { StringHandler } from './StringHandler.ts';
import { AnyChain, AnyChainCtorParams, AnyChainConfig } from '../any/AnyChain.ts';
import { StringProcessor } from './StringProcessor.ts';

/** Configuration options for string chains. */
export type StringChainConfig = AnyChainConfig & {
    // Matching options
    acceptableDelims: string;
    normalizedDelim: string;
    ignoreCase: boolean;
    mode: 'strict' | 'loose';
    normalize: boolean;
    stripDelims: string;

    // General options
    trim: boolean;

};

/** Constructor options for a string chain. */
export type StringChainCtorParams = AnyChainCtorParams<StringChainConfig, StringHandler>;

/** Chain of validators and transformations for string values. */
class StringChain extends AnyChain<StringChainCtorParams> {

    /**
     * Creates a string chain with the supplied configuration.
     *
     * @param args Initial configuration overrides for the string chain.
     */
    constructor(args: Partial<StringChainCtorParams> = {}) {
        const {
            acceptableDelims = ' -_',
            normalizedDelim = '-',
            ignoreCase = false,
            mode = 'loose',
            normalize = true,
            stripDelims = ' ',
            trim = true
        } = args;

        super(Object.assign({
            chainHandler: new StringHandler({
                acceptableDelims: ' -_',
                normalizedDelim: '-',
                ignoreCase,
                mode,
                normalize,
                stripDelims,
            }),
        }, args));

        const { config } = this;

        config.acceptableDelims = acceptableDelims;
        config.normalizedDelim = normalizedDelim;
        config.ignoreCase = ignoreCase;
        config.mode = mode;
        config.normalize = normalize;
        config.stripDelims = stripDelims;
        config.trim = trim;
    }

    // ========================================
    // Processor wiring
    // ========================================

    /**
     * Creates the processor that handles this string chain.
     *
     * @returns Processor configured for this string chain.
     */
    public override createProcessor(): StringProcessor {
        return new StringProcessor({
            field: this,
        });
    }

    // ========================================
    // Configurators
    // ========================================

    /**
     * Configures delimiter characters treated as equivalent during normalization.
     *
     * @param delims Allowed delimiter characters for normalized matching.
     * @returns Cloned chain with updated acceptable delimiters.
     */
    public acceptableDelims(delims: string): this {
        return this.clone({
            acceptableDelims: delims,
        });
    }

    /**
     * Configures the canonical delimiter used during normalization.
     *
     * @param delim Delimiter character used as normalized output.
     * @returns Cloned chain with updated normalized delimiter.
     */
    public normalizedDelim(delim: string): this {
        return this.clone({
            normalizedDelim: delim,
        });
    }

    /**
     * Configures case-insensitive matching behavior.
     *
     * @param ignore Whether to ignore case in string comparisons.
     * @returns Cloned chain with updated case-sensitivity behavior.
     */
    public ignoreCase(ignore: boolean = true): this {
        return this.clone({
            ignoreCase: ignore,
        });
    }

    /**
     * Configures strict or loose matching mode.
     *
     * @param mode String matching mode.
     * @returns Cloned chain with updated matching mode.
     */
    public mode(mode: 'strict' | 'loose'): this {
        return this.clone({
            mode,
        });
    }

    /**
     * Configures whether strings are normalized before matching.
     *
     * @param normalize Whether normalization is applied.
     * @returns Cloned chain with updated normalization behavior.
     */
    public normalize(normalize: boolean = true): this {
        return this.clone({
            normalize,
        });
    }

    /**
     * Configures delimiter characters stripped before matching.
     *
     * @param delims Delimiter characters to remove from input strings.
     * @returns Cloned chain with updated strip-delimiter behavior.
     */
    public stripDelims(delims: string): this {
        return this.clone({
            stripDelims: delims,
        });
    }

    /**
     * Configures whether leading and trailing whitespace is trimmed.
     *
     * @param trim Whether to trim strings before processing.
     * @returns Cloned chain with updated trim behavior.
     */
    public trim(trim: boolean = true): this {
        return this.clone({ trim });
    }
}

export { StringChain };
