'use strict';

import StringHandler from '../../lib/handlers/StringHandler.js';
import Presence from '../../lib/Presence.js';

const { required, optional, forbidden } = Presence;

// ====================================
// VALIDATORS
// ====================================

const getFirstError = (result) => [...result.errors][0];

describe('StringHandler.alpha', () => {
	test('should pass with lowercase letters', () => {
		const result = StringHandler.alpha('hello');
		expect(result.pass).toBe(true);
		expect(result.value).toBe('hello');
	});

	test('should pass with uppercase letters', () => {
		const result = StringHandler.alpha('WORLD');
		expect(result.pass).toBe(true);
		expect(result.value).toBe('WORLD');
	});

	test('should pass with mixed case letters', () => {
		const result = StringHandler.alpha('GitHubCopilot');
		expect(result.pass).toBe(true);
		expect(result.value).toBe('GitHubCopilot');
	});

	test('should fail when string contains digits', () => {
		const result = StringHandler.alpha('abc123');
		expect(result.pass).toBe(false);
		expect(getFirstError(result).key).toBe('string/alpha');
	});

	test('should fail when string contains spaces', () => {
		const result = StringHandler.alpha('hello world');
		expect(result.pass).toBe(false);
		expect(getFirstError(result).key).toBe('string/alpha');
	});

	test('should fail when string contains punctuation', () => {
		const result = StringHandler.alpha('hello!');
		expect(result.pass).toBe(false);
		expect(getFirstError(result).key).toBe('string/alpha');
	});

	test('should fail for empty string', () => {
		const result = StringHandler.alpha('');
		expect(result.pass).toBe(false);
		expect(getFirstError(result).key).toBe('string/alpha');
	});
});

describe('StringHandler.alphanumeric', () => {
	test('should pass with letters only', () => {
		const result = StringHandler.alphanumeric('abcDEF');
		expect(result.pass).toBe(true);
		expect(result.value).toBe('abcDEF');
	});

	test('should pass with digits only', () => {
		const result = StringHandler.alphanumeric('123456');
		expect(result.pass).toBe(true);
		expect(result.value).toBe('123456');
	});

	test('should pass with letters and digits', () => {
		const result = StringHandler.alphanumeric('a1B2c3');
		expect(result.pass).toBe(true);
		expect(result.value).toBe('a1B2c3');
	});

	test('should fail when string contains underscore', () => {
		const result = StringHandler.alphanumeric('abc_123');
		expect(result.pass).toBe(false);
		expect(getFirstError(result).key).toBe('string/alphanumeric');
	});

	test('should fail when string contains dash', () => {
		const result = StringHandler.alphanumeric('abc-123');
		expect(result.pass).toBe(false);
		expect(getFirstError(result).key).toBe('string/alphanumeric');
	});

	test('should fail when string contains spaces', () => {
		const result = StringHandler.alphanumeric('abc 123');
		expect(result.pass).toBe(false);
		expect(getFirstError(result).key).toBe('string/alphanumeric');
	});

	test('should fail for empty string', () => {
		const result = StringHandler.alphanumeric('');
		expect(result.pass).toBe(false);
		expect(getFirstError(result).key).toBe('string/alphanumeric');
	});
});

describe('StringHandler.ascii', () => {
	test('should pass with standard printable ASCII', () => {
		const result = StringHandler.ascii('Hello, World! 123');
		expect(result.pass).toBe(true);
		expect(result.value).toBe('Hello, World! 123');
	});

	test('should pass with ASCII control characters', () => {
		const result = StringHandler.ascii('line1\nline2\tend');
		expect(result.pass).toBe(true);
		expect(result.value).toBe('line1\nline2\tend');
	});

	test('should pass for empty string', () => {
		const result = StringHandler.ascii('');
		expect(result.pass).toBe(true);
		expect(result.value).toBe('');
	});

	test('should fail with accented latin character', () => {
		const result = StringHandler.ascii('café');
		expect(result.pass).toBe(false);
		expect(getFirstError(result).key).toBe('string/ascii');
	});

	test('should fail with emoji character', () => {
		const result = StringHandler.ascii('hello😀');
		expect(result.pass).toBe(false);
		expect(getFirstError(result).key).toBe('string/ascii');
	});

	test('should fail with non-latin script', () => {
		const result = StringHandler.ascii('こんにちは');
		expect(result.pass).toBe(false);
		expect(getFirstError(result).key).toBe('string/ascii');
	});
});

describe('StringHandler.balanced', () => {
	test('should pass when delimiters are balanced', () => {
		const result = StringHandler.balanced('(a(b)c)');
		expect(result.pass).toBe(true);
		expect(result.value).toBe('(a(b)c)');
	});

	test('should fail with negative subkey when closing appears before opening', () => {
		const result = StringHandler.balanced(')abc(');
		expect(result.pass).toBe(false);
		const error = getFirstError(result);
		expect(error.key).toBe('string/balanced/negative');
		expect(error.args).toMatchObject({
			openChar: '(',
			closeChar: ')',
			index: 0,
			openCount: -1
		});
	});

	test('should fail with base key when there are unmatched opening delimiters', () => {
		const result = StringHandler.balanced('((abc)');
		expect(result.pass).toBe(false);
		const error = getFirstError(result);
		expect(error.key).toBe('string/balanced/positive');
		expect(error.args).toMatchObject({
			openChar: '(',
			closeChar: ')',
			openCount: 1
		});
	});
});

describe('StringHandler.base64', () => {
	test('should pass for a valid base64 string with padding', () => {
		const result = StringHandler.base64('SGVsbG8=');
		expect(result.pass).toBe(true);
		expect(result.value).toBe('SGVsbG8=');
	});

	test('should pass for a valid base64 string without padding', () => {
		const result = StringHandler.base64('TWFu');
		expect(result.pass).toBe(true);
		expect(result.value).toBe('TWFu');
	});

	test('should fail for invalid base64 characters', () => {
		const result = StringHandler.base64('SGVsbG8*');
		expect(result.pass).toBe(false);
		expect(getFirstError(result).key).toBe('string/base64');
	});

	test('should fail when length is not divisible by 4', () => {
		const result = StringHandler.base64('abc');
		expect(result.pass).toBe(false);
		expect(getFirstError(result).key).toBe('string/base64');
	});
});

describe('StringHandler.base64Encode', () => {
	test('should encode utf8 text to base64', () => {
		const result = StringHandler.base64Encode('Hello');
		expect(result.pass).toBe(true);
		expect(result.value).toBe('SGVsbG8=');
	});
});

describe('StringHandler.base64Decode', () => {
	test('should decode a valid base64 string to utf8 text', () => {
		const result = StringHandler.base64Decode('SGVsbG8=');
		expect(result.pass).toBe(true);
		expect(result.value).toBe('Hello');
	});
});

describe('StringHandler.binary', () => {
	test('should pass for a valid binary string', () => {
		const result = StringHandler.binary('10100101');
		expect(result.pass).toBe(true);
		expect(result.value).toBe('10100101');
	});

	test('should fail when digits other than 0 and 1 are present', () => {
		const result = StringHandler.binary('10201');
		expect(result.pass).toBe(false);
		expect(getFirstError(result).key).toBe('string/binary');
	});

	test('should fail for empty string', () => {
		const result = StringHandler.binary('');
		expect(result.pass).toBe(false);
		expect(getFirstError(result).key).toBe('string/binary');
	});
});

describe('StringHandler.bmp', () => {
	test('should pass when all characters are in the BMP', () => {
		const result = StringHandler.bmp('Hello Ω漢');
		expect(result.pass).toBe(true);
		expect(result.value).toBe('Hello Ω漢');
	});

	test('should fail when string contains non-BMP characters', () => {
		const result = StringHandler.bmp('hello😀');
		expect(result.pass).toBe(false);
		expect(getFirstError(result).key).toBe('string/bmp');
	});
});

describe('StringHandler.complex', () => {
	test('should pass with default complexity requirements', () => {
		const result = StringHandler.complex('Abcdef1!');
		expect(result.pass).toBe(true);
		expect(result.value).toBe('Abcdef1!');
	});

	test('should fail with length subkey when below minimum length', () => {
		const result = StringHandler.complex('A1a!');
		expect(result.pass).toBe(false);
		const error = getFirstError(result);
		expect(error.key).toBe('string/complex/length');
		expect(error.args).toMatchObject({
			minLen: 8,
			maxLen: 100
		});
	});

	test('should fail with uppercase subkey when uppercase count is insufficient', () => {
		const result = StringHandler.complex('abcdef1!');
		expect(result.pass).toBe(false);
		const error = getFirstError(result);
		expect(error.key).toBe('string/complex/uppercase');
		expect(error.args).toMatchObject({
			minUppercase: 1
		});
	});

	test('should fail with lowercase subkey when lowercase count is insufficient', () => {
		const result = StringHandler.complex('ABCDEF1!');
		expect(result.pass).toBe(false);
		const error = getFirstError(result);
		expect(error.key).toBe('string/complex/lowercase');
		expect(error.args).toMatchObject({
			minLowercase: 1
		});
	});

	test('should fail with digits subkey when digit count is insufficient', () => {
		const result = StringHandler.complex('Abcdefg!');
		expect(result.pass).toBe(false);
		const error = getFirstError(result);
		expect(error.key).toBe('string/complex/digits');
		expect(error.args).toMatchObject({
			minDigits: 1
		});
	});

	test('should fail with specialChars subkey when special char count is insufficient', () => {
		const result = StringHandler.complex('Abcdefg1');
		expect(result.pass).toBe(false);
		const error = getFirstError(result);
		expect(error.key).toBe('string/complex/specialChars');
		expect(error.args).toMatchObject({
			minSpecialChars: 1
		});
	});

	test('should fail with repeats subkey when max repeats are exceeded', () => {
		const result = StringHandler.complex('Abc111!d');
		expect(result.pass).toBe(false);
		const error = getFirstError(result);
		expect(error.key).toBe('string/complex/repeats');
		expect(error.args).toMatchObject({
			maxRepeats: 2
		});
	});

	test('should respect custom options and pass when all constraints are met', () => {
		const options = {
			minLen: 10,
			maxLen: 12,
			minUppercase: 2,
			minLowercase: 2,
			minDigits: 2,
			minSpecialChars: 2,
			maxRepeats: 3
		};

		const result = StringHandler.complex('ABcd12!!xy', options);
		expect(result.pass).toBe(true);
		expect(result.value).toBe('ABcd12!!xy');
	});

	test('should return length subkey for custom max length overflow', () => {
		const options = { minLen: 4, maxLen: 6 };
		const result = StringHandler.complex('Ab1!xyz', options);
		expect(result.pass).toBe(false);
		const error = getFirstError(result);
		expect(error.key).toBe('string/complex/length');
		expect(error.args).toMatchObject({
			minLen: 4,
			maxLen: 6
		});
	});

	test('should return uppercase subkey using custom minimum uppercase requirement', () => {
		const options = { minLen: 6, minUppercase: 2, minLowercase: 1, minDigits: 1, minSpecialChars: 1 };
		const result = StringHandler.complex('Abc1!d', options);
		expect(result.pass).toBe(false);
		const error = getFirstError(result);
		expect(error.key).toBe('string/complex/uppercase');
		expect(error.args).toMatchObject({
			minUppercase: 2
		});
	});
});

describe('StringHandler.contains', () => {
	test('should pass when substring exists', () => {
		const result = StringHandler.contains('hello world', 'world');
		expect(result.pass).toBe(true);
		expect(result.value).toBe('hello world');
	});

	test('should pass with ignoreCase option', () => {
		const result = StringHandler.contains('Hello World', 'world', { ignoreCase: true });
		expect(result.pass).toBe(true);
		expect(result.value).toBe('hello world');
	});

	test('should fail when substring is not present', () => {
		const result = StringHandler.contains('hello world', 'planet');
		expect(result.pass).toBe(false);
		const error = getFirstError(result);
		expect(error.key).toBe('string/contains');
		expect(error.args).toMatchObject({
			substring: 'planet'
		});
	});
});

describe('StringHandler.creditCard', () => {
	test('should pass for a valid visa number', () => {
		const result = StringHandler.creditCard('4111111111111111');
		expect(result.pass).toBe(true);
		expect(result.value).toBe('4111111111111111');
	});

	test('should pass with delimiters and preserve original when normalize is false', () => {
		const result = StringHandler.creditCard('4111-1111-1111-1111', { delim: '-', normalize: false });
		expect(result.pass).toBe(true);
		expect(result.value).toBe('4111-1111-1111-1111');
	});

	test('should fail when card type is not allowed by types option', () => {
		const result = StringHandler.creditCard('4111111111111111', { types: ['amex'] });
		expect(result.pass).toBe(false);
		expect(getFirstError(result).key).toBe('string/creditCard');
	});

	test('should fail when card number fails luhn check', () => {
		const result = StringHandler.creditCard('4111111111111112');
		expect(result.pass).toBe(false);
		expect(getFirstError(result).key).toBe('string/creditCard');
	});

	test('should normalize to configured delim when normalize is true', () => {
		const result = StringHandler.creditCard('5555 5555 5555 4444', {
			allowedDelims: ' ',
			delim: ':',
			normalize: true,
			types: ['mastercard']
		});
		expect(result.pass).toBe(true);
		expect(result.value).toBe('5555:5555:5555:4444');
	});

	test('should preserve original formatting when normalize is false', () => {
		const result = StringHandler.creditCard('5555 5555 5555 4444', {
			allowedDelims: ' ',
			delim: ':',
			normalize: false,
			types: ['mastercard']
		});
		expect(result.pass).toBe(true);
		expect(result.value).toBe('5555 5555 5555 4444');
	});

	test('should accept delimiters that are included in allowedDelims', () => {
		const result = StringHandler.creditCard('5555.5555.5555.4444', {
			allowedDelims: ' .-',
			delim: '.',
			types: ['mastercard']
		});
		expect(result.pass).toBe(true);
		expect(result.value).toBe('5555.5555.5555.4444');
	});

	test('should fail when input delimiter is not included in allowedDelims', () => {
		const result = StringHandler.creditCard('5555_5555_5555_4444', {
			allowedDelims: ' .-',
			delim: '.',
			types: ['mastercard']
		});
		expect(result.pass).toBe(false);
		expect(getFirstError(result).key).toBe('string/creditCard');
	});

	test('should pass when types includes the detected card type', () => {
		const result = StringHandler.creditCard('378282246310005', { types: ['amex'] });
		expect(result.pass).toBe(true);
		expect(result.value).toBe('378282246310005');
	});
});

