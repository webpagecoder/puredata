'use strict';

export type ValidationResult<TValue = unknown> = {
	pass?: boolean;
	fail?: boolean;
	value?: TValue;
	errors?: Record<string, unknown>;
};

export type TestCase<TInput = unknown, TOptions = unknown, TValue = unknown> = {
	input: TInput;
	options?: TOptions;
	pass: boolean;
	value?: TValue;
	errorKey?: string;
};

export const expectPass = <TValue = unknown>(result: ValidationResult<TValue>, value?: TValue): void => {
	expect(result.pass).toBe(true);
	if (value !== undefined) {
		expect(result.value).toEqual(value);
	}
};

export const expectFail = (result: ValidationResult, errorKey: string): void => {
	expect(result.fail).toBe(true);
	expect(result.errors).toHaveProperty(errorKey);
};

export const runCases = <TInput, TOptions = unknown, TValue = unknown>(
	run: (input: TInput, options?: TOptions) => ValidationResult<TValue>,
	cases: Array<TestCase<TInput, TOptions, TValue>>,
	defaultErrorKey = 'unknown'
): void => {
	for (const c of cases) {
		const result = run(c.input, c.options);
		if (c.pass) {
			expectPass(result, c.value);
			continue;
		}

		expectFail(result, c.errorKey ?? defaultErrorKey);
	}
};
