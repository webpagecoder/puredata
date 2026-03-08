'use strict';

import NumberHandler from '../../lib/handlers/NumberHandler.ts';

// ====================================
// VALIDATORS
// ====================================

describe('NumberHandler.approx', () => {
    test('should pass within tolerance', () => {
        const result = NumberHandler.approx(10.001, 10, 0.01);
        expect(result.pass).toBe(true);
        expect(result.value).toBe(10.001);
    });

    test('should fail outside tolerance', () => {
        const result = NumberHandler.approx(10.1, 10, 0.01);
        expect(result.pass).toBe(false);
        expect([...result.errors][0].key).toBe('number/approx');
    });

    test('should use default tolerance when omitted', () => {
        const result = NumberHandler.approx(1, 1 + Number.EPSILON / 2);
        expect(result.pass).toBe(true);
    });

    test('should fail when difference equals tolerance', () => {
        const result = NumberHandler.approx(1.5, 1, 0.5);
        expect(result.pass).toBe(false);
    });
});

describe('NumberHandler.between', () => {
    test('should pass when number is between bounds', () => {
        const result = NumberHandler.between(5, 1, 10);
        expect(result.pass).toBe(true);
    });

    test('should fail when number is outside bounds', () => {
        const result = NumberHandler.between(11, 1, 10);
        expect(result.pass).toBe(false);
        expect([...result.errors][0].key).toBe('number/between');
    });

    test('should pass when number equals lower bound', () => {
        const result = NumberHandler.between(1, 1, 10);
        expect(result.pass).toBe(true);
    });

    test('should pass when number equals upper bound', () => {
        const result = NumberHandler.between(10, 1, 10);
        expect(result.pass).toBe(true);
    });
});

describe('NumberHandler.decimal', () => {
    test('should pass for decimal within configured precision', () => {
        const result = NumberHandler.decimal(1.23, { minDecimalPlaces: 1, maxDecimalPlaces: 3 });
        expect(result.pass).toBe(true);
    });

    test('should fail for integer', () => {
        const result = NumberHandler.decimal(2);
        expect(result.pass).toBe(false);
        expect([...result.errors][0].key).toBe('number/decimal');
    });

    test('should fail for decimal place count outside range', () => {
        const result = NumberHandler.decimal(1.2345, { maxDecimalPlaces: 2 });
        expect(result.pass).toBe(false);
    });

    test('should fail when decimal places are below minimum', () => {
        const result = NumberHandler.decimal(1.2, { minDecimalPlaces: 2, maxDecimalPlaces: 4 });
        expect(result.pass).toBe(false);
        expect([...result.errors][0].key).toBe('number/decimal');
    });

    test('should handle scientific notation branch without decimal point', () => {
        const result = NumberHandler.decimal(1e-7, { minDecimalPlaces: 0, maxDecimalPlaces: 0 });
        expect(result.pass).toBe(true);
    });
});

describe('NumberHandler.equals', () => {
    test('should pass when values are equal', () => {
        const result = NumberHandler.equals(5, 5);
        expect(result.pass).toBe(true);
    });

    test('should fail when values are different', () => {
        const result = NumberHandler.equals(5, 6);
        expect(result.pass).toBe(false);
        expect([...result.errors][0].key).toBe('number/equals');
    });
});

describe('NumberHandler.even', () => {
    test('should pass for even number', () => {
        expect(NumberHandler.even(4).pass).toBe(true);
    });

    test('should fail for odd number', () => {
        const result = NumberHandler.even(3);
        expect(result.pass).toBe(false);
        expect([...result.errors][0].key).toBe('number/even');
    });
});

describe('NumberHandler.factor', () => {
    test('should pass when number is a factor of multiple', () => {
        expect(NumberHandler.factor(3, 12).pass).toBe(true);
    });

    test('should fail when number is not a factor of multiple', () => {
        const result = NumberHandler.factor(5, 12);
        expect(result.pass).toBe(false);
        expect([...result.errors][0].key).toBe('number/factor');
    });

    test('should pass for negative factor values', () => {
        const result = NumberHandler.factor(-3, 12);
        expect(result.pass).toBe(true);
    });
});

describe('NumberHandler.finite', () => {
    test('should pass for finite number', () => {
        expect(NumberHandler.finite(123.45).pass).toBe(true);
    });

    test('should fail for Infinity', () => {
        const result = NumberHandler.finite(Infinity);
        expect(result.pass).toBe(false);
        expect([...result.errors][0].key).toBe('number/finite');
    });

    test('should fail for -Infinity', () => {
        const result = NumberHandler.finite(-Infinity);
        expect(result.pass).toBe(false);
    });

    test('should fail for NaN', () => {
        const result = NumberHandler.finite(NaN);
        expect(result.pass).toBe(false);
    });
});

describe('NumberHandler.greaterThan', () => {
    test('should pass when number is greater than comparison', () => {
        expect(NumberHandler.greaterThan(10, 5).pass).toBe(true);
    });

    test('should fail when number is not greater than comparison', () => {
        expect(NumberHandler.greaterThan(5, 5).pass).toBe(false);
    });
});

