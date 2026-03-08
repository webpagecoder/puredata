'use strict';

import BooleanHandler from '../../lib/handlers/BooleanHandler.ts';

// ====================================
// VALIDATORS
// ====================================

describe('BooleanHandler.falsy', () => {
    
    test('should pass when value is false', () => {
        const bool = false;
        const result = BooleanHandler.falsy(bool);
        
        expect(result.pass).toBe(true);
        expect(result.value).toBe(false);
    });

    test('should fail when value is true', () => {
        const bool = true;
        const result = BooleanHandler.falsy(bool);
        
        expect(result.pass).toBe(false);
        expect(result.value).toBe(true);
        
        const errors = [...result.errors];
        expect(errors).toHaveLength(1);
        expect(errors[0].key).toBe('boolean/falsy');
        expect(errors[0].args).toEqual({ falsyValues: [] });
    });

    test('should pass when value is in falsyValues array', () => {
        const bool = 'no';
        const result = BooleanHandler.falsy(bool, ['no', 'off', 0]);
        
        expect(result.pass).toBe(true);
        expect(result.value).toBe('no');
    });

    test('should pass when value is 0 in falsyValues', () => {
        const bool = 0;
        const result = BooleanHandler.falsy(bool, [0, 'false', null]);
        
        expect(result.pass).toBe(true);
        expect(result.value).toBe(0);
    });

    test('should pass when value is null in falsyValues', () => {
        const bool = null;
        const result = BooleanHandler.falsy(bool, [null, undefined, '']);
        
        expect(result.pass).toBe(true);
        expect(result.value).toBe(null);
    });

    test('should fail when value is not in falsyValues', () => {
        const bool = 'yes';
        const result = BooleanHandler.falsy(bool, ['no', 'off']);
        
        expect(result.pass).toBe(false);
        expect(result.value).toBe('yes');
        
        const errors = [...result.errors];
        expect(errors).toHaveLength(1);
        expect(errors[0].key).toBe('boolean/falsy');
        expect(errors[0].args).toEqual({ falsyValues: ['no', 'off'] });
    });

    test('should fail when value is 1 but falsyValues contains 0', () => {
        const bool = 1;
        const result = BooleanHandler.falsy(bool, [0, false]);
        
        expect(result.pass).toBe(false);
        expect(result.value).toBe(1);
    });

    test('should handle empty falsyValues array', () => {
        const bool = 'anything';
        const result = BooleanHandler.falsy(bool, []);
        
        expect(result.pass).toBe(false);
        expect(result.value).toBe('anything');
    });

    test('should work with string "false"', () => {
        const bool = 'false';
        const result = BooleanHandler.falsy(bool, ['false', 'no']);
        
        expect(result.pass).toBe(true);
        expect(result.value).toBe('false');
    });

    test('should work with empty string', () => {
        const bool = '';
        const result = BooleanHandler.falsy(bool, ['', 0]);
        
        expect(result.pass).toBe(true);
        expect(result.value).toBe('');
    });

    test('should work with undefined', () => {
        const bool = undefined;
        const result = BooleanHandler.falsy(bool, [undefined, null]);
        
        expect(result.pass).toBe(true);
        expect(result.value).toBe(undefined);
    });

    test('should pass when value is false even with falsyValues array', () => {
        const bool = false;
        const result = BooleanHandler.falsy(bool, ['no', 0, null]);
        
        expect(result.pass).toBe(true);
        expect(result.value).toBe(false);
    });

    test('should pass when value is false with falsy value in array', () => {
        const bool = false;
        const result = BooleanHandler.falsy(false, [false, 0, '']);
        
        expect(result.pass).toBe(true);
        expect(result.value).toBe(false);
    });

});

