'use strict';

import { PureData } from '../../../lib/PureData.ts';
import { SchemaChain } from '../../../lib/fields/schema/SchemaChain.ts';
import { ReferenceField } from '../../../lib/fields/schema/reference/ReferenceField.ts';

describe('SchemaProcessor', () => {
    const createSchema = (overrides: Partial<ConstructorParameters<typeof SchemaChain>[0]> = {}) => {
        return new SchemaChain({
            fieldFactory: PureData,
            schema: {},
            ...overrides,
        });
    };

    describe('basic functionality', () => {
        it('works', () => {
            const schema = createSchema({ schema: {
                ref1: new ReferenceField({ pathStr: '/ref2', defaultOrCallback: x => x+1 }),
                name: PureData.string(),
                sub: {
                    sub2: {
                        x: PureData.number(),
                    }
                },
                age: PureData.number(),
                ref2: new ReferenceField({ pathStr: 'sub/sub2/x' }),
            }}).stripExtraKeys().pickRandom(1);

            // const tracker = schema.process({
            //     name: 'Alice',
            //     age: 30,
            //     extra: true,
            // });

            // expect(tracker.pass).toBe(true);
            // expect(tracker.value).toEqual({
            //     name: 'Alice',
            //     age: 30,
            // });

            const tracker2 = schema.process({
                ref1: undefined,
                ref2: undefined,
                name: 'john',
                age: 22,
                sub: {
                    sub2: {
                        x: 5
                    }
                }
            });
            console.log(tracker2.value);
        });
    });



    // describe('processor behavior without schema subfields', () => {
    //     it('strips extra keys when stripExtraKeys is enabled', () => {
    //         const tracker = createSchema({ stripExtraKeys: true }).process({ keep: 1, drop: 2 });

    //         expect(tracker.pass).toBe(true);
    //         expect(tracker.value).toEqual({});
    //     });

    //     it('keeps extra keys when stripExtraKeys is disabled', () => {
    //         const tracker = createSchema({ stripExtraKeys: false }).process({ keep: 1, drop: 2 });

    //         expect(tracker.pass).toBe(true);
    //         expect(tracker.value).toEqual({ keep: 1, drop: 2 });
    //     });

    //     it('runs object pipeline methods before returning', () => {
    //         const tracker = createSchema({ stripExtraKeys: false })
    //             .addToPipeline('stripKeys', [['keep']])
    //             .process({ keep: 1, drop: 2 });

    //         expect(tracker.pass).toBe(true);
    //         expect(tracker.value).toEqual({ keep: 1 });
    //     });
    // });

    // describe('inherited object preProcess behavior', () => {
    //     it('rejects non-object values', () => {
    //         const tracker = createSchema().process('not-object');

    //         expect(tracker.fail).toBe(true);
    //         expect(tracker.ownErrors.some(error => error.errorKey === 'object/base')).toBe(true);
    //     });

    //     it('enforces object complexity limits', () => {
    //         const tracker = createSchema({
    //             maxDepth: 1,
    //             stripExtraKeys: false,
    //         }).process({ a: { b: 1 } });

    //         expect(tracker.fail).toBe(true);
    //         expect(tracker.ownErrors.some(error => error.errorKey === 'object/tooComplex')).toBe(true);
    //     });
    // });

    // describe('interaction with base AnyProcessor preProcess', () => {
    //     it('preserves required failures from base preProcess', () => {
    //         const tracker = createSchema().required().process(undefined);

    //         expect(tracker.fail).toBe(true);
    //         expect(tracker.ownErrors.some(error => error.errorKey === 'any/required')).toBe(true);
    //         expect(tracker.ownErrors.some(error => error.errorKey === 'object/base')).toBe(false);
    //     });

    //     it('immutable bypasses schema processing logic', () => {
    //         const chain = createSchema({ stripExtraKeys: false })
    //             .default({ fixed: true })
    //             .immutable()
    //             .addToPipeline('stripKeys', [['fixed']]);

    //         const tracker = chain.process({ fixed: false, extra: true });

    //         expect(tracker.pass).toBe(true);
    //         expect(tracker.value).toEqual({ fixed: true });
    //     });
    // });
});

