'use strict';

import { EnumField } from '../../../lib/fields/enum/EnumField.ts';
import { EnumProcessor } from '../../../lib/fields/enum/EnumProcessor.ts';

describe('EnumField', () => {
    describe('constructor and processor wiring', () => {
        it('applies default structure', () => {
            const field = new EnumField();

            expect(field.config.structure).toEqual([]);
        });

        it('applies provided structure override', () => {
            const structure = { admin: 1, user: 2 };
            const field = new EnumField({ structure });

            expect(field.config.structure).toBe(structure);
        });

        it('createProcessor returns an EnumProcessor instance', () => {
            expect(new EnumField().createProcessor()).toBeInstanceOf(EnumProcessor);
        });
    });

    describe('cloning', () => {
        it('clone applies structure override without mutating source', () => {
            const field = new EnumField({ structure: ['a', 'b'] });
            const clone = field.clone({ structure: ['x'] });

            expect(field.config.structure).toEqual(['a', 'b']);
            expect(clone.config.structure).toEqual(['x']);
        });
    });
});
