'use strict';

import NumberHandler  from '../../lib/processors/NumberHandler.js';
import GenericHandler  from '../../lib/processors/GenericHandler.js';

describe('GenericHandler.isPrimitive (number type)', () => {
    it('should pass for a number', () => {
        const result = GenericHandler.isPrimitive(123, 'number');
        expect(result.pass).toBe(true);
    });

    it('should fail for a numeric string', () => {
        const result = GenericHandler.isPrimitive('456', 'number');
        expect(result.pass).toBe(false);
    });

    it('should fail for a non-numeric string', () => {
        const result = GenericHandler.isPrimitive('abc', 'number');
        expect(result.pass).toBe(false);
    });
    
    it('should fail for undefined', () => {
        const result = GenericHandler.isPrimitive(undefined, 'number');
        expect(result.pass).toBe(false);
    });

    it('should pass for NaN (it is a number type)', () => {
        const result = GenericHandler.isPrimitive(NaN, 'number');
        expect(result.pass).toBe(true); // NaN is of type 'number'
    });

    it('should fail for an object', () => {
        const result = GenericHandler.isPrimitive({}, 'number');
        expect(result.pass).toBe(false);
    });

    it('should fail for an array', () => {
        const result = GenericHandler.isPrimitive([], 'number');
        expect(result.pass).toBe(false);
    });
});

describe('NumberHandler.isInteger', () => {
    it('should pass for integer number', () => {
        expect(NumberHandler.isInteger(42).pass).toBe(true);
    });

    it('should fail for integer string', () => {
        expect(NumberHandler.isInteger('42').pass).toBe(false);
    });

    it('should pass for integer number', () => {
        expect(NumberHandler.isInteger(42.0000).pass).toBe(true);
    });

    it('should fail for integer string with decimals', () => {
        expect(NumberHandler.isInteger('42.000').pass).toBe(false);
    });

    it('should fail for decimal number', () => {
        expect(NumberHandler.isInteger(42.5).pass).toBe(false);
    });

    it('should fail for decimal string', () => {
        expect(NumberHandler.isInteger('42.5').pass).toBe(false);
    });

});

describe('NumberHandler.isDecimal', () => {
    it('should pass for decimal number', () => {
        expect(NumberHandler.isDecimal(3.14).pass).toBe(true);
    });

    it('should pass for decimal string', () => {
        expect(NumberHandler.isDecimal('2.718').pass).toBe(true);
    });

    it('should fail for integer number', () => {
        expect(NumberHandler.isDecimal(10).pass).toBe(false);
    });

    it('should pass for integer string (not a JS integer)', () => {
        expect(NumberHandler.isDecimal('10').pass).toBe(true);
    });

    it('should pass for negative decimal', () => {
        expect(NumberHandler.isDecimal(-1.5).pass).toBe(true);
        expect(NumberHandler.isDecimal('-1.5').pass).toBe(true);
    });

    it('should fail for zero number', () => {
        expect(NumberHandler.isDecimal(0).pass).toBe(false);
    });

    it('should pass for zero string (not a JS integer)', () => {
        expect(NumberHandler.isDecimal('0').pass).toBe(true);
    });

    it('should fail if decimal places are less than minDecimalPlaces', () => {
        expect(NumberHandler.isDecimal('1.2', { minDecimalPlaces: 2 }).pass).toBe(false);
    });

    it('should fail if decimal places are more than maxDecimalPlaces', () => {
        expect(NumberHandler.isDecimal('1.2345', { maxDecimalPlaces: 2 }).pass).toBe(false);
    });

    it('should pass if decimal places are within min and max', () => {
        expect(NumberHandler.isDecimal('1.23', { minDecimalPlaces: 2, maxDecimalPlaces: 4 }).pass).toBe(true);
    });

});

