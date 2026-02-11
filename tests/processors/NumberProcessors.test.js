'use strict';

const NumberProcessors = require('../../lib/processors/NumberProcessors');
const GenericProcessors = require('../../lib/processors/GenericProcessors');

describe('GenericProcessors.isPrimitive (number type)', () => {
    it('should pass for a number', () => {
        const result = GenericProcessors.isPrimitive(123, 'number');
        expect(result.pass).toBe(true);
    });

    it('should fail for a numeric string', () => {
        const result = GenericProcessors.isPrimitive('456', 'number');
        expect(result.pass).toBe(false);
    });

    it('should fail for a non-numeric string', () => {
        const result = GenericProcessors.isPrimitive('abc', 'number');
        expect(result.pass).toBe(false);
    });
    
    it('should fail for undefined', () => {
        const result = GenericProcessors.isPrimitive(undefined, 'number');
        expect(result.pass).toBe(false);
    });

    it('should pass for NaN (it is a number type)', () => {
        const result = GenericProcessors.isPrimitive(NaN, 'number');
        expect(result.pass).toBe(true); // NaN is of type 'number'
    });

    it('should fail for an object', () => {
        const result = GenericProcessors.isPrimitive({}, 'number');
        expect(result.pass).toBe(false);
    });

    it('should fail for an array', () => {
        const result = GenericProcessors.isPrimitive([], 'number');
        expect(result.pass).toBe(false);
    });
});

describe('NumberProcessors.isInteger', () => {
    it('should pass for integer number', () => {
        expect(NumberProcessors.isInteger(42).pass).toBe(true);
    });

    it('should fail for integer string', () => {
        expect(NumberProcessors.isInteger('42').pass).toBe(false);
    });

    it('should pass for integer number', () => {
        expect(NumberProcessors.isInteger(42.0000).pass).toBe(true);
    });

    it('should fail for integer string with decimals', () => {
        expect(NumberProcessors.isInteger('42.000').pass).toBe(false);
    });

    it('should fail for decimal number', () => {
        expect(NumberProcessors.isInteger(42.5).pass).toBe(false);
    });

    it('should fail for decimal string', () => {
        expect(NumberProcessors.isInteger('42.5').pass).toBe(false);
    });

});

describe('NumberProcessors.isDecimal', () => {
    it('should pass for decimal number', () => {
        expect(NumberProcessors.isDecimal(3.14).pass).toBe(true);
    });

    it('should pass for decimal string', () => {
        expect(NumberProcessors.isDecimal('2.718').pass).toBe(true);
    });

    it('should fail for integer number', () => {
        expect(NumberProcessors.isDecimal(10).pass).toBe(false);
    });

    it('should pass for integer string (not a JS integer)', () => {
        expect(NumberProcessors.isDecimal('10').pass).toBe(true);
    });

    it('should pass for negative decimal', () => {
        expect(NumberProcessors.isDecimal(-1.5).pass).toBe(true);
        expect(NumberProcessors.isDecimal('-1.5').pass).toBe(true);
    });

    it('should fail for zero number', () => {
        expect(NumberProcessors.isDecimal(0).pass).toBe(false);
    });

    it('should pass for zero string (not a JS integer)', () => {
        expect(NumberProcessors.isDecimal('0').pass).toBe(true);
    });

    it('should fail if decimal places are less than minDecimalPlaces', () => {
        expect(NumberProcessors.isDecimal('1.2', { minDecimalPlaces: 2 }).pass).toBe(false);
    });

    it('should fail if decimal places are more than maxDecimalPlaces', () => {
        expect(NumberProcessors.isDecimal('1.2345', { maxDecimalPlaces: 2 }).pass).toBe(false);
    });

    it('should pass if decimal places are within min and max', () => {
        expect(NumberProcessors.isDecimal('1.23', { minDecimalPlaces: 2, maxDecimalPlaces: 4 }).pass).toBe(true);
    });

});

