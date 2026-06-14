'use strict';

import { Path } from './Path.ts';

export type DelimTypes = {
    separator: string;
    up: string;
    self: string;
};

class PathFactory {
    protected delims: DelimTypes;

    public constructor(delims: DelimTypes) {
        this.delims = delims;
    }

    public create(path: string | Path): Path {
        return new Path(path, this.delims);
    }

    public fromArray(keys: string[]): Path {
        const { separator } = this.delims;
        return this.create(keys.join(separator));
    }

}

export { PathFactory };
