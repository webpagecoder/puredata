'use strict';

import { StringHandler } from '../handlers/StringHandler.ts';
import { Overwrite } from '../types.ts';
import { Chain, ChainConstructorParams, ChainProps } from './Chain.ts';

export type StringChainProps = Overwrite<ChainProps<StringHandler>, {
    trim: boolean;
    maxLength: number | null;
    truncate: boolean;
}>;

export type StringChainConstructorParams = ChainConstructorParams<StringChainProps>;

class StringChain extends Chain<StringChainProps> {
    constructor(args: StringChainConstructorParams) {
        super(args);

        const {
            trim = true,
            maxLength = null,
            truncate = false,
        } = args;

        const { extendedProps: props } = this;
        props.trim = trim;
        props.maxLength = maxLength;
        props.truncate = truncate;
    }
}

export { StringChain };

