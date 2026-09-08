// AUTO-GENERATED FILE. DO NOT EDIT DIRECTLY.
// Source: lib/fields/string/StringHandler.ts + lib/fields/string/StringChain.ts
// Run: npm run generate:chain-defs

import type { StringHandler } from './StringHandler.ts';

type DropFirst<T extends unknown[]> = T extends [unknown, ...infer R] ? R : [];

interface StringChainGeneratedMethods {
    /**
    * Validates that the string contains only alphabetic letters.
    */
    alpha(...args: DropFirst<Parameters<StringHandler['alpha']>>): StringChain;

    /**
    * Validates that the string contains only letters and digits.
    */
    alphanumeric(...args: DropFirst<Parameters<StringHandler['alphanumeric']>>): StringChain;

    /**
    * Validates that a value matches one of the allowed values.
    * @param allowedValues Values that are accepted.
    * @returns A passing result when a match is found; otherwise a failing result.
    */
    anyOf(...args: DropFirst<Parameters<StringHandler['anyOf']>>): StringChain;

    /**
    * Validates that the string contains only ASCII characters.
    */
    ascii(...args: DropFirst<Parameters<StringHandler['ascii']>>): StringChain;

    /**
    * Validates that opening and closing characters are balanced in the string.
    * @param openChar The opening character to track. Default: '('.
    * @param closeChar The closing character to track. Default: ')'.
    */
    balanced(...args: DropFirst<Parameters<StringHandler['balanced']>>): StringChain;

    /**
    * Validates that the string is a properly padded Base64 sequence.
    */
    base64(...args: DropFirst<Parameters<StringHandler['base64']>>): StringChain;

    /**
    * Decodes a Base64-encoded string into UTF-8 text.
    */
    base64Decode(...args: DropFirst<Parameters<StringHandler['base64Decode']>>): StringChain;

    /**
    * Encodes a UTF-8 string as Base64.
    */
    base64Encode(...args: DropFirst<Parameters<StringHandler['base64Encode']>>): StringChain;

    /**
    * Validates that the string contains only binary digits.
    */
    binary(...args: DropFirst<Parameters<StringHandler['binary']>>): StringChain;

    /**
    * Validates that the string contains only whitespace characters (space, tab, newline, etc.).
    */
    blank(...args: DropFirst<Parameters<StringHandler['blank']>>): StringChain;

    /**
    * Validates that all characters are within the Basic Multilingual Plane.
    */
    bmp(...args: DropFirst<Parameters<StringHandler['bmp']>>): StringChain;

    /**
    * Collapses repeated occurrences of a character into a single character.
    * When `char` is empty, this collapses repeats of any character.
    * @param char The character to collapse.
    */
    collapseRepeats(...args: DropFirst<Parameters<StringHandler['collapseRepeats']>>): StringChain;

    /**
    * Collapses consecutive whitespace into a single space.
    */
    collapseSpacing(...args: DropFirst<Parameters<StringHandler['collapseSpacing']>>): StringChain;

    /**
    * Validates password-style complexity requirements.
    * @param options Complexity thresholds and limits.
    * @param options.minLength Minimum allowed length. Default: 8.
    * @param options.maxLength Maximum allowed length. Default: 100.
    * @param options.minLowercase Minimum lowercase letters required. Default: 1.
    * @param options.minUppercase Minimum uppercase letters required. Default: 1.
    * @param options.minDigits Minimum digits required. Default: 1.
    * @param options.minSpecialChars Minimum non-alphanumeric characters required. Default: 1.
    * @param options.maxRepeats Maximum allowed repeated consecutive occurrences for the same character.
    * For example, when set to 2, `aaa` fails and `aa` passes. Default: 2.
    */
    complex(...args: DropFirst<Parameters<StringHandler['complex']>>): StringChain;

    /**
    * Validates that the input contains a target substring.
    * @param substring The substring that must appear.
    * @param options Matching options.
    * Default: {} (merged with {@link CONTAINS_DEFAULTS}).
    * @param options.ignoreCase Whether to compare case-insensitively. Default: false.
    */
    contains(...args: DropFirst<Parameters<StringHandler['contains']>>): StringChain;

    /**
    * Validates and normalizes supported credit card numbers.
    * @param options Card matching and normalization options.
    * Default: {} (merged with {@link CREDIT_CARD_DEFAULTS}).
    * @param options.types Allowed card type names. Empty array means all supported types. Default: [].
    * @param options.acceptableDelims Delimiters accepted in loose matching. Default: ' -_./'.
    * @param options.normalizedDelim Delimiter used when normalization is applied. Default: ''.
    * @param options.normalize Whether to return normalized output when validation passes. Default: true.
    * @param options.mode Matching mode for regex normalization. Default: 'strict'.
    * @param options.stripDelims Delimiters removed before loose matching. Default: ' '.
    */
    creditCard(...args: DropFirst<Parameters<StringHandler['creditCard']>>): StringChain;

