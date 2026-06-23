'use strict';

import { GlobalConfig } from '../../GlobalConfig.ts';
import { Presence } from '../../Presence.ts';
import { RegexCache } from '../../RegexCache.ts';
import { Utils } from '../../Utils.ts';
import { ChainHandler } from '../ChainHandler.ts';
import { ChainHandlerResult } from '../ChainHandlerResult.ts';
import { NumberHandler } from '../number/NumberHandler.ts';
const { pass, fail } = ChainHandlerResult;
const { optional, required, forbidden } = Presence;

export type StringMatchingDefaults = GlobalConfig['string']['matching'];

class StringHandler extends ChainHandler {

    public matchingDefaults!: StringMatchingDefaults;

    protected _matchingDefaults: StringMatchingDefaults | undefined;

    public configMatchingDefaults(matchingDefaults: StringMatchingDefaults): void {
        this._matchingDefaults = matchingDefaults;
    }

    // ====================================
    // VALIDATORS
    // ====================================

    /**
     * Executes the alpha handler step.
     * @param {any} str
     * @returns {ChainHandlerResult}
     */
    public alpha(str: string): ChainHandlerResult {
        return /^[A-Z]+$/i.test(str)
            ? pass(str)
            : fail(str, 'string/alpha');
    }

    /**
     * Executes the alphanumeric handler step.
     * @param {any} str
     * @returns {ChainHandlerResult}
     */
    public alphanumeric(str: string): ChainHandlerResult {
        return /^[A-Z0-9]+$/i.test(str)
            ? pass(str)
            : fail(str, 'string/alphanumeric');
    }

    /**
     * Executes the ascii handler step.
     * @param {any} str
     * @returns {ChainHandlerResult}
     */
    public ascii(str: string): ChainHandlerResult {
        return /^[\x00-\x7F]*$/.test(str)
            ? pass(str)
            : fail(str, 'string/ascii');
    }

