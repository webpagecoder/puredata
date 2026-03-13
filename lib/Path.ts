'use strict';

type PathOrString = Path | string;

class Path {
    static separator: string = '/';
    static up: string = '..';
    static self: string = '.';

    string: string;
    private _keys: string[];
    isAbsolute: boolean;
    isSelf: boolean;
    upCount: number;

    static delims({ separator, up, self }: { separator: string; up: string; self: string }): void {
        Path.separator = separator;
        Path.up = up;
        Path.self = self;
    }

    static create(path: PathOrString): Path {
        return path instanceof Path ? new Path(path.string) : new Path(path);
    }

    static fromArray(keys: string[]): Path {
        const { separator } = Path;
        return Path.create(keys.join(separator));
    }

    constructor(pathString: string = '') {
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

        this.string = (isAbsolute ? separator : (up + separator).repeat(upCount)) + keys.join(separator) || self;
        this._keys = keys;
        this.isAbsolute = isAbsolute;
        this.isSelf = this.string === self;
        this.upCount = upCount;
    }

    get keys(): string[] {
        return [...this._keys];
    }

    parent(): Path {
        const { separator, up } = Path;
        return Path.create(this.string + separator + up);
    }

    move(movementPath: Path | string = ''): Path {
        const movementString = movementPath instanceof Path
            ? movementPath.string
            : movementPath;

        const { separator } = Path;
        return movementString.startsWith(separator)
            ? Path.create(movementString)
            : Path.create(this.string + separator + movementString);
    }

    equals(otherPath: Path): boolean {
        if (
            otherPath.isSelf !== this.isSelf
            || otherPath.isAbsolute !== this.isAbsolute
            || otherPath.upCount !== this.upCount
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

    shiftKeys(count: number = 1): Path {
        if (!this.isAbsolute) {
            throw new Error('Can only shift absolute paths.');
        }
        const { separator, up } = Path;
        const { isAbsolute, upCount, _keys } = this;
        return Path.create(
            (isAbsolute ? separator : (up + separator).repeat(upCount)) + _keys.slice(count).join(separator)
        );
    }

    toRelative(): Path {
        const { separator, self } = Path;
        return Path.create(self + separator + this.string);
    }

    toAbsolute(): Path {
        const { separator } = Path;
        return Path.create(separator + this.string);
    }

}

export { Path };