describe('StringHandler.currencyCode', () => {
	test('should pass for a valid uppercase ISO currency code', () => {
		const result = StringHandler.currencyCode('USD');
		expect(result.pass).toBe(true);
		expect(result.value).toBe('USD');
	});

	test('should pass for lowercase code when allowLooseFormat is enabled', () => {
		const result = StringHandler.currencyCode('usd', { allowLooseFormat: true });
		expect(result.pass).toBe(true);
		expect(result.value).toBe('USD');
	});

	test('should fail for lowercase code when allowLooseFormat is disabled', () => {
		const result = StringHandler.currencyCode('usd', { allowLooseFormat: false });
		expect(result.pass).toBe(false);
		expect(getFirstError(result).key).toBe('string/currencyCode');
	});

	test('should fail for an unknown currency code', () => {
		const result = StringHandler.currencyCode('ZZZ');
		expect(result.pass).toBe(false);
		expect(getFirstError(result).key).toBe('string/currencyCode');
	});
});

describe('StringHandler.dataUrl', () => {
	test('should pass for a valid image data URL', () => {
		const result = StringHandler.dataUrl('data:image/png;base64,iVBORw0KGgo=');
		expect(result.pass).toBe(true);
		expect(result.value).toBe('data:image/png;base64,iVBORw0KGgo=');
	});

	test('should pass when type is included in custom allowedTypes', () => {
		const result = StringHandler.dataUrl('data:text/plain;base64,SGVsbG8=', {
			allowedTypes: ['text']
		});
		expect(result.pass).toBe(true);
		expect(result.value).toBe('data:text/plain;base64,SGVsbG8=');
	});

	test('should fail when type is not in allowedTypes', () => {
		const result = StringHandler.dataUrl('data:text/plain;base64,SGVsbG8=', {
			allowedTypes: ['image']
		});
		expect(result.pass).toBe(false);
		expect(getFirstError(result).key).toBe('string/dataUrl');
	});

	test('should fail when missing base64 marker', () => {
		const result = StringHandler.dataUrl('data:image/png,SGVsbG8=');
		expect(result.pass).toBe(false);
		expect(getFirstError(result).key).toBe('string/dataUrl');
	});
});

describe('StringHandler.digits', () => {
	test('should pass for a string containing only digits', () => {
		const result = StringHandler.digits('0123456789');
		expect(result.pass).toBe(true);
		expect(result.value).toBe('0123456789');
	});

	test('should fail when non-digit characters are present', () => {
		const result = StringHandler.digits('123a45');
		expect(result.pass).toBe(false);
		expect(getFirstError(result).key).toBe('string/digits');
	});

	test('should fail for empty string', () => {
		const result = StringHandler.digits('');
		expect(result.pass).toBe(false);
		expect(getFirstError(result).key).toBe('string/digits');
	});
});

describe('StringHandler.domain', () => {
	test('should pass for a valid domain', () => {
		const result = StringHandler.domain('example.com');
		expect(result.pass).toBe(true);
		expect(result.value).toBe('example.com');
	});

	test('should normalize uppercase domain to lowercase by default', () => {
		const result = StringHandler.domain('EXAMPLE.COM');
		expect(result.pass).toBe(true);
		expect(result.value).toBe('example.com');
	});

	test('should fail for invalid domain label format', () => {
		const result = StringHandler.domain('-example.com');
		expect(result.pass).toBe(false);
		expect(getFirstError(result).key).toBe('string/domain');
	});

	test('should fail wildcard domain when wildcards are forbidden', () => {
		const result = StringHandler.domain('*.example.com', { wildcards: forbidden });
		expect(result.pass).toBe(false);
		expect(getFirstError(result).key).toBe('string/domain');
	});

	test('should pass wildcard domain when wildcards are optional', () => {
		const result = StringHandler.domain('*.example.com', { wildcards: optional });
		expect(result.pass).toBe(true);
		expect(result.value).toBe('*.example.com');
	});

	test('should fail non-wildcard domain when wildcards are required', () => {
		const result = StringHandler.domain('example.com', { wildcards: required });
		expect(result.pass).toBe(false);
		expect(getFirstError(result).key).toBe('string/domain');
	});

	test('should fail simple domain when subdomains are required', () => {
		const result = StringHandler.domain('example.com', { subdomains: required });
		expect(result.pass).toBe(false);
		expect(getFirstError(result).key).toBe('string/domain');
	});

	test('should pass multi-level domain when subdomains are required', () => {
		const result = StringHandler.domain('api.example.com', { subdomains: required });
		expect(result.pass).toBe(true);
		expect(result.value).toBe('api.example.com');
	});

	test('should fail multi-level domain when subdomains are forbidden', () => {
		const result = StringHandler.domain('api.example.com', { subdomains: forbidden });
		expect(result.pass).toBe(false);
		expect(getFirstError(result).key).toBe('string/domain');
	});
});

describe('StringHandler.e164', () => {
	test('should pass with compact E.164 format', () => {
		const result = StringHandler.e164('+12345678901');
		expect(result.pass).toBe(true);
		expect(result.value).toBe('+12345678901');
	});

	test('should normalize delimiters to configured delim when normalize is true', () => {
		const result = StringHandler.e164('+1-234-567-8901', {
			delim: ' ',
			allowedDelims: '-._',
			normalize: true
		});
		expect(result.pass).toBe(true);
		expect(result.value).toBe('+1 234 567 8901');
	});

	test('should preserve original format when normalize is false', () => {
		const result = StringHandler.e164('+1-234-567-8901', {
			delim: ' ',
			allowedDelims: '-._',
			normalize: false
		});
		expect(result.pass).toBe(true);
		expect(result.value).toBe('+1-234-567-8901');
	});

	test('should fail when missing leading plus sign', () => {
		const result = StringHandler.e164('12345678901');
		expect(result.pass).toBe(false);
		expect(getFirstError(result).key).toBe('string/e164');
	});

	test('should fail when number is too short', () => {
		const result = StringHandler.e164('+12345');
		expect(result.pass).toBe(false);
		expect(getFirstError(result).key).toBe('string/e164');
	});
});

describe('StringHandler.email', () => {
	test('should pass for a valid email address', () => {
		const result = StringHandler.email('user.name+tag@example.com');
		expect(result.pass).toBe(true);
		expect(result.value).toBe('user.name+tag@example.com');
	});

	test('should normalize to lowercase by default', () => {
		const result = StringHandler.email('User.Name+Tag@Example.COM');
		expect(result.pass).toBe(true);
		expect(result.value).toBe('user.name+tag@example.com');
	});

	test('should fail when missing @ separator', () => {
		const result = StringHandler.email('username.example.com');
		expect(result.pass).toBe(false);
		expect(getFirstError(result).key).toBe('string/email');
	});

	test('should fail when domain is invalid', () => {
		const result = StringHandler.email('user@-example.com');
		expect(result.pass).toBe(false);
		expect(getFirstError(result).key).toBe('string/email');
	});

	test('should fail when local part starts with a dot', () => {
		const result = StringHandler.email('.user@example.com');
		expect(result.pass).toBe(false);
		expect(getFirstError(result).key).toBe('string/email');
	});
});

describe('StringHandler.empty', () => {
	test('should pass for empty string', () => {
		const result = StringHandler.empty('');
		expect(result.pass).toBe(true);
		expect(result.value).toBe('');
	});

	test('should fail for non-empty string', () => {
		const result = StringHandler.empty('a');
		expect(result.pass).toBe(false);
		expect(getFirstError(result).key).toBe('string/empty');
	});

	test('should fail for whitespace-only string', () => {
		const result = StringHandler.empty('   ');
		expect(result.pass).toBe(false);
		expect(getFirstError(result).key).toBe('string/empty');
	});
});

describe('StringHandler.endsWith', () => {
	test('should pass when string ends with suffix', () => {
		const result = StringHandler.endsWith('hello world', 'world');
		expect(result.pass).toBe(true);
		expect(result.value).toBe('hello world');
	});

	test('should pass with ignoreCase option', () => {
		const result = StringHandler.endsWith('Hello World', 'WORLD', { ignoreCase: true });
		expect(result.pass).toBe(true);
		expect(result.value).toBe('hello world');
	});

	test('should fail when suffix is not present at the end', () => {
		const result = StringHandler.endsWith('hello world', 'hello');
		expect(result.pass).toBe(false);
		const error = getFirstError(result);
		expect(error.key).toBe('string/endsWith');
		expect(error.args).toMatchObject({
			suffix: 'hello'
		});
	});

	test('should fail with case mismatch when ignoreCase is false', () => {
		const result = StringHandler.endsWith('Hello World', 'WORLD', { ignoreCase: false });
		expect(result.pass).toBe(false);
		expect(getFirstError(result).key).toBe('string/endsWith');
	});
});

describe('StringHandler.excludesChars', () => {
	test('should pass when none of the forbidden chars are present', () => {
		const result = StringHandler.excludesChars('hello world', 'xyz');
		expect(result.pass).toBe(true);
		expect(result.value).toBe('hello world');
	});

	test('should fail when a forbidden char is present', () => {
		const result = StringHandler.excludesChars('hello world', 'ow');
		expect(result.pass).toBe(false);
		const error = getFirstError(result);
		expect(error.key).toBe('string/excludesChars');
		expect(error.args).toMatchObject({
			chars: 'ow'
		});
	});

	test('should fail with case-insensitive matching when ignoreCase is true', () => {
		const result = StringHandler.excludesChars('Hello', 'h', { ignoreCase: true });
		expect(result.pass).toBe(false);
		expect(getFirstError(result).key).toBe('string/excludesChars');
	});

	test('should pass with case-sensitive matching when ignoreCase is false', () => {
		const result = StringHandler.excludesChars('Hello', 'h', { ignoreCase: false });
		expect(result.pass).toBe(true);
		expect(result.value).toBe('Hello');
	});
});

describe('StringHandler.gtin', () => {
	const buildValidGtin = (bodyDigits) => {
		const reversedDigits = bodyDigits.split('').reverse().map(char => Number(char));
		const weightedSum = reversedDigits.reduce((total, digit, index) => {
			const weight = index % 2 === 0 ? 3 : 1;
			return total + (digit * weight);
		}, 0);
		const checkDigit = (10 - (weightedSum % 10)) % 10;
		return bodyDigits + String(checkDigit);
	};

	const gtin8 = buildValidGtin('1234567');
	const gtin12 = buildValidGtin('03600029145');
	const gtin13 = buildValidGtin('400638133393');
	const gtin14 = buildValidGtin('1234567890123');

	test('should pass for valid GTIN-8 with default options and default normalization', () => {
		const result = StringHandler.gtin(gtin8);
		expect(result.pass).toBe(true);
		expect(result.value).toBe('1234-5670');
	});

	test('should pass for valid GTIN-12 when lengths includes 12', () => {
		const result = StringHandler.gtin(gtin12, { lengths: [12] });
		expect(result.pass).toBe(true);
		expect(result.value).toBe(gtin12);
	});

	test('should pass for valid GTIN-13 when lengths includes 13', () => {
		const result = StringHandler.gtin(gtin13, { lengths: [13] });
		expect(result.pass).toBe(true);
		expect(result.value).toBe(gtin13);
	});

	test('should pass for valid GTIN-14 when lengths includes 14', () => {
		const result = StringHandler.gtin(gtin14, { lengths: [14] });
		expect(result.pass).toBe(true);
		expect(result.value).toBe(gtin14);
	});

	test('should fail when valid GTIN length is not allowed by lengths option', () => {
		const result = StringHandler.gtin(gtin13, { lengths: [8, 12] });
		expect(result.pass).toBe(false);
		expect(getFirstError(result).key).toBe('string/gtin');
	});

	test('should fail when check digit is invalid', () => {
		const invalidLastDigit = gtin13.slice(0, -1) + (gtin13.endsWith('9') ? '0' : '9');
		const result = StringHandler.gtin(invalidLastDigit, { lengths: [13] });
		expect(result.pass).toBe(false);
		expect(getFirstError(result).key).toBe('string/gtin');
	});

	test('should normalize delimiter when normalize is true', () => {
		const result = StringHandler.gtin('0 36000 29145 2', {
			lengths: [12],
			delim: ':',
			allowedDelims: ' .-',
			normalize: true
		});
		expect(result.pass).toBe(true);
		expect(result.value).toBe('0:36000:29145:2');
	});

	test('should preserve original delimiters when normalize is false', () => {
		const result = StringHandler.gtin('0 36000 29145 2', {
			lengths: [12],
			delim: ':',
			allowedDelims: ' .-',
			normalize: false
		});
		expect(result.pass).toBe(true);
		expect(result.value).toBe('0 36000 29145 2');
	});

	test('should fail when delimiter is not included in allowedDelims', () => {
		const result = StringHandler.gtin('0_36000_29145_2', {
			lengths: [12],
			delim: ':',
			allowedDelims: ' .-'
		});
		expect(result.pass).toBe(false);
		expect(getFirstError(result).key).toBe('string/gtin');
	});

	test('should fail strict format when allowLooseFormat is false and delimiter does not match delim', () => {
		const result = StringHandler.gtin('0 36000 29145 2', {
			lengths: [12],
			delim: '-',
			allowLooseFormat: false
		});
		expect(result.pass).toBe(false);
		expect(getFirstError(result).key).toBe('string/gtin');
	});
});

