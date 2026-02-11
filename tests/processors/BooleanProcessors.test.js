'use strict';

const BooleanProcessors = require('../../lib/processors/BooleanProcessors');
const GenericProcessors = require('../../lib/processors/GenericProcessors');


describe('BooleanProcessors.truthy', () => {
    it('should pass for boolean true', () => {
        const result = BooleanProcessors.truthy(true);
        expect(result.pass).toBe(true);
        expect(result.value).toBe(true);
    });

    it('should fail for boolean false', () => {
        const result = BooleanProcessors.truthy(false);
        expect(result.pass).toBe(false);
        expect(result.value).toBe(false);
    });

    it('should pass for truthyValues value', () => {
        const result = BooleanProcessors.truthy('yes', ['yes']);
        expect(result.pass).toBe(true);
        expect(result.value).toBe('yes');
    });

    it('should fail for non-truthy value', () => {
        const result = BooleanProcessors.truthy('no', ['yes']);
        expect(result.pass).toBe(false);
        expect(result.value).toBe('no');
    });
});

describe('BooleanProcessors.falsy', () => {
    it('should pass for boolean false', () => {
        const result = BooleanProcessors.falsy(false);
        expect(result.pass).toBe(true);
        expect(result.value).toBe(false);
    });

    it('should fail for boolean true', () => {
        const result = BooleanProcessors.falsy(true);
        expect(result.pass).toBe(false);
        expect(result.value).toBe(true);
    });

    it('should pass for falsyValues value', () => {
        const result = BooleanProcessors.falsy('no', ['no']);
        expect(result.pass).toBe(true);
        expect(result.value).toBe('no');
    });

    it('should fail for non-falsy value', () => {
        const result = BooleanProcessors.falsy('yes', ['no']);
        expect(result.pass).toBe(false);
        expect(result.value).toBe('yes');
    });
});

describe('BooleanProcessors.invert', () => {
    it('should invert boolean true to false', () => {
        const result = BooleanProcessors.invert(true);
        expect(result.pass).toBe(true);
        expect(result.value).toBe(false);
    });

    it('should invert boolean false to true', () => {
        const result = BooleanProcessors.invert(false);
        expect(result.pass).toBe(true);
        expect(result.value).toBe(true);
    });

    it('should invert truthy value using boolish pairs', () => {
        const boolishPairs = [['yes', 'no'], ['on', 'off']];
        const result = BooleanProcessors.invert('yes', boolishPairs);
        expect(result.pass).toBe(true);
        expect(result.value).toBe('no');
    });

    it('should invert falsy value using boolish pairs', () => {
        const boolishPairs = [['yes', 'no'], ['on', 'off']];
        const result = BooleanProcessors.invert('no', boolishPairs);
        expect(result.pass).toBe(true);
        expect(result.value).toBe('yes');
    });

    it('should fail for non-boolean value without boolish pairs', () => {
        const result = BooleanProcessors.invert('maybe');
        expect(result.pass).toBe(false);
    });

    it('should handle numeric boolish pairs', () => {
        const boolishPairs = [[1, 0], ['true', 'false']];
        expect(BooleanProcessors.invert(1, boolishPairs).value).toBe(0);
        expect(BooleanProcessors.invert(0, boolishPairs).value).toBe(1);
    });
});
