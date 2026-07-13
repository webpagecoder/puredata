'use strict';

export type ValidationResult<T = unknown> = {
	pass?: boolean;
	fail?: boolean;
	value?: T;
	errors?: Record<string, unknown>;
};

export type TestCase<I = unknown, O = unknown, V = unknown> = {
	input: I;
	options?: O;
	pass: boolean;
	value?: V;
	errorKey?: string;
};

export const expectPass = <V = unknown>(result: ValidationResult<V>, value?: V): void => {
	expect(result.pass).toBe(true);
	if (value !== undefined) {
		expect(result.value).toEqual(value);
	}
};

export const expectFail = (result: ValidationResult, errorKey: string): void => {
	expect(result.fail).toBe(true);
	expect(result.errors).toHaveProperty(errorKey);
};

export const runCases = <I, O = unknown, V = unknown>(
	run: (input: I, options?: O) => ValidationResult<V>,
	cases: Array<TestCase<I, O, V>>,
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
