'use strict';

import GenericChain  from './GenericChain.js';

class StringChain extends GenericChain {

    get languageKey() {
        return 'string';
    }

    // Validators

    /**
     * Validates that the string contains only alphabetic characters.
     * @returns {StringChain}
     */
    alpha() {
        return this.addStep('alpha');
    }

    /**
     * Validates that the string contains only alphanumeric characters.
     * @returns {StringChain}
     */
    alphanumeric() {
        return this.addStep('alphanumeric');
    }

    /**
     * Validates that the string contains only ASCII characters.
     * @returns {StringChain}
     */
    ascii() {
        return this.addStep('ascii');
    }

    /**
     * Validates that brackets/parentheses are balanced in the string.
     * @param {Array<[string, string]>} [pairs=[['(', ')'], ['[', ']'], ['{', '}']]] - Pairs of opening and closing characters.
     * @returns {StringChain}
     */
    balanced(pairs = [['(', ')'], ['[', ']'], ['{', '}']]) {
        return this.addStep('balanced', [pairs]);
    }

    /**
     * Validates that the string is valid base64.
     * @returns {StringChain}
     */
    base64() {
        return this.addStep('base64');
    }

    /**
     * Validates that the string contains only binary digits (0 and 1).
     * @returns {StringChain}
     */
    binary() {
        return this.addStep('binary');
    }

    /**
     * Validates that the string only contains characters from the Basic Multilingual Plane.
     * @returns {StringChain}
     */
    bmp() {
        return this.addStep('bmp');
    }

    /**
     * Validates that the string meets complexity requirements (e.g., password strength).
     * @param {Object} [options={}] - Complexity options.
     * @returns {StringChain}
     */
    complex(options = {}) {
        return this.addStep('complex', [options]);
    }

    /**
     * Validates that the string is a valid credit card number.
     * @returns {StringChain}
     */
    creditCard() {
        return this.addStep('creditCard');
    }

    /**
     * Validates that the string is a valid ISO 4217 currency code.
     * @returns {StringChain}
     */
    currencyCode() {
        return this.addStep('currencyCode');
    }

    /**
     * Validates that the string is a valid data URI.
     * @param {Object} [options={}] - Data URI validation options.
     * @returns {StringChain}
     */
    dataUri(options = {}) {
        return this.addStep('dataUri', [options]);
    }

    /**
     * Validates that the string contains only digits.
     * @returns {StringChain}
     */
    digits() {
        return this.addStep('digits');
    }

    /**
     * Validates that the string is a valid domain name.
     * @param {Object} [options={}] - Domain validation options.
     * @returns {StringChain}
     */
    domain(options = {}) {
        return this.addStep('domain', [options]);
    }

    /**
     * Validates that the string is a valid E.164 phone number format.
     * @returns {StringChain}
     */
    e164() {
        return this.addStep('e164');
    }

    /**
     * Validates that the string is a valid email address.
     * @param {Object} [options={}] - Email validation options.
     * @returns {StringChain}
     */
    email(options = {}) {
        return this.addStep('email', [options]);
    }

    /**
     * Validates that the string is empty.
     * @returns {StringChain}
     */
    empty() {
        return this.addStep('empty');
    }

    /**
     * Validates that the string ends with the specified suffix.
     * @param {string} suffix - The suffix to check for.
     * @param {Object} [options={}] - Validation options (e.g., case sensitivity).
     * @returns {StringChain}
     */
    endsWith(suffix, options = {}) {
        return this.addStep('endsWith', [suffix, options]);
    }

    /**
     * Validates that the string does not contain any of the specified characters.
     * @param {string} chars - Characters to exclude.
     * @returns {StringChain}
     */
    excludesChars(chars) {
        return this.addStep('excludesChars', [chars]);
    }

    /**
     * Validates that the string is a valid GTIN (Global Trade Item Number).
     * @returns {StringChain}
     */
    gtin() {
        return this.addStep('gtin');
    }

