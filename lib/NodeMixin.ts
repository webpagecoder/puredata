'use strict';

import { Path } from './Path.ts';

export type Constructor = new (...args: any[]) => any;

const SYM_IS_NODE = Symbol('isNode');

export const NodeMixin = <T = unknown, TBase extends Constructor = Constructor>(BaseClass: TBase) => {

    return class NodeMixinClass extends BaseClass {
        public parent: NodeMixinClass;
        public children: Record<string, T | NodeMixinClass>;

        public constructor(...args: any[]) {
            super(...args);
            this.parent = this;
            this.children = {};
            (this as any)[SYM_IS_NODE] = true;
        }

        public addChild(key: string, value: T) {
            if ((value as any)[SYM_IS_NODE]) {
                (value as NodeMixinClass).parent = this;
            }
            this.children[key] = value;
        }

        public removeChild(key: string) {
            const child = this.children[key];
            if (child && (child as any)[SYM_IS_NODE]) {
                const childNode = child as unknown as NodeMixinClass;
                (child as unknown as NodeMixinClass).parent = childNode;
            }
            delete this.children[key];
        }

        public resolvePath(path: Path | string): unknown {
            path = new Path(path);
            if (path.isSelf) {
                return this;
            }

            let node: NodeMixinClass;

            // Determine starting point based on abs/relative positioning
            if (path.isAbsolute) {
                node = this.root;
            }
            else {
                node = this;
                let i = path.upCount;
                while (i > 0) {
                    node = node.parent;
                    --i;
                }
            }

            if (!node) {
                return null;
            }

            // Dive into path keys
            for (const key of path.keys) {
                const child = (node as any)[SYM_IS_NODE] && node.children[key];
                if (child === undefined) {
                    return null;
                }
                node = child;
            }
            return node;
        }

        public get root(): NodeMixinClass {
            let node: NodeMixinClass = this;
            do {
                node = node.parent;
            }
            while (node && (node as any)[SYM_IS_NODE] && node.parent !== node);
            return node;
        }
    }
};
