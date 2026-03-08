'use strict';

import DefaultLanguage from '../../../lib/config/DefaultLanguage.ts';
import Processor from '../../../lib/processors/Processor.ts';
import Path from '../../../lib/Path.ts';

Path.delims({ separator: '/', self: '.', up: '..' });

function createEntity({ required = false, forbidden = false, defaultValue = null } = {}) {
    return {
        props: {
            defaultValue,
            label: 'Test Field',
            locale: {
                getText(path) {
                    let pointer = DefaultLanguage;
                    for (const key of path.keys) {
                        pointer = pointer[key];
                    }
                    return pointer;
                }
            }
        },
        isForbidden() {
            return forbidden;
        },
        isRequired() {
            return required;
        }
    };
}

describe('Processor generic presence errors', () => {
    test('should add generic/required when required value is undefined', () => {
        const processor = new Processor({ entity: createEntity({ required: true }) });

        const result = processor.process(undefined);
        const errors = result.getLocalErrors();

        expect(result.pass).toBe(false);
        expect(errors).toHaveLength(1);
        expect(errors[0].errorKey).toBe('generic/required');
        expect(errors[0].text).toBe(DefaultLanguage.errors.generic.required);
    });

    test('should add generic/forbidden when forbidden field is defined', () => {
        const processor = new Processor({ entity: createEntity({ forbidden: true }) });

        const result = processor.process('value');
        const errors = result.getLocalErrors();

        expect(result.pass).toBe(false);
        expect(errors).toHaveLength(1);
        expect(errors[0].errorKey).toBe('generic/forbidden');
        expect(errors[0].text).toBe(DefaultLanguage.errors.generic.forbidden);
    });

    test('should pass when required field is defined', () => {
        const processor = new Processor({ entity: createEntity({ required: true }) });

        const result = processor.process(123);

        expect(result.pass).toBe(true);
        expect(result.getLocalErrors()).toEqual([]);
    });
});
