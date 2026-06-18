// AUTO-GENERATED FILE. DO NOT EDIT DIRECTLY.
// Source: lib/handlers/StringHandler.(js|ts) + lib/fields/StringChain.ts
// Run: tsx ./generator/generate-arraychain-definitions.ts

interface StringChainGeneratedMethods {
        /**
        * Executes the alpha handler step.
        * @returns {StringChain}
        */
        alpha(): StringChain;

        /**
        * Executes the alphanumeric handler step.
        * @returns {StringChain}
        */
        alphanumeric(): StringChain;

        /**
        * Executes the ascii handler step.
        * @returns {StringChain}
        */
        ascii(): StringChain;

        /**
        * Executes the base64 handler step.
        * @returns {StringChain}
        */
        base64(): StringChain;

        /**
        * Executes the base64Decode handler step.
        * @returns {StringChain}
        */
        base64Decode(): StringChain;

        /**
        * Executes the base64Encode handler step.
        * @returns {StringChain}
        */
        base64Encode(): StringChain;

        /**
        * Executes the binary handler step.
        * @returns {StringChain}
        */
        binary(): StringChain;

        /**
        * Executes the bmp handler step.
        * @returns {StringChain}
        */
        bmp(): StringChain;

        /**
        * Executes the complex handler step.
        * @param {any} options
        * @returns {StringChain}
        */
        complex(options?: any): StringChain;

        /**
        * Executes the contains handler step.
        * @param {any} substring
        * @param {any} options
        * @returns {StringChain}
        */
        contains(substring: any, options?: any): StringChain;

        /**
        * Executes the creditCard handler step.
        * @param {any} options
        * @returns {StringChain}
        */
        creditCard(options?: any): StringChain;

        /**
        * Executes the currencyCode handler step.
        * @param {any} options
        * @returns {StringChain}
        */
        currencyCode(options?: any): StringChain;

        /**
        * Executes the dataUrl handler step.
        * @param {any} options
        * @returns {StringChain}
        */
        dataUrl(options?: any): StringChain;

        /**
        * Executes the digits handler step.
        * @returns {StringChain}
        */
        digits(): StringChain;

        /**
        * Executes the domain handler step.
        * @param {any} options
        * @returns {StringChain}
        */
        domain(options?: any): StringChain;

        /**
        * Executes the e164 handler step.
        * @param {any} options
        * @returns {StringChain}
        */
        e164(options?: any): StringChain;

        /**
        * Executes the email handler step.
        * @param {any} options
        * @returns {StringChain}
        */
        email(options?: any): StringChain;

        /**
        * Executes the empty handler step.
        * @returns {StringChain}
        */
        empty(): StringChain;

        /**
        * Executes the endsWith handler step.
        * @param {any} suffix
        * @param {any} options
        * @returns {StringChain}
        */
        endsWith(suffix: any, options?: any): StringChain;

        /**
        * Executes the excludesChars handler step.
        * @param {any} chars
        * @param {any} options
        * @returns {StringChain}
        */
        excludesChars(chars: any, options?: any): StringChain;

        /**
        * Executes the gtin handler step.
        * @param {any} options
        * @returns {StringChain}
        */
        gtin(options?: any): StringChain;

        /**
        * Executes the hash handler step.
        * @param {any} algorithm
        * @returns {StringChain}
        */
        hash(algorithm: any): StringChain;

        /**
        * Executes the hex handler step.
        * @param {any} options
        * @returns {StringChain}
        */
        hex(options?: any): StringChain;

        /**
        * Executes the hexColor handler step.
        * @param {any} options
        * @returns {StringChain}
        */
        hexColor(options?: any): StringChain;

        /**
        * Executes the imei handler step.
        * @param {any} options
        * @returns {StringChain}
        */
        imei(options?: any): StringChain;

        /**
        * Executes the ip handler step.
        * @param {any} options
        * @returns {StringChain}
        */
        ip(options?: any): StringChain;

        /**
        * Executes the ipCidr handler step.
        * @returns {StringChain}
        */
        ipCidr(): StringChain;

        /**
        * Executes the ipCidrV4 handler step.
        * @returns {StringChain}
        */
        ipCidrV4(): StringChain;

        /**
        * Executes the ipCidrV6 handler step.
        * @returns {StringChain}
        */
        ipCidrV6(): StringChain;

        /**
        * Executes the ipV4 handler step.
        * @param {any} options
        * @returns {StringChain}
        */
        ipV4(options?: any): StringChain;

        /**
        * Executes the ipV6 handler step.
        * @param {any} options
        * @returns {StringChain}
        */
        ipV6(options?: any): StringChain;