describe('NumberHandler.notEquals', () => {
    it('should pass for different numbers', () => {
        expect(NumberHandler.notEquals(5, 6).pass).toBe(true);
    });
    it('should pass for different numeric strings', () => {
        expect(NumberHandler.notEquals('5', 6).pass).toBe(true);
    });
    it('should fail for equal numbers', () => {
        expect(NumberHandler.notEquals(5, 5).pass).toBe(false);
    });
});

describe('NumberHandler.isLessThan', () => {
    it('should pass if less than', () => {
        expect(NumberHandler.isLessThan(3, 5).pass).toBe(true);
    });
    it('should pass for string less than', () => {
        expect(NumberHandler.isLessThan('2', 3).pass).toBe(true);
    });
    it('should fail if not less than', () => {
        expect(NumberHandler.isLessThan(5, 3).pass).toBe(false);
    });
});

describe('NumberHandler.isMax', () => {
    it('should pass if less than', () => {
        expect(NumberHandler.isMax(3, 5).pass).toBe(true);
    });
    it('should pass if equal', () => {
        expect(NumberHandler.isMax(5, 5).pass).toBe(true);
    });
    it('should fail if greater', () => {
        expect(NumberHandler.isMax(6, 5).pass).toBe(false);
    });
});

describe('NumberHandler.isGreaterThan', () => {
    it('should pass if greater than', () => {
        expect(NumberHandler.isGreaterThan(5, 3).pass).toBe(true);
    });
    it('should pass for string greater than', () => {
        expect(NumberHandler.isGreaterThan('5', 3).pass).toBe(true);
    });
    it('should fail if not greater than', () => {
        expect(NumberHandler.isGreaterThan(3, 5).pass).toBe(false);
    });
});

describe('NumberHandler.isMin', () => {
    it('should pass if greater than', () => {
        expect(NumberHandler.isMin(5, 3).pass).toBe(true);
    });
    it('should pass if equal', () => {
        expect(NumberHandler.isMin(5, 5).pass).toBe(true);
    });
    it('should fail if less', () => {
        expect(NumberHandler.isMin(3, 5).pass).toBe(false);
    });
});

describe('NumberHandler.isBetween', () => {
    it('should pass if in range', () => {
        expect(NumberHandler.isBetween(5, 3, 7).pass).toBe(true);
    });
    it('should pass for string in range', () => {
        expect(NumberHandler.isBetween('5', 3, 7).pass).toBe(true);
    });
    it('should fail if out of range', () => {
        expect(NumberHandler.isBetween(2, 3, 7).pass).toBe(false);
    });
});

describe('NumberHandler.isMultipleOf', () => {
    it('should pass if value is multiple', () => {
        expect(NumberHandler.isMultipleOf(10, 5).pass).toBe(true);
    });
    it('should pass for string multiple', () => {
        expect(NumberHandler.isMultipleOf('12', 6).pass).toBe(true);
    });
    it('should fail if not a multiple', () => {
        expect(NumberHandler.isMultipleOf(11, 5).pass).toBe(false);
    });
});

describe('NumberHandler.isFactorOf', () => {
    it('should pass if value is factor', () => {
        expect(NumberHandler.isFactorOf(5, 10).pass).toBe(true);
    });
    it('should pass for string factor', () => {
        expect(NumberHandler.isFactorOf('2', 8).pass).toBe(true);
    });
    it('should fail if not a factor', () => {
        expect(NumberHandler.isFactorOf(3, 10).pass).toBe(false);
    });
});

describe('NumberHandler.isZero', () => {
    it('should pass for 0', () => {
        expect(NumberHandler.isZero(0).pass).toBe(true);
    });
    it('should fail for string 0 (strict equality)', () => {
        expect(NumberHandler.isZero('0').pass).toBe(false);
    });
    it('should fail for non-zero', () => {
        expect(NumberHandler.isZero(1).pass).toBe(false);
    });
});

describe('NumberHandler.isSigned', () => {
    it('should pass for negative string', () => {
        expect(NumberHandler.isSigned('-5').pass).toBe(true);
    });
    it('should pass for positive string', () => {
        expect(NumberHandler.isSigned('+5').pass).toBe(true);
    });
    it('should fail for unsigned string', () => {
        expect(NumberHandler.isSigned('5').pass).toBe(false);
    });
});

