'use strict';

import { StringHandler } from './StringHandler.ts';
import { Chain, ChainCtorParams, ChainProps } from '../Chain.ts';
import { GlobalConfig } from '../../GlobalConfig.ts';
import {MatchOptions} from './StringHandler.ts';

export type StringChainProps = ChainProps<StringHandler> & {
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

export type StringChainCtorParams = ChainCtorParams<StringChainProps>;

class StringChain extends Chain<StringChainProps> {
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

        this._props.chainHandler.configMatchingDefaults({
            ignoreCase,
            mode,
            normalize,
            stripDelims,
        });
    }


}

export { StringChain };

