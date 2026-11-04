'use strict';

import { PureData } from '../../../../lib/PureData.ts';
import { ConditionalField } from '../../../../lib/fields/schema/conditional/ConditionalField.ts';
import { ConditionalProcessor } from '../../../../lib/fields/schema/conditional/ConditionalProcessor.ts';

describe('ConditionalField', () => {
    const createBaseField = (): ConditionalField => {
        return new ConditionalField({
            fieldFactory: PureData,
            comparisonField: PureData.any(),
            targetPathStr: '/value',
        });
    };

    describe('constructor and processor wiring', () => {
        it('requires fieldFactory', () => {
            expect(() => {
                new ConditionalField({
                    comparisonField: PureData.any(),
                    targetPathStr: '/value',
                });
            }).toThrow('ConditionalField requires a fieldFactory to be provided in the constructor arguments');
        });

        it('requires comparisonField', () => {
            expect(() => {
                new ConditionalField({
                    fieldFactory: PureData,
                    targetPathStr: '/value',
                });
            }).toThrow('comparisonField value required');
        });

        it('requires targetPath or targetPathStr', () => {
            expect(() => {
                new ConditionalField({
                    fieldFactory: PureData,
                    comparisonField: PureData.any(),
                });
            }).toThrow('Must supply either targetPath or targetPathStr');
        });

        it('builds default conditional config and optional presence', () => {
            const field = createBaseField();

            expect(field.config.buildStage).toBe(0);
            expect(field.config.comparisonMode).toBe('equals');
            expect(field.config.conditionalChain).toEqual([]);
            expect(field.config.thenField).toBeNull();
            expect(field.config.otherwiseField).toBeNull();
            expect(field.config.presence).toBe('optional');
        });

        it('createProcessor returns a ConditionalProcessor instance', () => {
            expect(createBaseField().createProcessor()).toBeInstanceOf(ConditionalProcessor);
        });
    });

    describe('cloning', () => {
        it('clone reparses targetPathStr overrides', () => {
            const field = createBaseField();
            const clone = field.clone({ targetPathStr: '/next' });

            expect(field.config.targetPath.toString({ self: '.', separator: '/', up: '..' })).toBe('/value');
            expect(clone.config.targetPath.toString({ self: '.', separator: '/', up: '..' })).toBe('/next');
        });
    });

    describe('conditional chain builders', () => {
        it('or and and append conditional entries', () => {
            const andChain = createBaseField().and('/other', PureData.any());
            const orChain = createBaseField().or('/other', PureData.any());

            expect(andChain.config.conditionalChain).toHaveLength(1);
            expect(andChain.config.conditionalChain[0][0]).toBe('and');
            expect(andChain.config.conditionalChain[0][1]).toBeInstanceOf(ConditionalField);
            expect(orChain.config.conditionalChain[0][0]).toBe('or');
        });

        it('or accepts an existing ConditionalField entry', () => {
            const entry = createBaseField();
            const chain = createBaseField().or(entry);

            expect(chain.config.conditionalChain).toHaveLength(1);
            expect(chain.config.conditionalChain[0][1]).toBe(entry);
        });

        it('and/or reject illegal placement and missing comparison field', () => {
            const base = createBaseField();
            const staged = base.then('ok');
            const callOrWithoutComparison = (): ConditionalField => {
                return (base as unknown as {
                    or: (targetPathStr: string, comparisonField: unknown) => ConditionalField;
                }).or('/x', null);
            };

            expect(() => staged.and('/x', PureData.any())).toThrow('Illegal placement of "and" in condition chain');
            expect(callOrWithoutComparison).toThrow('Must supply a comparison field along with the path string');
        });
    });

    describe('result branch configurators', () => {
        it('then and otherwise enforce staging rules', () => {
            const base = createBaseField();
            const withThen = base.then('accepted');
            const withOtherwise = withThen.otherwise('rejected');

            expect(withThen.config.buildStage).toBe(1);
            expect(withThen.config.thenField).not.toBeNull();
            expect(withOtherwise.config.buildStage).toBe(2);
            expect(withOtherwise.config.otherwiseField).not.toBeNull();
            expect(() => base.otherwise('nope')).toThrow('Illegal placement of "otherwise" in condition chain');
            expect(() => withThen.then('again')).toThrow('Illegal placement of "then" in condition chain');
        });
    });
});
