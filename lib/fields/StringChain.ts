'use strict';

import { StringHandler } from '../handlers/StringHandler.ts';
import { Chain, ChainProps } from './Chain.ts';

export type StringChainProps = ChainProps<typeof StringHandler>;

class StringChain extends Chain {
    constructor(props: StringChainProps) {
        super(props);
    }
}

export { StringChain };