        /**
        * Executes the json handler step.
        * @returns {StringChain}
        */
        json(): StringChain;

        /**
        * Executes the jwt handler step.
        * @returns {StringChain}
        */
        jwt(): StringChain;

        /**
        * Executes the label handler step.
        * @param {any} options
        * @returns {StringChain}
        */
        label(options?: any): StringChain;

        /**
        * Executes the lengthBetween handler step.
        * @param {any} min
        * @param {any} max
        * @returns {StringChain}
        */
        lengthBetween(min: any, max: any): StringChain;

        /**
        * Executes the lowerCase handler step.
        * @returns {StringChain}
        */
        lowerCase(): StringChain;

        /**
        * Executes the luhn handler step.
        * @returns {StringChain}
        */
        luhn(): StringChain;

        /**
        * Executes the mac handler step.
        * @param {any} options
        * @returns {StringChain}
        */
        mac(options?: any): StringChain;

        /**
        * Executes the matches handler step.
        * @param {any} regex
        * @returns {StringChain}
        */
        matches(regex: any): StringChain;

        /**
        * Executes the maxLength handler step.
        * @param {any} max
        * @returns {StringChain}
        */
        maxLength(max: any): StringChain;

        /**
        * Executes the maxWords handler step.
        * @param {any} max
        * @param {any} allowedDelims
        * @returns {StringChain}
        */
        maxWords(max: any, allowedDelims?: any): StringChain;

        /**
        * Executes the measurement handler step.
        * @param {any} options
        * @returns {StringChain}
        */
        measurement(options?: any): StringChain;

        /**
        * Executes the minLength handler step.
        * @param {any} min
        * @returns {StringChain}
        */
        minLength(min: any): StringChain;

        /**
        * Executes the minWords handler step.
        * @param {any} min
        * @param {any} allowedDelims
        * @returns {StringChain}
        */
        minWords(min: any, allowedDelims?: any): StringChain;

        /**
        * Executes the money handler step.
        * @param {any} options
        * @returns {StringChain}
        */
        money(options?: any): StringChain;

        /**
        * Executes the notEmpty handler step.
        * @returns {StringChain}
        */
        notEmpty(): StringChain;

        /**
        * Executes the numeric handler step.
        * @param {any} options
        * @returns {StringChain}
        */
        numeric(options?: any): StringChain;

        /**
        * Executes the octal handler step.
        * @returns {StringChain}
        */
        octal(): StringChain;

        /**
        * Executes the onlyChars handler step.
        * @param {any} chars
        * @param {any} options
        * @returns {StringChain}
        */
        onlyChars(chars: any, options?: any): StringChain;

        /**
        * Executes the path handler step.
        * @param {any} options
        * @returns {StringChain}
        */
        path(options?: any): StringChain;

        /**
        * Executes the phone handler step.
        * @param {any} options
        * @returns {StringChain}
        */
        phone(options?: any): StringChain;

        /**
        * Executes the repetition handler step.
        * @param {any} fragment
        * @param {any} options
        * @returns {StringChain}
        */
        repetition(fragment: any, options?: any): StringChain;

        /**
        * Executes the slug handler step.
        * @returns {StringChain}
        */
        slug(): StringChain;

        /**
        * Executes the ssn handler step.
        * @param {any} options
        * @returns {StringChain}
        */
        ssn(options?: any): StringChain;

        /**
        * Executes the startsWith handler step.
        * @param {any} prefix
        * @param {any} options
        * @returns {StringChain}
        */
        startsWith(prefix: any, options?: any): StringChain;

        /**
        * Executes the state handler step.
        * @param {any} options
        * @returns {StringChain}
        */
        state(options?: any): StringChain;

        /**
        * Executes the upperCase handler step.
        * @returns {StringChain}
        */
        upperCase(): StringChain;

        /**
        * Executes the url handler step.
        * @param {any} options
        * @returns {StringChain}
        */
        url(options?: any): StringChain;

        /**
        * Executes the uuid handler step.
        * @param {any} version
        * @returns {StringChain}
        */
        uuid(version: any): StringChain;

        /**
        * Executes the wordCount handler step.
        * @param {any} min
        * @param {any} max
        * @param {any} allowedDelims
        * @returns {StringChain}
        */
        wordCount(min: any, max: any, allowedDelims?: any): StringChain;

        /**
        * Executes the zip handler step.
        * @param {any} options
        * @returns {StringChain}
        */
        zip(options?: any): StringChain;