    /**
    * Validates that the input is a supported ISO currency code.
    * @param options Case and normalization options.
    * Default: {} (merged with {@link CURRENCY_CODE_DEFAULTS}).
    * @param options.ignoreCase Whether to match case-insensitively. Default: false.
    * @param options.normalize Whether to return uppercase normalized output. Default: true.
    */
    currencyCode(...args: DropFirst<Parameters<StringHandler['currencyCode']>>): StringChain;

    /**
    * Executes a user-provided handler for custom validation or transformation.
    * If the callback returns a HandlerResult, that result is used directly.
    * Otherwise, the returned value is wrapped in a passing result.
    * @param filterFn Callback that validates and/or transforms the value.
    * @returns The callback result as-is when it is a HandlerResult; otherwise a passing result.
    */
    custom(...args: DropFirst<Parameters<StringHandler['custom']>>): StringChain;

    /**
    * Validates that the input is a base64 data URL of an allowed media type.
    * @param options Allowed data URL media types.
    * Default: {} (merged with {@link DATA_URL_DEFAULTS}).
    * @param options.allowedTypes Allowed top-level media families in the data URL.
    * Default: ['image', 'video', 'audio', 'text'].
    */
    dataUrl(...args: DropFirst<Parameters<StringHandler['dataUrl']>>): StringChain;

    /**
    * Validates that a value is not undefined.
    * @returns A passing result when the value is defined; otherwise a failing result.
    */
    defined(...args: DropFirst<Parameters<StringHandler['defined']>>): StringChain;

    /**
    * Validates that the string contains digits only.
    */
    digits(...args: DropFirst<Parameters<StringHandler['digits']>>): StringChain;

    /**
    * Validates a domain name with optional wildcard and subdomain rules.
    * @param options Domain validation options.
    * Default: {} (merged with {@link DOMAIN_DEFAULTS}).
    * @param options.normalize Whether to return lowercase normalized output. Default: true.
    * @param options.subdomains Whether subdomains are required, optional, or forbidden. Default: 'optional'.
    * @param options.wildcards Whether leading wildcard labels are required, optional, or forbidden. Default: 'forbidden'.
    * @param options.extensions Array of allowed domain extensions strings. Default: [].
    */
    domain(...args: DropFirst<Parameters<StringHandler['domain']>>): StringChain;

    /**
    * Validates and normalizes an E.123-style international phone number.
    * @param options Matching and normalization options.
    * Default: {} (merged with {@link E123_DEFAULTS}).
    * @param options.acceptableDelims Delimiters accepted in loose matching. Default: ' -./'.
    * @param options.mode Matching mode for regex normalization. Default: 'strict'.
    * @param options.normalizedDelim Delimiter used when normalization is applied. Default: ' '.
    * @param options.normalize Whether to return normalized output when validation passes. Default: true.
    * @param options.stripDelims Delimiters removed before loose matching. Default: ' '.
    */
    e123(...args: DropFirst<Parameters<StringHandler['e123']>>): StringChain;

    /**
    * Validates and normalizes an E.164 phone number.
    * @param options Matching and normalization options.
    * Default: {} (merged with {@link E164_DEFAULTS}).
    * @param options.acceptableDelims Delimiters accepted in loose matching. Default: ' -./'.
    * @param options.normalizedDelim Delimiter used when normalization is applied. Default: ''.
    * @param options.mode Matching mode for regex normalization. Default: 'strict'.
    * @param options.stripDelims Delimiters removed before loose matching. Default: ' '.
    * @param options.normalize Optional normalization toggle from provided options/default matching config.
    * By default no method-level normalize value is set, so the original input is returned.
    */
    e164(...args: DropFirst<Parameters<StringHandler['e164']>>): StringChain;

    /**
    * Validates an email address and optionally normalizes casing.
    * @param options Email validation options.
    * Default: {} (merged with {@link EMAIL_DEFAULTS}).
    * @param options.normalize Whether to return lowercase normalized output. Default: true.
    */
    email(...args: DropFirst<Parameters<StringHandler['email']>>): StringChain;

    /**
    * Validates that the input string is empty.
    */
    empty(...args: DropFirst<Parameters<StringHandler['empty']>>): StringChain;

    /**
    * Validates that the input ends with a suffix.
    * @param suffix The suffix that must appear at the end.
    * @param options Matching options.
    * Default: {} (merged with {@link ENDS_WITH_DEFAULTS}).
    * @param options.ignoreCase Whether to compare case-insensitively. Default: false.
    */
    endsWith(...args: DropFirst<Parameters<StringHandler['endsWith']>>): StringChain;

    /**
    * Validates that a value is deeply equal to the provided comparison value.
    * @param comparison Value to compare against.
    * @returns A passing result when values are equal; otherwise a failing result.
    */
    equals(...args: DropFirst<Parameters<StringHandler['equals']>>): StringChain;

    /**
    * Escapes HTML-sensitive characters to their HTML entities.
    */
    escapeHtml(...args: DropFirst<Parameters<StringHandler['escapeHtml']>>): StringChain;

