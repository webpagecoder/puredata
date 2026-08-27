'use strict';

export type PassTestCase<TData = unknown, TArgs extends any[] = any[]> = {
	input: TData;
	output?: TData | ((value: TData) => boolean) | ((value: unknown) => boolean);
	args?: TArgs;
};

export type FailTestCase<TData = unknown, TArgs extends any[] = any[]> = PassTestCase<TData, TArgs> & {
	errorKey?: string
};

export const runPassTests = <THandler extends (first: any, ...args: any[]) => any>(
	handlerMethod: THandler,
	testCases: Array<
		Parameters<THandler> extends [infer TInput, ...infer TArgs]
		? PassTestCase<TInput, TArgs>
		: never
	>,
): void => {
	for (const testCase of testCases) {
		const { input, output = input, args = [] } = testCase;
		const result = handlerMethod(input, ...(args as any[]));
		expect(result.pass).toBe(true);
		if (typeof output === 'function') {
			expect(output(result.value)).toBe(true);
		} else {
			expect(result.value).toEqual(output);
		}
	}
};

export const runFailTests = <THandler extends (first: any, ...args: any[]) => any>(
	handlerMethod: THandler,
	testCases: Array<
		Parameters<THandler> extends [infer TInput, ...infer TArgs]
		? FailTestCase<TInput, TArgs>
		: never
	>,
): void => {
	for (const testCase of testCases) {
		const { input, output = input, args = [], errorKey = null } = testCase;
		const result = handlerMethod(input, ...(args as any[]));
		expect(result.pass).toBe(false);
		if (typeof output === 'function') {
			expect(output(result.value)).toBe(true);
		} else {
			expect(result.value).toEqual(output);
		}
		if (errorKey) {
			expect(result.errors).toHaveProperty(errorKey);
		}
	}
};
