'use strict';

import { Path } from '../Path.ts';
import { Processor } from './Processor.ts';
import { SchemaProcessor } from './SchemaProcessor.ts';

export type SchemaNode<P = Processor> = P & {
    nodeParent: SchemaNode<SchemaProcessor>;
    nodePath: Path;
    resolveNodePath: (path: Path) => null | Processor;
};

function SchemaNodeMixin<P = Processor>(instance: P) {
    return Object.assign(instance as object, {
        resolveNodePath: function(path: Path): null | Processor {
            if (typeof path === 'string') {
                path = Path.create(path);
            }
            if (path.isSelf) {
                return this as unknown as Processor;
            }

            let foundProcessor = this as unknown as SchemaNode;
            if (path.isAbsolute) {
                foundProcessor = foundProcessor.nodeRoot;
            }
            else {
                for (let i = 0; i < path.upCount; ++i) {
                    foundProcessor = foundProcessor.nodeParent;
                }
            }

            for (const key of path.keys) {
                if (!foundProcessor || !(foundProcessor instanceof SchemaProcessor)) {
                    return null;
                }
                foundProcessor = foundProcessor.schema.get(key) as SchemaNode;
            }
            return foundProcessor;
        }
    }) as SchemaNode<P>;
}

export { SchemaNodeMixin };

