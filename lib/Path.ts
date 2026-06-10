'use strict';

type PathOrString = Path | string;

class Path {
    public static separator: string = '/';
    static up: string = '..';
    static self: string = '.';

    protected _isAbsolute: boolean;
    protected _keys: string[];
    protected _string: string;
    protected _upCount: number;

    public static delims({ separator, up, self }: { separator: string; up: string; self: string }): void {
        Path.separator = separator;
        Path.up = up;
        Path.self = self;
    }

    public static create(path: PathOrString): Path {
        return path instanceof Path ? new Path(path._string) : new Path(path);
    }

    public static fromArray(keys: string[]): Path {
        const { separator } = Path;
        return Path.create(keys.join(separator));
    }

    public constructor(pathString: string = '') {
        const { separator, up, self } = Path;
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

        this._string = (isAbsolute ? separator : (up + separator).repeat(upCount)) + keys.join(separator) || self;
        this._keys = keys;
        this._isAbsolute = isAbsolute;
        this._upCount = upCount;
    }

    public get keys(): string[] {
        return [...this._keys];
    }

    public get isAbsolute(): boolean {
        return this._isAbsolute;
    }

    public get isRoot(): boolean {
        return this._string === Path.separator;
    }

    public get isSelf(): boolean {
        return this._string === Path.self;
    }

    public get string(): string {
        return this._string;
    }

    public get upChar(): string {
        return Path.up;
    }

    public get upCount(): number {
        return this._upCount;
    }
    
    public get separatorChar(): string {
        return Path.separator;
    }

    public get selfChar(): string {
        return Path.self;
    }

    public parent(): Path {
        const { separator, up } = Path;
        return Path.create(this._string + separator + up);
    }

    public move(movementPath: Path | string = ''): Path {
        const movementString = movementPath instanceof Path
            ? movementPath._string
            : movementPath;

        const { separator } = Path;
        return movementString.startsWith(separator)
            ? Path.create(movementString)
            : Path.create(this._string + separator + movementString);
    }

    public equals(otherPath: Path): boolean {
        if (
            otherPath._isSelf !== this._isSelf
            || otherPath._isAbsolute !== this._isAbsolute
            || otherPath._upCount !== this._upCount
            || otherPath.keys.length !== this._keys.length
        ) {
            return false;
        }
        for (let i = 0; i < this._keys.length; ++i) {
            if (this._keys[i] !== otherPath.keys[i]) {
                return false;
            }
        }
        return true;
    }

    public shiftKeys(count: number = 1): Path {
        if (!this._isAbsolute) {
            throw new Error('Can only shift absolute paths.');
        }
        const { separator, up } = Path;
        const { _isAbsolute: isAbsolute, _upCount: upCount, _keys } = this;
        return Path.create(
            (isAbsolute ? separator : (up + separator).repeat(upCount)) + _keys.slice(count).join(separator)
        );
    }

    public toAbsolute(): Path {
        const { separator } = Path;
        return Path.create(separator + this._string);
    }

    public toRelative(): Path {
        const { separator, self } = Path;
        return Path.create(self + separator + this._string);
    }

    public toString() {
        return this._string;
    }

}

export { Path };