    /**
    * Validates that none of the provided characters appear in the input.
    * @param chars Characters that must be excluded.
    * @param options Matching options.
    * Default: {} (merged with {@link EXCLUDES_CHARS_DEFAULTS}).
    * @param options.ignoreCase Whether to compare case-insensitively. Default: false.
    */
    excludesChars(...args: DropFirst<Parameters<StringHandler['excludesChars']>>): StringChain;

    /**
    * Validates that a value is falsy.
    * @returns A passing result for falsy values; otherwise a failing result.
    */
    falsy(...args: DropFirst<Parameters<StringHandler['falsy']>>): StringChain;

    /**
    * Validates and normalizes GTIN values.
    * @param options GTIN matching options.
    * Default: {} (merged with {@link GTIN_DEFAULTS}).
    * @param options.lengths Allowed GTIN lengths to validate. Default: [8, 12, 13, 14].
    * @param options.acceptableDelims Delimiters accepted in loose matching. Default: ' -_./'.
    * @param options.normalizedDelim Delimiter used when normalization is applied. Default: ''.
    * @param options.normalize Whether to return normalized output when validation passes. Default: true.
    * @param options.mode Matching mode for regex normalization. Default: 'strict'.
    * @param options.stripDelims Delimiters removed before loose matching. Default: ' '.
    */
    gtin(...args: DropFirst<Parameters<StringHandler['gtin']>>): StringChain;

    /**
    * Validates fixed-length hexadecimal hash values for known algorithms.
    * @param algorithm Hash algorithm name. Default: 'md5' when empty.
    */
    hash(...args: DropFirst<Parameters<StringHandler['hash']>>): StringChain;

    /**
    * Validates hexadecimal text.
    * @param options Normalization options.
    * Default: {} (merged with {@link HEX_DEFAULTS}).
    * @param options.normalize Whether to return lowercase normalized output. Default: true.
    */
    hex(...args: DropFirst<Parameters<StringHandler['hex']>>): StringChain;

    /**
    * Validates hex color text (#RGB or #RRGGBB).
    * @param options Normalization options.
    * Default: {} (merged with {@link HEX_DEFAULTS}).
    * @param options.normalize Whether to return lowercase normalized output. Default: true.
    */
    hexColor(...args: DropFirst<Parameters<StringHandler['hexColor']>>): StringChain;

    /**
    * Decodes a hex-encoded string into plain text.
    * Interprets the input as pairs of hexadecimal bytes.
    */
    hexDecode(...args: DropFirst<Parameters<StringHandler['hexDecode']>>): StringChain;

    /**
    * Encodes a string into lowercase hexadecimal byte pairs.
    */
    hexEncode(...args: DropFirst<Parameters<StringHandler['hexEncode']>>): StringChain;

    /**
    * Validates and normalizes IMEI values.
    * @param options IMEI matching options.
    * Default: {} (merged with {@link IMEI_DEFAULTS}).
    * @param options.acceptableDelims Delimiters accepted in loose matching. Default: ' -_./'.
    * @param options.normalizedDelim Delimiter used when normalization is applied. Default: ''.
    * @param options.normalize Whether to return normalized output when validation passes. Default: true.
    * @param options.mode Matching mode for regex normalization. Default: 'strict'.
    * @param options.stripDelims Delimiters removed before loose matching. Default: ' '.
    */
    imei(...args: DropFirst<Parameters<StringHandler['imei']>>): StringChain;

    /**
    * Validates that a value is an instance of the supplied constructor.
    * @param constructor Constructor function the value must be an instance of.
    * @returns A passing result when the instance check succeeds; otherwise a failing result.
    */
    instanceOf(...args: DropFirst<Parameters<StringHandler['instanceOf']>>): StringChain;

    /**
    * Validates IPv4 or IPv6 input.
    * @param options Normalization options.
    * Default: {} (merged with {@link IP_DEFAULTS}).
    * @param options.normalize Whether to return lowercase normalized output. Default: true.
    */
    ip(...args: DropFirst<Parameters<StringHandler['ip']>>): StringChain;

    /**
    * Validates whether input is CIDR in either IPv4 or IPv6 notation.
    */
    ipCidr(...args: DropFirst<Parameters<StringHandler['ipCidr']>>): StringChain;

    /**
    * Validates IPv4 CIDR notation.
    */
    ipCidrV4(...args: DropFirst<Parameters<StringHandler['ipCidrV4']>>): StringChain;

    /**
    * Validates IPv6 CIDR notation.
    */
    ipCidrV6(...args: DropFirst<Parameters<StringHandler['ipCidrV6']>>): StringChain;

    /**
    * Validates IPv4 input.
    * @param options Normalization options.
    * Default: {} (merged with {@link IP_DEFAULTS}).
    * @param options.normalize Whether to return lowercase normalized output. Default: true.
    */
    ipV4(...args: DropFirst<Parameters<StringHandler['ipV4']>>): StringChain;

