'use strict';

import { StringHandler } from '../handlers/StringHandler.ts';
import { Overwrite } from '../types.ts';
import { Chain, ChainCloneParams, ChainConfig, ChainConstructorParams } from './Chain.ts';


export type StringChainConfig = ChainConfig;

export type StringChainConstructorParams = ChainConstructorParams<StringHandler, StringChainConfig>;

class StringChain extends Chain<StringChainConfig, StringChainConstructorParams> {
    constructor(args: StringChainConstructorParams) {
        super(args);
    }
}

export { StringChain };