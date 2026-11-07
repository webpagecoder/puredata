'use strict';

import { Path } from '../../../../lib/Path.ts';
import { PointerField } from '../../../../lib/fields/schema/pointer/PointerField.ts';
import { PointerProcessor } from '../../../../lib/fields/schema/pointer/PointerProcessor.ts';

describe('PointerField', () => {
    describe('constructor and processor wiring', () => {
        it('applies default pointer config', () => {
            const field = new PointerField();

            expect(field.config.fieldPath).toBeInstanceOf(Path);
            expect(field.config.nestMinDepth).toBeNull();
            expect(field.config.nestMaxDepth).toBeNull();
        });

        it('applies provided pointer config', () => {
            const path = new Path('/user/name');
            const field = new PointerField({
                fieldPath: path,
                nestMinDepth: 1,
                nestMaxDepth: 3,
            });

            expect(field.config.fieldPath).toBe(path);
            expect(field.config.nestMinDepth).toBe(1);
            expect(field.config.nestMaxDepth).toBe(3);
        });

        it('createProcessor returns a PointerProcessor instance', () => {
            expect(new PointerField().createProcessor()).toBeInstanceOf(PointerProcessor);
        });
    });

    describe('cloning', () => {
        it('clone applies overrides without mutating source config', () => {
            const source = new PointerField({
                fieldPath: new Path('/source'),
                nestMinDepth: 1,
                nestMaxDepth: 2,
            });

            const clone = source.clone({
                fieldPath: new Path('/clone'),
                nestMinDepth: 3,
            });

            expect(source.config.fieldPath.toString({ self: '.', separator: '/', up: '..' })).toBe('/source');
            expect(source.config.nestMinDepth).toBe(1);
            expect(source.config.nestMaxDepth).toBe(2);
            expect(clone.config.fieldPath.toString({ self: '.', separator: '/', up: '..' })).toBe('/clone');
            expect(clone.config.nestMinDepth).toBe(3);
            expect(clone.config.nestMaxDepth).toBe(2);
        });
    });
});
