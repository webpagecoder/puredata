'use strict';

import BooleanHandler  from '../../lib/processors/BooleanHandler.js';
import GenericHandler  from '../../lib/processors/GenericHandler.js';


describe('BooleanHandler.truthy', () => {
    it('should pass for boolean true', () => {
        const result = BooleanHandler.truthy(true);
        expect(result.pass).toBe(true);
        expect(result.value).toBe(true);
    });

    it('should fail for boolean false', () => {
        const result = BooleanHandler.truthy(false);
        expect(result.pass).toBe(false);
        expect(result.value).toBe(false);
    });

    it('should pass for truthyValues value', () => {
        const result = BooleanHandler.truthy('yes', ['yes']);
        expect(result.pass).toBe(true);
        expect(result.value).toBe('yes');
    });

    it('should fail for non-truthy value', () => {
        const result = BooleanHandler.truthy('no', ['yes']);
        expect(result.pass).toBe(false);
        expect(result.value).toBe('no');
    });
});

describe('BooleanHandler.falsy', () => {
    it('should pass for boolean false', () => {
        const result = BooleanHandler.falsy(false);
        expect(result.pass).toBe(true);
        expect(result.value).toBe(false);
    });

    it('should fail for boolean true', () => {
        const result = BooleanHandler.falsy(true);
        expect(result.pass).toBe(false);
        expect(result.value).toBe(true);
    });

    it('should pass for falsyValues value', () => {
        const result = BooleanHandler.falsy('no', ['no']);
        expect(result.pass).toBe(true);
        expect(result.value).toBe('no');
    });

    it('should fail for non-falsy value', () => {
        const result = BooleanHandler.falsy('yes', ['no']);
        expect(result.pass).toBe(false);
        expect(result.value).toBe('yes');
    });
});

describe('BooleanHandler.invert', () => {
    it('should invert boolean true to false', () => {
        const result = BooleanHandler.invert(true);
        expect(result.pass).toBe(true);
        expect(result.value).toBe(false);
    });

    it('should invert boolean false to true', () => {
        const result = BooleanHandler.invert(false);
        expect(result.pass).toBe(true);
        expect(result.value).toBe(true);
    });

    it('should invert truthy value using boolish pairs', () => {
        const boolishPairs = [['yes', 'no'], ['on', 'off']];
        const result = BooleanHandler.invert('yes', boolishPairs);
        expect(result.pass).toBe(true);
        expect(result.value).toBe('no');
    });

    it('should invert falsy value using boolish pairs', () => {
        const boolishPairs = [['yes', 'no'], ['on', 'off']];
        const result = BooleanHandler.invert('no', boolishPairs);
        expect(result.pass).toBe(true);
        expect(result.value).toBe('yes');
    });

    it('should fail for non-boolean value without boolish pairs', () => {
        const result = BooleanHandler.invert('maybe');
        expect(result.pass).toBe(false);
    });

    it('should handle numeric boolish pairs', () => {
        const boolishPairs = [[1, 0], ['true', 'false']];
        expect(BooleanHandler.invert(1, boolishPairs).value).toBe(0);
        expect(BooleanHandler.invert(0, boolishPairs).value).toBe(1);
    });
});