describe('BooleanHandler.truthy', () => {
    
    test('should pass when value is true', () => {
        const bool = true;
        const result = BooleanHandler.truthy(bool);
        
        expect(result.pass).toBe(true);
        expect(result.value).toBe(true);
    });

    test('should fail when value is false', () => {
        const bool = false;
        const result = BooleanHandler.truthy(bool);
        
        expect(result.pass).toBe(false);
        expect(result.value).toBe(false);
        
        const errors = [...result.errors];
        expect(errors).toHaveLength(1);
        expect(errors[0].key).toBe('boolean/truthy');
        expect(errors[0].args).toEqual({ truthyValues: [] });
    });

    test('should pass when value is in truthyValues array', () => {
        const bool = 'yes';
        const result = BooleanHandler.truthy(bool, ['yes', 'on', 1]);
        
        expect(result.pass).toBe(true);
        expect(result.value).toBe('yes');
    });

    test('should pass when value is 1 in truthyValues', () => {
        const bool = 1;
        const result = BooleanHandler.truthy(bool, [1, 'true', 'yes']);
        
        expect(result.pass).toBe(true);
        expect(result.value).toBe(1);
    });

    test('should pass when value is string "true" in truthyValues', () => {
        const bool = 'true';
        const result = BooleanHandler.truthy(bool, ['true', 'yes', 'on']);
        
        expect(result.pass).toBe(true);
        expect(result.value).toBe('true');
    });

    test('should fail when value is not in truthyValues', () => {
        const bool = 'no';
        const result = BooleanHandler.truthy(bool, ['yes', 'on']);
        
        expect(result.pass).toBe(false);
        expect(result.value).toBe('no');
        
        const errors = [...result.errors];
        expect(errors).toHaveLength(1);
        expect(errors[0].key).toBe('boolean/truthy');
        expect(errors[0].args).toEqual({ truthyValues: ['yes', 'on'] });
    });

    test('should fail when value is 0 but truthyValues contains 1', () => {
        const bool = 0;
        const result = BooleanHandler.truthy(bool, [1, true]);
        
        expect(result.pass).toBe(false);
        expect(result.value).toBe(0);
    });

    test('should handle empty truthyValues array', () => {
        const bool = 'anything';
        const result = BooleanHandler.truthy(bool, []);
        
        expect(result.pass).toBe(false);
        expect(result.value).toBe('anything');
    });

    test('should work with objects in truthyValues', () => {
        const bool = 'active';
        const result = BooleanHandler.truthy(bool, ['active', 'enabled']);
        
        expect(result.pass).toBe(true);
        expect(result.value).toBe('active');
    });

    test('should work with numeric 1', () => {
        const bool = 1;
        const result = BooleanHandler.truthy(bool, [1]);
        
        expect(result.pass).toBe(true);
        expect(result.value).toBe(1);
    });

    test('should fail with null when not in truthyValues', () => {
        const bool = null;
        const result = BooleanHandler.truthy(bool, [true, 1]);
        
        expect(result.pass).toBe(false);
        expect(result.value).toBe(null);
    });

    test('should work with mixed data types in truthyValues', () => {
        const bool = 'on';
        const result = BooleanHandler.truthy(bool, [1, 'on', true]);
        
        expect(result.pass).toBe(true);
        expect(result.value).toBe('on');
    });

    test('should pass when value is true even with truthyValues array', () => {
        const bool = true;
        const result = BooleanHandler.truthy(bool, ['yes', 'on', 1]);
        
        expect(result.pass).toBe(true);
        expect(result.value).toBe(true);
    });

    test('should pass when value is true with true in truthyValues array', () => {
        const bool = true;
        const result = BooleanHandler.truthy(true, [true, 'yes', 1]);
        
        expect(result.pass).toBe(true);
        expect(result.value).toBe(true);
    });

});






// ====================================
// MUTATORS 
// ====================================

