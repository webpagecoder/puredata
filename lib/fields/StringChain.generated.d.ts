// AUTO-GENERATED FILE. DO NOT EDIT DIRECTLY.
// Source: lib/handlers/StringHandler.(js|ts) + lib/fields/StringChain.ts
// Run: tsx ./generator/generate-arraychain-definitions.ts

interface StringChainGeneratedMethods {
        alpha(): StringChain;

        alphanumeric(): StringChain;

        ascii(): StringChain;

        base64(): StringChain;

        base64Decode(): StringChain;

        base64Encode(): StringChain;

        binary(): StringChain;

        bmp(): StringChain;

        complex(options?: any): StringChain;

        contains(substring: any, options?: any): StringChain;

        creditCard(options?: any): StringChain;

        currencyCode(options?: any): StringChain;

        dataUrl(options?: any): StringChain;

        digits(): StringChain;

        domain(options?: any): StringChain;

        e164(options?: any): StringChain;

        email(options?: any): StringChain;

        empty(): StringChain;

        endsWith(suffix: any, options?: any): StringChain;

        excludesChars(chars: any, options?: any): StringChain;

        gtin(options?: any): StringChain;

        hash(algorithm: any): StringChain;

        hex(options?: any): StringChain;

        hexColor(options?: any): StringChain;

        imei(options?: any): StringChain;

        ip(options?: any): StringChain;

        ipCidr(): StringChain;

        ipCidrV4(): StringChain;

        ipCidrV6(): StringChain;

        ipV4(options?: any): StringChain;

        ipV6(options?: any): StringChain;

        json(): StringChain;

        jwt(): StringChain;

        label(options?: any): StringChain;

        length(length: any): StringChain;

        lengthBetween(min: any, max: any): StringChain;

        lowerCase(): StringChain;

        luhn(): StringChain;

        mac(options?: any): StringChain;

        matches(regex: any): StringChain;

        maxLength(max: any): StringChain;

        maxWords(max: any, allowedDelims?: any): StringChain;

        measurement(options?: any): StringChain;

        minLength(min: any): StringChain;

        minWords(min: any, allowedDelims?: any): StringChain;

        money(options?: any): StringChain;

        notEmpty(): StringChain;

        numeric(options?: any): StringChain;

        octal(): StringChain;

        onlyChars(chars: any, options?: any): StringChain;

        path(options?: any): StringChain;

        phone(options?: any): StringChain;

        repetition(fragment: any, options?: any): StringChain;

        slug(): StringChain;

        ssn(options?: any): StringChain;

        startsWith(prefix: any, options?: any): StringChain;

        state(options?: any): StringChain;

        upperCase(): StringChain;

        url(options?: any): StringChain;

        uuid(version: any): StringChain;

        wordCount(min: any, max: any, allowedDelims?: any): StringChain;

        zip(options?: any): StringChain;

        collapseRepeats(char: any): StringChain;

        collapseSpacing(): StringChain;

        escapeHtml(): StringChain;

        hexDecode(): StringChain;

        hexEncode(): StringChain;

        normalizeLineBreaks(lineBreak?: any): StringChain;

        normalizeUnicode(type?: any): StringChain;

        padLeft(length: any, char: any): StringChain;

        padRight(length: any, char: any): StringChain;

        removeSpacing(): StringChain;

        slice(startIndex: any, endIndex: any): StringChain;

        sliceFirst(count?: any): StringChain;

        sliceLast(count?: any): StringChain;

        stripHtml(): StringChain;

        toCamelCase(allowedDelims?: any): StringChain;

        toDelimited(options?: any): StringChain;

        toKebabCase(allowedDelims?: any): StringChain;

        toLowerCase(): StringChain;

        toPascalCase(allowedDelims?: any): StringChain;

        toSentenceCase(allowedDelims?: any): StringChain;

        toSnakeCase(allowedDelims?: any): StringChain;

        toTitleCase(allowedDelims?: any): StringChain;

        toUpperCase(): StringChain;

        trim(chars?: any): StringChain;

        trimLeft(chars?: any): StringChain;

        trimRight(chars?: any): StringChain;

        urlDecode(): StringChain;

        urlEncode(): StringChain;

}

declare module './StringChain.ts' {
    interface StringChain extends StringChainGeneratedMethods {}
}

declare module './StringChain.js' {
    interface StringChain extends StringChainGeneratedMethods {}
}

export { };
