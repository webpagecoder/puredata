'use strict';

import { StringChain } from '../../../lib/fields/string/StringChain.ts';
import { StringProcessor } from '../../../lib/fields/string/StringProcessor.ts';

describe('StringChain', () => {
    describe('constructor and processor wiring', () => {
        it('applies default string config', () => {
            const chain = new StringChain();

            expect(chain.config.ignoreCase).toBe(false);
            expect(chain.config.mode).toBe('loose');
            expect(chain.config.normalize).toBe(true);
            expect(chain.config.stripDelims).toBe(' ');
            expect(chain.config.trim).toBe(true);
        });

        it('applies provided constructor config overrides', () => {
            const chain = new StringChain({
                ignoreCase: true,
                mode: 'strict',
                normalize: false,
                stripDelims: '_',
                trim: false,
            });

            expect(chain.config.ignoreCase).toBe(true);
            expect(chain.config.mode).toBe('strict');
            expect(chain.config.normalize).toBe(false);
            expect(chain.config.stripDelims).toBe('_');
            expect(chain.config.trim).toBe(false);
        });

        it('createProcessor returns a StringProcessor instance', () => {
            expect(new StringChain().createProcessor()).toBeInstanceOf(StringProcessor);
        });
    });

    describe('configurators', () => {
        it('trim clones without mutating source', () => {
            const chain = new StringChain();
            const configured = chain.trim(false);

            expect(chain.config.trim).toBe(true);
            expect(configured.config.trim).toBe(false);
        });
    });
});