describe('NumberHandler.isUnsigned', () => {
    it('should pass for unsigned string', () => {
        expect(NumberHandler.isUnsigned('5').pass).toBe(true);
    });
    it('should fail for negative string', () => {
        expect(NumberHandler.isUnsigned('-5').pass).toBe(false);
    });
    it('should fail for positive string', () => {
        expect(NumberHandler.isUnsigned('+5').pass).toBe(false);
    });
});

describe('NumberHandler.plusSign', () => {
    it('should pass for string with plus sign', () => {
        expect(NumberHandler.hasPlusSign('+5').pass).toBe(true);
    });
    it('should fail for string with minus sign', () => {
        expect(NumberHandler.hasPlusSign('-5').pass).toBe(false);
    });
    it('should fail for unsigned string', () => {
        expect(NumberHandler.hasPlusSign('5').pass).toBe(false);
    });
});

describe('NumberHandler.minusSign', () => {
    it('should pass for string with minus sign', () => {
        expect(NumberHandler.hasMinusSign('-5').pass).toBe(true);
    });
    it('should fail for string with plus sign', () => {
        expect(NumberHandler.hasMinusSign('+5').pass).toBe(false);
    });
    it('should fail for unsigned string', () => {
        expect(NumberHandler.hasMinusSign('5').pass).toBe(false);
    });
});

describe('NumberHandler.hasPrecision', () => {
    it('should pass for number with exact precision', () => {
        const result = NumberHandler.hasPrecision(1.23, 2);
        expect(result.pass).toBe(true);
        expect(result.value).toBe(1.23);
    });

    it('should pass for number with fewer decimal places', () => {
        const result = NumberHandler.hasPrecision(1.2, 2);
        expect(result.pass).toBe(true);
        expect(result.value).toBe(1.2);
    });

    it('should pass for integer with any precision', () => {
        const result = NumberHandler.hasPrecision(5, 2);
        expect(result.pass).toBe(true);
        expect(result.value).toBe(5);
    });

    it('should fail for number with too many decimal places', () => {
        const result = NumberHandler.hasPrecision(1.234, 2);
        expect(result.pass).toBe(false);
        expect(result.value).toBe(1.234);
    });

    it('should work with precision 0', () => {
        expect(NumberHandler.hasPrecision(5, 0).pass).toBe(true);
        expect(NumberHandler.hasPrecision(5.1, 0).pass).toBe(false);
    });
});

describe('NumberHandler.isSafeInteger', () => {
    it('should pass for safe integer', () => {
        const result = NumberHandler.isSafeInteger(42);
        expect(result.pass).toBe(true);
        expect(result.value).toBe(42);
    });

    it('should pass for negative safe integer', () => {
        const result = NumberHandler.isSafeInteger(-42);
        expect(result.pass).toBe(true);
        expect(result.value).toBe(-42);
    });

    it('should pass for max safe integer', () => {
        const result = NumberHandler.isSafeInteger(Number.MAX_SAFE_INTEGER);
        expect(result.pass).toBe(true);
    });

    it('should fail for unsafe large integer', () => {
        const result = NumberHandler.isSafeInteger(Number.MAX_SAFE_INTEGER + 1);
        expect(result.pass).toBe(false);
    });

    it('should fail for decimal number', () => {
        const result = NumberHandler.isSafeInteger(42.5);
        expect(result.pass).toBe(false);
    });

    it('should fail for string (not a number type)', () => {
        const result = NumberHandler.isSafeInteger('42');
        expect(result.pass).toBe(false);
    });
});

