
'use strict';

const RegexCache = require('../cache/RegexCache.js');
const DataCache = require('../cache/DataCache.js');

class StringUtils {

    static toLowerCase(str) {
        return str.toLowerCase();
    }

    static toUpperCase(str) {
        return str.toUpperCase();
    }

    static padLeft(str, length, char = ' ') {
        let padding = '';
        if (str.length < length) {
            padding = new Array(length - str.length + 1).join(char);
        }
        return padding + str;
    }

    static padRight(str, length, char = ' ') {
        let padding = '';
        if (str.length < length) {
            padding = new Array(length - str.length + 1).join(char);
        }
        return str + padding;
    }

    static trimLeft(str, chars = ' ') {
        const finalChars = chars === ' ' ? '\\s' : self.escapeForRegex(chars);
        return str.replace(RegexCache('^[' + finalChars + ']+'), '');
    }

    static trimRight(str, chars = ' ') {
        const finalChars = chars === ' ' ? '\\s' : self.escapeForRegex(chars);
        return str.replace(RegexCache('[' + finalChars + ']+$'), '');
    }

    static trim(str, chars = ' ') {
        const finalChars = chars === ' ' ? '\\s' : self.escapeForRegex(chars);
        return str.replace(RegexCache(`^[${finalChars}]+|[${finalChars}]+$`, 'g'), '');
    }

    static collapseRepeats(str, char = null) {
        if (!char) {
            return str.replace(/(.)\1+/g, '$1');
        }
        return str.replace(RegexCache('(' + self.escapeForRegex(char) + ')\\1+', 'g'), '$1');
    }

    static escapeForRegex(str) {
        return str.replace(/([\\\^\$\*\+\?\.\(\)\|\{\}\[\]\-])/g, '\\$1')
    }

    static getNumUniqueDelims(str, chars) {
        return ([...chars].filter(v => str.indexOf(v) > -1)).length;
    }

    static escapeForRegex(str) {
        return str.replace(/([\\\^\$\*\+\?\.\(\)\|\{\}\[\]\-])/g, '\\$1')
    }

    static getMatchData(str, regex, options = {}) {
        const {
            allowedDelims,
            delim,
            allowLooseFormat
        } = options;

        let matchData;
        const bareStr = self.replaceDelims(str, allowedDelims + delim);

        // Loose match
        if (allowLooseFormat) {
            matchData = Array.isArray(regex)
                ? RegexCache('^(' + regex.join(')(') + ')$', 'i').exec(bareStr)
                : regex.exec(bareStr);
        }
        else {
            matchData = Array.isArray(regex)
                ? RegexCache('^(' + regex.join(')' + StringUtils.escapeForRegex(delim) + '(') + ')$')
                    .exec(str)
                : regex.exec(str);
        }

        if (matchData) {
            matchData[0] = bareStr;
        }

        return matchData;
    }

    static replaceDelims(str, delims, replacement = '') {
        return str.replace(RegexCache('[' + self.escapeForRegex(delims) + ']+', 'g'), replacement);
    }

    static splitOnDelims(str, chars) {
        const trimmed = self.trim(str, chars);
        return trimmed.length > 0
            ? trimmed.split(RegexCache('[' + self.escapeForRegex(chars) + ']+'))
            : [];
    }

    static generateCheckDigit(str, {
        weights = [2, 1],
        alpha = {
            A: 10, B: 11, C: 12, D: 13, E: 14, F: 15, G: 16, H: 17, I: 18, J: 19, K: 20, L: 21, M: 22,
            N: 23, O: 24, P: 25, Q: 26, R: 27, S: 28, T: 29, U: 30, V: 31, W: 32, X: 33, Y: 34, Z: 35
        },
        mod = 10,
        transform = x => x,
        reverse = false
    } = {}) {
        const values = str.toUpperCase().split('').map(ch => isNaN(ch) ? alpha[ch] : +ch);
        if (reverse) {
            values.reverse();
        }
        let sum = 0;
        const weightsLen = weights.length;
        for (let i = 0, len = values.length; i < len; i++) {
            const raw = values[i] * weights[i % weightsLen];
            sum += transform(raw);
        }
        return (mod - (sum % mod)) % mod;
    }

    static validateWithCheckDigit(str, {
        weights = [2, 1],
        mod = 10,
        transform = x => x,
        reverse = false
    } = {}) {
        return str.length > 0 && self.generateCheckDigit(str.slice(0, -1), {
            weights,
            mod,
            transform,
            reverse
        }) === Number(str.slice(-1));
    }

    static validateLuhn(str) {
        return self.validateWithCheckDigit(str, {
            weights: [2, 1],
            mod: 10,
            transform: x => x > 9 ? x - 9 : x,
            reverse: true
        });
    }
}

const self = module.exports = StringUtils;

