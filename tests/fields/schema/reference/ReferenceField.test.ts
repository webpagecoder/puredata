'use strict';

import { ReferenceField } from '../../../../lib/fields/schema/reference/ReferenceField.ts';
import { ReferenceProcessor } from '../../../../lib/fields/schema/reference/ReferenceProcessor.ts';

describe('ReferenceField', () => {
    describe('constructor and processor wiring', () => {
        it('applies default reference config', () => {
            const field = new ReferenceField();

            expect(field.config.path.toString({ self: '.', separator: '/', up: '..' })).toBe('.');
            expect(field.config.defaultOrCallback).toBe(undefined);
        });

        it('applies provided path and fallback config', () => {
            const fallback = 'missing';
            const field = new ReferenceField({
                pathStr: '/user/name',
                defaultOrCallback: fallback,
            });

            expect(field.config.path.toString({ self: '.', separator: '/', up: '..' })).toBe('/user/name');
            expect(field.config.defaultOrCallback).toBe(fallback);
        });

        it('createProcessor returns a ReferenceProcessor instance', () => {
            expect(new ReferenceField().createProcessor()).toBeInstanceOf(ReferenceProcessor);
        });
    });

    describe('cloning', () => {
        it('clone reparses pathStr overrides without mutating source', () => {
            const field = new ReferenceField({ pathStr: '/a' });
            const clone = field.clone({ pathStr: '/b' });

            expect(field.config.path.toString({ self: '.', separator: '/', up: '..' })).toBe('/a');
            expect(clone.config.path.toString({ self: '.', separator: '/', up: '..' })).toBe('/b');
        });
    });
});