describe('NumberProcessors.notEquals', () => {
    it('should pass for different numbers', () => {
        expect(NumberProcessors.notEquals(5, 6).pass).toBe(true);
    });
    it('should pass for different numeric strings', () => {
        expect(NumberProcessors.notEquals('5', 6).pass).toBe(true);
    });
    it('should fail for equal numbers', () => {
        expect(NumberProcessors.notEquals(5, 5).pass).toBe(false);
    });
});

describe('NumberProcessors.isLessThan', () => {
    it('should pass if less than', () => {
        expect(NumberProcessors.isLessThan(3, 5).pass).toBe(true);
    });
    it('should pass for string less than', () => {
        expect(NumberProcessors.isLessThan('2', 3).pass).toBe(true);
    });
    it('should fail if not less than', () => {
        expect(NumberProcessors.isLessThan(5, 3).pass).toBe(false);
    });
});

describe('NumberProcessors.isMax', () => {
    it('should pass if less than', () => {
        expect(NumberProcessors.isMax(3, 5).pass).toBe(true);
    });
    it('should pass if equal', () => {
        expect(NumberProcessors.isMax(5, 5).pass).toBe(true);
    });
    it('should fail if greater', () => {
        expect(NumberProcessors.isMax(6, 5).pass).toBe(false);
    });
});

describe('NumberProcessors.isGreaterThan', () => {
    it('should pass if greater than', () => {
        expect(NumberProcessors.isGreaterThan(5, 3).pass).toBe(true);
    });
    it('should pass for string greater than', () => {
        expect(NumberProcessors.isGreaterThan('5', 3).pass).toBe(true);
    });
    it('should fail if not greater than', () => {
        expect(NumberProcessors.isGreaterThan(3, 5).pass).toBe(false);
    });
});

describe('NumberProcessors.isMin', () => {
    it('should pass if greater than', () => {
        expect(NumberProcessors.isMin(5, 3).pass).toBe(true);
    });
    it('should pass if equal', () => {
        expect(NumberProcessors.isMin(5, 5).pass).toBe(true);
    });
    it('should fail if less', () => {
        expect(NumberProcessors.isMin(3, 5).pass).toBe(false);
    });
});

describe('NumberProcessors.isBetween', () => {
    it('should pass if in range', () => {
        expect(NumberProcessors.isBetween(5, 3, 7).pass).toBe(true);
    });
    it('should pass for string in range', () => {
        expect(NumberProcessors.isBetween('5', 3, 7).pass).toBe(true);
    });
    it('should fail if out of range', () => {
        expect(NumberProcessors.isBetween(2, 3, 7).pass).toBe(false);
    });
});

describe('NumberProcessors.isMultipleOf', () => {
    it('should pass if value is multiple', () => {
        expect(NumberProcessors.isMultipleOf(10, 5).pass).toBe(true);
    });
    it('should pass for string multiple', () => {
        expect(NumberProcessors.isMultipleOf('12', 6).pass).toBe(true);
    });
    it('should fail if not a multiple', () => {
        expect(NumberProcessors.isMultipleOf(11, 5).pass).toBe(false);
    });
});

describe('NumberProcessors.isFactorOf', () => {
    it('should pass if value is factor', () => {
        expect(NumberProcessors.isFactorOf(5, 10).pass).toBe(true);
    });
    it('should pass for string factor', () => {
        expect(NumberProcessors.isFactorOf('2', 8).pass).toBe(true);
    });
    it('should fail if not a factor', () => {
        expect(NumberProcessors.isFactorOf(3, 10).pass).toBe(false);
    });
});

describe('NumberProcessors.isZero', () => {
    it('should pass for 0', () => {
        expect(NumberProcessors.isZero(0).pass).toBe(true);
    });
    it('should fail for string 0 (strict equality)', () => {
        expect(NumberProcessors.isZero('0').pass).toBe(false);
    });
    it('should fail for non-zero', () => {
        expect(NumberProcessors.isZero(1).pass).toBe(false);
    });
});