    /**
    * Validates IPv6 input.
    * @param options Normalization options.
    * Default: {} (merged with {@link IP_DEFAULTS}).
    * @param options.normalize Whether to return lowercase normalized output. Default: true.
    */
    ipV6(...args: DropFirst<Parameters<StringHandler['ipV6']>>): StringChain;

    /**
    * Validates that a string parses as JSON.
    */
    json(...args: DropFirst<Parameters<StringHandler['json']>>): StringChain;

    /**
    * Validates JSON Web Token basic format (three base64url-like segments).
    */
    jwt(...args: DropFirst<Parameters<StringHandler['jwt']>>): StringChain;

    /**
    * Validates DNS label-like input.
    * @param options Normalization options.
    * Default: {} (merged with {@link LABEL_DEFAULTS}).
    * @param options.normalize Whether to return lowercase normalized output. Default: true.
    */
    label(...args: DropFirst<Parameters<StringHandler['label']>>): StringChain;

    /**
    * Validates exact string length.
    * @param length Required length.
    */
    length(...args: DropFirst<Parameters<StringHandler['length']>>): StringChain;

    /**
    * Validates that string length is between min and max, inclusive.
    * @param min Minimum length (inclusive).
    * @param max Maximum length (inclusive).
    */
    lengthBetween(...args: DropFirst<Parameters<StringHandler['lengthBetween']>>): StringChain;

    /**
    * Validates that the input is all lowercase.
    */
    lowerCase(...args: DropFirst<Parameters<StringHandler['lowerCase']>>): StringChain;

    /**
    * Validates a string using the Luhn check-digit algorithm.
    */
    luhn(...args: DropFirst<Parameters<StringHandler['luhn']>>): StringChain;

    /**
    * Validates and normalizes MAC addresses.
    * @param options Matching options.
    * Default: {} (merged with {@link MAC_DEFAULTS}).
    * @param options.acceptableDelims Delimiters accepted in loose matching. Default: ': -_./'.
    * @param options.normalizedDelim Delimiter used when normalization is applied. Default: ':'.
    * @param options.normalize Whether to return normalized output when validation passes. Default: true.
    * @param options.mode Matching mode for regex normalization. Default: 'strict'.
    * @param options.stripDelims Delimiters removed before loose matching. Default: ' '.
    */
    mac(...args: DropFirst<Parameters<StringHandler['mac']>>): StringChain;

    /**
    * Validates that the input matches a regular expression.
    * @param regex The regular expression to test.
    */
    matches(...args: DropFirst<Parameters<StringHandler['matches']>>): StringChain;

    /**
    * Validates that the input length does not exceed a maximum.
    * @param max Maximum allowed length.
    */
    maxLength(...args: DropFirst<Parameters<StringHandler['maxLength']>>): StringChain;

    /**
    * Validates that word count is not above a maximum.
    * @param max Maximum word count.
    * @param delim Word delimiter used for splitting. Default: ' '.
    */
    maxWords(...args: DropFirst<Parameters<StringHandler['maxWords']>>): StringChain;

    /**
    * Validates measurement-like numeric strings.
    * @param options Measurement options.
    * Default: {} (merged with {@link MEASUREMENT_DEFAULTS}).
    * @param options.units Allowed unit suffixes. Default: ['cm'].
    * @param options.plus Whether plus sign is required, optional, or forbidden. Default: 'optional'.
    * @param options.minus Whether minus sign is required, optional, or forbidden. Default: 'optional'.
    * @param options.alignment Whether signs appear on the left or right side. Default: 'left'.
    * @param options.min Minimum numeric value allowed. Default: null.
    * @param options.max Maximum numeric value allowed. Default: null.
    * @param options.decimal Whether a decimal part is required, optional, or forbidden. Default: 'optional'.
    * @param options.thousandsDelim Thousands separator character. Default: ','.
    * @param options.decimalDelim Decimal separator character. Default: '.'.
    * @param options.minPrecision Minimum digits required after the decimal. Default: null.
    * @param options.maxPrecision Maximum digits allowed after the decimal. Default: null.
    * @param options.leadingZero Whether leading zero before decimal is required, optional, or forbidden. Default: 'optional'.
    * @param options.trailingZero Whether fractional trailing zero is required, optional, or forbidden. Default: 'optional'.
    * @param options.leadingSymbols Allowed symbols before the numeric portion. Default: [''].
    * @param options.trailingSymbols Allowed symbols after the numeric portion. Default: [''].
    * @param options.looseSpacing Whether whitespace is allowed around symbols and signs. Default: false.
    */
    measurement(...args: DropFirst<Parameters<StringHandler['measurement']>>): StringChain;

    /**
    * Validates that the input length is at least a minimum.
    * @param min Minimum allowed length.
    */
    minLength(...args: DropFirst<Parameters<StringHandler['minLength']>>): StringChain;

