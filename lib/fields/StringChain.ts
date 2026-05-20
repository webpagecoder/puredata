'use strict';

import { StringHandler } from '../handlers/StringHandler.ts';
import { Overwrite } from '../types.ts';
import { Chain, ChainCloneParams, ChainConstructorParams } from './Chain.ts';

export type StringChainConstructorParams =
    Overwrite<ChainConstructorParams<StringHandler>, {
        cloneObject?: boolean;
        ensurePlain?: boolean;
        maxDepth?: number;
        maxKeyCount?: number;
    }>;

// export type StringChainCloneParams = ChainCloneParams<StringChainConstructorParams>;

class StringChain extends Chain<StringChainConstructorParams> {
    constructor(args: StringChainConstructorParams) {
        super(args);
    }
}

export { StringChain };