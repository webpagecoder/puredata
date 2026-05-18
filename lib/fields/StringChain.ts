'use strict';

import { StringHandler } from '../handlers/StringHandler.ts';
import { Chain, ChainProps } from './Chain.ts';

export type StringChainProps = ChainProps<StringHandler>;

class StringChain extends Chain<StringChainProps> {
    constructor(props: StringChainProps) {
        super(props);
    }
}

export { StringChain };