    /**
    * Validates that word count is at least a minimum.
    * @param min Minimum word count.
    * @param delim Word delimiter used for splitting. Default: ' '.
    */
    minWords(...args: DropFirst<Parameters<StringHandler['minWords']>>): StringChain;

    /**
    * Validates money-formatted strings.
    * @param options Money format options.
    * Default: {} (merged with {@link MONEY_DEFAULTS}).
    * @param options.parens Whether surrounding parentheses are required, optional, or forbidden. Default: 'forbidden'.
    * @param options.leadingSymbols Allowed symbols before the numeric portion. Default: ['$'].
    * @param options.trailingSymbols Allowed symbols after the numeric portion. Default: [].
    * @param options.plus Whether plus sign is required, optional, or forbidden. Default: 'optional'.
    * @param options.minus Whether minus sign is required, optional, or forbidden. Default: 'optional'.
    * @param options.alignment Whether signs appear on the left or right side. Default: 'left'.
    * @param options.min Minimum numeric value allowed. Default: null.
    * @param options.max Maximum numeric value allowed. Default: null.
    * @param options.decimal Whether a decimal part is required, optional, or forbidden. Default: 'optional'.
    * @param options.thousandsDelim Thousands separator character. Default: ','.
    * @param options.decimalDelim Decimal separator character. Default: '.'.
    * @param options.minPrecision Minimum digits required after the decimal. Default: null.
    * @param options.maxPrecision Maximum digits allowed after the decimal. Default: null.
    * @param options.leadingZero Whether leading zero before decimal is required, optional, or forbidden. Default: 'optional'.
    * @param options.trailingZero Whether fractional trailing zero is required, optional, or forbidden. Default: 'optional'.
    * @param options.looseSpacing Whether whitespace is allowed around symbols and signs. Default: false.
    */
    money(...args: DropFirst<Parameters<StringHandler['money']>>): StringChain;

    /**
    * Validates that a value does not match any of the forbidden values.
    * @param forbiddenValues Values that are not allowed.
    * @returns A passing result when the value is not found; otherwise a failing result.
    */
    noneOf(...args: DropFirst<Parameters<StringHandler['noneOf']>>): StringChain;

    /**
    * Normalizes all line endings in a string to a single line break token.
    * Converts CRLF, CR, and LF into `lineBreak`.
    * @param lineBreak The target line break string. Default: '\n'.
    */
    normalizeLineBreaks(...args: DropFirst<Parameters<StringHandler['normalizeLineBreaks']>>): StringChain;

    /**
    * Applies Unicode normalization to the string.
    * @param type The normalization form (NFC, NFD, NFKC, NFKD). Default: 'NFC'.
    */
    normalizeUnicode(...args: DropFirst<Parameters<StringHandler['normalizeUnicode']>>): StringChain;

    /**
    * Validates that the string contains only blank characters (spaces, tabs, etc.).
    */
    notBlank(...args: DropFirst<Parameters<StringHandler['notBlank']>>): StringChain;

    /**
    * Validates that the input string is not empty.
    */
    notEmpty(...args: DropFirst<Parameters<StringHandler['notEmpty']>>): StringChain;

    /**
    * Validates that a value is not deeply equal to the provided comparison value.
    * @param comparison Value to compare against.
    * @returns A passing result when values differ; otherwise a failing result.
    */
    notEquals(...args: DropFirst<Parameters<StringHandler['notEquals']>>): StringChain;

    /**
    * Validates that a value is not null.
    * @returns A passing result when the value is not null; otherwise a failing result.
    */
    notNull(...args: DropFirst<Parameters<StringHandler['notNull']>>): StringChain;

    /**
    * Validates that a value is null or undefined.
    * @returns A passing result when the value is nullish; otherwise a failing result.
    */
    notNullish(...args: DropFirst<Parameters<StringHandler['notNullish']>>): StringChain;

    /**
    * Validates that a value is null.
    * @returns A passing result when the value is null; otherwise a failing result.
    */
    null(...args: DropFirst<Parameters<StringHandler['null']>>): StringChain;

    /**
    * Validates that a value is null or undefined.
    * @returns A passing result when the value is nullish; otherwise a failing result.
    */
    nullish(...args: DropFirst<Parameters<StringHandler['nullish']>>): StringChain;

