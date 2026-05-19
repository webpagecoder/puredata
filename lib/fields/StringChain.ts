'use strict';

import { StringHandler } from '../handlers/StringHandler.ts';
import { Chain, ChainConstructorProps } from './Chain.ts';

export type StringChainProps = ChainConstructorProps<StringHandler>;

class StringChain extends Chain<StringChainProps> {
    constructor(props: StringChainProps) {
        super(props);
    }
}

export { StringChain };