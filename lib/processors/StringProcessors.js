'use strict';

import Presence  from '../Presence.js';
import StringUtils  from '../utils/StringUtils.js';
import NumberProcessors  from './NumberProcessors.js';
import { pass, fail }  from '../Result.js';
const { optional, required, forbidden } = Presence;
import RegexCache  from '../cache/RegexCache.js';
import NumberUtils  from '../utils/NumberUtils.js';
import GenericProcessors  from './GenericProcessors.js';

class StringProcessors extends GenericProcessors {

    static base64Decode(str) {
        if (typeof Buffer !== 'undefined') {
            return pass(Buffer.from(str, 'base64').toString('utf8'));
        }
        else if (typeof atob !== 'undefined') {
            return pass(decodeURIComponent(escape(atob(str))));
        }
        return fail(str, 'string/base64Decode');
    }

    static base64Encode(str) {
        if (typeof Buffer !== 'undefined') {
            return pass(Buffer.from(str, 'utf8').toString('base64'));
        }
        else if (typeof btoa !== 'undefined') {
            return pass(btoa(unescape(encodeURIComponent(str))));
        }
        return fail(str, 'string/base64Encode');
    }

    static collapseRepeats(str, char) {
        return pass(StringUtils.collapseRepeats(str, char));
    }

    static collapseSpacing(str) {
        return pass(str.replace(/\s+/g, ' '));
    }

    static endsWith(str, suffix, options = StringProcessors.matchingDefaults) {
        const { ignoreCase } = options;

        if (ignoreCase) {
            str = StringUtils.toLowerCase(str);
            suffix = StringUtils.toLowerCase(suffix);
        }
        return str.endsWith(suffix)
            ? pass(str)
            : fail(str, 'string/endsWith', Object.assign({ suffix }, options));
    }