describe('NumberHandler.infinity', () => {
    test('should pass for Infinity', () => {
        expect(NumberHandler.infinity(Infinity).pass).toBe(true);
    });

    test('should pass for -Infinity', () => {
        expect(NumberHandler.infinity(-Infinity).pass).toBe(true);
    });

    test('should fail for finite number', () => {
        expect(NumberHandler.infinity(1).pass).toBe(false);
    });
});

describe('NumberHandler.integer', () => {
    test('should pass for integer', () => {
        expect(NumberHandler.integer(10).pass).toBe(true);
    });

    test('should fail for non-integer', () => {
        expect(NumberHandler.integer(10.5).pass).toBe(false);
    });
});

describe('NumberHandler.lessThan', () => {
    test('should pass when number is less than comparison', () => {
        expect(NumberHandler.lessThan(4, 5).pass).toBe(true);
    });

    test('should fail when number is not less than comparison', () => {
        expect(NumberHandler.lessThan(5, 5).pass).toBe(false);
    });
});

describe('NumberHandler.max', () => {
    test('should pass when value is below or equal max', () => {
        expect(NumberHandler.max(5, 5).pass).toBe(true);
    });

    test('should fail when value exceeds max', () => {
        expect(NumberHandler.max(6, 5).pass).toBe(false);
    });
});

describe('NumberHandler.min', () => {
    test('should pass when value is above or equal min', () => {
        expect(NumberHandler.min(5, 5).pass).toBe(true);
    });

    test('should fail when value is below min', () => {
        expect(NumberHandler.min(4, 5).pass).toBe(false);
    });
});

describe('NumberHandler.minusSign', () => {
    test('should pass when string has minus sign', () => {
        expect(NumberHandler.minusSign('-5').pass).toBe(true);
    });

    test('should fail when no minus sign', () => {
        expect(NumberHandler.minusSign(5).pass).toBe(false);
    });
});

describe('NumberHandler.multiple', () => {
    test('should pass when number is a multiple of factor', () => {
        expect(NumberHandler.multiple(12, 3).pass).toBe(true);
    });

    test('should fail when number is not a multiple of factor', () => {
        expect(NumberHandler.multiple(10, 3).pass).toBe(false);
    });

    test('should pass when number is zero', () => {
        expect(NumberHandler.multiple(0, 3).pass).toBe(true);
    });
});

describe('NumberHandler.negative', () => {
    test('should pass for negative number', () => {
        expect(NumberHandler.negative(-1).pass).toBe(true);
    });

    test('should fail for zero or positive number', () => {
        expect(NumberHandler.negative(0).pass).toBe(false);
    });
});

describe('NumberHandler.notEquals', () => {
    test('should pass for different values', () => {
        expect(NumberHandler.notEquals(1, 2).pass).toBe(true);
    });

    test('should fail for equal values', () => {
        expect(NumberHandler.notEquals(2, 2).pass).toBe(false);
    });
});

describe('NumberHandler.odd', () => {
    test('should pass for odd number', () => {
        expect(NumberHandler.odd(3).pass).toBe(true);
    });

    test('should fail for even number', () => {
        expect(NumberHandler.odd(4).pass).toBe(false);
    });
});

describe('NumberHandler.plusSign', () => {
    test('should pass when string has plus sign', () => {
        expect(NumberHandler.plusSign('+5').pass).toBe(true);
    });

    test('should fail when no plus sign', () => {
        expect(NumberHandler.plusSign(5).pass).toBe(false);
    });
});

describe('NumberHandler.positive', () => {
    test('should pass for positive number', () => {
        expect(NumberHandler.positive(1).pass).toBe(true);
    });

    test('should fail for zero', () => {
        expect(NumberHandler.positive(0).pass).toBe(false);
    });
});

describe('NumberHandler.precision', () => {
    test('should pass when value matches precision', () => {
        expect(NumberHandler.precision(1.23, 2).pass).toBe(true);
    });

    test('should fail when value exceeds precision', () => {
        expect(NumberHandler.precision(1.234, 2).pass).toBe(false);
    });
});

describe('NumberHandler.prime', () => {
    test('should pass for prime number', () => {
        expect(NumberHandler.prime(13).pass).toBe(true);
    });

    test('should fail for composite number', () => {
        expect(NumberHandler.prime(12).pass).toBe(false);
    });

    test('should fail for numbers less than 2', () => {
        expect(NumberHandler.prime(1).pass).toBe(false);
    });
});

describe('NumberHandler.safe', () => {
    test('should pass for safe integer', () => {
        expect(NumberHandler.safe(100).pass).toBe(true);
    });

    test('should fail for values above MAX_SAFE_INTEGER', () => {
        expect(NumberHandler.safe(Number.MAX_SAFE_INTEGER + 1).pass).toBe(false);
    });

    test('should fail for values below MIN_SAFE_INTEGER', () => {
        expect(NumberHandler.safe(Number.MIN_SAFE_INTEGER - 1).pass).toBe(false);
    });
});