describe('NumberProcessors.isSigned', () => {
    it('should pass for negative string', () => {
        expect(NumberProcessors.isSigned('-5').pass).toBe(true);
    });
    it('should pass for positive string', () => {
        expect(NumberProcessors.isSigned('+5').pass).toBe(true);
    });
    it('should fail for unsigned string', () => {
        expect(NumberProcessors.isSigned('5').pass).toBe(false);
    });
});

describe('NumberProcessors.isUnsigned', () => {
    it('should pass for unsigned string', () => {
        expect(NumberProcessors.isUnsigned('5').pass).toBe(true);
    });
    it('should fail for negative string', () => {
        expect(NumberProcessors.isUnsigned('-5').pass).toBe(false);
    });
    it('should fail for positive string', () => {
        expect(NumberProcessors.isUnsigned('+5').pass).toBe(false);
    });
});

describe('NumberProcessors.plusSign', () => {
    it('should pass for string with plus sign', () => {
        expect(NumberProcessors.hasPlusSign('+5').pass).toBe(true);
    });
    it('should fail for string with minus sign', () => {
        expect(NumberProcessors.hasPlusSign('-5').pass).toBe(false);
    });
    it('should fail for unsigned string', () => {
        expect(NumberProcessors.hasPlusSign('5').pass).toBe(false);
    });
});

describe('NumberProcessors.minusSign', () => {
    it('should pass for string with minus sign', () => {
        expect(NumberProcessors.hasMinusSign('-5').pass).toBe(true);
    });
    it('should fail for string with plus sign', () => {
        expect(NumberProcessors.hasMinusSign('+5').pass).toBe(false);
    });
    it('should fail for unsigned string', () => {
        expect(NumberProcessors.hasMinusSign('5').pass).toBe(false);
    });
});

describe('NumberProcessors.hasPrecision', () => {
    it('should pass for number with exact precision', () => {
        const result = NumberProcessors.hasPrecision(1.23, 2);
        expect(result.pass).toBe(true);
        expect(result.value).toBe(1.23);
    });

    it('should pass for number with fewer decimal places', () => {
        const result = NumberProcessors.hasPrecision(1.2, 2);
        expect(result.pass).toBe(true);
        expect(result.value).toBe(1.2);
    });

    it('should pass for integer with any precision', () => {
        const result = NumberProcessors.hasPrecision(5, 2);
        expect(result.pass).toBe(true);
        expect(result.value).toBe(5);
    });

    it('should fail for number with too many decimal places', () => {
        const result = NumberProcessors.hasPrecision(1.234, 2);
        expect(result.pass).toBe(false);
        expect(result.value).toBe(1.234);
    });

    it('should work with precision 0', () => {
        expect(NumberProcessors.hasPrecision(5, 0).pass).toBe(true);
        expect(NumberProcessors.hasPrecision(5.1, 0).pass).toBe(false);
    });
});

describe('NumberProcessors.isSafeInteger', () => {
    it('should pass for safe integer', () => {
        const result = NumberProcessors.isSafeInteger(42);
        expect(result.pass).toBe(true);
        expect(result.value).toBe(42);
    });

    it('should pass for negative safe integer', () => {
        const result = NumberProcessors.isSafeInteger(-42);
        expect(result.pass).toBe(true);
        expect(result.value).toBe(-42);
    });

    it('should pass for max safe integer', () => {
        const result = NumberProcessors.isSafeInteger(Number.MAX_SAFE_INTEGER);
        expect(result.pass).toBe(true);
    });

    it('should fail for unsafe large integer', () => {
        const result = NumberProcessors.isSafeInteger(Number.MAX_SAFE_INTEGER + 1);
        expect(result.pass).toBe(false);
    });

    it('should fail for decimal number', () => {
        const result = NumberProcessors.isSafeInteger(42.5);
        expect(result.pass).toBe(false);
    });

    it('should fail for string (not a number type)', () => {
        const result = NumberProcessors.isSafeInteger('42');
        expect(result.pass).toBe(false);
    });
});

