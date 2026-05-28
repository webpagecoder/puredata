'use strict';

import { StringHandler } from '../handlers/StringHandler.ts';
import { Overwrite } from '../types.ts';
import { Chain, ChainConfig } from './Chain.ts';

export type StringChainConfig = Overwrite<ChainConfig<StringHandler>, {
    trim: boolean;
    maxLength: number | null;
    truncate: boolean;
}>;

class StringChain extends Chain<StringChainConfig> {
    constructor(args: StringChainConfig) {
        super(args);

        const {
            trim = true,
            maxLength = null,
            truncate = false,
        } = args;

        const { _config } = this;
        _config.trim = trim;
        _config.maxLength = maxLength;
        _config.truncate = truncate;
    }
}

export { StringChain };

