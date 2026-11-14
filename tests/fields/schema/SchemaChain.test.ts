'use strict';

import { PureData } from '../../../lib/PureData.ts';
import { AnyChain } from '../../../lib/fields/any/AnyChain.ts';
import { SchemaChain } from '../../../lib/fields/schema/SchemaChain.ts';
import { SchemaProcessor } from '../../../lib/fields/schema/SchemaProcessor.ts';

describe('SchemaChain', () => {
    describe('constructor and processor wiring', () => {
        it('requires fieldFactory in constructor args', () => {
            expect(() => new SchemaChain()).toThrow('SchemaChain requires a fieldFactory to be provided in the constructor arguments');
        });

        it('applies schema defaults and converts schema entries to fields', () => {
            const chain = new SchemaChain({
                fieldFactory: PureData,
                schema: {
                    name: 'John',
                    nested: {
                        age: 42,
                    },
                },
            });

            expect(chain.config.cloneValue).toBe(true);
            expect(chain.config.plainOnly).toBe(true);
            expect(chain.config.failFast).toBe(false);
            expect(chain.config.stripExtraKeys).toBe(true);
            expect(chain.config.schemaFields.name).toBeInstanceOf(AnyChain);
            expect(chain.config.schemaFields.nested).toBeInstanceOf(SchemaChain);
        });

        it('createProcessor returns a SchemaProcessor instance', () => {
            const chain = new SchemaChain({
                fieldFactory: PureData,
            });

            expect(chain.createProcessor()).toBeInstanceOf(SchemaProcessor);
        });
    });

    describe('cloning', () => {
        it('clone can replace schema via args.schema', () => {
            const chain = new SchemaChain({
                fieldFactory: PureData,
                schema: { a: 1 },
            });
            const clone = chain.clone({
                schema: { b: 2 },
            });

            expect(Object.keys(chain.config.schemaFields)).toEqual(['a']);
            expect(Object.keys(clone.config.schemaFields)).toEqual(['b']);
        });

        it('clone can replace schema with an empty object', () => {
            const chain = new SchemaChain({
                fieldFactory: PureData,
                schema: { a: 1 },
            });
            const clone = chain.clone({
                schema: {},
            });

            expect(Object.keys(chain.config.schemaFields)).toEqual(['a']);
            expect(Object.keys(clone.config.schemaFields)).toEqual([]);
        });

        it('cloning configurators preserves existing schemaFields in both source and clone', () => {
            const chain = new SchemaChain({
                fieldFactory: PureData,
                schema: {
                    profile: {
                        age: 42,
                    },
                    name: 'Jane',
                },
            });
            const configured = chain.failFast(true).stripExtraKeys(false);

            expect(Object.keys(chain.config.schemaFields).sort()).toEqual(['name', 'profile']);
            expect(Object.keys(configured.config.schemaFields).sort()).toEqual(['name', 'profile']);
            expect(chain.config.schemaFields.profile).toBeInstanceOf(SchemaChain);
            expect(configured.config.schemaFields.profile).toBeInstanceOf(SchemaChain);
            expect(chain.config.failFast).toBe(false);
            expect(configured.config.failFast).toBe(true);
        });
    });

    describe('configurators', () => {
        it('failFast and stripExtraKeys clone safely', () => {
            const chain = new SchemaChain({
                fieldFactory: PureData,
            });
            const configured = chain.failFast(true).stripExtraKeys(false);

            expect(chain.config.failFast).toBe(false);
            expect(chain.config.stripExtraKeys).toBe(true);
            expect(configured.config.failFast).toBe(true);
            expect(configured.config.stripExtraKeys).toBe(false);
        });

        it('failFast and stripExtraKeys default args set values to true', () => {
            const chain = new SchemaChain({
                fieldFactory: PureData,
                failFast: false,
                stripExtraKeys: false,
            });

            const withFailFastDefault = chain.failFast();
            const withStripExtraKeysDefault = chain.stripExtraKeys();

            expect(withFailFastDefault.config.failFast).toBe(true);
            expect(withFailFastDefault.config.stripExtraKeys).toBe(false);

            expect(withStripExtraKeysDefault.config.failFast).toBe(false);
            expect(withStripExtraKeysDefault.config.stripExtraKeys).toBe(true);
        });

        it('constructor applies per-flag defaults for partial overrides', () => {
            const onlyFailFast = new SchemaChain({
                fieldFactory: PureData,
                failFast: true,
            });
            const onlyStripExtraKeys = new SchemaChain({
                fieldFactory: PureData,
                stripExtraKeys: false,
            });

            expect(onlyFailFast.config.failFast).toBe(true);
            expect(onlyFailFast.config.stripExtraKeys).toBe(true);

            expect(onlyStripExtraKeys.config.failFast).toBe(false);
            expect(onlyStripExtraKeys.config.stripExtraKeys).toBe(false);
        });

        it('schema configurators preserve inherited object and field config', () => {
            const chain = new SchemaChain({
                fieldFactory: PureData,
                maxDepth: 3,
                maxKeyCount: 10,
                autoConvert: 'force',
                label: 'Payload',
                presence: 'optional',
                strip: true,
            });
            const configured = chain.failFast(true).stripExtraKeys(false);

            expect(configured.config.maxDepth).toBe(3);
            expect(configured.config.maxKeyCount).toBe(10);
            expect(configured.config.autoConvert).toBe('force');
            expect(configured.config.label).toBe('Payload');
            expect(configured.config.presence).toBe('optional');
            expect(configured.config.strip).toBe(true);
        });
    });
});