describe('NumberProcessors.isFinite', () => {
    it('should pass for finite number', () => {
        const result = NumberProcessors.isFinite(42);
        expect(result.pass).toBe(true);
        expect(result.value).toBe(42);
    });

    it('should pass for zero', () => {
        const result = NumberProcessors.isFinite(0);
        expect(result.pass).toBe(true);
        expect(result.value).toBe(0);
    });

    it('should pass for negative number', () => {
        const result = NumberProcessors.isFinite(-42);
        expect(result.pass).toBe(true);
        expect(result.value).toBe(-42);
    });

    it('should fail for Infinity', () => {
        const result = NumberProcessors.isFinite(Infinity);
        expect(result.pass).toBe(false);
        expect(result.value).toBe(Infinity);
    });

    it('should fail for negative Infinity', () => {
        const result = NumberProcessors.isFinite(-Infinity);
        expect(result.pass).toBe(false);
        expect(result.value).toBe(-Infinity);
    });

    it('should fail for NaN', () => {
        const result = NumberProcessors.isFinite(NaN);
        expect(result.pass).toBe(false);
    });
});

// Note: NumberProcessors does not have an isNaN method
// Use notEquals(val, val) to test for NaN since NaN !== NaN

describe('NumberProcessors.isInfinity', () => {
    it('should pass for positive Infinity', () => {
        const result = NumberProcessors.isInfinity(Infinity);
        expect(result.pass).toBe(true);
        expect(result.value).toBe(Infinity);
    });

    it('should pass for negative Infinity', () => {
        const result = NumberProcessors.isInfinity(-Infinity);
        expect(result.pass).toBe(true);
        expect(result.value).toBe(-Infinity);
    });

    it('should fail for finite number', () => {
        const result = NumberProcessors.isInfinity(42);
        expect(result.pass).toBe(false);
        expect(result.value).toBe(42);
    });

    it('should fail for zero', () => {
        const result = NumberProcessors.isInfinity(0);
        expect(result.pass).toBe(false);
        expect(result.value).toBe(0);
    });

    it('should fail for NaN', () => {
        const result = NumberProcessors.isInfinity(NaN);
        expect(result.pass).toBe(false);
    });
});

describe('NumberProcessors.isPrime', () => {
    it('should pass for prime number 2', () => {
        const result = NumberProcessors.isPrime(2);
        expect(result.pass).toBe(true);
        expect(result.value).toBe(2);
    });

    it('should pass for prime number 3', () => {
        const result = NumberProcessors.isPrime(3);
        expect(result.pass).toBe(true);
    });

    it('should pass for prime number 17', () => {
        const result = NumberProcessors.isPrime(17);
        expect(result.pass).toBe(true);
    });

    it('should pass for large prime 97', () => {
        const result = NumberProcessors.isPrime(97);
        expect(result.pass).toBe(true);
    });

    it('should fail for composite number 4', () => {
        const result = NumberProcessors.isPrime(4);
        expect(result.pass).toBe(false);
        expect(result.value).toBe(4);
    });

    it('should fail for composite number 9', () => {
        const result = NumberProcessors.isPrime(9);
        expect(result.pass).toBe(false);
    });

    it('should fail for 1', () => {
        const result = NumberProcessors.isPrime(1);
        expect(result.pass).toBe(false);
    });

    it('should fail for 0', () => {
        const result = NumberProcessors.isPrime(0);
        expect(result.pass).toBe(false);
    });

    it('should fail for negative number', () => {
        const result = NumberProcessors.isPrime(-5);
        expect(result.pass).toBe(false);
    });

    it('should fail for decimal number', () => {
        const result = NumberProcessors.isPrime(3.5);
        expect(result.pass).toBe(false);
    });
});

describe('NumberProcessors.isNegative', () => {
    it('should pass for negative number', () => {
        const result = NumberProcessors.isNegative(-5);
        expect(result.pass).toBe(true);
        expect(result.value).toBe(-5);
    });

    it('should pass for negative decimal', () => {
        const result = NumberProcessors.isNegative(-3.14);
        expect(result.pass).toBe(true);
    });

    it('should fail for positive number', () => {
        const result = NumberProcessors.isNegative(5);
        expect(result.pass).toBe(false);
        expect(result.value).toBe(5);
    });

    it('should fail for zero', () => {
        const result = NumberProcessors.isNegative(0);
        expect(result.pass).toBe(false);
        expect(result.value).toBe(0);
    });
});