    /**
     * Validates that the string has at most the specified number of words.
     * @param {number} max - Maximum number of words.
     * @param {string[]|undefined} allowedDelims - Allowed word delimiters.
     * @returns {StringChain}
     */
    maxWords(max, allowedDelims = undefined) {
        return this.addStep('maxWords', [max, allowedDelims]);
    }

    /**
     * Validates that the string has at least the specified number of words.
     * @param {number} min - Minimum number of words.
     * @param {string[]|undefined} allowedDelims - Allowed word delimiters.
     * @returns {StringChain}
     */
    minWords(min, allowedDelims = undefined) {
        return this.addStep('minWords', [min, allowedDelims]);
    }

    /**
     * Validates that the string contains only the specified characters.
     * @param {string} chars - Allowed characters.
     * @returns {StringChain}
     */
    onlyChars(chars) {
        return this.addStep('onlyChars', [chars]);
    }

    /**
     * Validates that the string contains the specified substring.
     * @param {string} substring - Substring to search for.
     * @param {Object} [options={}] - Search options (e.g., case sensitivity).
     * @returns {StringChain}
     */
    contains(substring, options = {}) {
        return this.addStep('contains', [substring, options]);
    }

    /**
     * Validates that the string has a word count.isBetween min and max.
     * @param {number} min - Minimum number of words.
     * @param {number} max - Maximum number of words.
     * @param {string[]|undefined} allowedDelims - Allowed word delimiters.
     * @returns {StringChain}
     */
    wordCount(min, max, allowedDelims = undefined) {
        return this.addStep('wordCount', [min, max, allowedDelims]);
    }

    /**
     * Validates that the string is a valid hash of the specified algorithm.
     * @param {string} algorithm - Hash algorithm (e.g., 'md5', 'sha256').
     * @param {Object} [options={}] - Hash validation options.
     * @returns {StringChain}
     */
    hash(algorithm, options = {}) {
        return this.addStep('hash', [algorithm, options]);
    }

    /**
     * Validates that the string is a valid hexadecimal string.
     * @param {Object} [options={}] - Hex validation options.
     * @returns {StringChain}
     */
    hex(options = {}) {
        return this.addStep('hex', [options]);
    }

    /**
     * Validates that the string is a valid hex color code.
     * @param {Object} [options={}] - Color validation options.
     * @returns {StringChain}
     */
    hexColor(options = {}) {
        return this.addStep('hexColor', [options]);
    }

    /**
     * Validates that the string is a valid IMEI number.
     * @returns {StringChain}
     */
    imei() {
        return this.addStep('imei');
    }

    /**
     * Validates that the string is a valid IP CIDR notation (v4 or v6).
     * @param {Object} [options={}] - CIDR validation options.
     * @returns {StringChain}
     */
    ipCidr(options = {}) {
        return this.addStep('ipCidr', [options]);
    }

    /**
     * Validates that the string is a valid IPv4 CIDR notation.
     * @param {Object} [options={}] - CIDR validation options.
     * @returns {StringChain}
     */
    ipCidrV4(options = {}) {
        return this.addStep('ipCidrV4', [options]);
    }

    /**
     * Validates that the string is a valid IPv6 CIDR notation.
     * @param {Object} [options={}] - CIDR validation options.
     * @returns {StringChain}
     */
    ipCidrV6(options = {}) {
        return this.addStep('ipCidrV6', [options]);
    }

    /**
     * Validates that the string is a valid IPv4 address.
     * @param {Object} [options={}] - IP validation options.
     * @returns {StringChain}
     */
    ipV4(options = {}) {
        return this.addStep('ipV4', [options]);
    }

    /**
     * Validates that the string is a valid IP address (v4 or v6).
     * @param {Object} [options={}] - IP validation options.
     * @returns {StringChain}
     */
    isIp(options = {}) {
        return this.addStep('ip', [options]);
    }

    /**
     * Validates that the string is a valid IPv6 address.
     * @param {Object} [options={}] - IP validation options.
     * @returns {StringChain}
     */
    ipV6(options = {}) {
        return this.addStep('ipV6', [options]);
    }

    /**
     * Validates that the string is in lower case.
     * @returns {StringChain}
     */
    lowerCase() {
        return this.addStep('lowerCase');
    }

