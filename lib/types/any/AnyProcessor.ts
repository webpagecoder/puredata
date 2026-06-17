'use strict';

import { ChainProcessor } from '../ChainProcessor.ts';
import { AnyChain } from './AnyChain.ts';

class AnyProcessor<C extends AnyChain = AnyChain> extends ChainProcessor<C> {}

export { AnyProcessor };