describe('NumberProcessors.isPositive', () => {
    it('should pass for positive number', () => {
        const result = NumberProcessors.isPositive(5);
        expect(result.pass).toBe(true);
        expect(result.value).toBe(5);
    });

    it('should pass for positive decimal', () => {
        const result = NumberProcessors.isPositive(3.14);
        expect(result.pass).toBe(true);
    });

    it('should fail for negative number', () => {
        const result = NumberProcessors.isPositive(-5);
        expect(result.pass).toBe(false);
        expect(result.value).toBe(-5);
    });

    it('should fail for zero', () => {
        const result = NumberProcessors.isPositive(0);
        expect(result.pass).toBe(false);
        expect(result.value).toBe(0);
    });
});

describe('NumberProcessors.isOdd', () => {
    it('should pass for odd number', () => {
        const result = NumberProcessors.isOdd(3);
        expect(result.pass).toBe(true);
        expect(result.value).toBe(3);
    });

    it('should pass for negative odd number', () => {
        const result = NumberProcessors.isOdd(-5);
        expect(result.pass).toBe(true);
    });

    it('should fail for even number', () => {
        const result = NumberProcessors.isOdd(4);
        expect(result.pass).toBe(false);
        expect(result.value).toBe(4);
    });

    it('should fail for zero', () => {
        const result = NumberProcessors.isOdd(0);
        expect(result.pass).toBe(false);
    });
});

describe('NumberProcessors.isEven', () => {
    it('should pass for even number', () => {
        const result = NumberProcessors.isEven(4);
        expect(result.pass).toBe(true);
        expect(result.value).toBe(4);
    });

    it('should pass for zero', () => {
        const result = NumberProcessors.isEven(0);
        expect(result.pass).toBe(true);
    });

    it('should pass for negative even number', () => {
        const result = NumberProcessors.isEven(-6);
        expect(result.pass).toBe(true);
    });

    it('should fail for odd number', () => {
        const result = NumberProcessors.isEven(3);
        expect(result.pass).toBe(false);
        expect(result.value).toBe(3);
    });
});

describe('NumberProcessors.equals', () => {
    it('should pass for equal numbers', () => {
        const result = NumberProcessors.equals(5, 5);
        expect(result.pass).toBe(true);
        expect(result.value).toBe(5);
    });

    it('should pass for equal decimals', () => {
        const result = NumberProcessors.equals(3.14, 3.14);
        expect(result.pass).toBe(true);
    });

    it('should fail for different numbers', () => {
        const result = NumberProcessors.equals(5, 3);
        expect(result.pass).toBe(false);
        expect(result.value).toBe(5);
    });

    it('should fail for string vs number (strict equality)', () => {
        const result = NumberProcessors.equals('5', 5);
        expect(result.pass).toBe(false);
    });
});

describe('NumberProcessors.isApproxEqual', () => {
    it('should pass for exactly equal numbers', () => {
        const result = NumberProcessors.isApproxEqual(5, 5);
        expect(result.pass).toBe(true);
        expect(result.value).toBe(5);
    });

    it('should pass for numbers within default tolerance', () => {
        const result = NumberProcessors.isApproxEqual(0.1 + 0.2, 0.3);
        expect(result.pass).toBe(true);
    });

    it('should pass for numbers within custom tolerance', () => {
        const result = NumberProcessors.isApproxEqual(5.001, 5, 0.01);
        expect(result.pass).toBe(true);
    });

    it('should fail for numbers outside tolerance', () => {
        const result = NumberProcessors.isApproxEqual(5.1, 5, 0.01);
        expect(result.pass).toBe(false);
        expect(result.value).toBe(5.1);
    });

    it('should work with negative numbers', () => {
        const result = NumberProcessors.isApproxEqual(-5.001, -5, 0.01);
        expect(result.pass).toBe(true);
    });
});