    /**
     * Validates that the string is valid JSON.
     * @returns {StringChain}
     */
    json() {
        return this.addStep('json');
    }

    /**
     * Validates that the string is a valid JWT (JSON Web Token).
     * @returns {StringChain}
     */
    jwt() {
        return this.addStep('jwt');
    }

    /**
     * Validates that the string is a valid label (e.g., DNS label).
     * @param {Object} [options={}] - Label validation options.
     * @returns {StringChain}
     */
    label(options = {}) {
        return this.addStep('label', [options]);
    }

    /**
     * Validates that the string has the exact specified length.
     * @param {number} length - Required length.
     * @returns {StringChain}
     */
    length(length) {
        return this.addStep('length', [length]);
    }

    /**
     * Validates that the string length is.isBetween min and max.
     * @param {number} min - Minimum length.
     * @param {number} max - Maximum length.
     * @returns {StringChain}
     */
    lengthBetween(min, max) {
        return this.addStep('lengthBetween', [min, max]);
    }

    /**
     * Validates that the string passes the Luhn algorithm check.
     * @returns {StringChain}
     */
    luhn() {
        return this.addStep('luhn');
    }

    /**
     * Validates that the string is a valid MAC address.
     * @param {Object} [options={}] - MAC address validation options.
     * @returns {StringChain}
     */
    mac(options = {}) {
        return this.addStep('mac', [options]);
    }

    /**
     * Validates that the string matches the specified regular expression.
     * @param {RegExp} regex - Regular expression to match.
     * @returns {StringChain}
     */
    matches(regex) {
        return this.addStep('matches', [regex]);
    }

    /**
     * Validates that the string length does not exceed the specified maximum.
     * @param {number} max - Maximum length.
     * @returns {StringChain}
     */
    maxLength(max) {
        return this.addStep('maxLength', [max]);
    }

    /**
     * Validates that the string is a valid measurement (e.g., "10px", "5kg").
     * @param {Object} [options={}] - Measurement validation options.
     * @returns {StringChain}
     */
    measurement(options = {}) {
        return this.addStep('measurement', [options]);
    }

    /**
     * Validates that the string length is at least the specified minimum.
     * @param {number} min - Minimum length.
     * @returns {StringChain}
     */
    minLength(min) {
        return this.addStep('minLength', [min]);
    }

    /**
     * Validates that the string is a valid monetary amount.
     * @param {Object} [options={}] - Money validation options.
     * @returns {StringChain}
     */
    money(options = {}) {
        return this.addStep('money', [options]);
    }

    /**
     * Validates that the string is not empty.
     * @returns {StringChain}
     */
    notEmpty() {
        return this.addStep('notEmpty');
    }

    /**
     * Validates that the string is a valid numeric string.
     * @param {Object} [options={}] - Numeric validation options.
     * @returns {StringChain}
     */
    numeric(options = {}) {
        return this.addStep('numeric', [options]);
    }

    /**
     * Validates that the string contains only octal digits (0-7).
     * @returns {StringChain}
     */
    octal() {
        return this.addStep('octal');
    }

    /**
     * Validates that the string is a valid file path.
     * @param {Object} [options={}] - Path validation options.
     * @returns {StringChain}
     */
    path(options = {}) {
        return this.addStep('path', [options]);
    }

    /**
     * Validates that the string is a valid phone number.
     * @param {Object} [options={}] - Phone validation options.
     * @returns {StringChain}
     */
    phone(options = {}) {
        return this.addStep('phone', [options]);
    }

    /**
     * Validates that the string does not contain excessive character repetition.
     * @param {Object} [options={}] - Repetition validation options.
     * @returns {StringChain}
     */
    repetition(options = {}) {
        return this.addStep('repetition', [options]);
    }

    /**
     * Validates that the string is a valid URL slug.
     * @param {Object} [options={}] - Slug validation options.
     * @returns {StringChain}
     */
    slug(options = {}) {
        return this.addStep('slug', [options]);
    }

    /**
     * Validates that the string is a valid Social Security Number.
     * @returns {StringChain}
     */
    ssn() {
        return this.addStep('ssn');
    }

