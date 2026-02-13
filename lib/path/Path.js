'use strict';

class Path {
    static delims({ separator, up, self }) {
        this.prototype.separator = separator;
        this.prototype.up = up;
        this.prototype.self = self;
    }

    static create(string) {
        return new Path(string);
    }

    static fromArray(keys) {
        const { separator } = this.prototype;
        return Path.create(keys.join(separator));
    }

    constructor(string = '') {
        const { separator, up, self } = this;
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
        const { string, separator, up } = this;
        return Path.create(string + separator + up);
    }

    move(movementPath = '') {
        const movementString = movementPath instanceof Path
            ? movementPath.string
            : movementPath;

        const { separator } = this;
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
        const { string, separator, self } = this;
        return Path.create(self + separator + string);
    }

    toAbsolute() {
        const { string, separator } = this;
        return Path.create(separator + string);
    }



}

export default Path;
