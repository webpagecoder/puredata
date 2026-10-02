'use strict';

export type PathDelimTypes = {
    separator: string;
    up: string;
    self: string;
};

class Path {

    public delims: PathDelimTypes;

    private _isAbsolute: boolean;
    private _keys: string[];
    private _string: string;
    private _upCount: number;

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
        this._string = this.toString();
        this._upCount = upCount;
    }

    public get keys(): string[] {
        return [...this._keys];
    }

    public get isAbsolute(): boolean {
        return this._isAbsolute;
    }

    public get isRoot(): boolean {
        return this._string === this.delims.separator;
    }

    public get isSelf(): boolean {
        return this._string === this.delims.self && this.upCount === 0;
    }

    public get upCount(): number {
        return this._upCount;
    }

    public parent(): Path {
        const { separator, up } = this.delims;
        return new Path(this._string + separator + up, this.delims);
    }

    public move(targetPath: Path): Path {
        if (targetPath.isAbsolute) {
            return new Path(targetPath);
        }
        const delims = targetPath.delims;
        const { separator } = delims;
        return new Path(
            this.toString(targetPath.delims) + separator + targetPath._string,
            delims
        );
    }

    public addSegment(key: string): Path {
        return new Path(this.toString() + this.delims.separator + key, this.delims);
    }

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

    public toAbsolute(): Path {
        return new Path(this.delims.separator + this._string, this.delims);
    }

    public toRelative(): Path {
        const { separator, self } = this.delims;
        return new Path(self + separator + this._string, this.delims);
    }

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

    public toNormalizedString(): string {
        return this.toString({ self: '.', separator: '/', up: '..' });
    }

}

export { Path };