describe('StringHandler.hash', () => {
	test('should pass for valid md5 hash with default algorithm', () => {
		const result = StringHandler.hash('5d41402abc4b2a76b9719d911017c592');
		expect(result.pass).toBe(true);
		expect(result.value).toBe('5d41402abc4b2a76b9719d911017c592');
	});

	test('should pass for valid sha1 hash when algorithm is sha1', () => {
		const result = StringHandler.hash('a9993e364706816aba3e25717850c26c9cd0d89d', 'sha1');
		expect(result.pass).toBe(true);
		expect(result.value).toBe('a9993e364706816aba3e25717850c26c9cd0d89d');
	});

	test('should pass for uppercase hex hash because matching is case-insensitive', () => {
		const result = StringHandler.hash('A9993E364706816ABA3E25717850C26C9CD0D89D', 'sha1');
		expect(result.pass).toBe(true);
		expect(result.value).toBe('A9993E364706816ABA3E25717850C26C9CD0D89D');
	});

	test('should fail for hash with invalid length for the algorithm', () => {
		const result = StringHandler.hash('5d41402abc4b2a76b9719d911017c59', 'md5');
		expect(result.pass).toBe(false);
		const error = getFirstError(result);
		expect(error.key).toBe('string/hash');
		expect(error.args).toMatchObject({ algorithm: 'md5' });
	});

	test('should fail for unknown algorithm', () => {
		const result = StringHandler.hash('5d41402abc4b2a76b9719d911017c592', 'sha3');
		expect(result.pass).toBe(false);
		const error = getFirstError(result);
		expect(error.key).toBe('string/hash');
		expect(error.args).toMatchObject({ algorithm: 'sha3' });
	});
});

describe('StringHandler.hex', () => {
	test('should pass and normalize uppercase hex to lowercase by default', () => {
		const result = StringHandler.hex('A1B2C3');
		expect(result.pass).toBe(true);
		expect(result.value).toBe('a1b2c3');
	});

	test('should preserve original case when normalize is false', () => {
		const result = StringHandler.hex('A1B2C3', { normalize: false });
		expect(result.pass).toBe(true);
		expect(result.value).toBe('A1B2C3');
	});

	test('should fail when non-hex characters are present', () => {
		const result = StringHandler.hex('A1B2G3');
		expect(result.pass).toBe(false);
		expect(getFirstError(result).key).toBe('string/hex');
	});
});

describe('StringHandler.hexColor', () => {
	test('should pass for 6-digit color with leading # and normalize to lowercase', () => {
		const result = StringHandler.hexColor('#A1B2C3');
		expect(result.pass).toBe(true);
		expect(result.value).toBe('#a1b2c3');
	});

	test('should pass for 3-digit color without #', () => {
		const result = StringHandler.hexColor('abc');
		expect(result.pass).toBe(true);
		expect(result.value).toBe('abc');
	});

	test('should preserve original case when normalize is false', () => {
		const result = StringHandler.hexColor('#A1B2C3', { normalize: false });
		expect(result.pass).toBe(true);
		expect(result.value).toBe('#A1B2C3');
	});

	test('should fail for invalid color length', () => {
		const result = StringHandler.hexColor('#abcd');
		expect(result.pass).toBe(false);
		expect(getFirstError(result).key).toBe('string/hexColor');
	});

	test('should fail for invalid hex character', () => {
		const result = StringHandler.hexColor('#12GG34');
		expect(result.pass).toBe(false);
		expect(getFirstError(result).key).toBe('string/hexColor');
	});
});

describe('StringHandler.imei', () => {
	test('should pass for valid IMEI in compact format and default normalization', () => {
		const result = StringHandler.imei('490154203237518');
		expect(result.pass).toBe(true);
		expect(result.value).toBe('49-015420-323751-8');
	});

	test('should pass for valid delimited IMEI and normalize to configured delim', () => {
		const result = StringHandler.imei('49 015420 323751 8', {
			delim: '-',
			allowedDelims: ' .-'
		});
		expect(result.pass).toBe(true);
		expect(result.value).toBe('49-015420-323751-8');
	});

	test('should preserve original formatting when normalize is false', () => {
		const result = StringHandler.imei('49 015420 323751 8', {
			delim: '-',
			allowedDelims: ' .-',
			normalize: false
		});
		expect(result.pass).toBe(true);
		expect(result.value).toBe('49 015420 323751 8');
	});

	test('should fail when delimiter is not included in allowedDelims', () => {
		const result = StringHandler.imei('49_015420_323751_8', {
			delim: '-',
			allowedDelims: ' .-'
		});
		expect(result.pass).toBe(false);
		expect(getFirstError(result).key).toBe('string/imei');
	});

	test('should fail when allowLooseFormat is false and delimiter does not match configured delim', () => {
		const result = StringHandler.imei('49 015420 323751 8', {
			delim: '-',
			allowLooseFormat: false
		});
		expect(result.pass).toBe(false);
		expect(getFirstError(result).key).toBe('string/imei');
	});

	test('should fail when luhn check digit is invalid', () => {
		const result = StringHandler.imei('490154203237519');
		expect(result.pass).toBe(false);
		expect(getFirstError(result).key).toBe('string/imei');
	});
});

describe('StringHandler.ipV4', () => {
	test('should pass for a valid IPv4 address', () => {
		const result = StringHandler.ipV4('192.168.1.1');
		expect(result.pass).toBe(true);
		expect(result.value).toBe('192.168.1.1');
	});

	test('should pass for boundary IPv4 addresses', () => {
		expect(StringHandler.ipV4('0.0.0.0').pass).toBe(true);
		expect(StringHandler.ipV4('255.255.255.255').pass).toBe(true);
	});

	test('should fail when octet is out of range', () => {
		const result = StringHandler.ipV4('256.1.1.1');
		expect(result.pass).toBe(false);
		expect(getFirstError(result).key).toBe('string/ipV4');
	});

	test('should fail when there are too few octets', () => {
		const result = StringHandler.ipV4('192.168.1');
		expect(result.pass).toBe(false);
		expect(getFirstError(result).key).toBe('string/ipV4');
	});

	test('should fail when there are too many octets', () => {
		const result = StringHandler.ipV4('192.168.1.1.1');
		expect(result.pass).toBe(false);
		expect(getFirstError(result).key).toBe('string/ipV4');
	});

	test('should fail when octet has leading zero', () => {
		const result = StringHandler.ipV4('01.2.3.4');
		expect(result.pass).toBe(false);
		expect(getFirstError(result).key).toBe('string/ipV4');
	});
});

describe('StringHandler.ipV6', () => {
	test('should pass for full IPv6 notation', () => {
		const result = StringHandler.ipV6('2001:0db8:0000:0000:0000:ff00:0042:8329');
		expect(result.pass).toBe(true);
		expect(result.value).toBe('2001:0db8:0000:0000:0000:ff00:0042:8329');
	});

	test('should pass for condensed IPv6 notation', () => {
		const result = StringHandler.ipV6('2001:db8::1');
		expect(result.pass).toBe(true);
		expect(result.value).toBe('2001:db8::1');
	});

	test('should pass for loopback condensed address', () => {
		const result = StringHandler.ipV6('::1');
		expect(result.pass).toBe(true);
		expect(result.value).toBe('::1');
	});

	test('should pass for IPv6 with embedded IPv4', () => {
		const result = StringHandler.ipV6('2001:db8::192.168.0.1');
		expect(result.pass).toBe(true);
		expect(result.value).toBe('2001:db8::192.168.0.1');
	});

	test('should normalize uppercase IPv6 to lowercase by default', () => {
		const result = StringHandler.ipV6('2001:DB8::ABCD');
		expect(result.pass).toBe(true);
		expect(result.value).toBe('2001:db8::abcd');
	});

	test('should preserve case when normalize is false', () => {
		const result = StringHandler.ipV6('2001:DB8::ABCD', { normalize: false });
		expect(result.pass).toBe(true);
		expect(result.value).toBe('2001:DB8::ABCD');
	});

	test('should fail when address has multiple double-colon compressions', () => {
		const result = StringHandler.ipV6('2001::db8::1');
		expect(result.pass).toBe(false);
		expect(getFirstError(result).key).toBe('string/ipV6');
	});

	test('should fail when address includes invalid hex characters', () => {
		const result = StringHandler.ipV6('2001:db8::gggg');
		expect(result.pass).toBe(false);
		expect(getFirstError(result).key).toBe('string/ipV6');
	});

	test('should fail when address has too many groups', () => {
		const result = StringHandler.ipV6('1:2:3:4:5:6:7:8:9');
		expect(result.pass).toBe(false);
		expect(getFirstError(result).key).toBe('string/ipV6');
	});
});

describe('StringHandler.ip', () => {
	test('should pass for valid IPv4 address', () => {
		const result = StringHandler.ip('10.0.0.1');
		expect(result.pass).toBe(true);
		expect(result.value).toBe('10.0.0.1');
	});

	test('should pass for valid IPv6 address', () => {
		const result = StringHandler.ip('2001:db8::1');
		expect(result.pass).toBe(true);
		expect(result.value).toBe('2001:db8::1');
	});

	test('should normalize uppercase IPv6 when normalize is true', () => {
		const result = StringHandler.ip('2001:DB8::ABCD', { normalize: true });
		expect(result.pass).toBe(true);
		expect(result.value).toBe('2001:db8::abcd');
	});

	test('should preserve original case when normalize is false', () => {
		const result = StringHandler.ip('2001:DB8::ABCD', { normalize: false });
		expect(result.pass).toBe(true);
		expect(result.value).toBe('2001:DB8::ABCD');
	});

	test('should fail when string is neither valid IPv4 nor IPv6', () => {
		const result = StringHandler.ip('not-an-ip');
		expect(result.pass).toBe(false);
		expect(getFirstError(result).key).toBe('string/ip');
	});
});

describe('StringHandler.ipCidrV4', () => {
	test('should pass for valid IPv4 CIDR', () => {
		const result = StringHandler.ipCidrV4('192.168.1.10/24');
		expect(result.pass).toBe(true);
		expect(result.value).toBe('192.168.1.10/24');
	});

	test('should pass for boundary masks /0 and /32', () => {
		expect(StringHandler.ipCidrV4('10.0.0.1/0').pass).toBe(true);
		expect(StringHandler.ipCidrV4('10.0.0.1/32').pass).toBe(true);
	});

	test('should fail when slash portion is missing', () => {
		const result = StringHandler.ipCidrV4('192.168.1.10');
		expect(result.pass).toBe(false);
		expect(getFirstError(result).key).toBe('string/ipCidrV4');
	});

	test('should fail when mask is out of range', () => {
		const result = StringHandler.ipCidrV4('192.168.1.10/33');
		expect(result.pass).toBe(false);
		expect(getFirstError(result).key).toBe('string/ipCidrV4');
	});

	test('should fail when IPv4 portion is invalid', () => {
		const result = StringHandler.ipCidrV4('999.168.1.10/24');
		expect(result.pass).toBe(false);
		expect(getFirstError(result).key).toBe('string/ipCidrV4');
	});
});

describe('StringHandler.ipCidrV6', () => {
	test('should pass for valid IPv6 CIDR', () => {
		const result = StringHandler.ipCidrV6('2001:db8::1/64');
		expect(result.pass).toBe(true);
		expect(result.value).toBe('2001:db8::1/64');
	});

	test('should pass for boundary masks /0 and /128', () => {
		expect(StringHandler.ipCidrV6('2001:db8::1/0').pass).toBe(true);
		expect(StringHandler.ipCidrV6('2001:db8::1/128').pass).toBe(true);
	});

	test('should fail when slash portion is missing', () => {
		const result = StringHandler.ipCidrV6('2001:db8::1');
		expect(result.pass).toBe(false);
		expect(getFirstError(result).key).toBe('string/ipCidrV6');
	});

	test('should fail when mask is out of range', () => {
		const result = StringHandler.ipCidrV6('2001:db8::1/129');
		expect(result.pass).toBe(false);
		expect(getFirstError(result).key).toBe('string/ipCidrV6');
	});

	test('should fail when IPv6 portion is invalid', () => {
		const result = StringHandler.ipCidrV6('2001::db8::1/64');
		expect(result.pass).toBe(false);
		expect(getFirstError(result).key).toBe('string/ipCidrV6');
	});
});

