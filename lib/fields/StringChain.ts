'use strict';

import { StringHandler } from '../handlers/StringHandler.ts';
import { Overwrite } from '../types.ts';
import { Chain, ChainConfig, ChainConstructorParams } from './Chain.ts';


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

        const config = this._chainConfig;
        config.trim = trim;
        config.maxLength = maxLength;
        config.truncate = truncate;
    }
}

export { StringChain };
