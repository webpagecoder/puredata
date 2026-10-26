'use strict';

import { ObjectHandler } from './ObjectHandler.ts';
import { AnyChain, AnyChainConfig, AnyChainCtorParams } from '../any/AnyChain.ts';
import { ObjectProcessor } from './ObjectProcessor.ts';

/** Configuration options for object chains. */
export type ObjectChainConfig = AnyChainConfig & {
    clone: boolean;
    plainOnly: boolean;
    maxDepth: number | null;
    maxKeyCount: number | null;
    stripEmpties: boolean;
    stripNestedEmpties: boolean;
};

/** Constructor options for an object chain. */
export type ObjectChainCtorParams<C extends ObjectChainConfig = ObjectChainConfig> =
    AnyChainCtorParams<C, ObjectHandler>;

/** Chain of validators and transformations for object values. */
class ObjectChain<P extends ObjectChainCtorParams = ObjectChainCtorParams> extends AnyChain<P> {

    /** Creates an object chain with the supplied configuration. */
    constructor(args: Partial<P> = {}) {
        super(Object.assign({ chainHandlerCtor: ObjectHandler }, args));

        const {
            clone = false,
            plainOnly = false,
            maxDepth = null,
            maxKeyCount = null,
            stripEmpties = false,
            stripNestedEmpties = false
        } = args;

        const { config } = this;
        config.clone = clone;
        config.plainOnly = plainOnly;
        config.maxDepth = maxDepth;
        config.maxKeyCount = maxKeyCount;
        config.stripEmpties = stripEmpties;
        config.stripNestedEmpties = stripNestedEmpties;
    }

    /** Creates the processor that handles this object chain. */
    public override createProcessor(): ObjectProcessor {
        return new ObjectProcessor({
            field: this,
        });
    }


    // Configurators

    /**
     * Configures whether object values are cloned before validation.
     *
     * @param clone Whether to clone the object.
     * @returns A cloned chain with the updated setting.
     */
    public cloneVal(clone = true) {
        return this.clone({ clone } as Partial<P>);
    }

    /**
     * Requires values to be plain objects.
     *
     * @param plainOnly Whether to reject non-plain objects.
     * @returns A cloned chain with the updated setting.
     */
    public plainOnly(plainOnly = true) {
        return this.clone({ plainOnly } as Partial<P>);
    }

    /**
     * Sets the maximum allowed object nesting depth.
     *
     * @param maxDepth Maximum depth, or `null` for no limit.
     * @returns A cloned chain with the updated setting.
     */
    public maxDepth(maxDepth: number | null) {
        return this.clone({ maxDepth } as Partial<P>);
    }

    /**
     * Sets the maximum allowed number of object keys, including nested keys.
     *
     * @param maxKeyCount Maximum key count, or `null` for no limit.
     * @returns A cloned chain with the updated setting.
     */
    public maxKeyCount(maxKeyCount: number | null) {
        return this.clone({ maxKeyCount } as Partial<P>);
    }

    /**
     * Configures whether empty values are removed from the object.
     *
     * @param stripEmpties Whether to remove empty values.
     * @returns A cloned chain with the updated setting.
     */
    public stripEmpties(stripEmpties = true) {
        return this.clone({ stripEmpties } as Partial<P>);
    }

    /**
     * Configures whether empty values are removed recursively from nested objects.
     *
     * @param stripNestedEmpties Whether to remove nested empty values.
     * @returns A cloned chain with the updated setting.
     */
    public stripNestedEmpties(stripNestedEmpties = true) {
        return this.clone({ stripNestedEmpties } as Partial<P>);
    }
}

export { ObjectChain };