describe('NumberHandler.isFinite', () => {
    it('should pass for finite number', () => {
        const result = NumberHandler.isFinite(42);
        expect(result.pass).toBe(true);
        expect(result.value).toBe(42);
    });

    it('should pass for zero', () => {
        const result = NumberHandler.isFinite(0);
        expect(result.pass).toBe(true);
        expect(result.value).toBe(0);
    });

    it('should pass for negative number', () => {
        const result = NumberHandler.isFinite(-42);
        expect(result.pass).toBe(true);
        expect(result.value).toBe(-42);
    });

    it('should fail for Infinity', () => {
        const result = NumberHandler.isFinite(Infinity);
        expect(result.pass).toBe(false);
        expect(result.value).toBe(Infinity);
    });

    it('should fail for negative Infinity', () => {
        const result = NumberHandler.isFinite(-Infinity);
        expect(result.pass).toBe(false);
        expect(result.value).toBe(-Infinity);
    });

    it('should fail for NaN', () => {
        const result = NumberHandler.isFinite(NaN);
        expect(result.pass).toBe(false);
    });
});

// Note: NumberHandler does not have an isNaN method
// Use notEquals(val, val) to test for NaN since NaN !== NaN

describe('NumberHandler.isInfinity', () => {
    it('should pass for positive Infinity', () => {
        const result = NumberHandler.isInfinity(Infinity);
        expect(result.pass).toBe(true);
        expect(result.value).toBe(Infinity);
    });

    it('should pass for negative Infinity', () => {
        const result = NumberHandler.isInfinity(-Infinity);
        expect(result.pass).toBe(true);
        expect(result.value).toBe(-Infinity);
    });

    it('should fail for finite number', () => {
        const result = NumberHandler.isInfinity(42);
        expect(result.pass).toBe(false);
        expect(result.value).toBe(42);
    });

    it('should fail for zero', () => {
        const result = NumberHandler.isInfinity(0);
        expect(result.pass).toBe(false);
        expect(result.value).toBe(0);
    });

    it('should fail for NaN', () => {
        const result = NumberHandler.isInfinity(NaN);
        expect(result.pass).toBe(false);
    });
});

describe('NumberHandler.isPrime', () => {
    it('should pass for prime number 2', () => {
        const result = NumberHandler.isPrime(2);
        expect(result.pass).toBe(true);
        expect(result.value).toBe(2);
    });

    it('should pass for prime number 3', () => {
        const result = NumberHandler.isPrime(3);
        expect(result.pass).toBe(true);
    });

    it('should pass for prime number 17', () => {
        const result = NumberHandler.isPrime(17);
        expect(result.pass).toBe(true);
    });

    it('should pass for large prime 97', () => {
        const result = NumberHandler.isPrime(97);
        expect(result.pass).toBe(true);
    });

    it('should fail for composite number 4', () => {
        const result = NumberHandler.isPrime(4);
        expect(result.pass).toBe(false);
        expect(result.value).toBe(4);
    });

    it('should fail for composite number 9', () => {
        const result = NumberHandler.isPrime(9);
        expect(result.pass).toBe(false);
    });

    it('should fail for 1', () => {
        const result = NumberHandler.isPrime(1);
        expect(result.pass).toBe(false);
    });

    it('should fail for 0', () => {
        const result = NumberHandler.isPrime(0);
        expect(result.pass).toBe(false);
    });

    it('should fail for negative number', () => {
        const result = NumberHandler.isPrime(-5);
        expect(result.pass).toBe(false);
    });

    it('should fail for decimal number', () => {
        const result = NumberHandler.isPrime(3.5);
        expect(result.pass).toBe(false);
    });
});

describe('NumberHandler.isNegative', () => {
    it('should pass for negative number', () => {
        const result = NumberHandler.isNegative(-5);
        expect(result.pass).toBe(true);
        expect(result.value).toBe(-5);
    });

    it('should pass for negative decimal', () => {
        const result = NumberHandler.isNegative(-3.14);
        expect(result.pass).toBe(true);
    });

    it('should fail for positive number', () => {
        const result = NumberHandler.isNegative(5);
        expect(result.pass).toBe(false);
        expect(result.value).toBe(5);
    });

    it('should fail for zero', () => {
        const result = NumberHandler.isNegative(0);
        expect(result.pass).toBe(false);
        expect(result.value).toBe(0);
    });
});