    /**
     * Validates that the string starts with the specified prefix.
     * @param {string} prefix - The prefix to check for.
     * @param {Object} [options={}] - Validation options (e.g., case sensitivity).
     * @returns {StringChain}
     */
    startsWith(prefix, options = {}) {
        return this.addStep('startsWith', [prefix, options]);
    }

    /**
     * Validates that the string is a valid US state or state for the specified country.
     * @param {string} [country='US'] - Country code.
     * @returns {StringChain}
     */
    state(country = 'US') {
        return this.addStep('state', [country]);
    }

    /**
     * Validates that the string is in upper case.
     * @returns {StringChain}
     */
    upperCase() {
        return this.addStep('upperCase');
    }

    /**
     * Validates that the string is a valid URL.
     * @param {Object} [options={}] - URL validation options.
     * @returns {StringChain}
     */
    url(options = {}) {
        return this.addStep('url', [options]);
    }

    /**
     * Validates that the string is a valid UUID.
     * @param {number|null} [version=null] - UUID version (1-5, or null for any version).
     * @returns {StringChain}
     */
    uuid(version = null) {
        return this.addStep('uuid', [version]);
    }

    /**
     * Validates that the string is a valid ZIP/postal code.
     * @param {string} [country='US'] - Country code.
     * @returns {StringChain}
     */
    zip(country = 'US') {
        return this.addStep('zip', [country]);
    }


    // Transformers (alphabetical)


    /**
     * Decodes a base64-encoded string.
     * @returns {StringChain}
     */
    base64Decode() {
        return this.addStep('base64Decode');
    }


    /**
     * Encodes the string in base64 format.
     * @returns {StringChain}
     */
    base64Encode() {
        return this.addStep('base64Encode');
    }


    /**
     * Collapses repeated characters in the string.
     * @param {string|undefined} chars - Characters to collapse (optional).
     * @returns {StringChain}
     */
    collapseRepeats(chars = undefined) {
        return this.addStep('collapseRepeats', [chars]);
    }


    /**
     * Collapses all spacing in the string to a single space.
     * @returns {StringChain}
     */
    collapseSpacing() {
        return this.addStep('collapseSpacing');
    }


    /**
     * Escapes HTML entities in the string.
     * @returns {StringChain}
     */
    escapeHtml() {
        return this.addStep('escapeHtml');
    }


    /**
     * Decodes a hex-encoded string.
     * @returns {StringChain}
     */
    hexDecode() {
        return this.addStep('hexDecode');
    }


    /**
     * Encodes the string in hexadecimal format.
     * @returns {StringChain}
     */
    hexEncode() {
        return this.addStep('hexEncode');
    }


    /**
     * Normalizes line breaks in the string.
     * @param {string} [lineBreak='\n'] - Line break character to use.
     * @returns {StringChain}
     */
    normalizeLineBreaks(lineBreak = '\n') {
        return this.addStep('normalizeLineBreaks', [lineBreak]);
    }


    /**
     * Normalizes Unicode characters in the string.
     * @param {string} [form='NFC'] - Unicode normalization form.
     * @returns {StringChain}
     */
    normalizeUnicode(form = 'NFC') {
        return this.addStep('normalizeUnicode', [form]);
    }


    /**
     * Pads the string on the left to the specified length.
     * @param {number} length - Target length.
     * @param {string} [padChar=' '] - Padding character.
     * @returns {StringChain}
     */
    padLeft(length, padChar = ' ') {
        return this.addStep('padLeft', [length, padChar]);
    }


    /**
     * Pads the string on the right to the specified length.
     * @param {number} length - Target length.
     * @param {string} [padChar=' '] - Padding character.
     * @returns {StringChain}
     */
    padRight(length, padChar = ' ') {
        return this.addStep('padRight', [length, padChar]);
    }


    /**
     * Removes all spacing from the string.
     * @returns {StringChain}
     */
    removeSpacing() {
        return this.addStep('removeSpacing');
    }