describe('StringHandler.ipCidr', () => {
	test('should pass for valid IPv4 CIDR', () => {
		const result = StringHandler.ipCidr('172.16.0.1/16');
		expect(result.pass).toBe(true);
		expect(result.value).toBe('172.16.0.1/16');
	});

	test('should pass for valid IPv6 CIDR', () => {
		const result = StringHandler.ipCidr('2001:db8::1/64');
		expect(result.pass).toBe(true);
		expect(result.value).toBe('2001:db8::1/64');
	});

	test('should fail for invalid CIDR string', () => {
		const result = StringHandler.ipCidr('invalid/24');
		expect(result.pass).toBe(false);
		expect(getFirstError(result).key).toBe('string/ipCidr');
	});
});

describe('StringHandler.json', () => {
	test('should pass for valid JSON object string', () => {
		const result = StringHandler.json('{"a":1,"b":[2,3]}');
		expect(result.pass).toBe(true);
		expect(result.value).toBe('{"a":1,"b":[2,3]}');
	});

	test('should pass for valid JSON primitive string', () => {
		const result = StringHandler.json('"hello"');
		expect(result.pass).toBe(true);
		expect(result.value).toBe('"hello"');
	});

	test('should fail for invalid JSON syntax', () => {
		const result = StringHandler.json('{a:1}');
		expect(result.pass).toBe(false);
		expect(getFirstError(result).key).toBe('string/json');
	});

	test('should fail for truncated JSON', () => {
		const result = StringHandler.json('{"a":1');
		expect(result.pass).toBe(false);
		expect(getFirstError(result).key).toBe('string/json');
	});
});

describe('StringHandler.jwt', () => {
	test('should pass for a syntactically valid JWT', () => {
		const result = StringHandler.jwt('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjMifQ.signature123');
		expect(result.pass).toBe(true);
		expect(result.value).toBe('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjMifQ.signature123');
	});

	test('should fail when token has fewer than three segments', () => {
		const result = StringHandler.jwt('abc.def');
		expect(result.pass).toBe(false);
		expect(getFirstError(result).key).toBe('string/jwt');
	});

	test('should fail when token contains invalid characters', () => {
		const result = StringHandler.jwt('abc.def.g$h');
		expect(result.pass).toBe(false);
		expect(getFirstError(result).key).toBe('string/jwt');
	});

	test('should fail when token has extra segment', () => {
		const result = StringHandler.jwt('abc.def.ghi.jkl');
		expect(result.pass).toBe(false);
		expect(getFirstError(result).key).toBe('string/jwt');
	});
});

describe('StringHandler.label', () => {
	test('should pass for a valid DNS label', () => {
		const result = StringHandler.label('my-label-1');
		expect(result.pass).toBe(true);
		expect(result.value).toBe('my-label-1');
	});

	test('should normalize uppercase label to lowercase by default', () => {
		const result = StringHandler.label('My-Label');
		expect(result.pass).toBe(true);
		expect(result.value).toBe('my-label');
	});

	test('should preserve case when normalize is false', () => {
		const result = StringHandler.label('My-Label', { normalize: false });
		expect(result.pass).toBe(true);
		expect(result.value).toBe('My-Label');
	});

	test('should fail when label starts with hyphen', () => {
		const result = StringHandler.label('-abc');
		expect(result.pass).toBe(false);
		expect(getFirstError(result).key).toBe('string/label');
	});

	test('should fail when label ends with hyphen', () => {
		const result = StringHandler.label('abc-');
		expect(result.pass).toBe(false);
		expect(getFirstError(result).key).toBe('string/label');
	});

	test('should fail when label contains invalid characters', () => {
		const result = StringHandler.label('my_label');
		expect(result.pass).toBe(false);
		expect(getFirstError(result).key).toBe('string/label');
	});

	test('should fail when label exceeds 63 characters', () => {
		const tooLong = 'a'.repeat(64);
		const result = StringHandler.label(tooLong);
		expect(result.pass).toBe(false);
		expect(getFirstError(result).key).toBe('string/label');
	});
});

describe('StringHandler.length', () => {
	test('should pass when string length matches exactly', () => {
		const result = StringHandler.length('hello', 5);
		expect(result.pass).toBe(true);
		expect(result.value).toBe('hello');
	});

	test('should fail when string length does not match', () => {
		const result = StringHandler.length('hello', 4);
		expect(result.pass).toBe(false);
		const error = getFirstError(result);
		expect(error.key).toBe('string/length');
		expect(error.args).toMatchObject({ length: 4 });
	});

	test('should pass for empty string when required length is zero', () => {
		const result = StringHandler.length('', 0);
		expect(result.pass).toBe(true);
		expect(result.value).toBe('');
	});
});

describe('StringHandler.lengthBetween', () => {
	test('should pass when length is within inclusive range', () => {
		const result = StringHandler.lengthBetween('hello', 3, 5);
		expect(result.pass).toBe(true);
		expect(result.value).toBe('hello');
	});

	test('should pass at lower boundary', () => {
		const result = StringHandler.lengthBetween('abc', 3, 10);
		expect(result.pass).toBe(true);
		expect(result.value).toBe('abc');
	});

	test('should pass at upper boundary', () => {
		const result = StringHandler.lengthBetween('abcdefghij', 1, 10);
		expect(result.pass).toBe(true);
		expect(result.value).toBe('abcdefghij');
	});

	test('should fail when shorter than minimum', () => {
		const result = StringHandler.lengthBetween('ab', 3, 5);
		expect(result.pass).toBe(false);
		const error = getFirstError(result);
		expect(error.key).toBe('string/lengthBetween');
		expect(error.args).toMatchObject({ min: 3, max: 5 });
	});

	test('should fail when longer than maximum', () => {
		const result = StringHandler.lengthBetween('abcdef', 1, 5);
		expect(result.pass).toBe(false);
		const error = getFirstError(result);
		expect(error.key).toBe('string/lengthBetween');
		expect(error.args).toMatchObject({ min: 1, max: 5 });
	});
});

describe('StringHandler.lowerCase', () => {
	test('should pass when string is already lowercase', () => {
		const result = StringHandler.lowerCase('hello world');
		expect(result.pass).toBe(true);
		expect(result.value).toBe('hello world');
	});

	test('should pass for lowercase alphanumeric with symbols', () => {
		const result = StringHandler.lowerCase('abc123-_.!');
		expect(result.pass).toBe(true);
		expect(result.value).toBe('abc123-_.!');
	});

	test('should fail when uppercase letters are present', () => {
		const result = StringHandler.lowerCase('Hello');
		expect(result.pass).toBe(false);
		expect(getFirstError(result).key).toBe('string/lowerCase');
	});
});

describe('StringHandler.luhn', () => {
	test('should pass for a valid Visa number', () => {
		const result = StringHandler.luhn('4111111111111111');
		expect(result.pass).toBe(true);
		expect(result.value).toBe('4111111111111111');
	});

	test('should pass for a valid Amex number', () => {
		const result = StringHandler.luhn('378282246310005');
		expect(result.pass).toBe(true);
		expect(result.value).toBe('378282246310005');
	});

	test('should pass for a valid short Luhn sequence', () => {
		const result = StringHandler.luhn('79927398713');
		expect(result.pass).toBe(true);
		expect(result.value).toBe('79927398713');
	});

	test('should fail when one digit is changed in an otherwise valid number', () => {
		const result = StringHandler.luhn('4111111111111112');
		expect(result.pass).toBe(false);
		expect(getFirstError(result).key).toBe('string/luhn');
	});

	test('should fail for empty string', () => {
		const result = StringHandler.luhn('');
		expect(result.pass).toBe(false);
		expect(getFirstError(result).key).toBe('string/luhn');
	});

	test('should pass for single-digit zero based on current implementation', () => {
		const result = StringHandler.luhn('0');
		expect(result.pass).toBe(true);
		expect(result.value).toBe('0');
	});

	test('should fail for single-digit non-zero input', () => {
		const result = StringHandler.luhn('7');
		expect(result.pass).toBe(false);
		expect(getFirstError(result).key).toBe('string/luhn');
	});

	test('should fail for non-digit input', () => {
		const result = StringHandler.luhn('4111-1111-1111-1111');
		expect(result.pass).toBe(false);
		expect(getFirstError(result).key).toBe('string/luhn');
	});

	test('should fail for input containing whitespace', () => {
		const result = StringHandler.luhn('4111111111111111 ');
		expect(result.pass).toBe(false);
		expect(getFirstError(result).key).toBe('string/luhn');
	});

	test('should fail for alphabetic input', () => {
		const result = StringHandler.luhn('abcdef');
		expect(result.pass).toBe(false);
		expect(getFirstError(result).key).toBe('string/luhn');
	});

	test('should ignore extra options argument and keep same behavior', () => {
		const result = StringHandler.luhn('4111111111111111', { normalize: false, strict: true });
		expect(result.pass).toBe(true);
		expect(result.value).toBe('4111111111111111');
	});
});

describe('StringHandler.mac', () => {
	test('should pass for valid MAC in colon format', () => {
		const result = StringHandler.mac('aa:bb:cc:dd:ee:ff');
		expect(result.pass).toBe(true);
		expect(result.value).toBe('aa:bb:cc:dd:ee:ff');
	});

	test('should normalize to configured delim when normalize is true', () => {
		const result = StringHandler.mac('AA.BB.CC.DD.EE.FF', {
			delim: '-',
			allowedDelims: '.:-',
			normalize: true
		});
		expect(result.pass).toBe(true);
		expect(result.value).toBe('AA-BB-CC-DD-EE-FF');
	});

	test('should preserve original formatting when normalize is false', () => {
		const result = StringHandler.mac('AA.BB.CC.DD.EE.FF', {
			delim: '-',
			allowedDelims: '.:-',
			normalize: false
		});
		expect(result.pass).toBe(true);
		expect(result.value).toBe('AA.BB.CC.DD.EE.FF');
	});

	test('should fail when delimiter is not in allowedDelims', () => {
		const result = StringHandler.mac('AA_BB_CC_DD_EE_FF', {
			delim: '-',
			allowedDelims: '.:'
		});
		expect(result.pass).toBe(false);
		expect(getFirstError(result).key).toBe('string/mac');
	});

	test('should fail strict format when allowLooseFormat is false and delim does not match', () => {
		const result = StringHandler.mac('AA BB CC DD EE FF', {
			delim: '-',
			allowLooseFormat: false
		});
		expect(result.pass).toBe(false);
		expect(getFirstError(result).key).toBe('string/mac');
	});

	test('should fail for invalid hex pair', () => {
		const result = StringHandler.mac('aa:bb:cc:dd:ee:gg');
		expect(result.pass).toBe(false);
		expect(getFirstError(result).key).toBe('string/mac');
	});
});

describe('StringHandler.matches', () => {
	test('should pass when regex matches', () => {
		const result = StringHandler.matches('abc123', /^[a-z]+\d+$/i);
		expect(result.pass).toBe(true);
		expect(result.value).toBe('abc123');
	});

	test('should fail when regex does not match and include regex in args', () => {
		const regex = /^\d+$/;
		const result = StringHandler.matches('abc123', regex);
		expect(result.pass).toBe(false);
		const error = getFirstError(result);
		expect(error.key).toBe('string/matches');
		expect(error.args).toMatchObject({ regex: regex.toString() });
	});

	test('should work consistently with global regex reused across calls', () => {
		const regex = /abc/g;
		const first = StringHandler.matches('abc', regex);
		const second = StringHandler.matches('abc', regex);
		expect(first.pass).toBe(true);
		expect(second.pass).toBe(false);
		expect(getFirstError(second).key).toBe('string/matches');
	});
});

describe('StringHandler.maxLength', () => {
	test('should pass when length is below max', () => {
		const result = StringHandler.maxLength('hello', 10);
		expect(result.pass).toBe(true);
		expect(result.value).toBe('hello');
	});

	test('should pass when length equals max boundary', () => {
		const result = StringHandler.maxLength('hello', 5);
		expect(result.pass).toBe(true);
		expect(result.value).toBe('hello');
	});

	test('should fail when length exceeds max', () => {
		const result = StringHandler.maxLength('hello!', 5);
		expect(result.pass).toBe(false);
		const error = getFirstError(result);
		expect(error.key).toBe('string/maxLength');
		expect(error.args).toMatchObject({ max: 5 });
	});
});

describe('StringHandler.maxWords', () => {
	test('should pass when word count is below max', () => {
		const result = StringHandler.maxWords('one two', 3);
		expect(result.pass).toBe(true);
		expect(result.value).toBe('one two');
	});

	test('should pass when word count equals max', () => {
		const result = StringHandler.maxWords('one two three', 3);
		expect(result.pass).toBe(true);
		expect(result.value).toBe('one two three');
	});

	test('should fail when word count exceeds max and include count details', () => {
		const result = StringHandler.maxWords('one two three four', 3);
		expect(result.pass).toBe(false);
		const error = getFirstError(result);
		expect(error.key).toBe('string/maxWords');
		expect(error.args).toMatchObject({
			count: 4,
			max: 3
		});
	});

	test('should use custom delimiters when provided', () => {
		const result = StringHandler.maxWords('one|two|three', 3, '|');
		expect(result.pass).toBe(true);
		expect(result.value).toBe('one|two|three');
	});

	test('should collapse repeated delimiters when counting words', () => {
		const result = StringHandler.maxWords('one,,two,,,three', 3, ',');
		expect(result.pass).toBe(true);
		expect(result.value).toBe('one,,two,,,three');
	});

	test('should trim delimiters at edges when counting words', () => {
		const result = StringHandler.maxWords('  one   two  ', 2, ' ');
		expect(result.pass).toBe(true);
		expect(result.value).toBe('  one   two  ');
	});
});

