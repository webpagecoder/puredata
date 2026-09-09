'use strict';

import { ObjectHandler } from './ObjectHandler.ts';
import { AnyChain, AnyChainConfig, AnyChainCtorParams } from '../any/AnyChain.ts';
import { ObjectProcessor } from './ObjectProcessor.ts';

export type ObjectChainConfig = AnyChainConfig & {
    cloneObject: boolean;
    ensurePlain: boolean;
    maxDepth: number | null;
    maxKeyCount: number | null;
    stripEmpties: boolean;
    stripEmptiesDeep: boolean;
};

export type ObjectChainCtorParams<C extends ObjectChainConfig = ObjectChainConfig> =
    AnyChainCtorParams<C, ObjectHandler>;

class ObjectChain<P extends ObjectChainCtorParams = ObjectChainCtorParams> extends AnyChain<P> {

    constructor(args: Partial<P> = {}) {
        super(Object.assign({ chainHandlerCtor: ObjectHandler }, args));

        const {
            cloneObject = false,
            ensurePlain = false,
            maxDepth = null,
            maxKeyCount = null,
            stripEmpties = false,
            stripEmptiesDeep = false
        } = args;

        const { _config } = this;
        _config.cloneObject = cloneObject;
        _config.ensurePlain = ensurePlain;
        _config.maxDepth = maxDepth;
        _config.maxKeyCount = maxKeyCount;
        _config.stripEmpties = stripEmpties;
        _config.stripEmptiesDeep = stripEmptiesDeep;
    }

    public override createProcessor(): ObjectProcessor {
        return new ObjectProcessor({
            field: this,
        });
    }

}

export { ObjectChain };

