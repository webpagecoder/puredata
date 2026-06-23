'use strict';

import { StringHandler } from './StringHandler.ts';
import { Chain, ChainCtorParams, ChainProps } from '../Chain.ts';
import { GlobalConfig } from '../../GlobalConfig.ts';

export type StringChainProps = ChainProps<StringHandler> & {
    matching: GlobalConfig['string']['matching'];
    maxLength: number | null;
    trim: boolean;
    truncate: boolean;
};

export type StringChainCtorParams = ChainCtorParams<StringChainProps>;

class StringChain extends Chain<StringChainProps> {
    constructor(args: StringChainCtorParams) {
        super(args);

        const {
            matching = GlobalConfig.string.matching,
            maxLength = null,
            trim = true,
            truncate = false,
        } = args;

        const { props } = this;
        props.matching = matching;
        props.maxLength = maxLength;
        props.trim = trim;
        props.truncate = truncate;

        this._props.chainHandler.configMatchingDefaults(matching);
    }

    
}

export { StringChain };

