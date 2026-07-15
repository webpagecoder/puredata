'use strict';

import { StringHandler } from './StringHandler.ts';
import { AnyChain, AnyChainCtorParams, AnyChainProps } from '../any/AnyChain.ts';
import { StringProcessor } from './StringProcessor.ts';

export type StringChainProps = AnyChainProps<StringHandler> & {
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

export type StringChainCtorParams = AnyChainCtorParams<StringChainProps>;

class StringChain extends AnyChain<StringChainProps> {
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

        const { props } = this;
        props.maxLength = maxLength;
        props.trim = trim;
        props.truncate = truncate;

        props.ignoreCase = ignoreCase;
        props.stripDelims = stripDelims;
        props.normalize = normalize;

        this._props.chainHandler.configMatchingDefaults({
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