describe('StringHandler.measurement', () => {
	test('should pass for default cm unit', () => {
		const result = StringHandler.measurement('12cm');
		expect(result.pass).toBe(true);
		expect(result.value).toBe('12cm');
	});

	test('should pass with custom units option', () => {
		const result = StringHandler.measurement('15kg', { units: 'kg' });
		expect(result.pass).toBe(true);
		expect(result.value).toBe('15kg');
	});

	test('should allow trailingSymbol array (current output joins symbols via array string coercion)', () => {
		const result = StringHandler.measurement('7lb', { trailingSymbol: ['kg', 'lb'] });
		expect(result.pass).toBe(true);
		expect(result.value).toBe('7kg,lb');
	});

	test('should prioritize explicit trailingSymbol over units option', () => {
		const result = StringHandler.measurement('9m', { units: 'cm', trailingSymbol: 'm' });
		expect(result.pass).toBe(true);
		expect(result.value).toBe('9m');
	});

	test('should enforce numeric min and max options', () => {
		const low = StringHandler.measurement('4cm', { min: 5 });
		const high = StringHandler.measurement('11cm', { max: 10 });
		expect(low.pass).toBe(false);
		expect(high.pass).toBe(false);
		expect(getFirstError(low).key).toBe('string/measurement');
		expect(getFirstError(high).key).toBe('string/measurement');
	});

	test('should support decimals when decimal is required', () => {
		const result = StringHandler.measurement('12.5cm', { decimal: required });
		expect(result.pass).toBe(true);
		expect(result.value).toBe('12.5cm');
	});

	test('should fail if decimal is forbidden but decimal value is provided', () => {
		const result = StringHandler.measurement('12.5cm', { decimal: forbidden });
		expect(result.pass).toBe(false);
		expect(getFirstError(result).key).toBe('string/measurement');
	});

	test('should fail when trailing unit is missing', () => {
		const result = StringHandler.measurement('12');
		expect(result.pass).toBe(false);
		expect(getFirstError(result).key).toBe('string/measurement');
	});
});

describe('StringHandler.minLength', () => {
	test('should pass when length is greater than minimum', () => {
		const result = StringHandler.minLength('hello', 3);
		expect(result.pass).toBe(true);
		expect(result.value).toBe('hello');
	});

	test('should pass when length equals minimum boundary', () => {
		const result = StringHandler.minLength('hello', 5);
		expect(result.pass).toBe(true);
		expect(result.value).toBe('hello');
	});

	test('should fail when length is below minimum', () => {
		const result = StringHandler.minLength('hi', 3);
		expect(result.pass).toBe(false);
		const error = getFirstError(result);
		expect(error.key).toBe('string/minLength');
		expect(error.args).toMatchObject({ min: 3 });
	});

	test('should pass for empty string when minimum is zero', () => {
		const result = StringHandler.minLength('', 0);
		expect(result.pass).toBe(true);
		expect(result.value).toBe('');
	});

	test('should fail for empty string when minimum is positive', () => {
		const result = StringHandler.minLength('', 1);
		expect(result.pass).toBe(false);
		expect(getFirstError(result).key).toBe('string/minLength');
	});
});

describe('StringHandler.minWords', () => {
	test('should pass when word count is above minimum', () => {
		const result = StringHandler.minWords('one two three', 2);
		expect(result.pass).toBe(true);
		expect(result.value).toBe('one two three');
	});

	test('should pass when word count equals minimum boundary', () => {
		const result = StringHandler.minWords('one two', 2);
		expect(result.pass).toBe(true);
		expect(result.value).toBe('one two');
	});

	test('should fail when word count is below minimum and include count details', () => {
		const result = StringHandler.minWords('one', 2);
		expect(result.pass).toBe(false);
		const error = getFirstError(result);
		expect(error.key).toBe('string/minWords');
		expect(error.args).toMatchObject({
			count: 1,
			min: 2
		});
	});

	test('should use custom delimiters when provided', () => {
		const result = StringHandler.minWords('one|two|three', 3, '|');
		expect(result.pass).toBe(true);
		expect(result.value).toBe('one|two|three');
	});

	test('should collapse repeated delimiters when counting words', () => {
		const result = StringHandler.minWords('one,,two,,,three', 3, ',');
		expect(result.pass).toBe(true);
		expect(result.value).toBe('one,,two,,,three');
	});

	test('should trim delimiter characters at edges when counting words', () => {
		const result = StringHandler.minWords('  one   two  ', 2, ' ');
		expect(result.pass).toBe(true);
		expect(result.value).toBe('  one   two  ');
	});
});

describe('StringHandler.money', () => {
	test('should pass for default dollar format', () => {
		const result = StringHandler.money('$123.45');
		expect(result.pass).toBe(true);
		expect(result.value).toBe('$123.45');
	});

	test('should pass for custom leading symbol', () => {
		const result = StringHandler.money('€123.45', { leadingSymbol: '€' });
		expect(result.pass).toBe(true);
		expect(result.value).toBe('€123.45');
	});

	test('should pass for custom trailing symbol', () => {
		const result = StringHandler.money('123.45USD', { leadingSymbol: '', trailingSymbol: 'USD' });
		expect(result.pass).toBe(true);
		expect(result.value).toBe('123.45USD');
	});

	test('should enforce min and max numeric constraints', () => {
		const tooLow = StringHandler.money('$4.99', { min: 5 });
		const tooHigh = StringHandler.money('$20.01', { max: 20 });
		expect(tooLow.pass).toBe(false);
		expect(tooHigh.pass).toBe(false);
		expect(getFirstError(tooLow).key).toBe('string/money');
		expect(getFirstError(tooHigh).key).toBe('string/money');
	});

	test('should support custom delimiters and normalize when enabled', () => {
		const result = StringHandler.money('$1 234 567,89', {
			thousandsDelim: ' ',
			decimalDelim: ',',
			normalize: true,
			allowLooseFormat: true
		});
		expect(result.pass).toBe(true);
		expect(result.value).toBe('$1 234 567,89');
	});

	test('should preserve original formatting when normalize is false', () => {
		const result = StringHandler.money('$1 234 567,89', {
			thousandsDelim: ' ',
			decimalDelim: ',',
			normalize: false,
			allowLooseFormat: true
		});
		expect(result.pass).toBe(true);
		expect(result.value).toBe('$1 234 567,89');
	});

	test('should fail when value does not include required leading symbol', () => {
		const result = StringHandler.money('123.45', { leadingSymbol: '$' });
		expect(result.pass).toBe(false);
		expect(getFirstError(result).key).toBe('string/money');
	});

	test('should pass for parenthesized amount when parens is required', () => {
		const result = StringHandler.money('($123.45)', { parens: required });
		expect(result.pass).toBe(true);
		expect(result.value).toBe('($123.45)');
	});

	test('should fail for non-parenthesized amount when parens is required', () => {
		const result = StringHandler.money('$123.45', { parens: required });
		expect(result.pass).toBe(false);
		expect(getFirstError(result).key).toBe('string/money');
	});

	test('should fail for parenthesized amount when parens is forbidden', () => {
		const result = StringHandler.money('($123.45)', { parens: forbidden });
		expect(result.pass).toBe(false);
		expect(getFirstError(result).key).toBe('string/money');
	});

	test('should pass for either parenthesized or normal amount when parens is optional', () => {
		const plain = StringHandler.money('$123.45', { parens: optional });
		const parenthesized = StringHandler.money('($123.45)', { parens: optional });
		expect(plain.pass).toBe(true);
		expect(parenthesized.pass).toBe(true);
		expect(plain.value).toBe('$123.45');
		expect(parenthesized.value).toBe('($123.45)');
	});

	test('should enforce decimal requirement through numeric options', () => {
		const requiredDecimalFail = StringHandler.money('$100', { decimal: required });
		const requiredDecimalPass = StringHandler.money('$100.00', { decimal: required });
		expect(requiredDecimalFail.pass).toBe(false);
		expect(requiredDecimalPass.pass).toBe(true);
		expect(getFirstError(requiredDecimalFail).key).toBe('string/money');
	});

	test('should fail when amount is not numeric', () => {
		const result = StringHandler.money('$abc');
		expect(result.pass).toBe(false);
		expect(getFirstError(result).key).toBe('string/money');
	});
});

describe('StringHandler.notEmpty', () => {
	test('should pass for non-empty string', () => {
		const result = StringHandler.notEmpty('hello');
		expect(result.pass).toBe(true);
		expect(result.value).toBe('hello');
	});

	test('should pass for whitespace-only string because length is greater than zero', () => {
		const result = StringHandler.notEmpty('   ');
		expect(result.pass).toBe(true);
		expect(result.value).toBe('   ');
	});

	test('should fail for empty string', () => {
		const result = StringHandler.notEmpty('');
		expect(result.pass).toBe(false);
		expect(getFirstError(result).key).toBe('string/notEmpty');
	});
});


describe('StringHandler.numeric', () => {
	test('should pass for simple integer with default options', () => {
		const result = StringHandler.numeric('123');
		expect(result.pass).toBe(true);
		expect(result.value).toBe('123');
	});

	test('should pass for decimal with default options', () => {
		const result = StringHandler.numeric('123.45');
		expect(result.pass).toBe(true);
		expect(result.value).toBe('123.45');
	});

	test('should fail with invalidIntegral key for non-numeric content under current parser flow', () => {
		const result = StringHandler.numeric('abc');
		expect(result.pass).toBe(false);
		expect(getFirstError(result).key).toBe('string/numeric/invalidIntegral');
	});

	test('should enforce plus required option', () => {
		const passResult = StringHandler.numeric('+12', { plus: required });
		const failResult = StringHandler.numeric('12', { plus: required });
		expect(passResult.pass).toBe(true);
		expect(failResult.pass).toBe(false);
		expect(getFirstError(failResult).key).toBe('string/numeric/missingPlusSign');
	});

	test('should enforce plus forbidden option', () => {
		const result = StringHandler.numeric('+12', { plus: forbidden });
		expect(result.pass).toBe(false);
		expect(getFirstError(result).key).toBe('string/numeric');
	});

	test('should enforce minus required option', () => {
		const passResult = StringHandler.numeric('-12', { minus: required });
		const failResult = StringHandler.numeric('12', { minus: required });
		expect(passResult.pass).toBe(true);
		expect(failResult.pass).toBe(false);
		expect(getFirstError(failResult).key).toBe('string/numeric/missingMinusSign');
	});

	test('should enforce minus forbidden option', () => {
		const result = StringHandler.numeric('-12', { minus: forbidden });
		expect(result.pass).toBe(false);
		expect(getFirstError(result).key).toBe('string/numeric/forbiddenMinusSign');
	});

	test('should pass with right-aligned plus sign when leftAlign is false', () => {
		const result = StringHandler.numeric('123+', { leftAlign: false, plus: required });
		expect(result.pass).toBe(true);
		expect(result.value).toBe('123+');
	});

	test('should fail with missingSign when sign appears on wrong side', () => {
		const result = StringHandler.numeric('123+', { leftAlign: true });
		expect(result.pass).toBe(false);
		expect(getFirstError(result).key).toBe('string/numeric/missingSign');
	});

	test('should enforce decimal required option', () => {
		const passResult = StringHandler.numeric('12.3', { decimal: required });
		const failResult = StringHandler.numeric('12', { decimal: required });
		expect(passResult.pass).toBe(true);
		expect(failResult.pass).toBe(false);
		expect(getFirstError(failResult).key).toBe('string/numeric/missingDecimal');
	});

	test('should enforce decimal forbidden option', () => {
		const result = StringHandler.numeric('12.3', { decimal: forbidden });
		expect(result.pass).toBe(false);
		expect(getFirstError(result).key).toBe('string/numeric/forbiddenDecimal');
	});

	test('should fail invalid integral grouping with default thousands delimiter', () => {
		const result = StringHandler.numeric('12,34');
		expect(result.pass).toBe(false);
		expect(getFirstError(result).key).toBe('string/numeric/invalidIntegral');
	});

	test('should pass with custom thousands and decimal delimiters', () => {
		const result = StringHandler.numeric('1.234.567,89', {
			thousandsDelim: '.',
			decimalDelim: ','
		});
		expect(result.pass).toBe(true);
		expect(result.value).toBe('1.234.567,89');
	});

	test('should fail with invalid fractional precision when maxPrecision is exceeded', () => {
		const result = StringHandler.numeric('12.345', { maxPrecision: 2 });
		expect(result.pass).toBe(false);
		expect(getFirstError(result).key).toBe('string/numeric/invalidFractional');
	});

	test('should fail when minPrecision is not met', () => {
		const result = StringHandler.numeric('12.3', { minPrecision: 2, decimal: required });
		expect(result.pass).toBe(false);
		expect(getFirstError(result).key).toBe('string/numeric/invalidFractional');
	});

	test('should fail when leadingZero is required but integral part is empty', () => {
		const result = StringHandler.numeric('.5', { leadingZero: required, decimal: required });
		expect(result.pass).toBe(false);
		expect(getFirstError(result).key).toBe('string/numeric');
	});

	test('should fail when leadingZero is forbidden and integral is zero', () => {
		const result = StringHandler.numeric('0.5', { leadingZero: forbidden, decimal: required });
		expect(result.pass).toBe(false);
		expect(getFirstError(result).key).toBe('string/numeric/forbiddenLeadingZero');
	});

	test('should fail when trailingZero is required but fractional part is missing', () => {
		const result = StringHandler.numeric('12', { trailingZero: required });
		expect(result.pass).toBe(false);
		expect(getFirstError(result).key).toBe('string/numeric/missingTrailingZero');
	});

	test('should fail when trailingZero is forbidden and fractional part is exactly zero', () => {
		const result = StringHandler.numeric('12.0', { trailingZero: forbidden, decimal: required });
		expect(result.pass).toBe(false);
		expect(getFirstError(result).key).toBe('string/numeric/forbiddenTrailingZero');
	});

	test('should enforce minimum numeric value', () => {
		const result = StringHandler.numeric('9', { min: 10 });
		expect(result.pass).toBe(false);
		expect(getFirstError(result).key).toBe('string/numeric/min');
	});

	test('should enforce maximum numeric value', () => {
		const result = StringHandler.numeric('101', { max: 100 });
		expect(result.pass).toBe(false);
		expect(getFirstError(result).key).toBe('string/numeric/max');
	});

	test('should pass when value is within min and max range', () => {
		const result = StringHandler.numeric('50', { min: 10, max: 100 });
		expect(result.pass).toBe(true);
		expect(result.value).toBe('50');
	});

	test('should parse leading and trailing symbols', () => {
		const result = StringHandler.numeric('$123USD', {
			leadingSymbol: '$',
			trailingSymbol: 'USD'
		});
		expect(result.pass).toBe(true);
		expect(result.value).toBe('$123USD');
	});

	test('should support array symbols and case-insensitive matching with ignoreCase (array symbols stringify in output)', () => {
		const result = StringHandler.numeric('eur123usd', {
			leadingSymbol: ['$', 'EUR'],
			trailingSymbol: ['USD', 'cad'],
			ignoreCase: true
		});
		expect(result.pass).toBe(true);
		expect(result.value).toBe('$,EUR123USD,cad');
	});

	test('should fail when symbols do not match configured options', () => {
		const result = StringHandler.numeric('#123USD', {
			leadingSymbol: '$',
			trailingSymbol: 'USD'
		});
		expect(result.pass).toBe(false);
		expect(getFirstError(result).key).toBe('string/numeric/base');
	});

	test('should allow loose formatting with mixed delimiters when allowLooseFormat is true', () => {
		const result = StringHandler.numeric('1 234 567', {
			thousandsDelim: ' ',
			allowLooseFormat: true
		});
		expect(result.pass).toBe(true);
		expect(result.value).toBe('1 234 567');
	});

	test('should fail strict delimiter format when allowLooseFormat is false', () => {
		const result = StringHandler.numeric('1 234 567', {
			thousandsDelim: ',',
			allowLooseFormat: false
		});
		expect(result.pass).toBe(false);
		expect(getFirstError(result).key).toBe('string/numeric/invalidIntegral');
	});

	test('should account for all documented numeric error keys', () => {
		const scenarios = [
			['#123', { leadingSymbol: '$' }],
			['123+', { leftAlign: true }],
			['12', { plus: required }],
			['+12', { plus: forbidden }],
			['12', { minus: required }],
			['-12', { minus: forbidden }],
			['1.2', { decimal: forbidden }],
			['12', { decimal: required }],
			['12,34', {}],
			['0.5', { leadingZero: forbidden, decimal: required }],
			['12.345', { maxPrecision: 2 }],
			['12', { trailingZero: required }],
			['12.0', { trailingZero: forbidden, decimal: required }],
			['9', { min: 10 }],
			['101', { max: 100 }],
		];

		const emittedKeys = new Set(
			scenarios.map(([value, options]) => getFirstError(StringHandler.numeric(value, options)).key)
		);

		expect(emittedKeys).toEqual(new Set([
			'string/numeric/base',
			'string/numeric/missingSign',
			'string/numeric/missingPlusSign',
			'string/numeric',
			'string/numeric/missingMinusSign',
			'string/numeric/forbiddenMinusSign',
			'string/numeric/forbiddenDecimal',
			'string/numeric/missingDecimal',
			'string/numeric/invalidIntegral',
			'string/numeric/forbiddenLeadingZero',
			'string/numeric/invalidFractional',
			'string/numeric/missingTrailingZero',
			'string/numeric/forbiddenTrailingZero',
			'string/numeric/min',
			'string/numeric/max',
		]));
	});
});