describe('NumberHandler.safeInteger', () => {
    test('should pass for safe integer', () => {
        expect(NumberHandler.safeInteger(100).pass).toBe(true);
    });

    test('should fail for non-integer or unsafe integer', () => {
        expect(NumberHandler.safeInteger(Number.MAX_SAFE_INTEGER + 1).pass).toBe(false);
    });
});

describe('NumberHandler.signed', () => {
    test('should pass for minus sign', () => {
        expect(NumberHandler.signed('-1').pass).toBe(true);
    });

    test('should pass for plus sign', () => {
        expect(NumberHandler.signed('+1').pass).toBe(true);
    });

    test('should fail when no sign exists', () => {
        expect(NumberHandler.signed(1).pass).toBe(false);
    });
});

describe('NumberHandler.unsigned', () => {
    test('should pass when no sign exists', () => {
        expect(NumberHandler.unsigned(1).pass).toBe(true);
    });

    test('should fail when minus sign exists', () => {
        const result = NumberHandler.unsigned('-1');
        expect(result.pass).toBe(false);
        expect([...result.errors][0].key).toBe('number/unsigned');
    });

    test('should fail when plus sign exists and include sign arg', () => {
        const result = NumberHandler.unsigned('+1');
        expect(result.pass).toBe(false);
        const errors = [...result.errors];
        expect(errors[0].key).toBe('number/unsigned');
        expect(errors[0].args).toEqual({ sign: '+' });
    });
});

describe('NumberHandler.zero', () => {
    test('should pass for zero', () => {
        expect(NumberHandler.zero(0).pass).toBe(true);
    });

    test('should fail for non-zero value', () => {
        expect(NumberHandler.zero(0.1).pass).toBe(false);
    });
});

// ====================================
// MUTATORS
// ====================================

describe('NumberHandler.clampBetween', () => {
    test('should clamp above max', () => {
        expect(NumberHandler.clampBetween(15, 1, 10).value).toBe(10);
    });

    test('should clamp below min', () => {
        expect(NumberHandler.clampBetween(-1, 1, 10).value).toBe(1);
    });

    test('should keep in-range value unchanged', () => {
        expect(NumberHandler.clampBetween(5, 1, 10).value).toBe(5);
    });
});

describe('NumberHandler.constrain', () => {
    test('should constrain values within bounds', () => {
        expect(NumberHandler.constrain(12, 1, 10).value).toBe(10);
    });

    test('should leave in-range value unchanged', () => {
        expect(NumberHandler.constrain(4, 1, 10).value).toBe(4);
    });
});

describe('NumberHandler.negate', () => {
    test('should negate positive number', () => {
        expect(NumberHandler.negate(5).value).toBe(-5);
    });

    test('should negate negative number', () => {
        expect(NumberHandler.negate(-5).value).toBe(5);
    });
});

describe('NumberHandler.round', () => {
    test('should round to nearest integer by default', () => {
        expect(NumberHandler.round(1.6).value).toBe(2);
    });

    test('should round to configured decimal places', () => {
        expect(NumberHandler.round(1.235, 2).value).toBe(1.24);
    });
});

describe('NumberHandler.roundDown', () => {
    test('should floor decimal number', () => {
        expect(NumberHandler.roundDown(2.9).value).toBe(2);
    });

    test('should floor negative decimal number', () => {
        expect(NumberHandler.roundDown(-2.1).value).toBe(-3);
    });
});

describe('NumberHandler.roundUp', () => {
    test('should ceil decimal number', () => {
        expect(NumberHandler.roundUp(2.1).value).toBe(3);
    });

    test('should ceil negative decimal number', () => {
        expect(NumberHandler.roundUp(-2.9).value).toBe(-2);
    });
});

describe('NumberHandler.stripSign', () => {
    test('should return absolute value', () => {
        expect(NumberHandler.stripSign(-12).value).toBe(12);
    });

    test('should keep positive value unchanged', () => {
        expect(NumberHandler.stripSign(12).value).toBe(12);
    });
});

describe('NumberHandler.toPower', () => {
    test('should raise number to exponent', () => {
        expect(NumberHandler.toPower(2, 3).value).toBe(8);
    });

    test('should handle zero exponent', () => {
        expect(NumberHandler.toPower(5, 0).value).toBe(1);
    });
});

describe('NumberHandler.toScale', () => {
    test('should scale from one range to another', () => {
        expect(NumberHandler.toScale(5, 0, 10, 0, 100).value).toBe(50);
    });

    test('should scale lower bound to lower bound', () => {
        expect(NumberHandler.toScale(0, 0, 10, 0, 100).value).toBe(0);
    });

    test('should scale upper bound to upper bound', () => {
        expect(NumberHandler.toScale(10, 0, 10, 0, 100).value).toBe(100);
    });

    test('should scale to negative destination range', () => {
        expect(NumberHandler.toScale(5, 0, 10, -1, 1).value).toBe(0);
    });
});

describe('NumberHandler.truncate', () => {
    test('should truncate positive decimal', () => {
        expect(NumberHandler.truncate(1.99).value).toBe(1);
    });

    test('should truncate negative decimal', () => {
        expect(NumberHandler.truncate(-1.99).value).toBe(-1);
    });
});