    /**
    * Validates numeric-format strings with configurable rules.
    * @param options Numeric format options.
    * Default: {} (merged with {@link NUMERIC_DEFAULTS}).
    * @param options.plus Whether plus sign is required, optional, or forbidden. Default: 'optional'.
    * @param options.minus Whether minus sign is required, optional, or forbidden. Default: 'optional'.
    * @param options.alignment Whether signs appear on the left or right side. Default: 'left'.
    * @param options.min Minimum numeric value allowed. Default: null.
    * @param options.max Maximum numeric value allowed. Default: null.
    * @param options.decimal Whether a decimal part is required, optional, or forbidden. Default: 'optional'.
    * @param options.thousandsDelim Thousands separator character. Default: ','.
    * @param options.decimalDelim Decimal separator character. Default: '.'.
    * @param options.minPrecision Minimum digits required after the decimal. Default: null.
    * @param options.maxPrecision Maximum digits allowed after the decimal. Default: null.
    * @param options.leadingZero Whether leading zero before decimal is required, optional, or forbidden. Default: 'optional'.
    * @param options.trailingZero Whether fractional trailing zero is required, optional, or forbidden. Default: 'optional'.
    * @param options.leadingSymbols Allowed symbols before the numeric portion. Default: [''].
    * @param options.trailingSymbols Allowed symbols after the numeric portion. Default: [''].
    * @param options.looseSpacing Whether whitespace is allowed around symbols and signs. Default: false.
    */
    numeric(...args: DropFirst<Parameters<StringHandler['numeric']>>): StringChain;

    /**
    * Validates that the string contains only octal digits.
    */
    octal(...args: DropFirst<Parameters<StringHandler['octal']>>): StringChain;

    /**
    * Validates that all characters are from an allowed set.
    * @param chars Allowed characters.
    * @param options Matching options.
    * Default: {} (merged with {@link ONLY_CHARS_DEFAULTS}).
    * @param options.ignoreCase Whether to compare case-insensitively. Default: false.
    */
    onlyChars(...args: DropFirst<Parameters<StringHandler['onlyChars']>>): StringChain;

    /**
    * Left-pads a string to the requested length.
    * @param length The final minimum length.
    * @param char The pad character.
    */
    padLeft(...args: DropFirst<Parameters<StringHandler['padLeft']>>): StringChain;

    /**
    * Right-pads a string to the requested length.
    * @param length The final minimum length.
    * @param char The pad character.
    */
    padRight(...args: DropFirst<Parameters<StringHandler['padRight']>>): StringChain;

    /**
    * Validates path-like strings.
    * @param options Path validation options.
    * Default: {} (merged with {@link PATH_DEFAULTS}).
    * @param options.absolute Whether absolute paths are required, optional, or forbidden. Default: 'required'.
    * @param options.extensions Allowed file extensions, including dot (for example '.txt'). Empty array allows any/none.
    * Default: [].
    * @param options.lowercase Whether to lowercase output. Default: false.
    * @param options.segmentMaxLen Maximum length for each folder/file segment. Default: 100.
    * @param options.style Path style to validate. Default: 'unix'.
    */
    path(...args: DropFirst<Parameters<StringHandler['path']>>): StringChain;

    /**
    * Validates and normalizes phone numbers.
    * @param options Matching options.
    * Default: {} (merged with {@link PHONE_DEFAULTS}).
    * @param options.acceptableDelims Delimiters accepted in loose matching. Default: ' -_./'.
    * @param options.normalizedDelim Delimiter used when normalization is applied. Default: '-'.
    * @param options.normalize Whether to return normalized output when validation passes. Default: true.
    * @param options.mode Matching mode for regex normalization. Default: 'strict'.
    * @param options.stripDelims Delimiters removed before loose matching. Default: ' '.
    */
    phone(...args: DropFirst<Parameters<StringHandler['phone']>>): StringChain;

    /**
    * Validates primitive type expectations for a value.
    * When type is provided, the value must match that primitive type exactly.
    * When type is omitted, any primitive type is accepted.
    * @param type Optional primitive type to enforce.
    * @returns A passing result when type constraints are met; otherwise a failing result.
    */
    primitive(...args: DropFirst<Parameters<StringHandler['primitive']>>): StringChain;

    /**
    * Validates repeated fragment usage.
    * @param fragment The fragment to count.
    * @param min Minimum repeats required. Default: 1.
    * @param max Maximum repeats allowed. Default: null (no maximum).
    * @param options Repeat options.
    * Default: {} (merged with {@link REPEAT_DEFAULTS}).
    * @param options.ignoreCase Whether to compare case-insensitively. Default: false.
    * @param options.otherText Whether non-fragment text is allowed in the input. Default: true.
    */
    repeats(...args: DropFirst<Parameters<StringHandler['repeats']>>): StringChain;

    /**
    * Returns a substring between `startIndex` and `endIndex`.
    * @param startIndex Inclusive start index.
    * @param endIndex Exclusive end index.
    */
    slice(...args: DropFirst<Parameters<StringHandler['slice']>>): StringChain;

    /**
    * Keeps only the first `count` characters.
    * @param count Number of characters to keep from the start. Default: 1.
    */
    sliceFirst(...args: DropFirst<Parameters<StringHandler['sliceFirst']>>): StringChain;

    /**
    * Keeps only the last `count` characters.
    * @param count Number of characters to keep from the end. Default: 1.
    */
    sliceLast(...args: DropFirst<Parameters<StringHandler['sliceLast']>>): StringChain;

    /**
    * Validates kebab-style lowercase slug text.
    */
    slug(...args: DropFirst<Parameters<StringHandler['slug']>>): StringChain;

