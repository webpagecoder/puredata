'use strict';

import { NumberHandler } from './NumberHandler.ts';
import { AnyChain, AnyChainConfig, AnyChainCtorParams } from '../any/AnyChain.ts';
import { NumberProcessor } from './NumberProcessor.ts';

/** Configuration options for number chains. */
export type NumberChainConfig = AnyChainConfig & {
    safe: boolean;
    finite: boolean;
    precision: boolean;
};

/** Constructor options for a number chain. */
export type NumberChainCtorParams = AnyChainCtorParams<NumberChainConfig, NumberHandler>;

/** Chain of validators and transforms for numeric values. */
class NumberChain extends AnyChain<NumberChainCtorParams> {

    /** Creates a number chain with the supplied configuration. */
    public constructor(args: Partial<NumberChainCtorParams> = {}) {
        super(Object.assign({ chainHandlerCtor: NumberHandler }, args));
        
        const {
            safe = false,
            finite = false,
            precision = false,
        } = args;

        const { config } = this;
        config.safe = safe;
        config.finite = finite;
        config.precision = precision;
    }

    /** Creates the processor that handles this number chain. */
    public override createProcessor(): NumberProcessor {
        return new NumberProcessor({
            field: this,
        });
    }

    // Configurators


    /** Configures whether converted numbers must fit the safe integer range. */
    public safe(safe = true) {
        return this.clone({ safe });
    }

    /** Configures whether converted numbers must be finite. */
    public finite(finite = true) {
        return this.clone({ finite });
    }

    /** Configures whether numeric conversion must preserve precision. */
    public precision(precision = true) {
        return this.clone({ precision });
    }

}

export { NumberChain };