describe('NumberHandler.isPositive', () => {
    it('should pass for positive number', () => {
        const result = NumberHandler.isPositive(5);
        expect(result.pass).toBe(true);
        expect(result.value).toBe(5);
    });

    it('should pass for positive decimal', () => {
        const result = NumberHandler.isPositive(3.14);
        expect(result.pass).toBe(true);
    });

    it('should fail for negative number', () => {
        const result = NumberHandler.isPositive(-5);
        expect(result.pass).toBe(false);
        expect(result.value).toBe(-5);
    });

    it('should fail for zero', () => {
        const result = NumberHandler.isPositive(0);
        expect(result.pass).toBe(false);
        expect(result.value).toBe(0);
    });
});

describe('NumberHandler.isOdd', () => {
    it('should pass for odd number', () => {
        const result = NumberHandler.isOdd(3);
        expect(result.pass).toBe(true);
        expect(result.value).toBe(3);
    });

    it('should pass for negative odd number', () => {
        const result = NumberHandler.isOdd(-5);
        expect(result.pass).toBe(true);
    });

    it('should fail for even number', () => {
        const result = NumberHandler.isOdd(4);
        expect(result.pass).toBe(false);
        expect(result.value).toBe(4);
    });

    it('should fail for zero', () => {
        const result = NumberHandler.isOdd(0);
        expect(result.pass).toBe(false);
    });
});

describe('NumberHandler.isEven', () => {
    it('should pass for even number', () => {
        const result = NumberHandler.isEven(4);
        expect(result.pass).toBe(true);
        expect(result.value).toBe(4);
    });

    it('should pass for zero', () => {
        const result = NumberHandler.isEven(0);
        expect(result.pass).toBe(true);
    });

    it('should pass for negative even number', () => {
        const result = NumberHandler.isEven(-6);
        expect(result.pass).toBe(true);
    });

    it('should fail for odd number', () => {
        const result = NumberHandler.isEven(3);
        expect(result.pass).toBe(false);
        expect(result.value).toBe(3);
    });
});

describe('NumberHandler.equals', () => {
    it('should pass for equal numbers', () => {
        const result = NumberHandler.equals(5, 5);
        expect(result.pass).toBe(true);
        expect(result.value).toBe(5);
    });

    it('should pass for equal decimals', () => {
        const result = NumberHandler.equals(3.14, 3.14);
        expect(result.pass).toBe(true);
    });

    it('should fail for different numbers', () => {
        const result = NumberHandler.equals(5, 3);
        expect(result.pass).toBe(false);
        expect(result.value).toBe(5);
    });

    it('should fail for string vs number (strict equality)', () => {
        const result = NumberHandler.equals('5', 5);
        expect(result.pass).toBe(false);
    });
});

describe('NumberHandler.isApproxEqual', () => {
    it('should pass for exactly equal numbers', () => {
        const result = NumberHandler.isApproxEqual(5, 5);
        expect(result.pass).toBe(true);
        expect(result.value).toBe(5);
    });

    it('should pass for numbers within default tolerance', () => {
        const result = NumberHandler.isApproxEqual(0.1 + 0.2, 0.3);
        expect(result.pass).toBe(true);
    });

    it('should pass for numbers within custom tolerance', () => {
        const result = NumberHandler.isApproxEqual(5.001, 5, 0.01);
        expect(result.pass).toBe(true);
    });

    it('should fail for numbers outside tolerance', () => {
        const result = NumberHandler.isApproxEqual(5.1, 5, 0.01);
        expect(result.pass).toBe(false);
        expect(result.value).toBe(5.1);
    });

    it('should work with negative numbers', () => {
        const result = NumberHandler.isApproxEqual(-5.001, -5, 0.01);
        expect(result.pass).toBe(true);
    });
});

