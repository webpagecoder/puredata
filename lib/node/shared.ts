export const SYM_IS_NODE = Symbol('isNode');
export const SYM_NAMED_CHILDREN = Symbol('namedChildren');
export const SYM_INDEXED_CHILDREN = Symbol('indexedChildren');
export const SYM_PARENT = Symbol('parent');
export const SYM_SKIP_LEVEL = Symbol('skipLevel');

export type Constructor = new (...args: any[]) => any;