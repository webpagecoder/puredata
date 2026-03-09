'use strict';

import Field from '../../lib/fields/Field.ts';
import Chain from '../../lib/fields/Chain.ts';
import Locale from '../../lib/Locale.ts';
import DefaultLanguage from '../../lib/config/DefaultLanguage.ts';

class DynamicChain extends Chain {}

Locale.register('en-US', DefaultLanguage);
const locale = new Locale('en-US');

describe('Field proxy fallback', () => {
    test('routes unknown methods to addStep when available', () => {
        const processors = {
            myDynamicStep: (value) => value,
        };

        const chain = new DynamicChain({ processors, locale });
        const updated = chain.myDynamicStep('a', 'b');

        expect(updated).toBeInstanceOf(DynamicChain);
        expect(updated.props.pipeline).toHaveLength(1);
        expect(updated.props.pipeline[0]).toMatchObject({
            fn: processors.myDynamicStep,
            args: ['a', 'b'],
            prioritize: false,
        });
    });

    test('throws chain addStep error when missing processor is called dynamically', () => {
        const chain = new DynamicChain({ processors: {}, locale });
        expect(() => chain.unknownValidator()).toThrow("Filter 'unknownValidator' not found in processors");
    });

    test('does not fabricate unknown methods for plain Field', () => {
        const field = new Field({ locale });

        expect(field.unknownMethod).toBeUndefined();
        expect(() => field.unknownMethod()).toThrow(TypeError);
    });
});
