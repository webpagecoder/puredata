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
        super(Object.assign({ chainHandlerCtor: StringHandler }, args));

        const {
            maxLength = null,
            trim = true,
            truncate = false,

            ignoreCase = false,
            mode = 'strict',
            normalize = false,
            stripDelims = ''
        } = args;

        const { _config } = this;
        _config.maxLength = maxLength;
        _config.trim = trim;
        _config.truncate = truncate;

        _config.ignoreCase = ignoreCase;
        _config.mode = mode;
        _config.normalize = normalize;
        _config.stripDelims = stripDelims;

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