// Mutator/Transformer Functions
describe('NumberProcessors.constrain', () => {
    it('should constrain value within range', () => {
        const result = NumberProcessors.constrain(15, 10, 20);
        expect(result.pass).toBe(true);
        expect(result.value).toBe(15);
    });

    it('should clamp to minimum', () => {
        const result = NumberProcessors.constrain(5, 10, 20);
        expect(result.pass).toBe(true);
        expect(result.value).toBe(10);
    });

    it('should clamp to maximum', () => {
        const result = NumberProcessors.constrain(25, 10, 20);
        expect(result.pass).toBe(true);
        expect(result.value).toBe(20);
    });

    it('should work with negative ranges', () => {
        const result = NumberProcessors.constrain(-25, -20, -10);
        expect(result.pass).toBe(true);
        expect(result.value).toBe(-20);
    });
});

describe('NumberProcessors.stripSign', () => {
    it('should return positive number unchanged', () => {
        const result = NumberProcessors.stripSign(5);
        expect(result.pass).toBe(true);
        expect(result.value).toBe(5);
    });

    it('should convert negative to positive', () => {
        const result = NumberProcessors.stripSign(-5);
        expect(result.pass).toBe(true);
        expect(result.value).toBe(5);
    });

    it('should handle zero', () => {
        const result = NumberProcessors.stripSign(0);
        expect(result.pass).toBe(true);
        expect(result.value).toBe(0);
    });

    it('should work with decimals', () => {
        const result = NumberProcessors.stripSign(-3.14);
        expect(result.pass).toBe(true);
        expect(result.value).toBe(3.14);
    });
});

describe('NumberProcessors.negate', () => {
    it('should negate positive number', () => {
        const result = NumberProcessors.negate(5);
        expect(result.pass).toBe(true);
        expect(result.value).toBe(-5);
    });

    it('should negate negative number', () => {
        const result = NumberProcessors.negate(-5);
        expect(result.pass).toBe(true);
        expect(result.value).toBe(5);
    });

    it('should handle zero', () => {
        const result = NumberProcessors.negate(0);
        expect(result.pass).toBe(true);
        expect(result.value).toBe(-0);
    });

    it('should work with decimals', () => {
        const result = NumberProcessors.negate(3.14);
        expect(result.pass).toBe(true);
        expect(result.value).toBe(-3.14);
    });
});

describe('NumberProcessors.round', () => {
    it('should round to integer by default', () => {
        const result = NumberProcessors.round(3.7);
        expect(result.pass).toBe(true);
        expect(result.value).toBe(4);
    });

    it('should round to specified decimal places', () => {
        const result = NumberProcessors.round(3.14159, 2);
        expect(result.pass).toBe(true);
        expect(result.value).toBe(3.14);
    });

    it('should round negative numbers', () => {
        const result = NumberProcessors.round(-3.7);
        expect(result.pass).toBe(true);
        expect(result.value).toBe(-4);
    });

    it('should handle zero decimal places', () => {
        const result = NumberProcessors.round(3.14159, 0);
        expect(result.pass).toBe(true);
        expect(result.value).toBe(3);
    });

    it('should handle more decimal places than input', () => {
        const result = NumberProcessors.round(3.1, 5);
        expect(result.pass).toBe(true);
        expect(result.value).toBe(3.1);
    });
});

describe('NumberProcessors.roundDown', () => {
    it('should floor positive number', () => {
        const result = NumberProcessors.roundDown(3.7);
        expect(result.pass).toBe(true);
        expect(result.value).toBe(3);
    });

    it('should floor negative number', () => {
        const result = NumberProcessors.roundDown(-3.2);
        expect(result.pass).toBe(true);
        expect(result.value).toBe(-4);
    });

    it('should handle integer', () => {
        const result = NumberProcessors.roundDown(5);
        expect(result.pass).toBe(true);
        expect(result.value).toBe(5);
    });

    it('should handle zero', () => {
        const result = NumberProcessors.roundDown(0);
        expect(result.pass).toBe(true);
        expect(result.value).toBe(0);
    });
});

