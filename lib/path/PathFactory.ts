'use strict';

import { Path, PathDelimTypes } from './Path.ts'

class PathFactory {
    protected delims: PathDelimTypes;

    public constructor(delims: PathDelimTypes) {
        this.delims = delims;
    }

    public create(path: string | Path): Path {
        return new Path(path, this.delims);
    }

}

export { PathFactory };
