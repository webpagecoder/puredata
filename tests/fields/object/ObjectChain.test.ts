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

        it('default-arg configurators set boolean flags to true', () => {
            const chain = new ObjectChain({
                clone: false,
                plainOnly: false,
                stripEmpties: false,
                stripNestedEmpties: false,
            });

            const withCloneDefault = chain.cloneVal();
            const withPlainOnlyDefault = chain.plainOnly();
            const withStripEmptiesDefault = chain.stripEmpties();
            const withStripNestedDefault = chain.stripNestedEmpties();

            expect(withCloneDefault.config.clone).toBe(true);
            expect(withCloneDefault.config.plainOnly).toBe(false);
            expect(withCloneDefault.config.stripEmpties).toBe(false);
            expect(withCloneDefault.config.stripNestedEmpties).toBe(false);

            expect(withPlainOnlyDefault.config.clone).toBe(false);
            expect(withPlainOnlyDefault.config.plainOnly).toBe(true);
            expect(withPlainOnlyDefault.config.stripEmpties).toBe(false);
            expect(withPlainOnlyDefault.config.stripNestedEmpties).toBe(false);

            expect(withStripEmptiesDefault.config.clone).toBe(false);
            expect(withStripEmptiesDefault.config.plainOnly).toBe(false);
            expect(withStripEmptiesDefault.config.stripEmpties).toBe(true);
            expect(withStripEmptiesDefault.config.stripNestedEmpties).toBe(false);

            expect(withStripNestedDefault.config.clone).toBe(false);
            expect(withStripNestedDefault.config.plainOnly).toBe(false);
            expect(withStripNestedDefault.config.stripEmpties).toBe(false);
            expect(withStripNestedDefault.config.stripNestedEmpties).toBe(true);
        });

        it('constructor applies per-flag defaults for partial overrides', () => {
            const onlyClone = new ObjectChain({ clone: true });
            const onlyPlainOnly = new ObjectChain({ plainOnly: false });
            const onlyMaxDepth = new ObjectChain({ maxDepth: 2 });
            const onlyMaxKeyCount = new ObjectChain({ maxKeyCount: 7 });
            const onlyStripEmpties = new ObjectChain({ stripEmpties: false });
            const onlyStripNestedEmpties = new ObjectChain({ stripNestedEmpties: false });

            expect(onlyClone.config.clone).toBe(true);
            expect(onlyClone.config.plainOnly).toBe(true);
            expect(onlyClone.config.maxDepth).toBeNull();
            expect(onlyClone.config.maxKeyCount).toBeNull();
            expect(onlyClone.config.stripEmpties).toBe(true);
            expect(onlyClone.config.stripNestedEmpties).toBe(true);

            expect(onlyPlainOnly.config.clone).toBe(false);
            expect(onlyPlainOnly.config.plainOnly).toBe(false);
            expect(onlyPlainOnly.config.maxDepth).toBeNull();
            expect(onlyPlainOnly.config.maxKeyCount).toBeNull();
            expect(onlyPlainOnly.config.stripEmpties).toBe(true);
            expect(onlyPlainOnly.config.stripNestedEmpties).toBe(true);

            expect(onlyMaxDepth.config.clone).toBe(false);
            expect(onlyMaxDepth.config.plainOnly).toBe(true);
            expect(onlyMaxDepth.config.maxDepth).toBe(2);
            expect(onlyMaxDepth.config.maxKeyCount).toBeNull();
            expect(onlyMaxDepth.config.stripEmpties).toBe(true);
            expect(onlyMaxDepth.config.stripNestedEmpties).toBe(true);

            expect(onlyMaxKeyCount.config.clone).toBe(false);
            expect(onlyMaxKeyCount.config.plainOnly).toBe(true);
            expect(onlyMaxKeyCount.config.maxDepth).toBeNull();
            expect(onlyMaxKeyCount.config.maxKeyCount).toBe(7);
            expect(onlyMaxKeyCount.config.stripEmpties).toBe(true);
            expect(onlyMaxKeyCount.config.stripNestedEmpties).toBe(true);

            expect(onlyStripEmpties.config.clone).toBe(false);
            expect(onlyStripEmpties.config.plainOnly).toBe(true);
            expect(onlyStripEmpties.config.maxDepth).toBeNull();
            expect(onlyStripEmpties.config.maxKeyCount).toBeNull();
            expect(onlyStripEmpties.config.stripEmpties).toBe(false);
            expect(onlyStripEmpties.config.stripNestedEmpties).toBe(true);

            expect(onlyStripNestedEmpties.config.clone).toBe(false);
            expect(onlyStripNestedEmpties.config.plainOnly).toBe(true);
            expect(onlyStripNestedEmpties.config.maxDepth).toBeNull();
            expect(onlyStripNestedEmpties.config.maxKeyCount).toBeNull();
            expect(onlyStripNestedEmpties.config.stripEmpties).toBe(true);
            expect(onlyStripNestedEmpties.config.stripNestedEmpties).toBe(false);
        });

        it('maxDepth/maxKeyCount support resetting limits back to null', () => {
            const chain = new ObjectChain({ maxDepth: 3, maxKeyCount: 9 });
            const resetDepth = chain.maxDepth(null);
            const resetKeyCount = chain.maxKeyCount(null);

            expect(chain.config.maxDepth).toBe(3);
            expect(chain.config.maxKeyCount).toBe(9);
            expect(resetDepth.config.maxDepth).toBeNull();
            expect(resetDepth.config.maxKeyCount).toBe(9);
            expect(resetKeyCount.config.maxDepth).toBe(3);
            expect(resetKeyCount.config.maxKeyCount).toBeNull();
        });

        it('object configurators preserve inherited field config', () => {
            const chain = new ObjectChain({
                autoConvert: 'force',
                label: 'Profile',
                presence: 'optional',
                strip: true,
            });

            const configured = chain
                .cloneVal(true)
                .plainOnly(false)
                .maxDepth(4)
                .maxKeyCount(12)
                .stripEmpties(false)
                .stripNestedEmpties(false);

            expect(configured.config.autoConvert).toBe('force');
            expect(configured.config.label).toBe('Profile');
            expect(configured.config.presence).toBe('optional');
            expect(configured.config.strip).toBe(true);
        });
    });
});
