// @ts-nocheck
'use strict';

class Path {
    static delims({ separator, up, self }) {
        Path.separator = separator;
        Path.up = up;
        Path.self = self;
    }

    static create(string) {
        return new Path(string);
    }

    static fromArray(keys) {
        const { separator } = Path;
        return Path.create(keys.join(separator));
    }

    constructor(string = '') {
        const { separator, up, self } = Path;
        const isAbsolute = string.startsWith(separator);
        let upCount = 0;
        const keys = [];
        for (const part of string.split(separator)) {
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

    get keys() {
        return [...this._keys];
    }

    parent() {
        const { string, separator, up } = Path;
        return Path.create(string + separator + up);
    }

    move(movementPath = '') {
        const movementString = movementPath instanceof Path
            ? movementPath.string
            : movementPath;

        const { separator } = Path;
        return movementString.startsWith(separator)
            ? Path.create(movementString)
            : Path.create(this.string + separator + movementString);
    }

    equals(otherPath) {
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

    shiftKeys(count = 1) {
        if (!this.isAbsolute) {
            throw new Error('Can only shift absolute paths.');
        }
        const { isAbsolute, separator, up, upCount, _keys } = this;
        return Path.create(
            (isAbsolute ? separator : (up + separator).repeat(upCount)) + _keys.slice(count).join(separator)
        );
    }

    toRelative() {
        const { string, separator, self } = Path;
        return Path.create(self + separator + string);
    }

    toAbsolute() {
        const { string, separator } = Path;
        return Path.create(separator + string);
    }

}

Path.separator = '/';
Path.up = '..';
Path.self = '.';

export { Path };