    /**
    * Validates and normalizes U.S. SSN values.
    * @param options Matching options.
    * Default: {} (merged with {@link SSN_DEFAULTS}).
    * @param options.acceptableDelims Delimiters accepted in loose matching. Default: ' -_./'.
    * @param options.normalizedDelim Delimiter used when normalization is applied. Default: '-'.
    * @param options.normalize Whether to return normalized output when validation passes. Default: true.
    * @param options.mode Matching mode for regex normalization. Default: 'strict'.
    * @param options.stripDelims Delimiters removed before loose matching. Default: ' '.
    */
    ssn(...args: DropFirst<Parameters<StringHandler['ssn']>>): StringChain;

    /**
    * Validates that the input starts with a prefix.
    * @param prefix The prefix that must appear at the start.
    * @param options Matching options.
    * Default: {} (merged with {@link STARTS_WITH_DEFAULTS}).
    * @param options.ignoreCase Whether to compare case-insensitively. Default: false.
    */
    startsWith(...args: DropFirst<Parameters<StringHandler['startsWith']>>): StringChain;

    /**
    * Validates U.S. state abbreviations.
    * @param options Matching options.
    * Default: {} (merged with {@link STATE_DEFAULTS}).
    * @param options.ignoreCase Whether to compare case-insensitively. Default: false.
    * @param options.normalize Whether to return uppercase normalized output. Default: true.
    */
    state(...args: DropFirst<Parameters<StringHandler['state']>>): StringChain;

    /**
    * Removes all occurrences of specific characters from the input.
    * @param chars Characters to remove.
    */
    stripChars(...args: DropFirst<Parameters<StringHandler['stripChars']>>): StringChain;

    /**
    * Removes simple HTML tags from the string.
    */
    stripHtml(...args: DropFirst<Parameters<StringHandler['stripHtml']>>): StringChain;

    /**
    * Removes all whitespace from the string.
    */
    stripWhitespace(...args: DropFirst<Parameters<StringHandler['stripWhitespace']>>): StringChain;

    /**
    * Converts text to camelCase.
    * @param delims Delimiters used to split input text. Default: ' '.
    */
    toCamelCase(...args: DropFirst<Parameters<StringHandler['toCamelCase']>>): StringChain;

    /**
    * Splits a string on delimiters, transforms each segment, and joins it with a new delimiter.
    * `transformer1` is applied before `transformerSwitchIndex` and `transformer2` after.
    * @param options Delimiter and transformation options.
    * Default: {} (merged with {@link TO_DELIMITED_DEFAULTS}).
    * @param options.fromDelims Delimiter characters to split on. Use null to skip splitting and transform the whole input as one token.
    * Default: null.
    * @param options.toDelim Delimiter used when joining transformed tokens. Default: ''.
    * @param options.transformer1 Transformer applied to tokens before switch index. Default: identity function.
    * @param options.transformer2 Transformer applied at and after switch index. Default: identity function.
    * @param options.transformerSwitchIndex Index where transformer2 begins; null keeps transformer1 for all tokens.
    * Default: null.
    */
    toDelimited(...args: DropFirst<Parameters<StringHandler['toDelimited']>>): StringChain;

    /**
    * Converts text to kebab-case.
    * @param fromDelims Delimiters used to split input text. Default: ' '.
    */
    toKebabCase(...args: DropFirst<Parameters<StringHandler['toKebabCase']>>): StringChain;

    /**
    * Converts text to lowercase.
    */
    toLowerCase(...args: DropFirst<Parameters<StringHandler['toLowerCase']>>): StringChain;

    /**
    * Converts text to PascalCase.
    * @param fromDelims Delimiters used to split input text. Default: ' '.
    */
    toPascalCase(...args: DropFirst<Parameters<StringHandler['toPascalCase']>>): StringChain;

    /**
    * Converts text to sentence case.
    * @param fromDelims Delimiters used to split input text. Default: ' '.
    */
    toSentenceCase(...args: DropFirst<Parameters<StringHandler['toSentenceCase']>>): StringChain;

    /**
    * Converts text to snake_case.
    * @param fromDelims Delimiters used to split input text. Default: ' '.
    */
    toSnakeCase(...args: DropFirst<Parameters<StringHandler['toSnakeCase']>>): StringChain;

    /**
    * Converts text to Title Case.
    * @param fromDelims Delimiters used to split input text. Default: ' '.
    */
    toTitleCase(...args: DropFirst<Parameters<StringHandler['toTitleCase']>>): StringChain;

    /**
    * Converts text to uppercase.
    */
    toUpperCase(...args: DropFirst<Parameters<StringHandler['toUpperCase']>>): StringChain;

    /**
    * Trims matching characters from both ends of the string.
    * Note: when `chars` is omitted, this method trims all whitespace
    * characters via `\s` (for example spaces, tabs, and newlines), not only literal spaces.
    * @param chars Characters to trim. Default: omitted (trims all whitespace).
    */
    trim(...args: DropFirst<Parameters<StringHandler['trim']>>): StringChain;