        /**
        * Executes the collapseRepeats handler step.
        * @param {any} char
        * @returns {StringChain}
        */
        collapseRepeats(char: any): StringChain;

        /**
        * Executes the collapseSpacing handler step.
        * @returns {StringChain}
        */
        collapseSpacing(): StringChain;

        /**
        * Executes the escapeHtml handler step.
        * @returns {StringChain}
        */
        escapeHtml(): StringChain;

        /**
        * Executes the hexDecode handler step.
        * @returns {StringChain}
        */
        hexDecode(): StringChain;

        /**
        * Executes the hexEncode handler step.
        * @returns {StringChain}
        */
        hexEncode(): StringChain;

        /**
        * Executes the normalizeLineBreaks handler step.
        * @param {any} lineBreak
        * @returns {StringChain}
        */
        normalizeLineBreaks(lineBreak?: any): StringChain;

        /**
        * Executes the normalizeUnicode handler step.
        * @param {any} type
        * @returns {StringChain}
        */
        normalizeUnicode(type?: any): StringChain;

        /**
        * Executes the padLeft handler step.
        * @param {any} length
        * @param {any} char
        * @returns {StringChain}
        */
        padLeft(length: any, char: any): StringChain;

        /**
        * Executes the padRight handler step.
        * @param {any} length
        * @param {any} char
        * @returns {StringChain}
        */
        padRight(length: any, char: any): StringChain;

        /**
        * Executes the removeSpacing handler step.
        * @returns {StringChain}
        */
        removeSpacing(): StringChain;

        /**
        * Executes the slice handler step.
        * @param {any} startIndex
        * @param {any} endIndex
        * @returns {StringChain}
        */
        slice(startIndex: any, endIndex: any): StringChain;

        /**
        * Executes the sliceFirst handler step.
        * @param {any} count
        * @returns {StringChain}
        */
        sliceFirst(count?: any): StringChain;

        /**
        * Executes the sliceLast handler step.
        * @param {any} count
        * @returns {StringChain}
        */
        sliceLast(count?: any): StringChain;

        /**
        * Executes the stripHtml handler step.
        * @returns {StringChain}
        */
        stripHtml(): StringChain;

        /**
        * Executes the toCamelCase handler step.
        * @param {any} allowedDelims
        * @returns {StringChain}
        */
        toCamelCase(allowedDelims?: any): StringChain;

        /**
        * Executes the toDelimited handler step.
        * @param {any} options
        * @returns {StringChain}
        */
        toDelimited(options?: any): StringChain;

        /**
        * Executes the toKebabCase handler step.
        * @param {any} allowedDelims
        * @returns {StringChain}
        */
        toKebabCase(allowedDelims?: any): StringChain;

        /**
        * Executes the toLowerCase handler step.
        * @returns {StringChain}
        */
        toLowerCase(): StringChain;

        /**
        * Executes the toPascalCase handler step.
        * @param {any} allowedDelims
        * @returns {StringChain}
        */
        toPascalCase(allowedDelims?: any): StringChain;

        /**
        * Executes the toSentenceCase handler step.
        * @param {any} allowedDelims
        * @returns {StringChain}
        */
        toSentenceCase(allowedDelims?: any): StringChain;

        /**
        * Executes the toSnakeCase handler step.
        * @param {any} allowedDelims
        * @returns {StringChain}
        */
        toSnakeCase(allowedDelims?: any): StringChain;

        /**
        * Executes the toTitleCase handler step.
        * @param {any} allowedDelims
        * @returns {StringChain}
        */
        toTitleCase(allowedDelims?: any): StringChain;

        /**
        * Executes the toUpperCase handler step.
        * @returns {StringChain}
        */
        toUpperCase(): StringChain;

        /**
        * Executes the trim handler step.
        * @param {any} chars
        * @returns {StringChain}
        */
        trim(chars?: any): StringChain;

        /**
        * Executes the trimLeft handler step.
        * @param {any} chars
        * @returns {StringChain}
        */
        trimLeft(chars?: any): StringChain;

        /**
        * Executes the trimRight handler step.
        * @param {any} chars
        * @returns {StringChain}
        */
        trimRight(chars?: any): StringChain;

        /**
        * Executes the urlDecode handler step.
        * @returns {StringChain}
        */
        urlDecode(): StringChain;

        /**
        * Executes the urlEncode handler step.
        * @returns {StringChain}
        */
        urlEncode(): StringChain;

}

declare module './StringChain.ts' {
    interface StringChain extends StringChainGeneratedMethods {}
}

declare module './StringChain.js' {
    interface StringChain extends StringChainGeneratedMethods {}
}

export { };
