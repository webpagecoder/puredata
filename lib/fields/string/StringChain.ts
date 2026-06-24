'use strict';

import { StringHandler } from './StringHandler.ts';
import { Chain, ChainCtorParams, ChainProps } from '../Chain.ts';
import { GlobalConfig } from '../../GlobalConfig.ts';

export type StringChainProps = ChainProps<StringHandler> & {
    // General options
    maxLength: number | null;
    trim: boolean;
    truncate: boolean;

    // Matching options
    ignoreCase: boolean;
    cleanDelims: string;
    normalize: boolean;
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
            cleanDelims = '',
            normalize = false
        } = args;

        const { props } = this;
        props.maxLength = maxLength;
        props.trim = trim;
        props.truncate = truncate;

        props.ignoreCase = ignoreCase;
        props.cleanDelims = cleanDelims;
        props.normalize = normalize;

        this._props.chainHandler.configMatchingDefaults({
            ignoreCase,
            cleanDelims,
            normalize
        });
    }


}

export { StringChain };

