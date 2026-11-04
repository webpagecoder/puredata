'use strict';

import { ObjectChain } from '../../../lib/fields/object/ObjectChain.ts';
import { ObjectProcessor } from '../../../lib/fields/object/ObjectProcessor.ts';

describe('ObjectChain', () => {
    describe('constructor and processor wiring', () => {
        it('applies default object config', () => {
            const chain = new ObjectChain();

            expect(chain.config.clone).toBe(false);
            expect(chain.config.plainOnly).toBe(true);
            expect(chain.config.maxDepth).toBeNull();
            expect(chain.config.maxKeyCount).toBeNull();
            expect(chain.config.stripEmpties).toBe(true);
            expect(chain.config.stripNestedEmpties).toBe(true);
        });

        it('applies provided constructor config overrides', () => {
            const chain = new ObjectChain({
                clone: true,
                plainOnly: false,
                maxDepth: 2,
                maxKeyCount: 10,
                stripEmpties: false,
                stripNestedEmpties: false,
            });

            expect(chain.config.clone).toBe(true);
            expect(chain.config.plainOnly).toBe(false);
            expect(chain.config.maxDepth).toBe(2);
            expect(chain.config.maxKeyCount).toBe(10);
            expect(chain.config.stripEmpties).toBe(false);
            expect(chain.config.stripNestedEmpties).toBe(false);
        });

        it('createProcessor returns an ObjectProcessor instance', () => {
            expect(new ObjectChain().createProcessor()).toBeInstanceOf(ObjectProcessor);
        });
    });

    describe('configurators', () => {
        it('cloneVal/plainOnly/maxDepth/maxKeyCount/strip* clone safely', () => {
            const chain = new ObjectChain();
            const configured = chain
                .cloneVal(true)
                .plainOnly(false)
                .maxDepth(3)
                .maxKeyCount(20)
                .stripEmpties(false)
                .stripNestedEmpties(false);

            expect(chain.config.clone).toBe(false);
            expect(chain.config.plainOnly).toBe(true);
            expect(chain.config.maxDepth).toBeNull();
            expect(chain.config.maxKeyCount).toBeNull();
            expect(chain.config.stripEmpties).toBe(true);
            expect(chain.config.stripNestedEmpties).toBe(true);
            expect(configured.config.clone).toBe(true);
            expect(configured.config.plainOnly).toBe(false);
            expect(configured.config.maxDepth).toBe(3);
            expect(configured.config.maxKeyCount).toBe(20);
            expect(configured.config.stripEmpties).toBe(false);
            expect(configured.config.stripNestedEmpties).toBe(false);
        });
    });
});