    /**
     * Executes the balanced handler step.
     * @param {any} str
     * @param {any} openChar
     * @param {any} closeChar
     * @returns {ChainHandlerResult}
     */
    public balanced(str: string, openChar: string = '(', closeChar: string = ')'): ChainHandlerResult {
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
                return fail(str, 'string/balanced/negative', {
                    openChar,
                    closeChar,
                    index,
                    openCount
                });
            }
        }
        return openCount === 0
            ? pass(str)
            : fail(str, 'string/balanced/positive', {
                openChar,
                closeChar,
                openCount
            });
    }

    /**
     * Executes the base64 handler step.
     * @param {any} str
     * @returns {ChainHandlerResult}
     */
    public base64(str: string): ChainHandlerResult {
        return /^[A-Za-z0-9+/]+={0,2}$/.test(str) && str.length % 4 === 0
            ? pass(str)
            : fail(str, 'string/base64');
    }

    /**
     * Executes the base64Decode handler step.
     * @param {any} str
     * @returns {ChainHandlerResult}
     */
    public base64Decode(str: string): ChainHandlerResult {
        if (typeof Buffer !== 'undefined') {
            return pass(Buffer.from(str, 'base64').toString('utf8'));
        }
        else if (typeof atob !== 'undefined') {
            return pass(decodeURIComponent(escape(atob(str))));
        }
        return fail(str, 'string/base64Decode');
    }

    /**
     * Executes the base64Encode handler step.
     * @param {any} str
     * @returns {ChainHandlerResult}
     */
    public base64Encode(str: string): ChainHandlerResult {
        if (typeof Buffer !== 'undefined') {
            return pass(Buffer.from(str, 'utf8').toString('base64'));
        }
        else if (typeof btoa !== 'undefined') {
            return pass(btoa(unescape(encodeURIComponent(str))));
        }
        return fail(str, 'string/base64Encode');
    }

    /**
     * Executes the binary handler step.
     * @param {any} str
     * @returns {ChainHandlerResult}
     */
    public binary(str: string): ChainHandlerResult {
        return /^[01]+$/.test(str)
            ? pass(str)
            : fail(str, 'string/binary');
    }

    /**
     * Executes the bmp handler step.
     * @param {any} str
     * @returns {ChainHandlerResult}
     */
    public bmp(str: string): ChainHandlerResult {
        return /^[\u0000-\uFFFF]*$/u.test(str)
            ? pass(str)
            : fail(str, 'string/bmp');
    }

    /**
     * Executes the complex handler step.
     * @param {any} str
     * @param {any} options
     * @returns {ChainHandlerResult}
     */
    public complex(str: string, options: Record<string, unknown> = {}): ChainHandlerResult {
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
            return fail(str, 'string/complex/length', { minLen, maxLen });
        }

        (str.match(/[A-Z]/g) || []).forEach((_: string): void => { ++upper; }); // count uppercase letters
        if (upper < minUppercase) {
            return fail(str, 'string/complex/uppercase', { minUppercase });
        }
        (str.match(/[a-z]/g) || []).forEach((_: string): void => { ++lower; }); // count lowercase letters
        if (lower < minLowercase) {
            return fail(str, 'string/complex/lowercase', { minLowercase });
        }
        (str.match(/\d/g) || []).forEach((_: string): void => { ++digits; });   // count digits
        if (digits < minDigits) {
            return fail(str, 'string/complex/digits', { minDigits });
        }
        (str.match(/[^a-z0-9]/ig) || []).forEach((_: string): void => { ++specials; }); // count specials
        if (specials < minSpecialChars) {
            return fail(str, 'string/complex/specialChars', { minSpecialChars });
        }
        const failsRepeat = RegexCache.get('(.)\\1{' + maxRepeats + '}', 'g').test(str); // check repetition
        if (failsRepeat) {
            return fail(str, 'string/complex/repeats', { maxRepeats });
        }

        return pass(str);
    }

    /**
     * Executes the contains handler step.
     * @param {any} str
     * @param {any} substring
     * @param {any} options
     * @returns {ChainHandlerResult}
     */
    public contains(str: string, substring: string, options: Record<string, unknown> = StringHandler.matchingDefaults): ChainHandlerResult {
        const { ignoreCase } = options;

        if (ignoreCase) {
            str = str.toLowerCase();
            substring = substring.toLowerCase();
        }

        return str.indexOf(substring) !== -1
            ? pass(str)
            : fail(str, 'string/contains', Object.assign({ substring }, options));
    }

    /**
     * Executes the creditCard handler step.
     * @param {any} str
     * @param {any} options
     * @returns {ChainHandlerResult}
     */
    public creditCard(str: string, options: Record<string, unknown> = {}): ChainHandlerResult {
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
        } = Object.assign({}, StringHandler.matchingDefaults, finalOptions);

        const cards = ([
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

        ] as Array<[string, string[], boolean]>).filter(
            (card): boolean => types === null
                ? true
                : types.indexOf(card[0]) > -1
        );

        for (const [, regex, checkLuhn] of cards) {
            const matchData = Utils.regexMatch(
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
                if (checkLuhn && !this.luhn(bareStr).pass) {
                    return fail(str, 'string/creditCard', finalOptions);
                }

                return pass(
                    normalize
                        // Might have a trailing delim for some cc's so remove it
                        ? parts.join(delim).replace(RegexCache(`^[${delim}]+|[${delim}]+$`, 'g'), '')
                        : str
                );
            }
        }
        return fail(str, 'string/creditCard', finalOptions);
    }

    /**
     * Executes the currencyCode handler step.
     * @param {any} str
     * @param {any} options
     * @returns {ChainHandlerResult}
     */
    public currencyCode(str: string, options: Record<string, unknown> = {}): ChainHandlerResult {
        const {
            allowLooseFormat,
        } = Object.assign({}, StringHandler.matchingDefaults, options);

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

    /**
     * Executes the dataUrl handler step.
     * @param {any} str
     * @param {any} options
     * @returns {ChainHandlerResult}
     */
    public dataUrl(str: string, options: Record<string, unknown> = {}): ChainHandlerResult {
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

    /**
     * Executes the digits handler step.
     * @param {any} str
     * @returns {ChainHandlerResult}
     */
    public digits(str: string): ChainHandlerResult {
        return /^\d+$/.test(str)
            ? pass(str)
            : fail(str, 'string/digits');
    }

    /**
     * Executes the domain handler step.
     * @param {any} str
     * @param {any} options
     * @returns {ChainHandlerResult}
     */
    public domain(str: string, options: Record<string, unknown> = StringHandler.matchingDefaults): ChainHandlerResult {
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
            ? pass(normalize ? str.toLowerCase() : str)
            : fail(str, 'string/domain', options);
    }

    /**
     * Executes the e164 handler step.
     * @param {any} str
     * @param {any} options
     * @returns {ChainHandlerResult}
     */
    public e164(str: string, options: Record<string, unknown> = StringHandler.matchingDefaults): ChainHandlerResult {

        const finalOptions = Object.assign({
            delim: ' ',
        }, options);

        const {
            allowLooseFormat,
            allowedDelims,
            delim,
            normalize,
        } = Object.assign({}, StringHandler.matchingDefaults, finalOptions);

        const matchData = Utils.regexMatch(
            str,
            new RegExp('^\\+[1-9](?:' + Utils.escapeForRegex(delim) + '?\\d){6,14}$'),
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
                ? Utils.replaceChars(
                    str,
                    allowedDelims + delim,
                    delim
                )
                : str
        );
    }

    /**
     * Executes the email handler step.
     * @param {any} str
     * @param {any} options
     * @returns {ChainHandlerResult}
     */
    public email(str: string, options: Record<string, unknown> = StringHandler.matchingDefaults): ChainHandlerResult {
        const {
            normalize,
        } = options;
        const parts = str.split('@');

        // Make sure there are two parts and the domain passes
        if (parts.length !== 2 || this.domain(parts[1]).fail) {
            return fail(str, 'string/email', options);
        }

        const noDot = "[a-zA-Z0-9!#$%&'*+\\-/=?^_`{|}~]";
        const dot = "[a-zA-Z0-9!#$%&'*+\\-/=?^_`{|}~.]";
        const fullRegex = `^(?=(${noDot}+))\\1(?=(${dot}*${noDot}+)?)\\2$`;
        return RegexCache(fullRegex).test(parts[0])
            ? pass(normalize ? str.toLowerCase() : str)
            : fail(str, 'string/email', options);
    }

    /**
     * Executes the empty handler step.
     * @param {any} str
     * @returns {ChainHandlerResult}
     */
    public empty(str: string): ChainHandlerResult {
        return str.length === 0 ? pass(str) : fail(str, 'string/empty');
    }

    /**
     * Executes the endsWith handler step.
     * @param {any} str
     * @param {any} suffix
     * @param {any} options
     * @returns {ChainHandlerResult}
     */
    public endsWith(str: string, suffix: string, options: Record<string, unknown> = StringHandler.matchingDefaults): ChainHandlerResult {
        const { ignoreCase } = options;

        if (ignoreCase) {
            str = str.toLowerCase();
            suffix = suffix.toLowerCase();
        }
        return str.endsWith(suffix)
            ? pass(str)
            : fail(str, 'string/endsWith', Object.assign({ suffix }, options));
    }

    /**
     * Executes the excludesChars handler step.
     * @param {any} str
     * @param {any} chars
     * @param {any} options
     * @returns {ChainHandlerResult}
     */
    public excludesChars(str: string, chars: string, options: Record<string, unknown> = StringHandler.matchingDefaults): ChainHandlerResult {
        const {
            ignoreCase,
        } = options;

        return str.replace(
            RegexCache(
                `[${Utils.escapeForRegex(chars)}]`,
                'g' + (ignoreCase ? 'i' : '')
            ),
            ''
        ).length === str.length
            ? pass(str)
            : fail(str, 'string/excludesChars', Object.assign({ chars }, options));
    }

    /**
     * Executes the gtin handler step.
     * @param {any} str
     * @param {any} options
     * @returns {ChainHandlerResult}
     */
    public gtin(str: string, options: Record<string, unknown> = StringHandler.matchingDefaults): ChainHandlerResult {
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
        } = Object.assign({}, StringHandler.matchingDefaults, finalOptions);

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
            const matchData = Utils.regexMatch(
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
                if (!Utils.validateWithCheckDigit(bareStr, { weights: [3, 1], reverse: true })) {
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

    /**
     * Executes the hash handler step.
     * @param {any} str
     * @param {any} algorithm
     * @returns {ChainHandlerResult}
     */
    public hash(str: string, algorithm: string): ChainHandlerResult {
        const algo = (algorithm || 'md5').toLowerCase();
        const hashLengths = {
            md5: 32, sha1: 40, sha256: 64, sha512: 128, ripemd: 32,
            ripemd128: 32, ripemd160: 40, ripemd320: 80, tiger128: 32,
            tiger160: 40, tiger192: 48, whirlpool: 128
        };
        const key = algo as keyof typeof hashLengths;
        return hashLengths[key]
            ? RegexCache(`^(?=([a-f\\d]{${hashLengths[key]}}))\\1$`, 'i').test(str)
                ? pass(str)
                : fail(str, 'string/hash', { algorithm })
            : fail(str, 'string/hash', { algorithm });
    }

    /**
     * Executes the hex handler step.
     * @param {any} str
     * @param {any} options
     * @returns {ChainHandlerResult}
     */
    public hex(str: string, options: Record<string, unknown> = StringHandler.matchingDefaults): ChainHandlerResult {
        const { normalize } = options;
        return /^[0-9A-F]+$/i.test(str)
            ? pass(normalize ? str.toLowerCase() : str)
            : fail(str, 'string/hex', options);
    }

    /**
     * Executes the hexColor handler step.
     * @param {any} str
     * @param {any} options
     * @returns {ChainHandlerResult}
     */
    public hexColor(str: string, options: Record<string, unknown> = StringHandler.matchingDefaults): ChainHandlerResult {
        const { normalize } = options;
        return /^#?([0-9A-F]{3}|[0-9A-F]{6})$/i.test(str)
            ? pass(normalize ? str.toLowerCase() : str)
            : fail(str, 'string/hexColor', options);
    }

    /**
     * Executes the imei handler step.
     * @param {any} str
     * @param {any} options
     * @returns {ChainHandlerResult}
     */
    public imei(str: string, options: Record<string, unknown> = StringHandler.matchingDefaults): ChainHandlerResult {
        const finalOptions = Object.assign({
            delim: '-',
        }, options);

        const {
            allowLooseFormat,
            allowedDelims,
            delim,
            normalize,
        } = Object.assign({}, StringHandler.matchingDefaults, finalOptions);

        const matchData = Utils.regexMatch(
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

        if (this.luhn(bareStr).pass) {
            return pass(
                normalize
                    ? parts.join(delim)
                    : str
            );
        }
        return fail(str, 'string/imei', finalOptions);
    }

    /**
     * Executes the ip handler step.
     * @param {any} str
     * @param {any} options
     * @returns {ChainHandlerResult}
     */
    public ip(str: string, options: Record<string, unknown> = StringHandler.matchingDefaults): ChainHandlerResult {
        const { normalize } = options;

        const ipV4Test = this.ipV4(str);
        if (ipV4Test.pass) {
            return pass(normalize ? str.toLowerCase() : str);
        }

        const ipV6Test = this.ipV6(str);
        if (ipV6Test.pass) {
            return pass(normalize ? str.toLowerCase() : str);
        }

        return fail(str, 'string/ip', options);
    }

    /**
     * Executes the ipCidr handler step.
     * @param {any} str
     * @returns {ChainHandlerResult}
     */
    public ipCidr(str: string): ChainHandlerResult {
        return this.ipCidrV4(str).pass || this.ipCidrV6(str).pass
            ? pass(str)
            : fail(str, 'string/ipCidr');
    }

    /**
     * Executes the ipCidrV4 handler step.
     * @param {any} str
     * @returns {ChainHandlerResult}
     */
    public ipCidrV4(str: string): ChainHandlerResult {
        const parts = str.split('/');
        if (parts.length !== 2) {
            return fail(str, 'string/ipCidrV4');
        }
        const num = Utils.parseNumber(parts[1]);
        return num !== null && this.ipV4(parts[0]).pass && NumberHandler.between(num, 0, 32).pass
            ? pass(str)
            : fail(str, 'string/ipCidrV4');
    }

    /**
     * Executes the ipCidrV6 handler step.
     * @param {any} str
     * @returns {ChainHandlerResult}
     */
    public ipCidrV6(str: string): ChainHandlerResult {
        const parts = str.split('/');
        if (parts.length !== 2) {
            return fail(str, 'string/ipCidrV6');
        }
        const num = Utils.parseNumber(parts[1]);
        return num !== null && this.ipV6(parts[0]).pass && NumberHandler.between(num, 0, 128).pass
            ? pass(str)
            : fail(str, 'string/ipCidrV6');
    }

    /**
     * Executes the ipV4 handler step.
     * @param {any} str
     * @param {any} options
     * @returns {ChainHandlerResult}
     */
    public ipV4(str: string, options: Record<string, unknown> = StringHandler.matchingDefaults): ChainHandlerResult {
        const { normalize } = options;
        const digits = '(\\d|[1-9]\\d|1\\d{2}|2[0-4]\\d|25[0-5])';
        return RegexCache(`^${digits}\\.${digits}\\.${digits}\\.${digits}$`).test(str)
            ? pass(normalize ? str.toLowerCase() : str)
            : fail(str, 'string/ipV4', options);
    }

    /**
     * Executes the ipV6 handler step.
     * @param {any} str
     * @param {any} options
     * @returns {ChainHandlerResult}
     */
    public ipV6(str: string, options: Record<string, unknown> = StringHandler.matchingDefaults): ChainHandlerResult {
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
            ? pass(normalize ? str.toLowerCase() : str)
            : fail(str, 'string/ipV6', options);
    }

    /**
     * Executes the json handler step.
     * @param {any} str
     * @returns {ChainHandlerResult}
     */
    public json(str: string): ChainHandlerResult {
        try { JSON.parse(str); } catch (e) { return fail(str, 'string/json'); }
        return pass(str);
    }

    /**
     * Executes the jwt handler step.
     * @param {any} str
     * @returns {ChainHandlerResult}
     */
    public jwt(str: string): ChainHandlerResult {
        return /^(?=((?:[a-z\d_=-]+\.){2}[a-z\d_=-]+))\1$/i.test(str)
            ? pass(str)
            : fail(str, 'string/jwt');
    }

    /**
     * Executes the label handler step.
     * @param {any} str
     * @param {any} options
     * @returns {ChainHandlerResult}
     */
    public label(str: string, options: Record<string, unknown> = StringHandler.matchingDefaults): ChainHandlerResult {
        const {
            normalize,
        } = options;

        if (
            !this.lengthBetween(str, 1, 63).pass
            || str.startsWith('-')
            || str.endsWith('-')
        ) {
            return fail(str, 'string/label', options);
        }

        return /^(?=([a-z0-9\-]+))\1$/i.test(str)
            ? pass(normalize ? str.toLowerCase() : str)
            : fail(str, 'string/label', options);
    }

    /**
     * Executes the length handler step.
     * @param {any} str
     * @param {any} length
     * @returns {ChainHandlerResult}
     */
    public length(str: string, length: number): ChainHandlerResult {
        return str.length === length
            ? pass(str)
            : fail(str, 'string/length', { length });
    }

    /**
     * Executes the lengthBetween handler step.
     * @param {any} str
     * @param {any} min
     * @param {any} max
     * @returns {ChainHandlerResult}
     */
    public lengthBetween(str: string, min: number, max: number): ChainHandlerResult {
        if (str.length >= min && str.length <= max) {
            return pass(str);
        }
        return fail(str, 'string/lengthBetween', { min, max });
    }

    /**
     * Executes the lowerCase handler step.
     * @param {any} str
     * @returns {ChainHandlerResult}
     */
    public lowerCase(str: string): ChainHandlerResult {
        return str === str.toLowerCase()
            ? pass(str)
            : fail(str, 'string/lowerCase');
    }

    /**
     * Executes the luhn handler step.
     * @param {any} str
     * @returns {ChainHandlerResult}
     */
    public luhn(str: string): ChainHandlerResult {
        return Utils.validateWithCheckDigit(str, {
            weights: [2, 1],
            mod: 10,
            transform: (x: number): number => x > 9 ? x - 9 : x,
            reverse: true
        })
            ? pass(str)
            : fail(str, 'string/luhn');
    }

    /**
     * Executes the mac handler step.
     * @param {any} str
     * @param {any} options
     * @returns {ChainHandlerResult}
     */
    public mac(str: string, options: Record<string, unknown> = {}): ChainHandlerResult {
        const finalOptions = Object.assign({
            delim: ':',
        }, options);

        const {
            allowLooseFormat,
            allowedDelims,
            delim,
            normalize,
        } = Object.assign({}, StringHandler.matchingDefaults, finalOptions);

        const matchData = Utils.regexMatch(
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

    /**
     * Executes the matches handler step.
     * @param {any} str
     * @param {any} regex
     * @returns {ChainHandlerResult}
     */
    public matches(str: string, regex: RegExp): ChainHandlerResult {
        return regex.test(str)
            ? pass(str)
            : fail(str, 'string/matches', { regex: regex.toString() });
    }

    /**
     * Executes the maxLength handler step.
     * @param {any} str
     * @param {any} max
     * @returns {ChainHandlerResult}
     */
    public maxLength(str: string, max: number): ChainHandlerResult {
        return str.length <= max
            ? pass(str)
            : fail(str, 'string/maxLength', { max });
    }

    /**
     * Executes the maxWords handler step.
     * @param {any} str
     * @param {any} max
     * @param {any} allowedDelims
     * @returns {ChainHandlerResult}
     */
    public maxWords(str: string, max: number, allowedDelims: string = StringHandler.matchingDefaults.allowedDelims): ChainHandlerResult {
        const count = Utils.splitOnDelims(str, allowedDelims).length;
        return count <= max
            ? pass(str)
            : fail(str, 'string/maxWords', {
                count,
                max,
                allowedDelims
            });
    }

    /**
     * Executes the measurement handler step.
     * @param {any} str
     * @param {any} options
     * @returns {ChainHandlerResult}
     */
    public measurement(str: string, options: Record<string, unknown> = {}): ChainHandlerResult {
        const {
            units
        } = options;
        const mergedOptions = Object.assign({
            trailingSymbol: units || 'cm'
        }, options);
        const result = this.numeric(str, mergedOptions);
        return result.pass
            ? pass(result.value)
            : fail(str, 'string/measurement', options);

    }

    /**
     * Executes the minLength handler step.
     * @param {any} str
     * @param {any} min
     * @returns {ChainHandlerResult}
     */
    public minLength(str: string, min: number): ChainHandlerResult {
        return str.length >= min
            ? pass(str)
            : fail(str, 'string/minLength', { min });
    }

    /**
     * Executes the minWords handler step.
     * @param {any} str
     * @param {any} min
     * @param {any} allowedDelims
     * @returns {ChainHandlerResult}
     */
    public minWords(str: string, min: number, allowedDelims: string = StringHandler.matchingDefaults.allowedDelims): ChainHandlerResult {
        const count = Utils.splitOnDelims(str, allowedDelims).length;
        return count >= min
            ? pass(str)
            : fail(str, 'string/minWords', {
                count,
                min,
                allowedDelims
            });
    }

    /**
     * Executes the money handler step.
     * @param {any} str
     * @param {any} options
     * @returns {ChainHandlerResult}
     */
    public money(str: string, options: Record<string, unknown> = {}): ChainHandlerResult {
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
            const result = this.numeric(str, mergedOptions);
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
        const result = this.numeric(str, mergedOptions);
        return result.pass
            ? pass(result.value)
            : fail(str, 'string/money', options);
    }

    /**
     * Executes the notEmpty handler step.
     * @param {any} value
     * @returns {ChainHandlerResult}
     */
    public notEmpty(value: string): ChainHandlerResult {
        return value.length > 0 ? pass(value) : fail(value, 'string/notEmpty');
    }

    /**
     * Executes the numeric handler step.
     * @param {any} str
     * @param {any} options
     * @returns {ChainHandlerResult}
     */
    public numeric(str: string, options: Record<string, unknown> = {}): ChainHandlerResult {
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
        } = Object.assign({}, StringHandler.matchingDefaults, options);

        const leadingSymbolArr = [].concat(leadingSymbol);
        const trailingSymbolArr = [].concat(trailingSymbol);
        const looseSpacing = allowLooseFormat ? '\\s*' : '';
        const parts = RegexCache(
            '^(\\+?)(-?)'
            + looseSpacing
            + `(?:${leadingSymbolArr.map(Utils.escapeForRegex).join('|')})`
            + looseSpacing
            + '(.+?)'
            + looseSpacing
            + `(?:${trailingSymbolArr.map(Utils.escapeForRegex).join('|')})`
            + looseSpacing
            + '(\\+?)(-?)$'
            , ignoreCase ? 'i' : '')
            .exec(str);
        if (!parts) {
            return fail(str, 'string/numeric/base', options);
        }

        const [, leftPlus, leftMinus, number, rightPlus, rightMinus] = parts;
        const [plusStr, minusStr] = leftAlign ? [leftPlus, leftMinus] : [rightPlus, rightMinus];

        // Sign checks
        if ((leftAlign && (rightPlus || rightMinus)) || (!leftAlign && (leftPlus || leftMinus))) {
            return fail(str, 'string/numeric/missingSign', options);
        }
        if (plus === required && !plusStr) {
            return fail(str, 'string/numeric/missingPlusSign', options);
        }
        if (plus === forbidden && plusStr) {
            return fail(str, 'string/numeric', options);
        }
        if (minus === required && !minusStr) {
            return fail(str, 'string/numeric/missingMinusSign', options);
        }
        if (minus === forbidden && minusStr) {
            return fail(str, 'string/numeric/forbiddenMinusSign', options);
        }

        const [integral = '', fractional = ''] = number.split(decimalDelim, 2);
        if (decimal === forbidden && fractional !== '') {
            return fail(str, 'string/numeric/forbiddenDecimal', options);
        }
        if (decimal === required && fractional === '') {
            return fail(str, 'string/numeric/missingDecimal', options);
        }

        let integralRegex = thousandsDelim
            ? `^(|0|[1-9]\\d{0,2}(?:${Utils.escapeForRegex(thousandsDelim)}\\d{3})*)$`
            : '^(\\d*)$';
        const integralMatch = RegexCache(integralRegex).exec(integral);

        if (!integralMatch) {
            return fail(str, 'string/numeric/invalidIntegral', options);
        }

        // Leading/trailing 0 check
        if (leadingZero === required && integral === '') {
            return fail(str, 'string/numeric', options);
        }
        if (leadingZero === forbidden && integral === '0') {
            return fail(str, 'string/numeric/forbiddenLeadingZero', options);
        }

        const fractionalMatch = RegexCache(`^(\\d{${minPrecision || 0},${isNaN(maxPrecision) ? '' : maxPrecision}})$`).exec(fractional);
        if (!fractionalMatch) {
            return fail(str, 'string/numeric/invalidFractional', options);
        }

        if (trailingZero === required && fractional === '') {
            return fail(str, 'string/numeric/missingTrailingZero', options);
        }
        if (trailingZero === forbidden && fractional === '0') {
            return fail(str, 'string/numeric/forbiddenTrailingZero', options);
        }

        const integralNumPlain = integral.replace(new RegExp(Utils.escapeForRegex(thousandsDelim), 'g'), '');
        const fullNumber = Number(
            plusStr
            + minusStr
            + (integralNumPlain || '0') + '.' + (fractional || '0')
        );

        if (isNaN(fullNumber)) {
            return fail(str, 'string/numeric/base', options);
        }

        if (min !== undefined || max !== undefined) {

            if (min !== undefined && fullNumber < min) {
                return fail(str, 'string/numeric/min', options);
            }
            if (max !== undefined && fullNumber > max) {
                return fail(str, 'string/numeric/max', options);
            }
        }

        return pass(leftPlus + leftMinus + leadingSymbol + number + trailingSymbol + rightPlus + rightMinus);
    }

    /**
     * Executes the octal handler step.
     * @param {any} str
     * @returns {ChainHandlerResult}
     */
    public octal(str: string): ChainHandlerResult {
        return /^[0-7]+$/.test(str)
            ? pass(str)
            : fail(str, 'string/octal');
    }

    /**
     * Executes the onlyChars handler step.
     * @param {any} str
     * @param {any} chars
     * @param {any} options
     * @returns {ChainHandlerResult}
     */
    public onlyChars(str: string, chars: string, options: Record<string, unknown> = StringHandler.matchingDefaults): ChainHandlerResult {
        const {
            ignoreCase,
        } = options;

        return str.replace(
            RegexCache(
                `[${Utils.escapeForRegex(chars)}]`,
                'g' + (ignoreCase ? 'i' : '')
            ),
            ''
        ).length === 0
            ? pass(str)
            : fail(str, 'string/onlyChars', Object.assign({ chars }, options));
    }

    /**
     * Executes the path handler step.
     * @param {any} str
     * @param {any} options
     * @returns {ChainHandlerResult}
     */
    public path(str: string, options: Record<string, unknown> = StringHandler.matchingDefaults): ChainHandlerResult {
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
                '\\.(' + fileExtensionsArray.map((ext: string): string => Utils.escapeForRegex(ext)).join('|') + ')'
            ),
            '))\\1',
            '$',
        ].join('');

        return RegexCache(fullRegex, 'i').test(str)
            ? pass(normalize ? str.toLowerCase() : str)
            : fail(str, 'string/path', options)
    }

    /**
     * Executes the phone handler step.
     * @param {any} str
     * @param {any} options
     * @returns {ChainHandlerResult}
     */
    public phone(str: string, options: Record<string, unknown> = {}): ChainHandlerResult {
        const finalOptions = Object.assign({
            delim: '-',
        }, options);

        const {
            allowLooseFormat,
            allowedDelims,
            delim,
            normalize,
        } = Object.assign({}, StringHandler.matchingDefaults, finalOptions);

        const matchData = Utils.regexMatch(
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

    /**
     * Executes the repetition handler step.
     * @param {any} str
     * @param {any} fragment
     * @param {any} options
     * @returns {ChainHandlerResult}
     */
    public repetition(str: string, fragment: string, options: Record<string, unknown> = StringHandler.matchingDefaults): ChainHandlerResult {
        const {
            min = 1,
            max = null,
            otherText = true,
            ignoreCase,
        } = options;

        if (!otherText) {
            const fullRegex = `^(?=((${Utils.escapeForRegex(fragment)}){${min},${max === null ? '' : max}}))\\1$`;
            return RegexCache(fullRegex, (ignoreCase ? 'i' : '')).test(str) && str
                ? pass(str)
                : fail(str, 'string/repetition', Object.assign({ fragment, min, max }, options));
        }

        // Use some math to calculate if within repetition min/max
        const minChars = fragment.length * min;
        const maxChars = max !== null ? fragment.length * max : null;
        const difference =
            str.length -
            str.replace(RegexCache(Utils.escapeForRegex(fragment), 'g' + (ignoreCase ? 'i' : '')), '').length;

        return difference >= minChars && (maxChars === null || difference <= maxChars)
            ? pass(str)
            : fail(str, 'string/repetition', Object.assign({ fragment, min, max }, options));
    }

    /**
     * Executes the slug handler step.
     * @param {any} str
     * @returns {ChainHandlerResult}
     */
    public slug(str: string): ChainHandlerResult {
        return /^(?=([a-z\d]+(-[a-z\d]+)*))\1$/.test(str)
            ? pass(str)
            : fail(str, 'string/slug');
    }

    /**
     * Executes the ssn handler step.
     * @param {any} str
     * @param {any} options
     * @returns {ChainHandlerResult}
     */
    public ssn(str: string, options: Record<string, unknown> = {}): ChainHandlerResult {
        const finalOptions = Object.assign({
            delim: '-',
        }, options);

        const {
            allowLooseFormat,
            allowedDelims,
            delim,
            normalize,
        } = Object.assign({}, StringHandler.matchingDefaults, finalOptions);

        const matchData = Utils.regexMatch(
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

    /**
     * Executes the startsWith handler step.
     * @param {any} str
     * @param {any} prefix
     * @param {any} options
     * @returns {ChainHandlerResult}
     */
    public startsWith(str: string, prefix: string, options: Record<string, unknown> = StringHandler.matchingDefaults): ChainHandlerResult {
        const { ignoreCase } = options;

        if (ignoreCase) {
            str = str.toLowerCase();
            prefix = prefix.toLowerCase();
        }
        return str.startsWith(prefix)
            ? pass(str)
            : fail(str, 'string/startsWith', Object.assign({ prefix }, options));
    }

    /**
     * Executes the state handler step.
     * @param {any} str
     * @param {any} options
     * @returns {ChainHandlerResult}
     */
    public state(str: string, options: Record<string, unknown> = {}): ChainHandlerResult {
        const {
            allowLooseFormat,
        } = Object.assign({}, StringHandler.matchingDefaults, options);

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

    /**
     * Executes the upperCase handler step.
     * @param {any} str
     * @returns {ChainHandlerResult}
     */
    public upperCase(str: string): ChainHandlerResult {
        return str === str.toUpperCase()
            ? pass(str)
            : fail(str, 'string/upperCase');
    }

    /**
     * Executes the url handler step.
     * @param {any} str
     * @param {any} options
     * @returns {ChainHandlerResult}
     */
    public url(str: string, options: Record<string, unknown> = StringHandler.matchingDefaults): ChainHandlerResult {
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

        const portValueNum = Utils.parseNumber(portValue);

        const
            hasProto = protocolValue.length > 0,
            goodProto = hasProto && allowedProtocols.indexOf(protocolValue) > -1,

            isIp = this.ipV4(hostValue).pass || this.ipV6(ipv6Value).pass,
            isDomain = this.domain(hostValue).pass,
            isLabel = this.label(hostValue).pass,

            hasPort = portValue.length > 0,
            goodPort = hasPort &&
                portValueNum !== null
                && NumberHandler.integer(portValueNum).pass
                && NumberHandler.between(portValueNum, 1, 65535).pass,

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
            ? pass(normalize ? str.toLowerCase() : str)
            : fail(str, 'string/url', options);
    }

    /**
     * Executes the uuid handler step.
     * @param {any} str
     * @param {any} version
     * @returns {ChainHandlerResult}
     */
    public uuid(str: string, version: string | number): ChainHandlerResult {
        return RegexCache([
            '^(?=([a-f\\d]{8}-[a-f\\d]{4}-[',
            !version ? '12345' : version,
            '][a-f\\d]{3}-[89AB][a-f\\d]{3}-[a-f\\d]{12}))\\1$'
        ].join(''), 'i').test(str)
            ? pass(str)
            : fail(str, 'string/uuid', { version });
    }

    /**
     * Executes the wordCount handler step.
     * @param {any} str
     * @param {any} min
     * @param {any} max
     * @param {any} allowedDelims
     * @returns {ChainHandlerResult}
     */
    public wordCount(str: string, min: number, max: number, allowedDelims: string = StringHandler.matchingDefaults.allowedDelims): ChainHandlerResult {
        const count = Utils.splitOnDelims(str, allowedDelims).length;
        return count <= max && count >= min
            ? pass(str)
            : fail(str, 'string/wordCount', {
                count,
                min,
                max,
                allowedDelims
            });
    }

    /**
     * Executes the zip handler step.
     * @param {any} str
     * @param {any} options
     * @returns {ChainHandlerResult}
     */
    public zip(str: string, options: Record<string, unknown> = {}): ChainHandlerResult {
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
        } = Object.assign({}, StringHandler.matchingDefaults, finalOptions);


        // 00 through 12, 21 through 32, 61 through 72, or 80
        const matchData = Utils.regexMatch(
            str,
            ['(?!0{5})\\d{5}', '(?!0{4})(?:\\d{4})?'],
            {
                delim,
                allowedDelims,
                allowLooseFormat
            }
        );

        if (!matchData) {
            return fail(str, 'string/zip/base', finalOptions);
        }

        const [, zip, zip4Str = ''] = matchData;

        if (zip4 === required && !zip4Str) {
            return fail(str, 'string/zip/required4', options);
        }
        if (zip4 === forbidden && zip4Str) {
            return fail(str, 'string/zip/forbidden4', options);
        }

        return pass(
            normalize
                ? zip + delim + zip4Str
                : str
        );
    }







    // ====================================
    // MUTATORS
    // ====================================


    /**
     * Executes the collapseRepeats handler step.
     * @param {any} str
     * @param {any} char
     * @returns {ChainHandlerResult}
     */
    public collapseRepeats(str: string, char: string): ChainHandlerResult {
        return pass(str.replace(RegexCache('(' + (char ? Utils.escapeForRegex(char) : '.') + ')\\1+', 'g'), '$1'));
    }

    /**
     * Executes the collapseSpacing handler step.
     * @param {any} str
     * @returns {ChainHandlerResult}
     */
    public collapseSpacing(str: string): ChainHandlerResult {
        return pass(str.replace(/\s+/g, ' '));
    }

    /**
     * Executes the escapeHtml handler step.
     * @param {any} str
     * @returns {ChainHandlerResult}
     */
    public escapeHtml(str: string): ChainHandlerResult {
        return pass(str
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;'));
    }

    /**
     * Executes the hexDecode handler step.
     * @param {any} str
     * @returns {ChainHandlerResult}
     */
    public hexDecode(str: string): ChainHandlerResult {
        let decoded = '';
        for (const match of str.matchAll(/.{1,2}/g)) {
            decoded += String.fromCharCode(parseInt(match[0], 16));
        }
        return pass(decoded);
    }

    /**
     * Executes the hexEncode handler step.
     * @param {any} str
     * @returns {ChainHandlerResult}
     */
    public hexEncode(str: string): ChainHandlerResult {
        let encoded = '';
        for (const char of [...str]) {
            encoded += Utils.padLeft(char.charCodeAt(0).toString(16), 2, '0');
        }
        return pass(encoded);
    }

    /**
     * Executes the normalizeLineBreaks handler step.
     * @param {any} str
     * @param {any} lineBreak
     * @returns {ChainHandlerResult}
     */
    public normalizeLineBreaks(str: string, lineBreak: string = '\n'): ChainHandlerResult {
        return pass(str.replace(/\r\n|\r|\n/g, lineBreak));
    }

    /**
     * Executes the normalizeUnicode handler step.
     * @param {any} str
     * @param {any} type
     * @returns {ChainHandlerResult}
     */
    public normalizeUnicode(str: string, type: string = 'NFC'): ChainHandlerResult {
        return pass(str.normalize(type));
    }

    /**
     * Executes the padLeft handler step.
     * @param {any} str
     * @param {any} length
     * @param {any} char
     * @returns {ChainHandlerResult}
     */
    public padLeft(str: string, length: number, char: string): ChainHandlerResult {
        return pass(Utils.padLeft(str, length, char));
    }

    /**
     * Executes the padRight handler step.
     * @param {any} str
     * @param {any} length
     * @param {any} char
     * @returns {ChainHandlerResult}
     */
    public padRight(str: string, length: number, char: string): ChainHandlerResult {
        return pass(Utils.padRight(str, length, char));
    }

    /**
     * Executes the removeSpacing handler step.
     * @param {any} str
     * @returns {ChainHandlerResult}
     */
    public removeSpacing(str: string): ChainHandlerResult {
        return pass(str.replace(/\s/g, ''));
    }

    /**
     * Executes the slice handler step.
     * @param {any} str
     * @param {any} startIndex
     * @param {any} endIndex
     * @returns {ChainHandlerResult}
     */
    public slice(str: string, startIndex: number, endIndex: number): ChainHandlerResult {
        return pass(str.slice(startIndex, endIndex));
    }

    /**
     * Executes the sliceFirst handler step.
     * @param {any} str
     * @param {any} count
     * @returns {ChainHandlerResult}
     */
    public sliceFirst(str: string, count: number = 1): ChainHandlerResult {
        return pass(str.slice(0, count));
    }

    /**
     * Executes the sliceLast handler step.
     * @param {any} str
     * @param {any} count
     * @returns {ChainHandlerResult}
     */
    public sliceLast(str: string, count: number = 1): ChainHandlerResult {
        return pass(str.slice(-count));
    }

    /**
     * Executes the stripHtml handler step.
     * @param {any} str
     * @returns {ChainHandlerResult}
     */
    public stripHtml(str: string): ChainHandlerResult {
        return pass(str.replace(/<[^>]*>/g, ''));
    }

    /**
     * Executes the toCamelCase handler step.
     * @param {any} str
     * @param {any} allowedDelims
     * @returns {ChainHandlerResult}
     */
    public toCamelCase(str: string, allowedDelims: string = StringHandler.matchingDefaults.allowedDelims): ChainHandlerResult {
        return this.toDelimited(str, {
            allowedDelims,
            delim: '',
            transformer1: (word: string): string => word.toLowerCase(),
            transformer2: (word: string): string => word[0].toUpperCase() + word.slice(1).toLowerCase()
        });
    }

    /**
     * Executes the toDelimited handler step.
     * @param {any} str
     * @param {any} options
     * @returns {ChainHandlerResult}
     */
    public toDelimited(str: string, options: Record<string, unknown> = {}): ChainHandlerResult {
        const finalOptions = Object.assign({
            delim: '-',
            transformer: (x: string): string => x,
            switchIndex: 1
        }, options);

        const {
            allowedDelims,
            delim,
            transformer,
            transformer1,
            transformer2,
            switchIndex
        } = Object.assign({}, StringHandler.matchingDefaults, finalOptions);

        return pass(
            Utils.splitOnDelims(str, allowedDelims)
                .reduce((acc: string[], current: string, index: number): string[] => {
                    if (!transformer1) {
                        acc.push(transformer(current));
                    }
                    else {
                        acc.push(
                            index < switchIndex ? transformer1(current) : transformer2(current)
                        );
                    }
                    return acc;
                }, [] as string[])
                .join(delim)
        );
    }

    /**
     * Executes the toKebabCase handler step.
     * @param {any} str
     * @param {any} allowedDelims
     * @returns {ChainHandlerResult}
     */
    public toKebabCase(str: string, allowedDelims: string = StringHandler.matchingDefaults.allowedDelims): ChainHandlerResult {
        return this.toDelimited(str, {
            allowedDelims,
            delim: '-',
            transformer: (word: string): string => word.toLowerCase()
        });
    }

    /**
     * Executes the toLowerCase handler step.
     * @param {any} str
     * @returns {ChainHandlerResult}
     */
    public toLowerCase(str: string): ChainHandlerResult {
        return pass(str.toLowerCase());
    }

    /**
     * Executes the toPascalCase handler step.
     * @param {any} str
     * @param {any} allowedDelims
     * @returns {ChainHandlerResult}
     */
    public toPascalCase(str: string, allowedDelims: string = StringHandler.matchingDefaults.allowedDelims): ChainHandlerResult {
        return this.toDelimited(str, {
            allowedDelims,
            delim: '',
            transformer: (word: string): string => word[0].toUpperCase() + word.slice(1).toLowerCase()
        });
    }

    /**
     * Executes the toSentenceCase handler step.
     * @param {any} str
     * @param {any} allowedDelims
     * @returns {ChainHandlerResult}
     */
    public toSentenceCase(str: string, allowedDelims: string = StringHandler.matchingDefaults.allowedDelims): ChainHandlerResult {
        return this.toDelimited(str, {
            allowedDelims,
            delim: ' ',
            transformer1: (word: string): string => word[0].toUpperCase() + word.slice(1).toLowerCase(),
            transformer2: (word: string): string => word.toLowerCase()
        });
    }

    /**
     * Executes the toSnakeCase handler step.
     * @param {any} str
     * @param {any} allowedDelims
     * @returns {ChainHandlerResult}
     */
    public toSnakeCase(str: string, allowedDelims: string = StringHandler.matchingDefaults.allowedDelims): ChainHandlerResult {
        return this.toDelimited(str, {
            allowedDelims,
            delim: '_',
            transformer: (word: string): string => word.toLowerCase()
        });
    }

    /**
     * Executes the toTitleCase handler step.
     * @param {any} str
     * @param {any} allowedDelims
     * @returns {ChainHandlerResult}
     */
    public toTitleCase(str: string, allowedDelims: string = StringHandler.matchingDefaults.allowedDelims): ChainHandlerResult {
        return this.toDelimited(str, {
            allowedDelims,
            delim: ' ',
            transformer: (word: string): string => word[0].toUpperCase() + word.slice(1).toLowerCase()
        });
    }

    /**
     * Executes the toUpperCase handler step.
     * @param {any} str
     * @returns {ChainHandlerResult}
     */
    public toUpperCase(str: string): ChainHandlerResult {
        return pass(str.toUpperCase());
    }

    /**
     * Executes the trim handler step.
     * @param {any} str
     * @param {any} chars
     * @returns {ChainHandlerResult}
     */
    public trim(str: string, chars: string = ' '): ChainHandlerResult {
        const finalChars = chars === ' ' ? '\\s' : Utils.escapeForRegex(chars);
        return pass(str.replace(RegexCache(`^[${finalChars}]+|[${finalChars}]+$`, 'g'), ''));
    }

    /**
     * Executes the trimLeft handler step.
     * @param {any} str
     * @param {any} chars
     * @returns {ChainHandlerResult}
     */
    public trimLeft(str: string, chars: string = ' '): ChainHandlerResult {
        const finalChars = chars === ' ' ? '\\s' : Utils.escapeForRegex(chars);
        return pass(str.replace(RegexCache('^[' + finalChars + ']+'), ''));
    }

    /**
     * Executes the trimRight handler step.
     * @param {any} str
     * @param {any} chars
     * @returns {ChainHandlerResult}
     */
    public trimRight(str: string, chars: string = ' '): ChainHandlerResult {
        const finalChars = chars === ' ' ? '\\s' : Utils.escapeForRegex(chars);
        return pass(str.replace(RegexCache('[' + finalChars + ']+$'), ''));
    }

    /**
     * Executes the urlDecode handler step.
     * @param {any} str
     * @returns {ChainHandlerResult}
     */
    public urlDecode(str: string): ChainHandlerResult {
        return pass(decodeURIComponent(str));
    }

    /**
     * Executes the urlEncode handler step.
     * @param {any} str
     * @returns {ChainHandlerResult}
     */
    public urlEncode(str: string): ChainHandlerResult {
        return pass(encodeURIComponent(str));
    }

}

StringHandler.matchingDefaults = {
    allowedDelims: ' -._',
    allowLooseFormat: true,
    ignoreCase: false,
    normalize: true,
    delim: '-'
}


export { StringHandler };