    /**
    * Trims matching characters from the start of the string.
    * Note: when `chars` is omitted, this method trims all whitespace
    * characters via `\s` (for example spaces, tabs, and newlines), not only literal spaces.
    * @param chars Characters to trim. Default: omitted (trims all whitespace).
    */
    trimLeft(...args: DropFirst<Parameters<StringHandler['trimLeft']>>): StringChain;

    /**
    * Trims matching characters from the end of the string.
    * Note: when `chars` is omitted, this method trims all whitespace
    * characters via `\s` (for example spaces, tabs, and newlines), not only literal spaces.
    * @param chars Characters to trim. Default: omitted (trims all whitespace).
    */
    trimRight(...args: DropFirst<Parameters<StringHandler['trimRight']>>): StringChain;

    /**
    * Validates that a value is truthy.
    * @returns A passing result for truthy values; otherwise a failing result.
    */
    truthy(...args: DropFirst<Parameters<StringHandler['truthy']>>): StringChain;

    /**
    * Validates that a value is undefined.
    * @returns A passing result when the value is undefined; otherwise a failing result.
    */
    undefined(...args: DropFirst<Parameters<StringHandler['undefined']>>): StringChain;

    /**
    * Validates that the input is all uppercase.
    */
    upperCase(...args: DropFirst<Parameters<StringHandler['upperCase']>>): StringChain;

    /**
    * Validates URLs.
    * @param options URL validation options.
    * Default: {} (merged with {@link URL_DEFAULTS}).
    * @param options.rootRelative Whether root-relative URLs are allowed/expected without host. Default: false.
    * @param options.allowedProtocols Allowed protocol names when protocol is present. Default: ['http', 'https'].
    * @param options.protocols Whether protocol is required, optional, or forbidden. Default: 'optional'.
    * @param options.domain Whether domain hostnames are required, optional, or forbidden. Default: 'optional'.
    * @param options.ip Whether IP hosts are required, optional, or forbidden. Default: 'optional'.
    * @param options.label Whether single-label hosts are required, optional, or forbidden. Default: 'forbidden'.
    * @param options.port Whether port is required, optional, or forbidden. Default: 'optional'.
    * @param options.query Whether query string is required, optional, or forbidden. Default: 'optional'.
    * @param options.fragment Whether hash fragment is required, optional, or forbidden. Default: 'optional'.
    * @param options.normalize Whether to return lowercase normalized output. Default: true.
    */
    url(...args: DropFirst<Parameters<StringHandler['url']>>): StringChain;

    /**
    * URL-decodes a percent-encoded string.
    */
    urlDecode(...args: DropFirst<Parameters<StringHandler['urlDecode']>>): StringChain;

    /**
    * URL-encodes a string using percent-encoding.
    */
    urlEncode(...args: DropFirst<Parameters<StringHandler['urlEncode']>>): StringChain;

    /**
    * Validates and normalizes UUID values.
    * @param options UUID matching options.
    * Default: {} (merged with {@link UUID_DEFAULTS}).
    * @param options.version UUID version to enforce (1-5), or null to allow any supported version. Default: null.
    * @param options.acceptableDelims Delimiters accepted in loose matching. Default: ' -_./'.
    * @param options.normalizedDelim Delimiter used when normalization is applied. Default: '-'.
    * @param options.normalize Whether to return normalized output when validation passes. Default: true.
    * @param options.mode Matching mode for regex normalization. Default: 'strict'.
    * @param options.stripDelims Delimiters removed before loose matching. Default: ' '.
    */
    uuid(...args: DropFirst<Parameters<StringHandler['uuid']>>): StringChain;

    /**
    * Validates word count is within a min/max range.
    * @param min Minimum word count. Default: 1.
    * @param max Maximum word count. Default: null (no maximum).
    */
    wordCount(...args: DropFirst<Parameters<StringHandler['wordCount']>>): StringChain;

    /**
    * Validates and normalizes ZIP/postal values.
    * @param options ZIP matching options.
    * Default: {} (merged with {@link ZIP_DEFAULTS}).
    * @param options.zip4 Whether ZIP+4 extension is required, optional, or forbidden. Default: 'optional'.
    * @param options.acceptableDelims Delimiters accepted in loose matching. Default: ' -_./'.
    * @param options.normalizedDelim Delimiter used when normalization is applied. Default: '-'.
    * @param options.normalize Whether to return normalized output when validation passes. Default: true.
    * @param options.mode Matching mode for regex normalization. Default: 'strict'.
    * @param options.stripDelims Delimiters removed before loose matching. Default: ' '.
    */
    zip(...args: DropFirst<Parameters<StringHandler['zip']>>): StringChain;

}

declare module './StringChain.ts' {
    interface StringChain extends StringChainGeneratedMethods {}
}

declare module './StringChain.js' {
    interface StringChain extends StringChainGeneratedMethods {}
}

export {};
