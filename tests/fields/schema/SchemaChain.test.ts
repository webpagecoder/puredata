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

            expect(chain.config.clone).toBe(true);
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
    });
});