describe('StringHandler.phone', () => {
	test('should pass for default hyphen-delimited phone format', () => {
		const result = StringHandler.phone('123-456-7890');
		expect(result.pass).toBe(true);
		expect(result.value).toBe('123-456-7890');
	});

	test('should pass and normalize area code with parentheses', () => {
		const result = StringHandler.phone('(123) 456 7890');
		expect(result.pass).toBe(true);
		expect(result.value).toBe('(123)-456-7890');
	});

	test('should pass and normalize using custom delim', () => {
		const result = StringHandler.phone('123 456 7890', {
			delim: '.',
			allowedDelims: ' '
		});
		expect(result.pass).toBe(true);
		expect(result.value).toBe('123.456.7890');
	});

	test('should preserve original format when normalize is false', () => {
		const result = StringHandler.phone('123 456 7890', {
			delim: '.',
			allowedDelims: ' ',
			normalize: false
		});
		expect(result.pass).toBe(true);
		expect(result.value).toBe('123 456 7890');
	});

	test('should fail when allowLooseFormat is false and delimiters do not match delim', () => {
		const result = StringHandler.phone('123 456 7890', {
			delim: '-',
			allowLooseFormat: false
		});
		expect(result.pass).toBe(false);
		expect(getFirstError(result).key).toBe('string/phone');
	});

	test('should fail when delimiter is not in allowedDelims', () => {
		const result = StringHandler.phone('123/456/7890', {
			delim: '-',
			allowedDelims: ' .'
		});
		expect(result.pass).toBe(false);
		expect(getFirstError(result).key).toBe('string/phone');
	});

	test('should fail when number does not have valid segments', () => {
		const result = StringHandler.phone('12-34-5678');
		expect(result.pass).toBe(false);
		expect(getFirstError(result).key).toBe('string/phone');
	});
});

describe('StringHandler.repetition', () => {
	test('should pass with default options when fragment appears at least once', () => {
		const result = StringHandler.repetition('abcabc', 'abc');
		expect(result.pass).toBe(true);
		expect(result.value).toBe('abcabc');
	});

	test('should fail with default options when fragment does not appear', () => {
		const result = StringHandler.repetition('xyz', 'abc');
		expect(result.pass).toBe(false);
		const error = getFirstError(result);
		expect(error.key).toBe('string/repetition');
		expect(error.args).toMatchObject({
			fragment: 'abc',
			min: 1,
			max: null
		});
	});

	test('should enforce min and max counts when otherText is true', () => {
		const passResult = StringHandler.repetition('xxabyyabzz', 'ab', { min: 2, max: 2 });
		const failResult = StringHandler.repetition('xxabyy', 'ab', { min: 2, max: 2 });
		expect(passResult.pass).toBe(true);
		expect(failResult.pass).toBe(false);
		expect(getFirstError(failResult).key).toBe('string/repetition');
	});

	test('should support case-insensitive matching with ignoreCase true', () => {
		const result = StringHandler.repetition('AbcxxaBC', 'abc', { min: 2, ignoreCase: true });
		expect(result.pass).toBe(true);
		expect(result.value).toBe('AbcxxaBC');
	});

	test('should fail case-sensitive matching when ignoreCase is false', () => {
		const result = StringHandler.repetition('AbcxxaBC', 'abc', { min: 2, ignoreCase: false });
		expect(result.pass).toBe(false);
		expect(getFirstError(result).key).toBe('string/repetition');
	});

	test('should pass strict repetition when otherText is false and full string is repeated fragment', () => {
		const result = StringHandler.repetition('ababab', 'ab', { min: 2, max: 3, otherText: false });
		expect(result.pass).toBe(true);
		expect(result.value).toBe('ababab');
	});

	test('should fail strict repetition when otherText is false and extra text exists', () => {
		const result = StringHandler.repetition('abxab', 'ab', { min: 2, otherText: false });
		expect(result.pass).toBe(false);
		expect(getFirstError(result).key).toBe('string/repetition');
	});

	test('should fail strict repetition for empty string even when min is zero', () => {
		const result = StringHandler.repetition('', 'ab', { min: 0, otherText: false });
		expect(result.pass).toBe(false);
		expect(getFirstError(result).key).toBe('string/repetition');
	});

	test('should handle regex-special fragment characters literally', () => {
		const result = StringHandler.repetition('a+b a+b', 'a+b', { min: 2, ignoreCase: false });
		expect(result.pass).toBe(true);
		expect(result.value).toBe('a+b a+b');
	});
});

describe('StringHandler.slug', () => {
	test('should pass for a valid slug', () => {
		const result = StringHandler.slug('my-slug-123');
		expect(result.pass).toBe(true);
		expect(result.value).toBe('my-slug-123');
	});

	test('should pass for single token slug', () => {
		const result = StringHandler.slug('simple');
		expect(result.pass).toBe(true);
		expect(result.value).toBe('simple');
	});

	test('should fail when uppercase letters are present', () => {
		const result = StringHandler.slug('My-Slug');
		expect(result.pass).toBe(false);
		expect(getFirstError(result).key).toBe('string/slug');
	});

	test('should fail when underscores are present', () => {
		const result = StringHandler.slug('my_slug');
		expect(result.pass).toBe(false);
		expect(getFirstError(result).key).toBe('string/slug');
	});

	test('should fail when slug starts with hyphen', () => {
		const result = StringHandler.slug('-my-slug');
		expect(result.pass).toBe(false);
		expect(getFirstError(result).key).toBe('string/slug');
	});

	test('should fail when slug ends with hyphen', () => {
		const result = StringHandler.slug('my-slug-');
		expect(result.pass).toBe(false);
		expect(getFirstError(result).key).toBe('string/slug');
	});

	test('should fail when slug contains consecutive hyphens', () => {
		const result = StringHandler.slug('my--slug');
		expect(result.pass).toBe(false);
		expect(getFirstError(result).key).toBe('string/slug');
	});
});



describe('StringHandler.ssn', () => {
	test('should pass for valid SSN with default delimiter', () => {
		const result = StringHandler.ssn('123-45-6789');
		expect(result.pass).toBe(true);
		expect(result.value).toBe('123-45-6789');
	});

	test('should normalize compact SSN to default delimiter', () => {
		const result = StringHandler.ssn('123456789');
		expect(result.pass).toBe(true);
		expect(result.value).toBe('123-45-6789');
	});

	test('should normalize to custom delimiter when normalize is true', () => {
		const result = StringHandler.ssn('123 45 6789', {
			delim: '.',
			allowedDelims: ' '
		});
		expect(result.pass).toBe(true);
		expect(result.value).toBe('123.45.6789');
	});

	test('should preserve original format when normalize is false', () => {
		const result = StringHandler.ssn('123 45 6789', {
			delim: '.',
			allowedDelims: ' ',
			normalize: false
		});
		expect(result.pass).toBe(true);
		expect(result.value).toBe('123 45 6789');
	});

	test('should fail strict format when allowLooseFormat is false and delimiters do not match', () => {
		const result = StringHandler.ssn('123 45 6789', {
			delim: '-',
			allowLooseFormat: false
		});
		expect(result.pass).toBe(false);
		expect(getFirstError(result).key).toBe('string/ssn');
	});

	test('should fail when delimiter is not included in allowedDelims', () => {
		const result = StringHandler.ssn('123/45/6789', {
			delim: '-',
			allowedDelims: ' .'
		});
		expect(result.pass).toBe(false);
		expect(getFirstError(result).key).toBe('string/ssn');
	});

	test('should fail when area number is invalid', () => {
		const result = StringHandler.ssn('666-45-6789');
		expect(result.pass).toBe(false);
		expect(getFirstError(result).key).toBe('string/ssn');
	});

	test('should fail when group number is invalid', () => {
		const result = StringHandler.ssn('123-00-6789');
		expect(result.pass).toBe(false);
		expect(getFirstError(result).key).toBe('string/ssn');
	});

	test('should fail when serial number is invalid', () => {
		const result = StringHandler.ssn('123-45-0000');
		expect(result.pass).toBe(false);
		expect(getFirstError(result).key).toBe('string/ssn');
	});
});

describe('StringHandler.startsWith', () => {
	test('should pass when string starts with prefix', () => {
		const result = StringHandler.startsWith('hello world', 'hello');
		expect(result.pass).toBe(true);
		expect(result.value).toBe('hello world');
	});

	test('should pass with ignoreCase option', () => {
		const result = StringHandler.startsWith('Hello World', 'HELLO', { ignoreCase: true });
		expect(result.pass).toBe(true);
		expect(result.value).toBe('hello world');
	});

	test('should fail when prefix is not at start', () => {
		const result = StringHandler.startsWith('hello world', 'world');
		expect(result.pass).toBe(false);
		const error = getFirstError(result);
		expect(error.key).toBe('string/startsWith');
		expect(error.args).toMatchObject({ prefix: 'world' });
	});

	test('should fail on case mismatch when ignoreCase is false', () => {
		const result = StringHandler.startsWith('Hello World', 'hello', { ignoreCase: false });
		expect(result.pass).toBe(false);
		expect(getFirstError(result).key).toBe('string/startsWith');
	});
});

