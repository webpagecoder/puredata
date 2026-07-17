'use strict';

import { HandlerResult } from "../../lib/fields/HandlerResult.ts";

export type PassTestCase<TData = unknown, TArgs extends any[] = any[]> = { 
	input: TData; 
	output?: TData; 
	args?: TArgs;
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
		expect(result.value).toEqual(output);
	}
};

export type FailTestCase<TData = unknown, TArgs extends any[] = any[]> = PassTestCase<TData, TArgs> & {
	 errorKey: string 
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
		const { input, output = input, args = [], errorKey } = testCase;
		const result = handlerMethod(input, ...(args as any[]));
		expect(result.pass).toBe(false);
		expect(result.value).toEqual(output);
		expect(result.errors).toHaveProperty(errorKey);
	}
};