describe('NumberProcessors.roundUp', () => {
    it('should ceil positive number', () => {
        const result = NumberProcessors.roundUp(3.2);
        expect(result.pass).toBe(true);
        expect(result.value).toBe(4);
    });

    it('should ceil negative number', () => {
        const result = NumberProcessors.roundUp(-3.7);
        expect(result.pass).toBe(true);
        expect(result.value).toBe(-3);
    });

    it('should handle integer', () => {
        const result = NumberProcessors.roundUp(5);
        expect(result.pass).toBe(true);
        expect(result.value).toBe(5);
    });

    it('should handle zero', () => {
        const result = NumberProcessors.roundUp(0);
        expect(result.pass).toBe(true);
        expect(result.value).toBe(0);
    });
});

describe('NumberProcessors.truncate', () => {
    it('should truncate positive number', () => {
        const result = NumberProcessors.truncate(3.7);
        expect(result.pass).toBe(true);
        expect(result.value).toBe(3);
    });

    it('should truncate negative number', () => {
        const result = NumberProcessors.truncate(-3.7);
        expect(result.pass).toBe(true);
        expect(result.value).toBe(-3);
    });

    it('should handle integer', () => {
        const result = NumberProcessors.truncate(5);
        expect(result.pass).toBe(true);
        expect(result.value).toBe(5);
    });

    it('should handle zero', () => {
        const result = NumberProcessors.truncate(0);
        expect(result.pass).toBe(true);
        expect(result.value).toBe(0);
    });
});

describe('NumberProcessors.toPower', () => {
    it('should raise to power', () => {
        const result = NumberProcessors.toPower(2, 3);
        expect(result.pass).toBe(true);
        expect(result.value).toBe(8);
    });

    it('should handle square', () => {
        const result = NumberProcessors.toPower(5, 2);
        expect(result.pass).toBe(true);
        expect(result.value).toBe(25);
    });

    it('should handle power of 1', () => {
        const result = NumberProcessors.toPower(7, 1);
        expect(result.pass).toBe(true);
        expect(result.value).toBe(7);
    });

    it('should handle power of 0', () => {
        const result = NumberProcessors.toPower(5, 0);
        expect(result.pass).toBe(true);
        expect(result.value).toBe(1);
    });

    it('should handle fractional power', () => {
        const result = NumberProcessors.toPower(4, 0.5);
        expect(result.pass).toBe(true);
        expect(result.value).toBe(2);
    });

    it('should handle negative base', () => {
        const result = NumberProcessors.toPower(-2, 3);
        expect(result.pass).toBe(true);
        expect(result.value).toBe(-8);
    });
});

describe('NumberProcessors.toScale', () => {
    it('should scale value.isBetween ranges', () => {
        const result = NumberProcessors.toScale(50, 0, 100, 0, 1);
        expect(result.pass).toBe(true);
        expect(result.value).toBe(0.5);
    });

    it('should scale from one range to another', () => {
        const result = NumberProcessors.toScale(5, 0, 10, 0, 100);
        expect(result.pass).toBe(true);
        expect(result.value).toBe(50);
    });

    it('should handle negative ranges', () => {
        const result = NumberProcessors.toScale(0, -10, 10, 0, 100);
        expect(result.pass).toBe(true);
        expect(result.value).toBe(50);
    });

    it('should handle reverse scaling', () => {
        const result = NumberProcessors.toScale(25, 0, 100, 100, 0);
        expect(result.pass).toBe(true);
        expect(result.value).toBe(75);
    });

    it('should handle edge cases', () => {
        const result = NumberProcessors.toScale(0, 0, 100, 10, 20);
        expect(result.pass).toBe(true);
        expect(result.value).toBe(10);
    });

    it('should scale beyond bounds', () => {
        const result = NumberProcessors.toScale(150, 0, 100, 0, 1);
        expect(result.pass).toBe(true);
        expect(result.value).toBe(1.5);
    });
});