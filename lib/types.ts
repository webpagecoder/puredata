'use strict';

// Generic types
export type ArgumentCollection = Record<string, unknown>;
export type ErrorCollection =  Record<string, ArgumentCollection>;

export type Overwrite<T, U> = Omit<T, keyof U> & U;
export type StrictExtend<Base, Extension> =
  keyof Extension & keyof Base extends never
    ? Base & Extension
    : never;