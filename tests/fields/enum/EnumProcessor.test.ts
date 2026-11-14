'use strict';

import { EnumField } from '../../../lib/fields/enum/EnumField.ts';

describe('EnumProcessor', () => {
    describe('array structures', () => {
        it('passes when value is included in allowed values', () => {
            const field = new EnumField({ structure: ['a', 'b', 'c'] });
            const tracker = field.process('b');

            expect(tracker.pass).toBe(true);
            expect(tracker.value).toBe('b');
            expect(tracker.ownErrors).toHaveLength(0);
        });

        it('fails when value is not included and exposes allowed values args', () => {
            const field = new EnumField({ structure: ['a', 'b', 'c'] });
            const tracker = field.process('z');

            expect(tracker.fail).toBe(true);
            expect(tracker.ownErrors).toHaveLength(1);
            expect(tracker.ownErrors[0].errorKey).toBe('enum/allowedValues');
            expect(tracker.ownErrors[0].args.allowedValues).toEqual(['a', 'b', 'c']);
        });

        it('uses strict inclusion checks for complex values', () => {
            const ref = { id: 1 };
            const field = new EnumField({ structure: [ref] });

            expect(field.process(ref).pass).toBe(true);
            expect(field.process({ id: 1 }).fail).toBe(true);
        });
    });

    describe('object structures', () => {
        it('maps enum keys to configured values', () => {
            const field = new EnumField({
                structure: {
                    admin: 1,
                    user: 2,
                },
            });
            const tracker = field.process('user');

            expect(tracker.pass).toBe(true);
            expect(tracker.value).toBe(2);
            expect(tracker.ownErrors).toHaveLength(0);
        });

        it('accepts numeric-like keys via JavaScript property-key coercion', () => {
            const field = new EnumField({
                structure: {
                    1: 'one',
                    2: 'two',
                },
            });
            const tracker = field.process(1);

            expect(tracker.pass).toBe(true);
            expect(tracker.value).toBe('one');
        });

        it('fails on unknown keys and reports object keys as allowed values', () => {
            const field = new EnumField({
                structure: {
                    admin: 1,
                    user: 2,
                },
            });
            const tracker = field.process('guest');

            expect(tracker.fail).toBe(true);
            expect(tracker.ownErrors).toHaveLength(1);
            expect(tracker.ownErrors[0].errorKey).toBe('enum/allowedValues');
            expect(tracker.ownErrors[0].args.allowedValues).toEqual(['admin', 'user']);
        });
    });

    describe('processor-specific behavior', () => {
        it('does not apply base field default/presence preprocessors', () => {
            const withDefault = new EnumField({
                defaultValue: 'admin',
                structure: {
                    admin: 1,
                },
            });
            const requiredField = new EnumField({
                presence: 'required',
                structure: {
                    admin: 1,
                },
            });
            const forbiddenField = new EnumField({
                presence: 'forbidden',
                structure: {
                    admin: 1,
                },
            });

            const defaultTracker = withDefault.process(undefined);
            const requiredTracker = requiredField.process(undefined);
            const forbiddenTracker = forbiddenField.process('admin');

            expect(defaultTracker.fail).toBe(true);
            expect(defaultTracker.ownErrors[0].errorKey).toBe('enum/allowedValues');
            expect(requiredTracker.ownErrors[0].errorKey).toBe('enum/allowedValues');
            expect(forbiddenTracker.pass).toBe(true);
            expect(forbiddenTracker.value).toBe(1);
        });
    });
});
