'use strict';

import { StringHandler } from './StringHandler.ts';
import { AnyChain, AnyChainCtorParams, AnyChainConfig } from '../any/AnyChain.ts';
import { StringProcessor } from './StringProcessor.ts';

export type StringChainConfig = AnyChainConfig & {
    // General options
    maxLength: number | null;
    trim: boolean;
    truncate: boolean;

    // Matching options
    ignoreCase: boolean;
    mode: 'strict' | 'loose';
    normalize: boolean;
    stripDelims: string;
};

export type StringChainCtorParams = AnyChainCtorParams<StringChainConfig, StringHandler>;

class StringChain extends AnyChain<StringChainCtorParams> {
    constructor(args: StringChainCtorParams) {
        super(args);

        const {
            maxLength = null,
            trim = true,
            truncate = false,

            ignoreCase = false,
            mode = 'strict',
            normalize = false,
            stripDelims = ''
        } = args;

        const { props } = this;
        props.maxLength = maxLength;
        props.trim = trim;
        props.truncate = truncate;

        props.ignoreCase = ignoreCase;
        props.stripDelims = stripDelims;
        props.normalize = normalize;

        this._config.chainHandler.configMatchingDefaults({
            ignoreCase,
            mode,
            normalize,
            stripDelims,
        });
    }

    public override createProcessor(): StringProcessor {
        return new StringProcessor({
            field: this,
        });
    }
}

export { StringChain };