describe('StringHandler.state', () => {
	test('should pass for valid uppercase state code', () => {
		const result = StringHandler.state('CA');
		expect(result.pass).toBe(true);
		expect(result.value).toBe('CA');
	});

	test('should pass for lowercase state code when allowLooseFormat is true', () => {
		const result = StringHandler.state('ca', { allowLooseFormat: true });
		expect(result.pass).toBe(true);
		expect(result.value).toBe('CA');
	});

	test('should fail for lowercase state code when allowLooseFormat is false', () => {
		const result = StringHandler.state('ca', { allowLooseFormat: false });
		expect(result.pass).toBe(false);
		expect(getFirstError(result).key).toBe('string/state');
	});

	test('should fail for unknown state code', () => {
		const result = StringHandler.state('ZZ');
		expect(result.pass).toBe(false);
		expect(getFirstError(result).key).toBe('string/state');
	});

	test('should fail for full state name', () => {
		const result = StringHandler.state('California', { allowLooseFormat: true });
		expect(result.pass).toBe(false);
		expect(getFirstError(result).key).toBe('string/state');
	});
});

describe('StringHandler.upperCase', () => {
	test('should pass when string is uppercase', () => {
		const result = StringHandler.upperCase('HELLO WORLD');
		expect(result.pass).toBe(true);
		expect(result.value).toBe('HELLO WORLD');
	});

	test('should pass for uppercase alphanumeric with symbols', () => {
		const result = StringHandler.upperCase('ABC123-_.!');
		expect(result.pass).toBe(true);
		expect(result.value).toBe('ABC123-_.!');
	});

	test('should pass for empty string', () => {
		const result = StringHandler.upperCase('');
		expect(result.pass).toBe(true);
		expect(result.value).toBe('');
	});

	test('should fail when lowercase letters are present', () => {
		const result = StringHandler.upperCase('Hello');
		expect(result.pass).toBe(false);
		expect(getFirstError(result).key).toBe('string/upperCase');
	});
});

describe('StringHandler.url', () => {
	test('should pass for a standard http URL and normalize to lowercase by default', () => {
		const result = StringHandler.url('http://Example.COM/Path?X=1#Frag');
		expect(result.pass).toBe(true);
		expect(result.value).toBe('http://example.com/path?x=1#frag');
	});

	test('should preserve case when normalize is false', () => {
		const result = StringHandler.url('http://Example.COM/Path?X=1#Frag', { normalize: false });
		expect(result.pass).toBe(true);
		expect(result.value).toBe('http://Example.COM/Path?X=1#Frag');
	});

	test('should enforce allowedProtocols option', () => {
		const passResult = StringHandler.url('ftp://example.com', {
			allowedProtocols: ['ftp'],
			protocols: required
		});
		const failResult = StringHandler.url('http://example.com', {
			allowedProtocols: ['ftp'],
			protocols: required
		});
		expect(passResult.pass).toBe(true);
		expect(failResult.pass).toBe(false);
		expect(getFirstError(failResult).key).toBe('string/url');
	});

	test('should require protocol when protocols is required', () => {
		const passResult = StringHandler.url('https://example.com', { protocols: required });
		const failResult = StringHandler.url('example.com', { protocols: required });
		expect(passResult.pass).toBe(true);
		expect(failResult.pass).toBe(false);
		expect(getFirstError(failResult).key).toBe('string/url');
	});

	test('should reject protocol when protocols is forbidden', () => {
		const failResult = StringHandler.url('https://example.com', { protocols: forbidden });
		expect(failResult.pass).toBe(false);
		expect(getFirstError(failResult).key).toBe('string/url');
	});

	test('should enforce domain required and ip forbidden', () => {
		const passResult = StringHandler.url('https://example.com', {
			domain: required,
			ip: forbidden,
			label: forbidden
		});
		const failResult = StringHandler.url('https://127.0.0.1', {
			domain: required,
			ip: forbidden,
			label: forbidden
		});
		expect(passResult.pass).toBe(true);
		expect(failResult.pass).toBe(false);
		expect(getFirstError(failResult).key).toBe('string/url');
	});

	test('should enforce ip required', () => {
		const passResult = StringHandler.url('http://127.0.0.1', {
			ip: required,
			domain: forbidden,
			label: forbidden
		});
		const failResult = StringHandler.url('http://example.com', {
			ip: required,
			domain: forbidden,
			label: forbidden
		});
		expect(passResult.pass).toBe(true);
		expect(failResult.pass).toBe(false);
		expect(getFirstError(failResult).key).toBe('string/url');
	});

	test('should enforce label required', () => {
		const passResult = StringHandler.url('http://localhost', {
			label: required,
			domain: forbidden,
			ip: forbidden
		});
		const failResult = StringHandler.url('http://example.com', {
			label: required,
			domain: forbidden,
			ip: forbidden
		});
		expect(passResult.pass).toBe(true);
		expect(failResult.pass).toBe(false);
		expect(getFirstError(failResult).key).toBe('string/url');
	});

	test('should support IPv6 host in brackets', () => {
		const result = StringHandler.url('http://[2001:db8::1]/a');
		expect(result.pass).toBe(true);
		expect(result.value).toBe('http://[2001:db8::1]/a');
	});

	test('should enforce port required', () => {
		const passResult = StringHandler.url('https://example.com:8080', { port: required });
		const failResult = StringHandler.url('https://example.com', { port: required });
		expect(passResult.pass).toBe(true);
		expect(failResult.pass).toBe(false);
		expect(getFirstError(failResult).key).toBe('string/url');
	});

	test('should reject port when port is forbidden', () => {
		const failResult = StringHandler.url('https://example.com:8080', { port: forbidden });
		expect(failResult.pass).toBe(false);
		expect(getFirstError(failResult).key).toBe('string/url');
	});

	test('should reject out-of-range port', () => {
		const result = StringHandler.url('https://example.com:70000', { port: optional });
		expect(result.pass).toBe(false);
		expect(getFirstError(result).key).toBe('string/url');
	});

	test('should enforce query required', () => {
		const passResult = StringHandler.url('https://example.com/path?x=1', { query: required });
		const failResult = StringHandler.url('https://example.com/path', { query: required });
		expect(passResult.pass).toBe(true);
		expect(failResult.pass).toBe(false);
		expect(getFirstError(failResult).key).toBe('string/url');
	});

	test('should reject query when query is forbidden', () => {
		const result = StringHandler.url('https://example.com/path?x=1', { query: forbidden });
		expect(result.pass).toBe(false);
		expect(getFirstError(result).key).toBe('string/url');
	});

	test('should enforce fragment required', () => {
		const passResult = StringHandler.url('https://example.com/path#frag', { fragment: required });
		const failResult = StringHandler.url('https://example.com/path', { fragment: required });
		expect(passResult.pass).toBe(true);
		expect(failResult.pass).toBe(false);
		expect(getFirstError(failResult).key).toBe('string/url');
	});

	test('should reject fragment when fragment is forbidden', () => {
		const result = StringHandler.url('https://example.com/path#frag', { fragment: forbidden });
		expect(result.pass).toBe(false);
		expect(getFirstError(result).key).toBe('string/url');
	});

	test('should pass for root-relative URL when rootRelative is true', () => {
		const result = StringHandler.url('/api/v1/items?x=1#top', { rootRelative: true });
		expect(result.pass).toBe(true);
		expect(result.value).toBe('/api/v1/items?x=1#top');
	});

	test('should fail for absolute URL when rootRelative is true', () => {
		const result = StringHandler.url('https://example.com/api', { rootRelative: true });
		expect(result.pass).toBe(false);
		expect(getFirstError(result).key).toBe('string/url');
	});

	test('should fail for malformed URL', () => {
		const result = StringHandler.url('http://exa mple.com');
		expect(result.pass).toBe(false);
		expect(getFirstError(result).key).toBe('string/url');
	});
});

describe('StringHandler.uuid', () => {
	test('should pass for valid UUID v4 without version constraint', () => {
		const value = '550e8400-e29b-41d4-a716-446655440000';
		const result = StringHandler.uuid(value);
		expect(result.pass).toBe(true);
		expect(result.value).toBe(value);
	});

	test('should pass for uppercase UUID because matching is case-insensitive', () => {
		const value = '550E8400-E29B-41D4-A716-446655440000';
		const result = StringHandler.uuid(value);
		expect(result.pass).toBe(true);
		expect(result.value).toBe(value);
	});

	test('should pass when UUID matches requested version', () => {
		const value = '6ba7b810-9dad-11d1-80b4-00c04fd430c8';
		const result = StringHandler.uuid(value, 1);
		expect(result.pass).toBe(true);
		expect(result.value).toBe(value);
	});

	test('should fail when UUID version does not match requested version', () => {
		const value = '550e8400-e29b-41d4-a716-446655440000';
		const result = StringHandler.uuid(value, 1);
		expect(result.pass).toBe(false);
		const error = getFirstError(result);
		expect(error.key).toBe('string/uuid');
		expect(error.args).toMatchObject({ version: 1 });
	});

	test('should fail when variant nibble is invalid', () => {
		const value = '550e8400-e29b-41d4-c716-446655440000';
		const result = StringHandler.uuid(value);
		expect(result.pass).toBe(false);
		expect(getFirstError(result).key).toBe('string/uuid');
	});

	test('should fail when hyphen grouping is malformed', () => {
		const value = '550e8400e29b-41d4-a716-446655440000';
		const result = StringHandler.uuid(value);
		expect(result.pass).toBe(false);
		expect(getFirstError(result).key).toBe('string/uuid');
	});
});

describe('StringHandler.wordCount', () => {
	test('should pass when count is within inclusive range', () => {
		const result = StringHandler.wordCount('one two three', 2, 3);
		expect(result.pass).toBe(true);
		expect(result.value).toBe('one two three');
	});

	test('should pass exactly at lower and upper boundaries', () => {
		expect(StringHandler.wordCount('one two', 2, 4).pass).toBe(true);
		expect(StringHandler.wordCount('one two three four', 2, 4).pass).toBe(true);
	});

	test('should fail when below minimum and include args details', () => {
		const result = StringHandler.wordCount('one', 2, 4);
		expect(result.pass).toBe(false);
		const error = getFirstError(result);
		expect(error.key).toBe('string/wordCount');
		expect(error.args).toMatchObject({
			count: 1,
			min: 2,
			max: 4
		});
	});

	test('should fail when above maximum and include args details', () => {
		const result = StringHandler.wordCount('one two three four five', 1, 4);
		expect(result.pass).toBe(false);
		const error = getFirstError(result);
		expect(error.key).toBe('string/wordCount');
		expect(error.args).toMatchObject({
			count: 5,
			min: 1,
			max: 4
		});
	});

	test('should honor custom delimiter set', () => {
		const result = StringHandler.wordCount('one|two|three', 3, 3, '|');
		expect(result.pass).toBe(true);
		expect(result.value).toBe('one|two|three');
	});

	test('should collapse repeated delimiters and trim edges for counting', () => {
		const result = StringHandler.wordCount('  one,,,two,,three  ', 3, 3, ' ,');
		expect(result.pass).toBe(true);
		expect(result.value).toBe('  one,,,two,,three  ');
	});
});

describe('StringHandler.zip', () => {
	test('should pass for 5-digit ZIP with default options', () => {
		const result = StringHandler.zip('12345');
		expect(result.pass).toBe(true);
		expect(result.value).toBe('12345');
	});

	test('should pass for ZIP+4 and normalize to configured delimiter', () => {
		const result = StringHandler.zip('12345 6789', {
			delim: '-',
			allowedDelims: ' '
		});
		expect(result.pass).toBe(true);
		expect(result.value).toBe('12345-6789');
	});

	test('should preserve original format when normalize is false', () => {
		const result = StringHandler.zip('12345 6789', {
			delim: '-',
			allowedDelims: ' ',
			normalize: false
		});
		expect(result.pass).toBe(true);
		expect(result.value).toBe('12345 6789');
	});

	test('should fail with required4 key when ZIP+4 is required but missing', () => {
		const result = StringHandler.zip('12345', { zip4: required });
		expect(result.pass).toBe(false);
		expect(getFirstError(result).key).toBe('string/zip/required4');
	});

	test('should fail with forbidden4 key when ZIP+4 is forbidden but present', () => {
		const result = StringHandler.zip('12345-6789', { zip4: forbidden });
		expect(result.pass).toBe(false);
		expect(getFirstError(result).key).toBe('string/zip/forbidden4');
	});

	test('should fail when delimiter is not in allowedDelims', () => {
		const result = StringHandler.zip('12345/6789', {
			delim: '-',
			allowedDelims: ' .'
		});
		expect(result.pass).toBe(false);
		expect(getFirstError(result).key).toBe('string/zip/base');
	});

	test('should fail strict format when allowLooseFormat is false and delimiters do not match', () => {
		const result = StringHandler.zip('12345 6789', {
			delim: '-',
			allowLooseFormat: false
		});
		expect(result.pass).toBe(false);
		expect(getFirstError(result).key).toBe('string/zip/base');
	});

	test('should fail base validation for invalid ZIP values', () => {
		const allZeros = StringHandler.zip('00000');
		const shortZip = StringHandler.zip('1234');
		const zip4AllZeros = StringHandler.zip('12345-0000');
		expect(allZeros.pass).toBe(false);
		expect(shortZip.pass).toBe(false);
		expect(zip4AllZeros.pass).toBe(false);
		expect(getFirstError(allZeros).key).toBe('string/zip/base');
		expect(getFirstError(shortZip).key).toBe('string/zip/base');
		expect(getFirstError(zip4AllZeros).key).toBe('string/zip/base');
	});
});