    static escapeHtml(str) {
        return pass(str
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;'));
    }

    static excludesChars(str, chars, options = StringProcessors.matchingDefaults) {
        const {
            ignoreCase,
        } = options;

        return str.replace(
            RegexCache(
                `[${StringUtils.escapeForRegex(chars)}]`,
                'g' + (ignoreCase ? 'i' : '')
            ),
            ''
        ).length === str.length
            ? pass(str)
            : fail(str, 'string/excludesChars', Object.assign({ chars }, options));
    }

    static length(str, length) {
        return str.length === length
            ? pass(str)
            : fail(str, 'string/length', { length });
    }

    static lengthBetween(str, min, max) {
        if (str.length >= min && str.length <= max) {
            return pass(str);
        }
        return fail(str, 'string/lengthBetween', { min, max });
    }

    static maxLength(str, max) {
        return str.length <= max
            ? pass(str)
            : fail(str, 'string/maxLength', { max });
    }

    static maxWords(str, max, allowedDelims = StringProcessors.matchingDefaults.allowedDelims) {
        const count = StringUtils.splitOnDelims(str, allowedDelims).length;
        return count <= max
            ? pass(str)
            : fail(str, 'string/maxWords', {
                count,
                max,
                allowedDelims
            });
    }

    static minLength(str, min) {
        return str.length >= min
            ? pass(str)
            : fail(str, 'string/minLength', { min });
    }

    static minWords(str, min, allowedDelims = StringProcessors.matchingDefaults.allowedDelims) {
        const count = StringUtils.splitOnDelims(str, allowedDelims).length;
        return count >= min
            ? pass(str)
            : fail(str, 'string/minWords', {
                count,
                min,
                allowedDelims
            });
    }

    static onlyChars(str, chars, options = StringProcessors.matchingDefaults) {
        const {
            ignoreCase,
        } = options;

        return str.replace(
            RegexCache(
                `[${StringUtils.escapeForRegex(chars)}]`,
                'g' + (ignoreCase ? 'i' : '')
            ),
            ''
        ).length === 0
            ? pass(str)
            : fail(str, 'string/onlyChars', Object.assign({ chars }, options));
    }

    static repetition(str, fragment, options = StringProcessors.matchingDefaults) {
        const {
            min = 1,
            max = null,
            otherText = true,
            ignoreCase,
        } = options;

        if (!otherText) {
            const fullRegex = `^(?=((${StringUtils.escapeForRegex(fragment)}){${min},${max === null ? '' : max}}))\\1$`;
            return RegexCache(fullRegex, (ignoreCase ? 'i' : '')).test(str) && str
                ? pass(str)
                : fail(str, 'string/repetition', Object.assign({ fragment, min, max }, options));
        }

        // Use some math to calculate if within repetition min/max
        const minChars = fragment.length * min;
        const maxChars = max !== null ? fragment.length * max : null;
        const difference =
            str.length -
            str.replace(RegexCache(StringUtils.escapeForRegex(fragment), 'g' + (ignoreCase ? 'i' : '')), '').length;

        return difference >= minChars && (maxChars === null || difference <= maxChars)
            ? pass(str)
            : fail(str, 'string/repetition', Object.assign({ fragment, min, max }, options));
    }

    static contains(str, substring, options = StringProcessors.matchingDefaults) {
        const { ignoreCase } = options;

        if (ignoreCase) {
            str = StringUtils.toLowerCase(str);
            substring = StringUtils.toLowerCase(substring);
        }

        return str.indexOf(substring) !== -1
            ? pass(str)
            : fail(str, 'string/contains', Object.assign({ substring }, options));
    }

    static wordCount(str, min, max, allowedDelims = StringProcessors.matchingDefaults.allowedDelims) {
        const count = StringUtils.splitOnDelims(str, allowedDelims).length;
        return count <= max && count >= min
            ? pass(str)
            : fail(str, 'string/wordCount', {
                count,
                min,
                max,
                allowedDelims
            });
    }

    static hexDecode(str) {
        let decoded = '';
        for (const match of str.matchAll(/.{1,2}/g)) {
            decoded += String.fromCharCode(parseInt(match[0], 16));
        }
        return pass(decoded);
    }

    static hexEncode(str) {
        let encoded = '';
        for (const char of [...str]) {
            encoded += StringUtils.padLeft(char.charCodeAt(0).toString(16), 2, '0');
        }
        return pass(encoded);
    }

    static alphanumeric(str) {
        return /^[A-Z0-9]+$/i.test(str)
            ? pass(str)
            : fail(str, 'string/alphanumeric');
    }

    static alpha(str) {
        return /^[A-Z]+$/i.test(str)
            ? pass(str)
            : fail(str, 'string/alpha');
    }

    static ascii(str) {
        return /^[\x00-\x7F]+$/.test(str)
            ? pass(str)
            : fail(str, 'string/ascii');
    }

    static balanced(str, openChar = '(', closeChar = ')') {
        let openCount = 0;
        for (let index = 0, max = str.length; index < max; ++index) {
            const char = str[index];
            if (char === openChar) {
                openCount++;
            }
            else if (char === closeChar) {
                openCount--;
            }
            if (openCount < 0) {
                return fail(str, "string/balanced", {
                    openChar,
                    closeChar,
                    openCount
                })
            }
        }
        return openCount === 0
            ? pass(str)
            : fail(str, "string/balanced", {
                openChar,
                closeChar,
                openCount
            });
    }

    static base64(str) {
        return /^[A-Za-z0-9+/]+={0,2}$/.test(str) && str.length % 4 === 0
            ? pass(str)
            : fail(str, 'string/base64');
    }

    static binary(str) {
        return /^[01]+$/.test(str)
            ? pass(str)
            : fail(str, 'string/binary');
    }

    static bmp(str) {
        return /^[\u0000-\uFFFF]*$/u.test(str)
            ? pass(str)
            : fail(str, 'string/bmp');
    }

    static creditCard(str, options = {}) {
        const finalOptions = Object.assign({
            delim: '',
            types: null
        }, options);

        const {
            allowLooseFormat,
            allowedDelims,
            delim,
            normalize,
            types
        } = Object.assign({}, StringProcessors.matchingDefaults, finalOptions);

        const cards = [
            // visa 4(13-19 total)
            [
                'visa',
                ['4\\d{3}', '\\d{4}', '\\d{4}', '\\d|\\d{4}', '|\\d{3}'],
                true,
            ],

            // mastercard (2221–2720)(16 total) or (51-55)(16 total)
            [
                'mastercard',
                [
                    '5[1-5]\\d{2}|2(?:2[2-9]\\d|[3-6]\\d{2}|7[01]\\d|720)',
                    '\\d{4}', '\\d{4}', '\\d{4}'
                ],
                true,
            ],

            // amex (34,37)(15 total) 
            [
                'amex',
                ['3[47]\\d{2}', '\\d{6}', '\\d{5}'],
                true,
            ],

            // discover (6011,644-649,65)(16 total) or (622126–622925)(16-19 total)
            [
                'discover',
                [
                    '(?=6011|65\\d{2}|64[4-9]\\d|622(?:12[6-9]|1[3-9]\\d|[2-8]\\d{2}|9[01]\\d|92[0-5]))',
                    '\\d{4}', '\\d{4}', '\\d{4}', '\\d{4}', '(?:\\d{3})?'
                ],
                true,
            ],

            // diners classic 14 digits 
            [
                'diners',
                ['30[0-5]\\d|3[689]\\d{2}', '\\d{6}', '\\d{4}'],
                true,
            ],

            // diners 16 digits 
            [
                'diners16',
                ['30[0-5]\\d|3[689]\\d{2}', '\\d{4}', '\\d{4}', '\\d{4}'],
                true,
            ],

            // jcb (3528–3589)(16-19 total) or (353,356)(16 total)
            [
                'jcb',
                ['352[89]|35[3-8]\\d', '\\d{4}', '\\d{4}', '\\d{4}', '\\d{0,3}'],
                true,
            ],

        ].filter(
            card => types === null
                ? true
                : types.indexOf(card[0]) > -1
        );

        for (const [, regex, checkLuhn] of cards) {
            const matchData = StringUtils.getMatchData(
                str,
                regex,
                {
                    delim,
                    allowedDelims,
                    allowLooseFormat
                }
            );

            if (matchData) {
                const [bareStr, ...parts] = matchData;
                if (checkLuhn && !this.prototype.luhn(bareStr).pass) {
                    return fail(str, 'string/creditCard', finalOptions);
                }

                return pass(
                    normalize
                        // Might have a trailing delim for some cc's so remove it
                        ? StringUtils.trim(parts.join(delim), delim)
                        : str
                );
            }
        }
        return fail(str, 'string/creditCard', finalOptions);
    }

    static currencyCode(str, options = {}) {
        const {
            allowLooseFormat,
        } = Object.assign({}, StringProcessors.matchingDefaults, options);

        const codes = ['AED', 'AFN', 'ALL', 'AMD', 'ANG', 'AOA', 'ARS', 'AUD', 'AWG', 'AZN', 'BAM', 'BBD', 'BDT',
            'BGN', 'BHD', 'BIF', 'BMD', 'BND', 'BOB', 'BOV', 'BRL', 'BSD', 'BTN', 'BWP', 'BYN', 'BZD', 'CAD',
            'CDF', 'CHE', 'CHF', 'CHW', 'CLF', 'CLP', 'COP', 'COU', 'CRC', 'CUP', 'CVE', 'CZK', 'DJF', 'DKK',
            'DOP', 'DZD', 'EGP', 'ERN', 'ETB', 'EUR', 'FJD', 'FKP', 'GBP', 'GEL', 'GHS', 'GIP', 'GMD', 'GNF',
            'GTQ', 'GYD', 'HKD', 'HNL', 'HTG', 'HUF', 'IDR', 'ILS', 'INR', 'IQD', 'IRR', 'ISK', 'JMD', 'JOD',
            'JPY', 'KES', 'KGS', 'KHR', 'KMF', 'KPW', 'KRW', 'KWD', 'KYD', 'KZT', 'LAK', 'LBP', 'LKR', 'LRD',
            'LSL', 'LYD', 'MAD', 'MDL', 'MGA', 'MKD', 'MMK', 'MNT', 'MOP', 'MRU', 'MUR', 'MVR', 'MWK', 'MXN',
            'MXV', 'MYR', 'MZN', 'NAD', 'NGN', 'NIO', 'NOK', 'NPR', 'NZD', 'OMR', 'PAB', 'PEN', 'PGK', 'PHP',
            'PKR', 'PLN', 'PYG', 'QAR', 'RON', 'RSD', 'CNY', 'RUB', 'RWF', 'SAR', 'SBD', 'SCR', 'SDG', 'SEK',
            'SGD', 'SHP', 'SLE', 'SLL', 'SOS', 'SRD', 'SSP', 'STN', 'SVC', 'SYP', 'SZL', 'THB', 'TJS', 'TMT',
            'TND', 'TOP', 'TRY', 'TTD', 'TWD', 'TZS', 'UAH', 'UGX', 'USD', 'USN', 'UYI', 'UYU', 'UYW', 'UZS',
            'VED', 'VES', 'VND', 'VUV', 'WST', 'XAF', 'XAG', 'XAU', 'XBA', 'XBB', 'XBC', 'XBD', 'XCD', 'XDR',
            'XOF', 'XPD', 'XPF', 'XPT', 'XSU', 'XTS', 'XUA', 'XXX', 'YER', 'ZAR', 'ZMW', 'ZWL'
        ];

        const search = allowLooseFormat ? str.toUpperCase() : str;
        return codes.indexOf(search) > -1
            ? pass(search)
            : fail(str, 'string/currencyCode', options);
    }

    static dataUrl(str, options = {}) {
        const {
            allowedTypes = ['image', 'video', 'audio', 'text'],
        } = options;

        return RegexCache([
            '^data:',
            `(${allowedTypes.join('|')})/([a-z0-9+.-]+)`,
            ';base64,',
            '([A-Za-z0-9+/=]+)',
            '$'
        ].join(''), 'i').test(str)
            ? pass(str)
            : fail(str, 'string/dataUrl', options);
    }

    static digits(str) {
        return /^\d+$/.test(str)
            ? pass(str)
            : fail(str, 'string/digits');
    }

    static domain(str, options = StringProcessors.matchingDefaults) {
        const {
            wildcards = forbidden,
            subdomains = optional,
            normalize,
        } = options;

        const regexResult = RegexCache([
            `^`, (
                // Start with *. if allowed/required
                wildcards === optional && '(?:\\*\\.)?'
                || wildcards === required && '(?:\\*\\.)' || ''
            ),
            `(?=(`,
            // [a-z0-9-] up to 63 chars, can't start or end w/ dash
            `(?:[a-z\\d](?:[-a-z\\d]{0,61}[a-z\\d])?\\.)`, (
                subdomains === optional
                && '+' || subdomains === required
                && '{2,}' || '' // Subdomains or not
            ),
            `))\\1`,
            `(?!\\d+$)`, // TLD cannot be all digits
            `(?:[a-z\\d][-a-z\\d]{0,22}[a-z\\d])`, // TLD up to 24 chars
            `$`,
        ].join(''), 'i').test(str);

        return regexResult
            ? pass(normalize ? StringUtils.toLowerCase(str) : str)
            : fail(str, 'string/domain', options);
    }

    static e164(str, options = {}) {

        const finalOptions = Object.assign({
            delim: ' ',
        }, options);

        const {
            allowLooseFormat,
            allowedDelims,
            delim,
            normalize,
        } = Object.assign({}, StringProcessors.matchingDefaults, finalOptions);

        const matchData = StringUtils.getMatchData(
            str,
            new RegExp('^\\+[1-9](?:' + StringUtils.escapeForRegex(delim) + '?\\d){6,14}$'),
            {
                delim,
                allowedDelims,
                allowLooseFormat
            }
        );

        if (!matchData) {
            return fail(str, 'string/e164', finalOptions);
        }

        return pass(
            normalize
                ? StringUtils.replaceDelims(
                    str,
                    allowedDelims + delim,
                    delim
                )
                : str
        );
    }

    static email(str, options = StringProcessors.matchingDefaults) {
        const {
            normalize,
        } = options;
        const parts = str.split('@');

        // Make sure there are two parts and the domain passes
        if (parts.length !== 2 || this.prototype.domain(parts[1]).fail) {
            return fail(str, 'string/email', options);
        }

        const noDot = "[a-zA-Z0-9!#$%&'*+\\-/=?^_`{|}~]";
        const dot = "[a-zA-Z0-9!#$%&'*+\\-/=?^_`{|}~.]";
        const fullRegex = `^(?=(${noDot}+))\\1(?=(${dot}*${noDot}+)?)\\2$`;
        return RegexCache(fullRegex).test(parts[0])
            ? pass(normalize ? StringUtils.toLowerCase(str) : str)
            : fail(str, 'string/email', options);
    }

    static empty(value) {
        return value.length === 0 ? pass(value) : fail(value, 'string/empty');
    }

    static gtin(str, options = {}) {
        const finalOptions = Object.assign({
            delim: '',
            lengths: [8, 12, 13, 14]
        }, options);

        const {
            lengths,
            allowLooseFormat,
            allowedDelims,
            delim,
            normalize,
        } = Object.assign({}, StringProcessors.matchingDefaults, finalOptions);

        const patterns = [];
        if (lengths.indexOf(8) > -1) {
            patterns.push(['\\d{4}', '\\d{4}']);
        }
        if (lengths.indexOf(12) > -1) {
            patterns.push(['\\d', '\\d{5}', '\\d{5}', '\\d']);
        }
        if (lengths.indexOf(13) > -1) {
            patterns.push(['\\d', '\\d{6}', '\\d{6}']);
        }
        if (lengths.indexOf(14) > -1) {
            patterns.push(['\\d', '\\d{6}', '\\d{6}', '\\d']);
        }

        for (const regex of patterns) {
            const matchData = StringUtils.getMatchData(
                str,
                regex,
                {
                    delim,
                    allowedDelims,
                    allowLooseFormat
                }
            );

            if (matchData) {
                const [bareStr, ...parts] = matchData;
                if (!StringUtils.validateWithCheckDigit(bareStr, { weights: [3, 1], reverse: true })) {
                    return fail(str, 'string/gtin', finalOptions);
                }
                return pass(
                    normalize
                        ? parts.join(delim)
                        : str
                );
            }
        }

        return fail(str, 'string/gtin', finalOptions);
    }

    static hash(str, algorithm) {
        const algo = (algorithm || 'md5').toLowerCase();
        const hashLengths = {
            md5: 32, sha1: 40, sha256: 64, sha512: 128, ripemd: 32,
            ripemd128: 32, ripemd160: 40, ripemd320: 80, tiger128: 32,
            tiger160: 40, tiger192: 48, whirlpool: 128
        };
        return hashLengths[algo]
            ? RegexCache(`^(?=([a-f\\d]{${hashLengths[algo]}}))\\1$`, 'i').test(str)
                ? pass(str)
                : fail(str, 'string/hash', { algorithm })
            : fail(str, 'string/hash', { algorithm });
    }

    static hex(str, options = StringProcessors.matchingDefaults) {
        const { normalize } = options;
        return /^[0-9A-F]+$/i.test(str)
            ? pass(normalize ? StringUtils.toLowerCase(str) : str)
            : fail(str, 'string/hex', options);
    }

    static hexColor(str, options = StringProcessors.matchingDefaults) {
        const { normalize } = options;
        return /^#?([0-9A-F]{3}|[0-9A-F]{6})$/i.test(str)
            ? pass(normalize ? StringUtils.toLowerCase(str) : str)
            : fail(str, 'string/hexColor', options);
    }

    static imei(str, options = {}) {
        const finalOptions = Object.assign({
            delim: '-',
        }, options);

        const {
            allowLooseFormat,
            allowedDelims,
            delim,
            normalize,
        } = Object.assign({}, StringProcessors.matchingDefaults, finalOptions);

        const matchData = StringUtils.getMatchData(
            str,
            ['\\d{2}', '\\d{6}', '\\d{6}', '\\d'],
            {
                delim,
                allowedDelims,
                allowLooseFormat
            }
        );

        if (!matchData) {
            return fail(str, 'string/imei', finalOptions);
        }

        const [bareStr, ...parts] = matchData;

        if (this.prototype.luhn(bareStr).pass) {
            return pass(
                normalize
                    ? parts.join(delim)
                    : str
            );
        }
        return fail(str, 'string/imei', finalOptions);
    }

    static ip(str, options = StringProcessors.matchingDefaults) {
        const { normalize } = options;

        const ipV4Test = this.ipV4(str);
        if (ipV4Test.pass) {
            return pass(normalize ? StringUtils.toLowerCase(str) : str);
        }

        const ipV6Test = this.ipV6(str);
        if (ipV6Test.pass) {
            return pass(normalize ? StringUtils.toLowerCase(str) : str);
        }

        return fail(str, 'string/ip', options);
    }

    static ipCidr(str) {
        return this.prototype.ipCidrV4(str).pass || this.prototype.ipCidrV6(str).pass
            ? pass(str)
            : fail(str, 'string/ipCidr');
    }

    static ipCidrV4(str) {
        const parts = str.split('/');
        if (parts.length !== 2) {
            return fail(str, 'string/ipCidrV4');
        }
        const num = NumberUtils.toNumber(parts[1]);
        return num !== null && this.prototype.ipV4(parts[0]).pass && NumberProcessors.between(num, 0, 32).pass
            ? pass(str)
            : fail(str, 'string/ipCidrV4');
    }

    static ipCidrV6(str) {
        const parts = str.split('/');
        if (parts.length !== 2) {
            return fail(str, 'string/ipCidrV6');
        }
        const num = NumberUtils.toNumber(parts[1]);
        return num !== null && this.prototype.ipV6(parts[0]).pass && NumberProcessors.between(num, 0, 128).pass
            ? pass(str)
            : fail(str, 'string/ipCidrV6');
    }

    static ipV4(str, options = StringProcessors.matchingDefaults) {
        const { normalize } = options;
        const digits = '(\\d|[1-9]\\d|1\\d{2}|2[0-4]\\d|25[0-5])';
        return RegexCache(`^${digits}\\.${digits}\\.${digits}\\.${digits}$`).test(str)
            ? pass(normalize ? StringUtils.toLowerCase(str) : str)
            : fail(str, 'string/ipV4', options);
    }

    static ipV6(str, options = StringProcessors.matchingDefaults) {
        const { normalize } = options;
        const digits = '(?:\\d|[1-9]\\d|1\\d{2}|2[0-4]\\d|25[0-5])';
        const v4 = `${digits}\\.${digits}\\.${digits}\\.${digits}`;
        const hex = '[0-9a-f]{1,4}';
        const condensed = `(?=.*?::)(?!.*?::.*?::)`;
        const v6 = [
            `^(?:(?:${hex}:){7}${hex})$`, // standard: 1111:2222:3333:4444:5555:6666:7777:8888
            `^(?:::|${condensed}(?:::)?(?:${hex}::?){0,6}${hex}(?:::)?)$`, // condensed: 1111::3333, ::, a:b:c:d::, fe80::1
            `^(?:(?:[a-f0-9]{1,4}:){6}${v4})$`, // dual v4: 1:2:3:4:5:6:127.0.0.1
            `^(?:${condensed}(?:::)?(?:${hex}::?){0,5}${v4})$`, // dual v4 condensed: ::1.2.3.4, a:b::127.0.0.1
        ].join('|');

        return RegexCache(v6, 'i').test(str)
            ? pass(normalize ? StringUtils.toLowerCase(str) : str)
            : fail(str, 'string/ipV6', options);
    }

    static json(str) {
        try { JSON.parse(str); } catch (e) { return fail(str, 'string/json'); }
        return pass(str);
    }

    static jwt(str) {
        return /^(?=((?:[a-z\d_=-]+\.){2}[a-z\d_=-]+))\1$/i.test(str)
            ? pass(str)
            : fail(str, 'string/jwt');
    }

    static label(str, options = StringProcessors.matchingDefaults) {
        const {
            normalize,
        } = options;

        if (
            !this.prototype.lengthBetween(str, 1, 63).pass
            || str.startsWith('-')
            || str.endsWith('-')
        ) {
            return fail(str, 'string/label', options);
        }

        return /^(?=([a-z0-9\-]+))\1$/i.test(str)
            ? pass(normalize ? StringUtils.toLowerCase(str) : str)
            : fail(str, 'string/label', options);
    }

    static lowerCase(str) {
        return str === StringUtils.toLowerCase(str)
            ? pass(str)
            : fail(str, 'string/lowerCase');
    }

    static luhn(str) {
        return StringUtils.validateLuhn(str)
            ? pass(str)
            : fail(str, 'string/luhn');
    }

    static mac(str, options = {}) {
        const finalOptions = Object.assign({
            delim: ':',
        }, options);

        const {
            allowLooseFormat,
            allowedDelims,
            delim,
            normalize,
        } = Object.assign({}, StringProcessors.matchingDefaults, finalOptions);

        const matchData = StringUtils.getMatchData(
            str,
            new Array(6).fill('[a-f\\d]{2}'),
            {
                delim,
                allowedDelims,
                allowLooseFormat
            }
        );

        if (!matchData) {
            return fail(str, 'string/mac', finalOptions);
        }

        return pass(
            normalize
                ? matchData.slice(1).join(delim)
                : str
        );
    }

    static measurement(str, options = {}) {
        const {
            units
        } = options;
        const mergedOptions = Object.assign({
            trailingSymbol: units || 'cm'
        }, options);
        const result = this.prototype.numeric(str, mergedOptions);
        return result.pass
            ? pass(result.value)
            : fail(str, 'string/measurement', options);

    }

    static money(str, options = {}) {
        const {
            parens = forbidden,
            leadingSymbol = '$',
            trailingSymbol = '',
        } = options;

        if (parens !== required) {
            const mergedOptions = Object.assign({}, options, {
                leadingSymbol,
                trailingSymbol
            });
            const result = this.prototype.numeric(str, mergedOptions);
            if (result.pass) {
                return pass(result.value);
            }
            else if (parens === forbidden) {
                return fail(str, 'string/money', options);
            }
        }

        const mergedOptions = Object.assign({}, options, {
            leadingSymbol: '(' + leadingSymbol,
            trailingSymbol: trailingSymbol + ')'
        });
        const result = this.prototype.numeric(str, mergedOptions);
        return result.pass
            ? pass(result.value)
            : fail(str, 'string/money', options);
    }

    static notEmpty(value) {
        return value.length > 0 ? pass(value) : fail(value, 'string/notEmpty');
    }

    static numeric(str, options = {}) {
        const {
            plus = forbidden,
            minus = optional,
            leftAlign = true,
            min,
            max,
            decimal = optional,
            thousandsDelim = ',',
            decimalDelim = '.',
            minPrecision = 0,
            maxPrecision,
            leadingZero = optional,
            trailingZero = optional,
            leadingSymbol = '',
            trailingSymbol = '',
            ignoreCase,
            allowLooseFormat
        } = Object.assign({}, StringProcessors.matchingDefaults, options);

        const leadingSymbolArr = [].concat(leadingSymbol);
        const trailingSymbolArr = [].concat(trailingSymbol);
        const looseSpacing = allowLooseFormat ? '\\s*' : '';
        const parts = RegexCache(
            '^(\\+?)(-?)'
            + looseSpacing
            + `(?:${leadingSymbolArr.map(StringUtils.escapeForRegex).join('|')})`
            + looseSpacing
            + '(.+?)'
            + looseSpacing
            + `(?:${trailingSymbolArr.map(StringUtils.escapeForRegex).join('|')})`
            + looseSpacing
            + '(\\+?)(-?)$'
            , ignoreCase ? 'i' : '')
            .exec(str);
        if (!parts) {
            return fail(str, 'string/numeric', options);
        }

        const [, leftPlus, leftMinus, number, rightPlus, rightMinus] = parts;
        const [plusStr, minusStr] = leftAlign ? [leftPlus, leftMinus] : [rightPlus, rightMinus];

        // Sign checks
        if ((leftAlign && (rightPlus || rightMinus)) || (!leftAlign && (leftPlus || leftMinus))) {
            return fail(str, 'string/numeric', options);
        }
        if (plus === required && !plusStr) {
            return fail(str, 'string/numeric', options);
        }
        if (plus === forbidden && plusStr) {
            return fail(str, 'string/numeric', options);
        }
        if (minus === required && !minusStr) {
            return fail(str, 'string/numeric', options);
        }
        if (minus === forbidden && minusStr) {
            return fail(str, 'string/numeric', options);
        }

        const [integral = '', fractional = ''] = number.split(decimalDelim, 2);
        if (decimal === forbidden && fractional !== '' || decimal === required && fractional === '') {
            return fail(str, 'string/numeric', options);
        }

        let integralRegex = thousandsDelim
            ? `^(|0|[1-9]\\d{0,2}(?:${StringUtils.escapeForRegex(thousandsDelim)}\\d{3})*)$`
            : '^(\\d*)$';
        const integralMatch = RegexCache(integralRegex).exec(integral);

        if (!integralMatch) {
            return fail(str, 'string/numeric', options);
        }

        // Leading/trailing 0 check
        if (leadingZero === required && integral === '') {
            return fail(str, 'string/numeric', options);
        }
        if (leadingZero === forbidden && integral === '0') {
            return fail(str, 'string/numeric', options);
        }

        const fractionalMatch = RegexCache(`^(\\d{${minPrecision || 0},${isNaN(maxPrecision) ? '' : maxPrecision}})$`).exec(fractional);
        if (!fractionalMatch) {
            return fail(str, 'string/numeric', options);
        }

        if (trailingZero === required && fractional === '') {
            return fail(str, 'string/numeric', options);
        }
        if (trailingZero === forbidden && fractional === '0') {
            return fail(str, 'string/numeric', options);
        }

        const integralNumPlain = integral.replace(new RegExp(StringUtils.escapeForRegex(thousandsDelim), 'g'), '');
        const fullNumber = Number(
            plusStr
            + minusStr
            + (integralNumPlain || '0') + '.' + (fractional || '0')
        );

        if (min !== undefined || max !== undefined) {
            if (isNaN(fullNumber)) {
                return fail(str, 'string/numeric', options);
            }
            if (min !== undefined && fullNumber < min) {
                return fail(str, 'string/numeric', options);
            }
            if (max !== undefined && fullNumber > max) {
                return fail(str, 'string/numeric', options);
            }
        }

        return pass(leftPlus + leftMinus + leadingSymbol + number + trailingSymbol + rightPlus + rightMinus);
    }

    static octal(str) {
        return /^[0-7]+$/.test(str)
            ? pass(str)
            : fail(str, 'string/octal');
    }

    static path(str, options = StringProcessors.matchingDefaults) {
        const {
            style = 'unix',
            fileExtensions = '',
            maxLabelLength = 100,
            normalize
        } = options;

        let startRegex = '', forbidden, dir;
        const fileExtensionsArray = [].concat(fileExtensions);

        if (style === 'unix') {
            dir = '\\/';
            forbidden = '/\\x00';
        }
        else {
            dir = '\\\\';
            forbidden = '\\x00-\\x1F\\\\/:*?"<>|';
            if (style === 'win-unc') {
                startRegex = '\\\\\\\\[a-z0-9 %._~-]{1,63}\\\\[a-z0-9 $%._~-]{1,80}';
            }
            else if (style === 'win-drive') {
                startRegex = '[a-z]:';
            }
        }

        const fullRegex = [
            '^(',
            '?=(',
            startRegex,
            `(?:${dir}[^/${forbidden}]{0,${maxLabelLength}}[^${forbidden}\\s.])*`,
            (
                // Force any file
                fileExtensionsArray[0] === '.*' && '\\.[a-z]{1,15}' ||
                // Any file/directory
                (fileExtensionsArray[0] === '' || fileExtensionsArray.length === 0) && `${dir}?` ||
                // Force specific file ext
                '\\.(' + fileExtensionsArray.map(ext => StringUtils.escapeForRegex(ext)).join('|') + ')'
            ),
            '))\\1',
            '$',
        ].join('');

        return RegexCache(fullRegex, 'i').test(str)
            ? pass(normalize ? StringUtils.toLowerCase(str) : str)
            : fail(str, 'string/path', options)
    }

    static phone(str, options = {}) {
        const finalOptions = Object.assign({
            delim: '-',
        }, options);

        const {
            allowLooseFormat,
            allowedDelims,
            delim,
            normalize,
        } = Object.assign({}, StringProcessors.matchingDefaults, finalOptions);

        const matchData = StringUtils.getMatchData(
            str,
            ['(?:\\+?1)?', '(?:\\d{3}|\\(\\d{3}\\))', '\\d{3}', '\\d{4}'],
            {
                delim,
                allowedDelims,
                allowLooseFormat
            }
        );

        if (!matchData) {
            return fail(str, 'string/phone', finalOptions);
        }

        const [, , part1, part2, part3] = matchData;

        return pass(
            normalize
                ? part1 + delim + part2 + delim + part3
                : str
        );
    }

    static slug(str) {
        return /^(?=([a-z\d]+(-[a-z\d]+)*))\1$/.test(str)
            ? pass(str)
            : fail(str, 'string/slug');
    }

    static ssn(str, options = {}) {
        const finalOptions = Object.assign({
            delim: '-',
        }, options);

        const {
            allowLooseFormat,
            allowedDelims,
            delim,
            normalize,
        } = Object.assign({}, StringProcessors.matchingDefaults, finalOptions);

        const matchData = StringUtils.getMatchData(
            str,
            ['(?!000|666|9\\d{2})\\d{3}', '(?!00)\\d{2}', '(?!0000)\\d{4}'],
            {
                delim,
                allowedDelims,
                allowLooseFormat
            }
        );

        if (!matchData) {
            return fail(str, 'string/ssn', finalOptions);
        }

        const [, part1, part2, part3] = matchData;

        return pass(
            normalize
                ? part1 + delim + part2 + delim + part3
                : str
        );
    }

    static state(str, options = {}) {
        const {
            allowLooseFormat,
        } = Object.assign({}, StringProcessors.matchingDefaults, options);

        const states = [
            'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'DC', 'FL',
            'GA', 'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME',
            'MD', 'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH',
            'NJ', 'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI',
            'SC', 'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
        ];

        const search = allowLooseFormat ? str.toUpperCase() : str;
        return states.indexOf(search) > -1
            ? pass(search)
            : fail(str, 'string/state', options);
    }

    static upperCase(str) {
        return str === StringUtils.toUpperCase(str)
            ? pass(str)
            : fail(str, 'string/upperCase');
    }

    static url(str, options = StringProcessors.matchingDefaults) {
        let {
            normalize,
            rootRelative = false,
            allowedProtocols = ['http', 'https'],
            protocols = optional,
            domain = optional,
            ip = optional,
            label = forbidden,
            port = forbidden,
            query = optional,
            fragment = optional
        } = options;

        if (rootRelative) {
            domain = ip = label = protocols = port = forbidden; // force root relative option
        }

        const fullRegex = [
            `^`,
            `(?=(([a-z+.-]{2,20}):\\/\\/)?)\\1`, // 1=protocol
            `(?=(?:`,
            `([^\\[\\]/?#:]+)`, // domain or label or ipv4
            `|`,
            `(?:(?:(\\[)([^\\[\\]/?#]+)(\\])))`, // ipv6
            `)?)`,
            `\\3\\4\\5\\6`, // 3=ip/domain/host, 4=[, 5=ipv6, 6=]
            `(?::([0-9]{1,5}))?`,                                                   // port
            `(?=((?:\\/(?:[a-z0-9._~!$&'()*+,;=:@-]|(?:%[a-f0-9]{2}))+)*\\/?))\\8`, // path 
            `(?=(\\?(?:[a-z0-9._~!$&'()*+,;=:@?/-]|(?:%[a-f0-9]{2}))*)?)\\9`,       // query
            `(?=(#.*)?)\\10`, // fragment
            `$`
        ].join('');
        const matchResult = RegexCache(fullRegex, 'i').exec(str);

        if (!matchResult) {
            return fail(str, 'string/url', options);
        }

        // Pull matches from regex
        const [
            , , protocolValue = '', hostValue = '', , ipv6Value = '', , portValue = '', , queryValue = '', fragmentValue = ''
        ] = matchResult;

        const portValueNum =  NumberUtils.toNumber(portValue);

        const
            hasProto = protocolValue.length > 0,
            goodProto = hasProto && allowedProtocols.indexOf(protocolValue) > -1,

            isIp = this.prototype.ipV4(hostValue).pass || this.prototype.ipV6(ipv6Value).pass,
            isDomain = this.prototype.domain(hostValue).pass,
            isLabel = this.prototype.label(hostValue).pass,

            hasPort = portValue.length > 0,
            goodPort = hasPort &&
                portValueNum !== null
                && NumberProcessors.integer(portValueNum).pass
                && NumberProcessors.between(portValueNum, 1, 65535).pass,

            hasFrag = fragmentValue.length > 0,
            hasQuery = queryValue.length > 0,

            goodAddress = (isIp || isDomain || isLabel) && (!hasProto || goodProto) && (!hasPort || goodPort);


        return (
            // If there is no address, are we looking for a root relative url?
            ((!goodAddress && rootRelative) || goodAddress) &&

            // Check for ip, domain, label and whether result matches what is needed
            (ip === forbidden && !isIp || ip === required && isIp || ip === optional) &&
            (domain === forbidden && !isDomain || domain === required && isDomain || domain === optional) &&
            (label === forbidden && !isLabel || label === required && isLabel || label === optional) &&

            // Check protocol and port portions
            (protocols === forbidden && !hasProto || protocols === required && goodProto || protocols === optional &&
                (!hasProto || goodProto)) &&
            (port === forbidden && !hasPort || port === required && goodPort || port === optional && (!hasPort || goodPort)) &&

            // Check query and fragment portions
            (query === forbidden && !hasQuery || query === required && hasQuery || query === optional) &&
            (fragment === forbidden && !hasFrag || fragment === required && hasFrag || fragment === optional)
        )
            ? pass(normalize ? StringUtils.toLowerCase(str) : str)
            : fail(str, 'string/url', options);
    }

    static uuid(str, version) {
        return RegexCache([
            '^(?=([a-f\\d]{8}-[a-f\\d]{4}-[',
            !version ? '12345' : version,
            '][a-f\\d]{3}-[89AB][a-f\\d]{3}-[a-f\\d]{12}))\\1$'
        ].join(''), 'i').test(str)
            ? pass(str)
            : fail(str, 'string/uuid', { version });
    }

    static zip(str, options = {}) {
        const finalOptions = Object.assign({
            delim: '',
            zip4: optional
        }, options);

        const {
            allowLooseFormat,
            allowedDelims,
            delim,
            normalize,
            zip4
        } = Object.assign({}, StringProcessors.matchingDefaults, finalOptions);


        // 00 through 12, 21 through 32, 61 through 72, or 80
        const matchData = StringUtils.getMatchData(
            str,
            ['(?!0{5})\\d{5}', '(?!0{4})(?:\\d{4})?'],
            {
                delim,
                allowedDelims,
                allowLooseFormat
            }
        );

        if (!matchData) {
            return fail(str, 'string/zip', finalOptions);
        }

        const [, zip, zip4Str = ''] = matchData;

        if (zip4 === required && !zip4Str) {
            return fail(str, 'string/zip', options);
        }
        if (zip4 === forbidden && zip4Str) {
            return fail(str, 'string/zip', options);
        }

        return pass(
            normalize
                ? zip + delim + zip4Str
                : str
        );
    }

    static matches(str, regex) {
        return regex.test(str)
            ? pass(str)
            : fail(str, 'string/matches', { regex: regex.toString() });
    }

    static complex(str, options = {}) {
        const {
            minLen = 8,
            maxLen = 100,
            minLowercase = 1,
            minUppercase = 1,
            minDigits = 1,
            minSpecialChars = 1,
            maxRepeats = 2
        } = options

        let len = str.length, lower = 0, upper = 0, digits = 0, specials = 0;
        if (len < minLen || len > maxLen) {
            return fail(str, 'string/complex', { minLen, maxLen });
        }

        (str.match(/[A-Z]/g) || []).forEach(_ => ++upper); // count uppercase letters
        if (upper < minUppercase) {
            return fail(str, 'string/complex', { minUppercase });
        }
        (str.match(/[a-z]/g) || []).forEach(_ => ++lower); // count lowercase letters
        if (lower < minLowercase) {
            return fail(str, 'string/complex', { minLowercase });
        }
        (str.match(/\d/g) || []).forEach(_ => ++digits);   // count digits
        if (digits < minDigits) {
            return fail(str, 'string/complex', { minDigits });
        }
        (str.match(/[^a-z0-9]/ig) || []).forEach(_ => ++specials); // count specials
        if (specials < minSpecialChars) {
            return fail(str, 'string/complex', { minSpecialChars });
        }
        const failsRepeat = RegexCache('(.)\\1{' + maxRepeats + '}', 'g').test(str); // check repetition
        if (failsRepeat) {
            return fail(str, 'string/complex', { maxRepeats });
        }

        return pass(str);
    }

    static normalizeLineBreaks(str, lineBreak = '\n') {
        return pass(str.replace(/\r\n|\r|\n/g, lineBreak));
    }

    static normalizeUnicode(str, type = 'NFC') {
        return pass(str.normalize(type));
    }

    static padLeft(str, length, char) {
        return pass(StringUtils.padLeft(str, length, char));
    }

    static padRight(str, length, char) {
        return pass(StringUtils.padRight(str, length, char));
    }

    static removeSpacing(str) {
        return pass(str.replace(/\s/g, ''));
    }

    static slice(str, startIndex, endIndex) {
        return pass(str.slice(startIndex, endIndex));
    }

    static sliceFirst(str, count = 1) {
        return pass(str.slice(0, count));
    }

    static sliceLast(str, count = 1) {
        return pass(str.slice(-count));
    }

    static startsWith(str, prefix, options = StringProcessors.matchingDefaults) {
        const { ignoreCase } = options;

        if (ignoreCase) {
            str = StringUtils.toLowerCase(str);
            prefix = StringUtils.toLowerCase(prefix);
        }
        return str.startsWith(prefix)
            ? pass(str)
            : fail(str, 'string/startsWith', Object.assign({ prefix }, options));
    }

    static stripHtml(str) {
        return pass(str.replace(/<[^>]*>/g, ''));
    }

    static toCamelCase(str, allowedDelims = StringProcessors.matchingDefaults.allowedDelims) {
        return this.prototype.toDelimited(str, {
            allowedDelims,
            delim: '',
            transformer1: word => StringUtils.toLowerCase(word),
            transformer2: word => StringUtils.toUpperCase(word[0]) + StringUtils.toLowerCase(word.slice(1))
        });
    }

    static toDelimited(str, options = {}) {
        const finalOptions = Object.assign({
            delim: '-',
            transformer: x => x,
            switchIndex: 1
        }, options);

        const {
            allowedDelims,
            delim,
            transformer,
            transformer1,
            transformer2,
            switchIndex
        } = Object.assign({}, StringProcessors.matchingDefaults, finalOptions);

        return pass(
            StringUtils.splitOnDelims(str, allowedDelims)
                .reduce((acc, current, index) => {
                    if (!transformer1) {
                        acc.push(transformer(current));
                    }
                    else {
                        acc.push(
                            index < switchIndex ? transformer1(current) : transformer2(current)
                        );
                    }
                    return acc;
                }, [])
                .join(delim)
        );
    }

    static toKebabCase(str, allowedDelims = StringProcessors.matchingDefaults.allowedDelims) {
        return this.prototype.toDelimited(str, {
            allowedDelims,
            delim: '-',
            transformer: word => StringUtils.toLowerCase(word)
        });
    }

    static toLowerCase(str) {
        return pass(StringUtils.toLowerCase(str));
    }

    static toPascalCase(str, allowedDelims = StringProcessors.matchingDefaults.allowedDelims) {
        return this.prototype.toDelimited(str, {
            allowedDelims,
            delim: '',
            transformer: word => StringUtils.toUpperCase(word[0]) + StringUtils.toLowerCase(word.slice(1))
        });
    }

    static toSentenceCase(str, allowedDelims = StringProcessors.matchingDefaults.allowedDelims) {
        return this.prototype.toDelimited(str, {
            allowedDelims,
            delim: ' ',
            transformer1: word => StringUtils.toUpperCase(word[0]) + StringUtils.toLowerCase(word.slice(1)),
            transformer2: word => StringUtils.toLowerCase(word)
        });
    }

    static toSnakeCase(str, allowedDelims = StringProcessors.matchingDefaults.allowedDelims) {
        return this.prototype.toDelimited(str, {
            allowedDelims,
            delim: '_',
            transformer: word => StringUtils.toLowerCase(word)
        });
    }

    static toTitleCase(str, allowedDelims = StringProcessors.matchingDefaults.allowedDelims) {
        return this.prototype.toDelimited(str, {
            allowedDelims,
            delim: ' ',
            transformer: word => StringUtils.toUpperCase(word[0]) + StringUtils.toLowerCase(word.slice(1))
        });
    }

    static toUpperCase(str) {
        return pass(StringUtils.toUpperCase(str));
    }

    static trim(str, chars) {
        return pass(StringUtils.trim(str, chars));
    }

    static trimLeft(str, chars) {
        return pass(StringUtils.trimLeft(str, chars));
    }

    static trimRight(str, chars) {
        return pass(StringUtils.trimRight(str, chars));
    }

    static urlDecode(str) {
        return pass(decodeURIComponent(str));
    }

    static urlEncode(str) {
        return pass(encodeURIComponent(str));
    }

}

StringProcessors.matchingDefaults = {
    allowedDelims: ' -._',
    allowLooseFormat: true,
    ignoreCase: false,
    normalize: true,
    delim: '-'
}


export default  StringProcessors;