    /**
     * Slices the string from startIndex to endIndex.
     * @param {number} startIndex - Start index.
     * @param {number} endIndex - End index.
     * @returns {StringChain}
     */
    slice(startIndex, endIndex) {
        return this.addStep('slice', [startIndex, endIndex]);
    }


    /**
     * Slices the first N characters from the string.
     * @param {number} num - Number of characters.
     * @returns {StringChain}
     */
    sliceFirst(num) {
        return this.addStep('sliceFirst', [num]);
    }


    /**
     * Slices the last N characters from the string.
     * @param {number} num - Number of characters.
     * @returns {StringChain}
     */
    sliceLast(num) {
        return this.addStep('sliceLast', [num]);
    }


    /**
     * Removes HTML tags from the string.
     * @returns {StringChain}
     */
    stripHtml() {
        return this.addStep('stripHtml');
    }


    /**
     * Converts the string to camelCase.
     * @param {string[]|undefined} allowedDelims - Allowed delimiters.
     * @returns {StringChain}
     */
    toCamelCase(allowedDelims = undefined) {
        return this.addStep('toCamelCase', [allowedDelims]);
    }


    /**
     * Converts the string to a delimited format.
     * @param {Object} options - Delimiting options.
     * @returns {StringChain}
     */
    toDelimited(options = {}) {
        return this.addStep('toDelimited', [options]);
    }


    /**
     * Converts the string to kebab-case.
     * @param {string[]|undefined} allowedDelims - Allowed delimiters.
     * @returns {StringChain}
     */
    toKebabCase(allowedDelims = undefined) {
        return this.addStep('toKebabCase', [allowedDelims]);
    }


    /**
     * Converts the string to lower case.
     * @returns {StringChain}
     */
    toLowerCase() {
        return this.addStep('toLowerCase');
    }


    /**
     * Converts the string to PascalCase.
     * @param {string[]|undefined} allowedDelims - Allowed delimiters.
     * @returns {StringChain}
     */
    toPascalCase(allowedDelims = undefined) {
        return this.addStep('toPascalCase', [allowedDelims]);
    }


    /**
     * Converts the string to sentence case.
     * @param {string[]|undefined} allowedDelims - Allowed delimiters.
     * @returns {StringChain}
     */
    toSentenceCase(allowedDelims = undefined) {
        return this.addStep('toSentenceCase', [allowedDelims]);
    }


    /**
     * Converts the string to snake_case.
     * @param {string[]|undefined} allowedDelims - Allowed delimiters.
     * @returns {StringChain}
     */
    toSnakeCase(allowedDelims = undefined) {
        return this.addStep('toSnakeCase', [allowedDelims]);
    }


    /**
     * Converts the string to Title Case.
     * @param {string[]|undefined} allowedDelims - Allowed delimiters.
     * @returns {StringChain}
     */
    toTitleCase(allowedDelims = undefined) {
        return this.addStep('toTitleCase', [allowedDelims]);
    }


    /**
     * Converts the string to upper case.
     * @returns {StringChain}
     */
    toUpperCase() {
        return this.addStep('toUpperCase');
    }


    /**
     * Trims characters from both ends of the string.
     * @param {string|undefined} chars - Characters to trim (optional).
     * @returns {StringChain}
     */
    trim(chars = undefined) {
        return this.addStep('trim', [chars]);
    }


    /**
     * Trims characters from the left end of the string.
     * @param {string|undefined} chars - Characters to trim (optional).
     * @returns {StringChain}
     */
    trimLeft(chars = undefined) {
        return this.addStep('trimLeft', [chars]);
    }


    /**
     * Trims characters from the right end of the string.
     * @param {string|undefined} chars - Characters to trim (optional).
     * @returns {StringChain}
     */
    trimRight(chars = undefined) {
        return this.addStep('trimRight', [chars]);
    }

    /**
     * Decodes a URL-encoded string.
     * @returns {StringChain}
     */
    urlDecode() {
        return this.addStep('urlDecode');
    }

    /**
     * Encodes the string as a URL.
     * @returns {StringChain}
     */
    urlEncode() {
        return this.addStep('urlEncode');
    }

}

export default  StringChain;