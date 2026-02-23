'use strict';

import StringHandler from '../../lib/handlers/StringHandler.js';

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
		expect(error.key).toBe('string/balanced');
		expect(error.args).toMatchObject({
			openChar: '(',
			closeChar: ')',
			openCount: 1
		});
	});
});




// ====================================
// MUTATORS
// ====================================