// Mutator/Transformer Functions
describe('NumberHandler.constrain', () => {
    it('should constrain value within range', () => {
        const result = NumberHandler.constrain(15, 10, 20);
        expect(result.pass).toBe(true);
        expect(result.value).toBe(15);
    });

    it('should clamp to minimum', () => {
        const result = NumberHandler.constrain(5, 10, 20);
        expect(result.pass).toBe(true);
        expect(result.value).toBe(10);
    });

    it('should clamp to maximum', () => {
        const result = NumberHandler.constrain(25, 10, 20);
        expect(result.pass).toBe(true);
        expect(result.value).toBe(20);
    });

    it('should work with negative ranges', () => {
        const result = NumberHandler.constrain(-25, -20, -10);
        expect(result.pass).toBe(true);
        expect(result.value).toBe(-20);
    });
});

describe('NumberHandler.stripSign', () => {
    it('should return positive number unchanged', () => {
        const result = NumberHandler.stripSign(5);
        expect(result.pass).toBe(true);
        expect(result.value).toBe(5);
    });

    it('should convert negative to positive', () => {
        const result = NumberHandler.stripSign(-5);
        expect(result.pass).toBe(true);
        expect(result.value).toBe(5);
    });

    it('should handle zero', () => {
        const result = NumberHandler.stripSign(0);
        expect(result.pass).toBe(true);
        expect(result.value).toBe(0);
    });

    it('should work with decimals', () => {
        const result = NumberHandler.stripSign(-3.14);
        expect(result.pass).toBe(true);
        expect(result.value).toBe(3.14);
    });
});

describe('NumberHandler.negate', () => {
    it('should negate positive number', () => {
        const result = NumberHandler.negate(5);
        expect(result.pass).toBe(true);
        expect(result.value).toBe(-5);
    });

    it('should negate negative number', () => {
        const result = NumberHandler.negate(-5);
        expect(result.pass).toBe(true);
        expect(result.value).toBe(5);
    });

    it('should handle zero', () => {
        const result = NumberHandler.negate(0);
        expect(result.pass).toBe(true);
        expect(result.value).toBe(-0);
    });

    it('should work with decimals', () => {
        const result = NumberHandler.negate(3.14);
        expect(result.pass).toBe(true);
        expect(result.value).toBe(-3.14);
    });
});

describe('NumberHandler.round', () => {
    it('should round to integer by default', () => {
        const result = NumberHandler.round(3.7);
        expect(result.pass).toBe(true);
        expect(result.value).toBe(4);
    });

    it('should round to specified decimal places', () => {
        const result = NumberHandler.round(3.14159, 2);
        expect(result.pass).toBe(true);
        expect(result.value).toBe(3.14);
    });

    it('should round negative numbers', () => {
        const result = NumberHandler.round(-3.7);
        expect(result.pass).toBe(true);
        expect(result.value).toBe(-4);
    });

    it('should handle zero decimal places', () => {
        const result = NumberHandler.round(3.14159, 0);
        expect(result.pass).toBe(true);
        expect(result.value).toBe(3);
    });

    it('should handle more decimal places than input', () => {
        const result = NumberHandler.round(3.1, 5);
        expect(result.pass).toBe(true);
        expect(result.value).toBe(3.1);
    });
});

describe('NumberHandler.roundDown', () => {
    it('should floor positive number', () => {
        const result = NumberHandler.roundDown(3.7);
        expect(result.pass).toBe(true);
        expect(result.value).toBe(3);
    });

    it('should floor negative number', () => {
        const result = NumberHandler.roundDown(-3.2);
        expect(result.pass).toBe(true);
        expect(result.value).toBe(-4);
    });

    it('should handle integer', () => {
        const result = NumberHandler.roundDown(5);
        expect(result.pass).toBe(true);
        expect(result.value).toBe(5);
    });

    it('should handle zero', () => {
        const result = NumberHandler.roundDown(0);
        expect(result.pass).toBe(true);
        expect(result.value).toBe(0);
    });
});