describe('BooleanHandler.invert', () => {
    
    test('should invert true to false', () => {
        const bool = true;
        const result = BooleanHandler.invert(bool);
        
        expect(result.pass).toBe(true);
        expect(result.value).toBe(false);
    });

    test('should invert false to true', () => {
        const bool = false;
        const result = BooleanHandler.invert(bool);
        
        expect(result.pass).toBe(true);
        expect(result.value).toBe(true);
    });

    test('should work with custom boolish pair', () => {
        const bool = 'yes';
        const result = BooleanHandler.invert(bool, [['yes', 'no']]);
        
        expect(result.pass).toBe(true);
        expect(result.value).toBe('no');
    });

    test('should invert custom boolish pair in reverse', () => {
        const bool = 'no';
        const result = BooleanHandler.invert(bool, [['yes', 'no']]);
        
        expect(result.pass).toBe(true);
        expect(result.value).toBe('yes');
    });

    test('should work with numeric pairs', () => {
        const bool = 1;
        const result = BooleanHandler.invert(bool, [[1, 0]]);
        
        expect(result.pass).toBe(true);
        expect(result.value).toBe(0);
    });

    test('should invert 0 to 1 with numeric pair', () => {
        const bool = 0;
        const result = BooleanHandler.invert(bool, [[1, 0]]);
        
        expect(result.pass).toBe(true);
        expect(result.value).toBe(1);
    });

    test('should work with multiple custom pairs', () => {
        const bool = 'on';
        const result = BooleanHandler.invert(bool, [['yes', 'no'], ['on', 'off']]);
        
        expect(result.pass).toBe(true);
        expect(result.value).toBe('off');
    });

    test('should check all pairs and use first match', () => {
        const bool = 'yes';
        const result = BooleanHandler.invert(bool, [['yes', 'no'], ['on', 'off']]);
        
        expect(result.pass).toBe(true);
        expect(result.value).toBe('no');
    });

    test('should fail when value does not match any pair', () => {
        const bool = 'maybe';
        const result = BooleanHandler.invert(bool, [['yes', 'no']]);
        
        expect(result.pass).toBe(false);
        expect(result.value).toBe('maybe');
        
        const errors = [...result.errors];
        expect(errors).toHaveLength(1);
        expect(errors[0].key).toBe('boolean/invert');
        expect(errors[0].args).toEqual({ boolishPairs: [['yes', 'no'], [true, false]] });
    });

    test('should work with string true/false', () => {
        const bool = 'true';
        const result = BooleanHandler.invert(bool, [['true', 'false']]);
        
        expect(result.pass).toBe(true);
        expect(result.value).toBe('false');
    });

    test('should work with enabled/disabled', () => {
        const bool = 'enabled';
        const result = BooleanHandler.invert(bool, [['enabled', 'disabled']]);
        
        expect(result.pass).toBe(true);
        expect(result.value).toBe('disabled');
    });

    test('should invert disabled to enabled', () => {
        const bool = 'disabled';
        const result = BooleanHandler.invert(bool, [['enabled', 'disabled']]);
        
        expect(result.pass).toBe(true);
        expect(result.value).toBe('enabled');
    });

    test('should work with active/inactive', () => {
        const bool = 'active';
        const result = BooleanHandler.invert(bool, [['active', 'inactive']]);
        
        expect(result.pass).toBe(true);
        expect(result.value).toBe('inactive');
    });

    test('should fail with null when not in any pair', () => {
        const bool = null;
        const result = BooleanHandler.invert(bool, [['yes', 'no']]);
        
        expect(result.pass).toBe(false);
        expect(result.value).toBe(null);
    });

    test('should work with empty boolishPairs array', () => {
        const bool = true;
        const result = BooleanHandler.invert(bool, []);
        
        expect(result.pass).toBe(true);
        expect(result.value).toBe(false);
    });

    test('should prioritize custom pairs over default true/false', () => {
        const bool = true;
        const result = BooleanHandler.invert(bool, [['yes', 'no']]);
        
        expect(result.pass).toBe(true);
        expect(result.value).toBe(false);
    });

    test('should handle asymmetric inversions', () => {
        const bool = 'start';
        const result = BooleanHandler.invert(bool, [['start', 'stop']]);
        
        expect(result.pass).toBe(true);
        expect(result.value).toBe('stop');
    });

    test('should work with case-sensitive strings', () => {
        const bool = 'Yes';
        const result = BooleanHandler.invert(bool, [['Yes', 'No']]);
        
        expect(result.pass).toBe(true);
        expect(result.value).toBe('No');
    });

    test('should invert when value is 0 and paired with 1', () => {
        const bool = 0;
        const result = BooleanHandler.invert(bool, [[0, 1]]);
        
        expect(result.pass).toBe(true);
        expect(result.value).toBe(1);
    });

    test('should invert when value is null and paired with a string', () => {
        const bool = null;
        const result = BooleanHandler.invert(bool, [[null, 'active']]);
        
        expect(result.pass).toBe(true);
        expect(result.value).toBe('active');
    });

    test('should invert when value is empty string and paired with non-empty', () => {
        const bool = '';
        const result = BooleanHandler.invert(bool, [['', 'filled']]);
        
        expect(result.pass).toBe(true);
        expect(result.value).toBe('filled');
    });

    test('should invert back from empty string to non-empty', () => {
        const bool = 'filled';
        const result = BooleanHandler.invert(bool, [['', 'filled']]);
        
        expect(result.pass).toBe(true);
        expect(result.value).toBe('');
    });

    test('should handle false as falsy in pair', () => {
        const bool = 0;
        const result = BooleanHandler.invert(bool, [[1, 0]]);
        
        expect(result.pass).toBe(true);
        expect(result.value).toBe(1);
    });

    test('should fail when value is falsy (null) with no matching pair', () => {
        const bool = undefined;
        const result = BooleanHandler.invert(bool, [['yes', 'no']]);
        
        expect(result.pass).toBe(false);
        expect(result.value).toBe(undefined);
    });

});
