'use strict';

// Generic types
export type ArgumentCollection = Record<string, unknown>;
export type ErrorCollection =  Record<string, ArgumentCollection>;

export type Overwrite<T, U> = Omit<T, keyof U> & U;