describe('NumberHandler.roundUp', () => {
    it('should ceil positive number', () => {
        const result = NumberHandler.roundUp(3.2);
        expect(result.pass).toBe(true);
        expect(result.value).toBe(4);
    });

    it('should ceil negative number', () => {
        const result = NumberHandler.roundUp(-3.7);
        expect(result.pass).toBe(true);
        expect(result.value).toBe(-3);
    });

    it('should handle integer', () => {
        const result = NumberHandler.roundUp(5);
        expect(result.pass).toBe(true);
        expect(result.value).toBe(5);
    });

    it('should handle zero', () => {
        const result = NumberHandler.roundUp(0);
        expect(result.pass).toBe(true);
        expect(result.value).toBe(0);
    });
});

describe('NumberHandler.truncate', () => {
    it('should truncate positive number', () => {
        const result = NumberHandler.truncate(3.7);
        expect(result.pass).toBe(true);
        expect(result.value).toBe(3);
    });

    it('should truncate negative number', () => {
        const result = NumberHandler.truncate(-3.7);
        expect(result.pass).toBe(true);
        expect(result.value).toBe(-3);
    });

    it('should handle integer', () => {
        const result = NumberHandler.truncate(5);
        expect(result.pass).toBe(true);
        expect(result.value).toBe(5);
    });

    it('should handle zero', () => {
        const result = NumberHandler.truncate(0);
        expect(result.pass).toBe(true);
        expect(result.value).toBe(0);
    });
});

describe('NumberHandler.toPower', () => {
    it('should raise to power', () => {
        const result = NumberHandler.toPower(2, 3);
        expect(result.pass).toBe(true);
        expect(result.value).toBe(8);
    });

    it('should handle square', () => {
        const result = NumberHandler.toPower(5, 2);
        expect(result.pass).toBe(true);
        expect(result.value).toBe(25);
    });

    it('should handle power of 1', () => {
        const result = NumberHandler.toPower(7, 1);
        expect(result.pass).toBe(true);
        expect(result.value).toBe(7);
    });

    it('should handle power of 0', () => {
        const result = NumberHandler.toPower(5, 0);
        expect(result.pass).toBe(true);
        expect(result.value).toBe(1);
    });

    it('should handle fractional power', () => {
        const result = NumberHandler.toPower(4, 0.5);
        expect(result.pass).toBe(true);
        expect(result.value).toBe(2);
    });

    it('should handle negative base', () => {
        const result = NumberHandler.toPower(-2, 3);
        expect(result.pass).toBe(true);
        expect(result.value).toBe(-8);
    });
});

describe('NumberHandler.toScale', () => {
    it('should scale value.isBetween ranges', () => {
        const result = NumberHandler.toScale(50, 0, 100, 0, 1);
        expect(result.pass).toBe(true);
        expect(result.value).toBe(0.5);
    });

    it('should scale from one range to another', () => {
        const result = NumberHandler.toScale(5, 0, 10, 0, 100);
        expect(result.pass).toBe(true);
        expect(result.value).toBe(50);
    });

    it('should handle negative ranges', () => {
        const result = NumberHandler.toScale(0, -10, 10, 0, 100);
        expect(result.pass).toBe(true);
        expect(result.value).toBe(50);
    });

    it('should handle reverse scaling', () => {
        const result = NumberHandler.toScale(25, 0, 100, 100, 0);
        expect(result.pass).toBe(true);
        expect(result.value).toBe(75);
    });

    it('should handle edge cases', () => {
        const result = NumberHandler.toScale(0, 0, 100, 10, 20);
        expect(result.pass).toBe(true);
        expect(result.value).toBe(10);
    });

    it('should scale beyond bounds', () => {
        const result = NumberHandler.toScale(150, 0, 100, 0, 1);
        expect(result.pass).toBe(true);
        expect(result.value).toBe(1.5);
    });
});