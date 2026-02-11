'use strict';

const StringUtils = require('../utils/StringUtils.js');

class Path {

    constructor(delim = '/', up = '..', self = '.') {
        Object.assign(this, {
            delim,
            up,
            self
        });
    }

    create(pathStr) {
        if(typeof pathStr !== 'string') {
            throw new TypeError('Path string must be a string');
        }
        
    }

    static createPathString({
        chars,
        pathKeys
    }) {
        return pathKeys.join(chars.delim);
    }

    static create(pathStr, delim) {
        if(typeof pathStr !== 'string') {
            throw new TypeError('Path string must be a string');
        }
        pathStr = pathStr.trim();
        const path = new this();
        path.chars = {
            delim,
        };
        const normalizedPath = StringUtils.trim(StringUtils.collapseRepeats(pathStr, delim), delim);
        path.pathKeys = normalizedPath.length ? normalizedPath.split(delim) : [];
        path.path = path.toString();
        return path;
    }

    static createFromArray(pathKeys, delim) {
        if (!Array.isArray(pathKeys)) {
            throw new TypeError('Path keys must be an array');
        }
        const path = new this();
        path.chars = {
            delim,
        };
        path.pathKeys = [...pathKeys];
        path.path = path.toString();
        return path;
    }

    clone(overwrite = {}) {
        const clone = new this.constructor();
        Object.assign(clone, this, overwrite);
        return clone;
    }

    get length() {
        return this.pathKeys.length;
    }

    get lastKey() {
        return this.sliceKeys(-1)[0];
    }

    chop(count = 1) {
        return this.clone({
            pathKeys: this.pathKeys.slice(0, -count),
        });
    }

    appendKeys(...keys) {
        return this.clone({
            pathKeys: this.pathKeys.concat(keys)
        });
    }

    prependKeys(...keys) {
        return this.clone({
            pathKeys: keys.concat(this.pathKeys)
        });
    }

    sliceKeys(start, end) {
        return this.pathKeys.slice(start, end);
    }

    toString() {
        return Path.createPathString(this);
    }

    toArray() {
        return [...this.pathKeys];
    }

    equals(otherPath) {
        return otherPath instanceof Path && this.toString() === otherPath.toString();
    }

    matchesPath(keyArray = []) {
        const {pathKeys} = this;
        if(keyArray.length !== pathKeys.length) {
            return false;
        }
        let i = 0;
        for(const key of keyArray) {
            if(key !== pathKeys[i]) {
                return false;
            }
            ++i;
        }
        return true;
    }

}

module.exports = Path;