'use strict';

import { StringChain } from '../../../lib/fields/string/StringChain.ts';
import { StringProcessor } from '../../../lib/fields/string/StringProcessor.ts';

describe('StringChain', () => {
    describe('constructor and processor wiring', () => {
        it('applies default string config', () => {
            const chain = new StringChain();

            expect(chain.config.acceptableDelims).toBe(' -_');
            expect(chain.config.normalizedDelim).toBe('-');
            expect(chain.config.ignoreCase).toBe(false);
            expect(chain.config.mode).toBe('loose');
            expect(chain.config.normalize).toBe(true);
            expect(chain.config.stripDelims).toBe(' ');
            expect(chain.config.trim).toBe(true);
        });

        it('applies provided constructor config overrides', () => {
            const chain = new StringChain({
                acceptableDelims: '._',
                normalizedDelim: '.',
                ignoreCase: true,
                mode: 'strict',
                normalize: false,
                stripDelims: '_',
                trim: false,
            });

            expect(chain.config.acceptableDelims).toBe('._');
            expect(chain.config.normalizedDelim).toBe('.');
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
        it('string configurators clone safely without mutating source', () => {
            const chain = new StringChain();
            const configured = chain
                .acceptableDelims('._')
                .normalizedDelim('.')
                .ignoreCase(true)
                .mode('strict')
                .normalize(false)
                .stripDelims('_')
                .trim(false);

            expect(chain.config.acceptableDelims).toBe(' -_');
            expect(chain.config.normalizedDelim).toBe('-');
            expect(chain.config.ignoreCase).toBe(false);
            expect(chain.config.mode).toBe('loose');
            expect(chain.config.normalize).toBe(true);
            expect(chain.config.stripDelims).toBe(' ');
            expect(chain.config.trim).toBe(true);

            expect(configured.config.acceptableDelims).toBe('._');
            expect(configured.config.normalizedDelim).toBe('.');
            expect(configured.config.ignoreCase).toBe(true);
            expect(configured.config.mode).toBe('strict');
            expect(configured.config.normalize).toBe(false);
            expect(configured.config.stripDelims).toBe('_');
            expect(configured.config.trim).toBe(false);
        });

        it('ignoreCase/normalize/trim default args set values to true', () => {
            const chain = new StringChain({
                ignoreCase: false,
                normalize: false,
                trim: false,
            });

            const withIgnoreCaseDefault = chain.ignoreCase();
            const withNormalizeDefault = chain.normalize();
            const withTrimDefault = chain.trim();

            expect(withIgnoreCaseDefault.config.ignoreCase).toBe(true);
            expect(withIgnoreCaseDefault.config.normalize).toBe(false);
            expect(withIgnoreCaseDefault.config.trim).toBe(false);

            expect(withNormalizeDefault.config.ignoreCase).toBe(false);
            expect(withNormalizeDefault.config.normalize).toBe(true);
            expect(withNormalizeDefault.config.trim).toBe(false);

            expect(withTrimDefault.config.ignoreCase).toBe(false);
            expect(withTrimDefault.config.normalize).toBe(false);
            expect(withTrimDefault.config.trim).toBe(true);
        });

        it('constructor applies per-config defaults for partial overrides', () => {
            const onlyAcceptableDelims = new StringChain({ acceptableDelims: '._' });
            const onlyNormalizedDelim = new StringChain({ normalizedDelim: '.' });
            const onlyMode = new StringChain({ mode: 'strict' });

            expect(onlyAcceptableDelims.config.acceptableDelims).toBe('._');
            expect(onlyAcceptableDelims.config.normalizedDelim).toBe('-');
            expect(onlyAcceptableDelims.config.mode).toBe('loose');

            expect(onlyNormalizedDelim.config.acceptableDelims).toBe(' -_');
            expect(onlyNormalizedDelim.config.normalizedDelim).toBe('.');
            expect(onlyNormalizedDelim.config.mode).toBe('loose');

            expect(onlyMode.config.acceptableDelims).toBe(' -_');
            expect(onlyMode.config.normalizedDelim).toBe('-');
            expect(onlyMode.config.mode).toBe('strict');
        });

        it('string configurators preserve inherited field config', () => {
            const chain = new StringChain({
                autoConvert: 'force',
                label: 'Username',
                presence: 'optional',
                strip: true,
            });
            const configured = chain
                .acceptableDelims('._')
                .normalizedDelim('.')
                .mode('strict');

            expect(configured.config.autoConvert).toBe('force');
            expect(configured.config.label).toBe('Username');
            expect(configured.config.presence).toBe('optional');
            expect(configured.config.strip).toBe(true);
        });
    });
});