// ====================================
// MUTATORS
// ====================================

describe('StringHandler.collapseRepeats', () => {
	test('should collapse all repeated character runs when char is omitted', () => {
		const result = StringHandler.collapseRepeats('aaabbbcccddeee');
		expect(result.pass).toBe(true);
		expect(result.value).toBe('abcde');
	});

	test('should collapse only the selected character when char is provided', () => {
		const result = StringHandler.collapseRepeats('heeellooo wooorld', 'o');
		expect(result.pass).toBe(true);
		expect(result.value).toBe('heeello world');
	});
});

describe('StringHandler.collapseSpacing', () => {
	test('should collapse consecutive whitespace to a single space', () => {
		const result = StringHandler.collapseSpacing('a\t\t b\n\n c   d');
		expect(result.pass).toBe(true);
		expect(result.value).toBe('a b c d');
	});

	test('should leave single-spaced text unchanged', () => {
		const result = StringHandler.collapseSpacing('one two three');
		expect(result.pass).toBe(true);
		expect(result.value).toBe('one two three');
	});
});

describe('StringHandler.escapeHtml', () => {
	test('should escape all supported HTML special characters', () => {
		const result = StringHandler.escapeHtml(`Tom & <Jerry> \"'`);
		expect(result.pass).toBe(true);
		expect(result.value).toBe('Tom &amp; &lt;Jerry&gt; &quot;&#39;');
	});

	test('should return same string when no escapable characters exist', () => {
		const result = StringHandler.escapeHtml('plain text');
		expect(result.pass).toBe(true);
		expect(result.value).toBe('plain text');
	});
});

describe('StringHandler.hexDecode', () => {
	test('should decode lowercase hexadecimal string', () => {
		const result = StringHandler.hexDecode('68656c6c6f');
		expect(result.pass).toBe(true);
		expect(result.value).toBe('hello');
	});

	test('should decode uppercase hexadecimal string', () => {
		const result = StringHandler.hexDecode('48656C6C6F');
		expect(result.pass).toBe(true);
		expect(result.value).toBe('Hello');
	});
});

describe('StringHandler.hexEncode', () => {
	test('should encode ASCII text into hexadecimal', () => {
		const result = StringHandler.hexEncode('Hello');
		expect(result.pass).toBe(true);
		expect(result.value).toBe('48656c6c6f');
	});

	test('should preserve leading zero padding per byte', () => {
		const result = StringHandler.hexEncode('\x01A');
		expect(result.pass).toBe(true);
		expect(result.value).toBe('0141');
	});
});

describe('StringHandler.normalizeLineBreaks', () => {
	test('should normalize mixed line endings to LF by default', () => {
		const result = StringHandler.normalizeLineBreaks('a\r\nb\rc\nd');
		expect(result.pass).toBe(true);
		expect(result.value).toBe('a\nb\nc\nd');
	});

	test('should normalize mixed line endings to custom token', () => {
		const result = StringHandler.normalizeLineBreaks('a\r\nb\rc\nd', '|');
		expect(result.pass).toBe(true);
		expect(result.value).toBe('a|b|c|d');
	});
});

describe('StringHandler.normalizeUnicode', () => {
	test('should normalize decomposed characters to NFC by default', () => {
		const result = StringHandler.normalizeUnicode('e\u0301');
		expect(result.pass).toBe(true);
		expect(result.value).toBe('\u00E9');
	});

	test('should normalize composed characters to NFD when requested', () => {
		const result = StringHandler.normalizeUnicode('\u00E9', 'NFD');
		expect(result.pass).toBe(true);
		expect(result.value).toBe('e\u0301');
	});
});

describe('StringHandler.padLeft', () => {
	test('should left-pad to requested length with custom char', () => {
		const result = StringHandler.padLeft('42', 5, '0');
		expect(result.pass).toBe(true);
		expect(result.value).toBe('00042');
	});

	test('should return original when already at least requested length', () => {
		const result = StringHandler.padLeft('hello', 3, '0');
		expect(result.pass).toBe(true);
		expect(result.value).toBe('hello');
	});
});

describe('StringHandler.padRight', () => {
	test('should right-pad to requested length with custom char', () => {
		const result = StringHandler.padRight('42', 5, '0');
		expect(result.pass).toBe(true);
		expect(result.value).toBe('42000');
	});

	test('should return original when already at least requested length', () => {
		const result = StringHandler.padRight('hello', 3, '0');
		expect(result.pass).toBe(true);
		expect(result.value).toBe('hello');
	});
});

describe('StringHandler.removeSpacing', () => {
	test('should remove all whitespace characters', () => {
		const result = StringHandler.removeSpacing(' a\t b\n c\r d ');
		expect(result.pass).toBe(true);
		expect(result.value).toBe('abcd');
	});

	test('should keep non-whitespace characters untouched', () => {
		const result = StringHandler.removeSpacing('a-b_c');
		expect(result.pass).toBe(true);
		expect(result.value).toBe('a-b_c');
	});
});

describe('StringHandler.slice', () => {
	test('should return substring using start and end indexes', () => {
		const result = StringHandler.slice('abcdef', 1, 4);
		expect(result.pass).toBe(true);
		expect(result.value).toBe('bcd');
	});

	test('should support negative indexes', () => {
		const result = StringHandler.slice('abcdef', -3);
		expect(result.pass).toBe(true);
		expect(result.value).toBe('def');
	});
});

describe('StringHandler.sliceFirst', () => {
	test('should return first character by default', () => {
		const result = StringHandler.sliceFirst('abcdef');
		expect(result.pass).toBe(true);
		expect(result.value).toBe('a');
	});

	test('should return first N characters when count is provided', () => {
		const result = StringHandler.sliceFirst('abcdef', 3);
		expect(result.pass).toBe(true);
		expect(result.value).toBe('abc');
	});
});

describe('StringHandler.sliceLast', () => {
	test('should return last character by default', () => {
		const result = StringHandler.sliceLast('abcdef');
		expect(result.pass).toBe(true);
		expect(result.value).toBe('f');
	});

	test('should return last N characters when count is provided', () => {
		const result = StringHandler.sliceLast('abcdef', 3);
		expect(result.pass).toBe(true);
		expect(result.value).toBe('def');
	});
});

describe('StringHandler.stripHtml', () => {
	test('should remove HTML tags from string', () => {
		const result = StringHandler.stripHtml('<p>Hello <strong>World</strong></p>');
		expect(result.pass).toBe(true);
		expect(result.value).toBe('Hello World');
	});

	test('should keep plain text unchanged', () => {
		const result = StringHandler.stripHtml('No tags here');
		expect(result.pass).toBe(true);
		expect(result.value).toBe('No tags here');
	});
});

describe('StringHandler.toCamelCase', () => {
	test('should convert delimited words to camelCase', () => {
		const result = StringHandler.toCamelCase('HELLO-world_example');
		expect(result.pass).toBe(true);
		expect(result.value).toBe('helloWorldExample');
	});

	test('should honor custom delimiters', () => {
		const result = StringHandler.toCamelCase('foo|bar|baz', '|');
		expect(result.pass).toBe(true);
		expect(result.value).toBe('fooBarBaz');
	});
});

describe('StringHandler.toDelimited', () => {
	test('should apply single transformer and join with custom delimiter', () => {
		const result = StringHandler.toDelimited('Hello world_TEST', {
			delim: '/',
			transformer: word => word.toLowerCase()
		});
		expect(result.pass).toBe(true);
		expect(result.value).toBe('hello/world/test');
	});

	test('should switch from transformer1 to transformer2 at switchIndex', () => {
		const result = StringHandler.toDelimited('ONE two THREE four', {
			delim: '-',
			switchIndex: 2,
			transformer1: word => word.toLowerCase(),
			transformer2: word => word.toUpperCase()
		});
		expect(result.pass).toBe(true);
		expect(result.value).toBe('one-two-THREE-FOUR');
	});
});

describe('StringHandler.toKebabCase', () => {
	test('should convert input to kebab-case', () => {
		const result = StringHandler.toKebabCase('Hello World_test');
		expect(result.pass).toBe(true);
		expect(result.value).toBe('hello-world-test');
	});

	test('should support custom delimiters', () => {
		const result = StringHandler.toKebabCase('a|b|C', '|');
		expect(result.pass).toBe(true);
		expect(result.value).toBe('a-b-c');
	});
});

describe('StringHandler.toLowerCase', () => {
	test('should lowercase alphabetic characters', () => {
		const result = StringHandler.toLowerCase('HeLLo 123');
		expect(result.pass).toBe(true);
		expect(result.value).toBe('hello 123');
	});

	test('should leave already-lowercase text unchanged', () => {
		const result = StringHandler.toLowerCase('already lower');
		expect(result.pass).toBe(true);
		expect(result.value).toBe('already lower');
	});
});

describe('StringHandler.toPascalCase', () => {
	test('should convert delimited words to PascalCase', () => {
		const result = StringHandler.toPascalCase('hello WORLD_test');
		expect(result.pass).toBe(true);
		expect(result.value).toBe('HelloWorldTest');
	});

	test('should honor custom delimiters', () => {
		const result = StringHandler.toPascalCase('foo|bar|baz', '|');
		expect(result.pass).toBe(true);
		expect(result.value).toBe('FooBarBaz');
	});
});

describe('StringHandler.toSentenceCase', () => {
	test('should uppercase first word and lowercase remaining words', () => {
		const result = StringHandler.toSentenceCase('hELLo-WORLD_example');
		expect(result.pass).toBe(true);
		expect(result.value).toBe('Hello world example');
	});

	test('should honor custom delimiters', () => {
		const result = StringHandler.toSentenceCase('FOO|BAR|baz', '|');
		expect(result.pass).toBe(true);
		expect(result.value).toBe('Foo bar baz');
	});
});

describe('StringHandler.toSnakeCase', () => {
	test('should convert input to snake_case', () => {
		const result = StringHandler.toSnakeCase('Hello World-test');
		expect(result.pass).toBe(true);
		expect(result.value).toBe('hello_world_test');
	});

	test('should support custom delimiters', () => {
		const result = StringHandler.toSnakeCase('a|b|C', '|');
		expect(result.pass).toBe(true);
		expect(result.value).toBe('a_b_c');
	});
});

describe('StringHandler.toTitleCase', () => {
	test('should capitalize each word and join with spaces', () => {
		const result = StringHandler.toTitleCase('hello-WORLD_example');
		expect(result.pass).toBe(true);
		expect(result.value).toBe('Hello World Example');
	});

	test('should honor custom delimiters', () => {
		const result = StringHandler.toTitleCase('foo|bar|BAZ', '|');
		expect(result.pass).toBe(true);
		expect(result.value).toBe('Foo Bar Baz');
	});
});

describe('StringHandler.toUpperCase', () => {
	test('should uppercase alphabetic characters', () => {
		const result = StringHandler.toUpperCase('HeLLo 123');
		expect(result.pass).toBe(true);
		expect(result.value).toBe('HELLO 123');
	});

	test('should leave already-uppercase text unchanged', () => {
		const result = StringHandler.toUpperCase('ALREADY UPPER');
		expect(result.pass).toBe(true);
		expect(result.value).toBe('ALREADY UPPER');
	});
});

describe('StringHandler.trim', () => {
	test('should trim surrounding whitespace by default', () => {
		const result = StringHandler.trim('  \t hello \n  ');
		expect(result.pass).toBe(true);
		expect(result.value).toBe('hello');
	});

	test('should trim custom characters from both sides', () => {
		const result = StringHandler.trim('__hello--', '_-');
		expect(result.pass).toBe(true);
		expect(result.value).toBe('hello');
	});
});

describe('StringHandler.trimLeft', () => {
	test('should trim only left-side whitespace by default', () => {
		const result = StringHandler.trimLeft('   hello   ');
		expect(result.pass).toBe(true);
		expect(result.value).toBe('hello   ');
	});

	test('should trim custom characters only from the left side', () => {
		const result = StringHandler.trimLeft('---hello---', '-');
		expect(result.pass).toBe(true);
		expect(result.value).toBe('hello---');
	});
});

describe('StringHandler.trimRight', () => {
	test('should trim only right-side whitespace by default', () => {
		const result = StringHandler.trimRight('   hello   ');
		expect(result.pass).toBe(true);
		expect(result.value).toBe('   hello');
	});

	test('should trim custom characters only from the right side', () => {
		const result = StringHandler.trimRight('---hello---', '-');
		expect(result.pass).toBe(true);
		expect(result.value).toBe('---hello');
	});
});

describe('StringHandler.urlDecode', () => {
	test('should decode URL-encoded strings', () => {
		const result = StringHandler.urlDecode('hello%20world%21');
		expect(result.pass).toBe(true);
		expect(result.value).toBe('hello world!');
	});

	test('should decode reserved characters', () => {
		const result = StringHandler.urlDecode('%2Fapi%2Fv1%3Fq%3Dtest');
		expect(result.pass).toBe(true);
		expect(result.value).toBe('/api/v1?q=test');
	});
});

describe('StringHandler.urlEncode', () => {
	test('should encode spaces and punctuation', () => {
		const result = StringHandler.urlEncode('hello world!');
		expect(result.pass).toBe(true);
		expect(result.value).toBe('hello%20world!');
	});

	test('should encode reserved URL characters', () => {
		const result = StringHandler.urlEncode('/api/v1?q=test');
		expect(result.pass).toBe(true);
		expect(result.value).toBe('%2Fapi%2Fv1%3Fq%3Dtest');
	});
});

