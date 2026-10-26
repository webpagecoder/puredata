'use strict';

/** Characters used to separate path segments and represent relative traversal. */
export type PathDelimTypes = {
    /** Delimiter between path segments. */
    separator: string;
    /** Segment representing one level up from the current node. */
    up: string;
    /** Segment representing the current node. */
    self: string;
};

/** Represents a normalized absolute or relative path through a node tree. */
class Path {

    /** Delimiter characters used to parse and format this path. */
    public delims: PathDelimTypes;

    private _isAbsolute: boolean;
    private _keys: string[];
    private _string: string;
    private _upCount: number;

    /**
     * Parses a path string, segments, or another path.
     *
     * @param pathString Path to parse; defaults to the current node.
     * @param delims Delimiters used to parse and format the path.
     */
    public constructor(pathString: string | string[] | Path = '', {
        self,
        separator,
        up,
    }: PathDelimTypes = {
            self: '.',
            separator: '/',
            up: '..',
        }) {

        this.delims = { self, separator, up };

        this._isAbsolute = false;
        this._keys = [];
        this._string = '';
        this._upCount = 0;

        if (pathString instanceof Path) {
            return new Path(pathString.toString(), pathString.delims);
        }
        else if (Array.isArray(pathString)) {
            return new Path(pathString.join(separator), { self, separator, up });
        }

        const isAbsolute = pathString.startsWith(separator);
        let upCount = 0;
        const keys: string[] = [];
        for (const part of pathString.split(separator)) {
            if (part === '' || part === self) {
                continue;
            }
            else if (part === up) {
                if (keys.length && keys[keys.length - 1] !== up) {
                    keys.pop();
                }
                else if (!isAbsolute) {
                    upCount++;
                }
            }
            else {
                keys.push(part);
            }
        }

        this._isAbsolute = isAbsolute;
        this._keys = keys;
        this._upCount = upCount;
        
        this._string = this.toString();
    }

    /** Gets the path's segments as a copy. */
    public get keys(): string[] {
        return [...this._keys];
    }

    /** Whether this path starts at the root. */
    public get isAbsolute(): boolean {
        return this._isAbsolute;
    }

    /** Whether this path identifies the root node. */
    public get isRoot(): boolean {
        return this._string === this.delims.separator;
    }

    /** Whether this path identifies the current node. */
    public get isSelf(): boolean {
        return this._string === this.delims.self && this.upCount === 0;
    }

    /** Number of parent traversals at the start of a relative path. */
    public get upCount(): number {
        return this._upCount;
    }

    /** Creates a relative path to this path's parent. */
    public parent(): Path {
        const { separator, up } = this.delims;
        return new Path(this._string + separator + up, this.delims);
    }

    /**
     * Resolves a target path against this path.
     *
     * Absolute targets are returned as-is; relative targets are appended.
     *
     * @param targetPath Path to resolve from this path.
     * @returns The resolved path.
     */
    public move(targetPath: Path): Path {
        if (targetPath.isAbsolute) {
            return new Path(targetPath);
        }
        const { delims } = targetPath;
        return new Path(
            this.toString(targetPath.delims) + delims.separator + targetPath._string,
            delims
        );
    }

    /** Creates a path with the supplied segment appended. */
    public addSegment(key: string): Path {
        return new Path(this.toString() + this.delims.separator + key, this.delims);
    }

    /** Whether this path identifies the same location as another path. */
    public equals(otherPath: Path): boolean {
        if (
            otherPath.isSelf !== this.isSelf
            || otherPath.isAbsolute !== this.isAbsolute
            || otherPath.upCount !== this.upCount
            || otherPath.keys.length !== this.keys.length
        ) {
            return false;
        }
        for (let i = 0; i < this.keys.length; ++i) {
            if (this.keys[i] !== otherPath.keys[i]) {
                return false;
            }
        }
        return true;
    }

    /** Converts this path to an absolute path. */
    public toAbsolute(): Path {
        return new Path(this.delims.separator + this._string, this.delims);
    }

    /** Converts this path to a relative path. */
    public toRelative(): Path {
        const { separator, self } = this.delims;
        return new Path(self + separator + this._string, this.delims);
    }

    /**
     * Formats this path using the supplied or configured delimiters.
     *
     * @param options Optional delimiter overrides.
     * @returns The formatted path string.
     */
    public toString({
        self = this.delims.self,
        separator = this.delims.separator,
        up = this.delims.up
    } = {}): string {
        return (
            this._isAbsolute
                ? separator
                : (up + separator).repeat(this._upCount)
        ) + this._keys.join(separator) || self;
    }

    /** Formats this path with normalized `/`, `.`, and `..` delimiters. */
    public toNormalizedString(): string {
        return this.toString({ self: '.', separator: '/', up: '..' });
    }

}

export { Path };
