'use strict';


export type PathDelimTypes = {
    separator: string;
    up: string;
    self: string;
};

class Path {

    protected _self!: string;
    protected _separator!: string;
    protected _up!: string;

    protected _isAbsolute!: boolean;
    protected _keys!: string[];
    protected _string!: string;
    protected _upCount!: number;

    public constructor(pathString: string | string[] | Path = '', delims: PathDelimTypes = {
        self: '.',
        separator: '/',
        up: '..',
    }) {

        if (pathString instanceof Path) {
            return new Path(pathString._string, delims);
        }
        else if (Array.isArray(pathString)) {
            return new Path(pathString.join(delims.separator), delims);
        }

        const { separator, up, self } = delims;
        this._self = self;
        this._separator = separator;
        this._up = up;

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
        return this._string === this._separator;
    }

    public get isSelf(): boolean {
        return this._string === this._self;
    }

    public get string(): string {
        return this._string;
    }

    public get upCount(): number {
        return this._upCount;
    }

    public get self(): string {
        return this._self;
    }

    public get separator(): string {
        return this._separator;
    }

    public get up(): string {
        return this._up;
    }

    public parent(): Path {
        const { _self: self, _separator: separator, _up: up } = this;
        return new Path(this._string + separator + up, { self, separator, up });
    }

    public move(movementPath: Path): Path {
        const { _self: self, _separator, _up, _string } = movementPath;
        return _string.startsWith(_separator)
            ? new Path(movementPath)
            : new Path(this.toString() + this._separator + _string, { self: this._self, separator: this._separator, up: this._up });
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

    public shiftKeys(count: number = 1): Path {
        if (!this._isAbsolute) {
            throw new Error('Can only shift absolute paths.');
        }
        const { _self: self, _separator: separator, _up: up } = this;
        const { _isAbsolute, _upCount, _keys } = this;
        return new Path(
            (_isAbsolute ? separator : (up + separator).repeat(_upCount)) + _keys.slice(count).join(separator),
            { self, separator, up }
        );
    }

    public toAbsolute(): Path {
        const { _self: self, _separator: separator, _up: up } = this;
        return new Path(_separator + this._string, { self, separator, up });
    }

    public toRelative(): Path {
        const { _self: self, _separator: separator, _up: up } = this;
        return new Path(self + separator + this._string, { self, separator, up });
    }

    public toString({
        self = this._self,
        separator = this._separator,
        up = this._up
    } = {}) {
        return (
            this._isAbsolute
                ? separator
                : (up + separator).repeat(this._upCount)
        ) + this._keys.join(separator) || self;
    }

}

export { Path };
