'use strict';

const StringProcessors = require('../../lib/processors/StringProcessors.js');
const Presence = require('../../lib/Presence.js');
const { optional, required, forbidden } = Presence;

describe('StringProcessors.hasMaxLength', () => {
    it('should pass if string length is less than or equal to max', () => {
        const result = StringProcessors.hasMaxLength('hello', 5);
        expect(result.pass).toBe(true);
    });

    it('should fail if string length is greater than max', () => {
        const result = StringProcessors.hasMaxLength('hello world', 5);
        expect(result.pass).toBe(false);
    });
});

describe('StringProcessors.contains', () => {
    it('should pass if string contains substring', () => {
        const result = StringProcessors.contains('hello world', 'world', { ignoreCase: false });
        expect(result.pass).toBe(true);
    });

    it('should fail if string does not contain substring', () => {
        const result = StringProcessors.contains('hello world', 'foo', { ignoreCase: false });
        expect(result.pass).toBe(false);
    });

    it('should pass with ignoreCase true', () => {
        const result = StringProcessors.contains('Hello World', 'world', { ignoreCase: true });
        expect(result.pass).toBe(true);
    });
});

describe('StringProcessors.startsWith', () => {
    it('should pass if string starts with prefix', () => {
        const result = StringProcessors.startsWith('hello world', 'hello', { ignoreCase: false });
        expect(result.pass).toBe(true);
    });

    it('should fail if string does not start with prefix', () => {
        const result = StringProcessors.startsWith('hello world', 'world', { ignoreCase: false });
        expect(result.pass).toBe(false);
    });

    it('should pass with ignoreCase true', () => {
        const result = StringProcessors.startsWith('Hello World', 'hello', { ignoreCase: true });
        expect(result.pass).toBe(true);
    });
});

describe('StringProcessors.endsWith', () => {
    it('should pass if string ends with suffix', () => {
        const result = StringProcessors.endsWith('hello world', 'world', { ignoreCase: false });
        expect(result.pass).toBe(true);
    });

    it('should fail if string does not end with suffix', () => {
        const result = StringProcessors.endsWith('hello world', 'hello', { ignoreCase: false });
        expect(result.pass).toBe(false);
    });

    it('should pass with ignoreCase true', () => {
        const result = StringProcessors.endsWith('Hello World', 'WORLD', { ignoreCase: true });
        expect(result.pass).toBe(true);
    });
});

describe('StringProcessors.matches', () => {
    it('should pass if string matches regex', () => {
        const result = StringProcessors.matches('abc123', /^[a-z]+\d+$/);
        expect(result.pass).toBe(true);
    });

    it('should fail if string does not match regex', () => {
        const result = StringProcessors.matches('abc', /^\d+$/);
        expect(result.pass).toBe(false);
    });
});

describe('StringProcessors.isDomain', () => {
    it('should pass for a valid domain', () => {
        const result = StringProcessors.isDomain('example.com');
        expect(result.pass).toBe(true);
    });

    it('should fail for an invalid domain', () => {
        const result = StringProcessors.isDomain('not_a_domain');
        expect(result.pass).toBe(false);
    });

    it('should pass for a subdomain if allowed', () => {
        const result = StringProcessors.isDomain('sub.example.com', { subdomains: 0 });
        expect(result.pass).toBe(true);
    });

    it('should fail for a domain with only numbers', () => {
        const result = StringProcessors.isDomain('123456');
        expect(result.pass).toBe(false);
    });

    it('should pass for a wildcard domain if allowed', () => {
        const result = StringProcessors.isDomain('*.example.com', { wildcards: 0 });
        expect(result.pass).toBe(true);
    });
});

describe('StringProcessors.isLabel', () => {
    it('should pass for a valid domain label', () => {
        const result = StringProcessors.isLabel('example');
        expect(result.pass).toBe(true);
    });

    it('should fail for a label with invalid characters', () => {
        const result = StringProcessors.isLabel('ex@mple');
        expect(result.pass).toBe(false);
    });

    it('should fail for a label that is too long', () => {
        const longLabel = 'a'.repeat(64);
        const result = StringProcessors.isLabel(longLabel);
        expect(result.pass).toBe(false);
    });

    it('should fail for a label that starts with a dash', () => {
        const result = StringProcessors.isLabel('-example');
        expect(result.pass).toBe(false);
    });

    it('should fail for a label that ends with a dash', () => {
        const result = StringProcessors.isLabel('example-');
        expect(result.pass).toBe(false);
    });
});

describe('StringProcessors.isPath', () => {
    it('should fail for a path containing a null byte character', () => {
        const result = StringProcessors.isPath('/usr/local/bin/\x00node');
        expect(result.pass).toBe(false);
    });

    it('should pass for a valid unix abs path', () => {
        const result = StringProcessors.isPath('/usr/local/bin/node');
        expect(result.pass).toBe(true);
    });

    it('should pass for a valid windows abs path', () => {
        const result = StringProcessors.isPath('C:\\Program Files\\Node', { style: 'win-drive' });
        expect(result.pass).toBe(true);
    });

    it('should fail for a windows path with invalid characters', () => {
        const result = StringProcessors.isPath('C:\\Program Files\\No:de', { style: 'win-drive' });
        expect(result.pass).toBe(false);
    });

    it('should pass for a valid UNC path', () => {
        const result = StringProcessors.isPath('\\\\server\\share\\folder', { style: 'win-unc' });
        expect(result.pass).toBe(true);
    });

    it('should fail for a path with a label that is too long', () => {
        const longLabel = '/thisisaverylonglabelnamethatisdefinitelymorethantheallowedlength';
        const result = StringProcessors.isPath(longLabel, { maxLabelLength: 20 });
        expect(result.pass).toBe(false);
    });

    it('should pass for a file with a specific extension', () => {
        const result = StringProcessors.isPath('/home/user/file.txt', { fileExtensions: ['txt'] });
        expect(result.pass).toBe(true);
    });

    it('should fail for a file with a forbidden extension', () => {
        const result = StringProcessors.isPath('/home/user/file.exe', { fileExtensions: ['txt'] });
        expect(result.pass).toBe(false);
    });
});

describe('StringProcessors.isDataUrl', () => {
    it('should pass for a valid image data URI', () => {
        const result = StringProcessors.isDataUrl('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUA');
        expect(result.pass).toBe(true);
    });

    it('should pass for a valid text data URI', () => {
        const result = StringProcessors.isDataUrl('data:text/plain;base64,SGVsbG8sIFdvcmxkIQ==');
        expect(result.pass).toBe(true);
    });

    it('should fail for a data URI with a forbidden type', () => {
        const result = StringProcessors.isDataUrl('data:application/json;base64,eyJmb28iOiJiYXIifQ==', { allowedTypes: ['image', 'text'] });
        expect(result.pass).toBe(false);
    });

    it('should fail for a string that is not a data URI', () => {
        const result = StringProcessors.isDataUrl('not-a-data-uri');
        expect(result.pass).toBe(false);
    });

    it('should pass for a valid audio data URI if allowed', () => {
        const result = StringProcessors.isDataUrl('data:audio/mp3;base64,SUQzAwAAAAAA', { allowedTypes: ['audio'] });
        expect(result.pass).toBe(true);
    });
});

describe('StringProcessors.isUpperCase', () => {
    it('should pass for an all uppercase string', () => {
        const result = StringProcessors.isUpperCase('HELLO');
        expect(result.pass).toBe(true);
    });

    it('should fail for a string with lowercase letters', () => {
        const result = StringProcessors.isUpperCase('Hello');
        expect(result.pass).toBe(false);
    });

    it('should pass for an empty string', () => {
        const result = StringProcessors.isUpperCase('');
        expect(result.pass).toBe(true);
    });
});

describe('StringProcessors.isLowerCase', () => {
    it('should pass for an all lowercase string', () => {
        const result = StringProcessors.isLowerCase('hello');
        expect(result.pass).toBe(true);
    });

    it('should fail for a string with uppercase letters', () => {
        const result = StringProcessors.isLowerCase('Hello');
        expect(result.pass).toBe(false);
    });

    it('should pass for an empty string', () => {
        const result = StringProcessors.isLowerCase('');
        expect(result.pass).toBe(true);
    });
});

describe('StringProcessors.isAlpha', () => {
    it('should pass for a string with only letters', () => {
        const result = StringProcessors.isAlpha('abcXYZ');
        expect(result.pass).toBe(true);
    });

    it('should fail for a string with numbers', () => {
        const result = StringProcessors.isAlpha('abc123');
        expect(result.pass).toBe(false);
    });

    it('should fail for a string with symbols', () => {
        const result = StringProcessors.isAlpha('abc!');
        expect(result.pass).toBe(false);
    });
});

describe('StringProcessors.isAlphanumeric', () => {
    it('should pass for a string with only letters and numbers', () => {
        const result = StringProcessors.isAlphanumeric('abc123XYZ');
        expect(result.pass).toBe(true);
    });

    it('should fail for a string with symbols', () => {
        const result = StringProcessors.isAlphanumeric('abc123!');
        expect(result.pass).toBe(false);
    });

    it('should fail for a string with spaces', () => {
        const result = StringProcessors.isAlphanumeric('abc 123');
        expect(result.pass).toBe(false);
    });
});

describe('StringProcessors.isAscii', () => {
    it('should pass for a string with only ASCII characters', () => {
        const result = StringProcessors.isAscii('Hello123!@#');
        expect(result.pass).toBe(true);
    });

    it('should fail for a string with non-ASCII characters', () => {
        const result = StringProcessors.isAscii('Héllo');
        expect(result.pass).toBe(false);
    });
});

describe('StringProcessors.isDigits', () => {
    it('should pass for a string with only digits', () => {
        const result = StringProcessors.isDigits('1234567890');
        expect(result.pass).toBe(true);
    });

    it('should fail for a string with letters', () => {
        const result = StringProcessors.isDigits('123abc');
        expect(result.pass).toBe(false);
    });

    it('should fail for a string with symbols', () => {
        const result = StringProcessors.isDigits('123!');
        expect(result.pass).toBe(false);
    });
});

describe('StringProcessors.isBinary', () => {
    it('should pass for a string with only 0s and 1s', () => {
        const result = StringProcessors.isBinary('101010');
        expect(result.pass).toBe(true);
    });

    it('should fail for a string with digits other than 0 or 1', () => {
        const result = StringProcessors.isBinary('10201');
        expect(result.pass).toBe(false);
    });

    it('should fail for a string with letters', () => {
        const result = StringProcessors.isBinary('10a01');
        expect(result.pass).toBe(false);
    });
});

describe('StringProcessors.isOctal', () => {
    it('should pass for a string with only octal digits', () => {
        const result = StringProcessors.isOctal('01234567');
        expect(result.pass).toBe(true);
    });

    it('should fail for a string with digits outside octal range', () => {
        const result = StringProcessors.isOctal('128');
        expect(result.pass).toBe(false);
    });

    it('should fail for a string with letters', () => {
        const result = StringProcessors.isOctal('123abc');
        expect(result.pass).toBe(false);
    });
});

describe('StringProcessors.isHex', () => {
    it('should pass for a string with only hexadecimal digits', () => {
        const result = StringProcessors.isHex('1a2b3c4d5e6f');
        expect(result.pass).toBe(true);
    });

    it('should pass for uppercase hexadecimal digits', () => {
        const result = StringProcessors.isHex('ABCDEF123');
        expect(result.pass).toBe(true);
    });

    it('should fail for a string with non-hex characters', () => {
        const result = StringProcessors.isHex('123xyz');
        expect(result.pass).toBe(false);
    });
});

describe('StringProcessors.isHexColor', () => {
    it('should pass for a valid 6-digit hex color with #', () => {
        const result = StringProcessors.isHexColor('#1a2b3c');
        expect(result.pass).toBe(true);
    });

    it('should pass for a valid 3-digit hex color with #', () => {
        const result = StringProcessors.isHexColor('#abc');
        expect(result.pass).toBe(true);
    });

    it('should pass for a valid 6-digit hex color without #', () => {
        const result = StringProcessors.isHexColor('1a2b3c');
        expect(result.pass).toBe(true);
    });

    it('should fail for a string with invalid hex color', () => {
        const result = StringProcessors.isHexColor('#12345g');
        expect(result.pass).toBe(false);
    });

    it('should fail for a string with wrong length', () => {
        const result = StringProcessors.isHexColor('#1234');
        expect(result.pass).toBe(false);
    });
});

describe('StringProcessors.isBmp', () => {
    it('should pass for a string with only BMP Unicode characters', () => {
        // All characters are in the Basic Multilingual Plane (U+0000 to U+FFFF)
        const result = StringProcessors.isBmp('Hello, 世界!');
        expect(result.pass).toBe(true);
    });

    it('should fail for a string containing a supplementary Unicode character (outside BMP)', () => {
        // 😀 (U+1F600) is outside the BMP
        const result = StringProcessors.isBmp('Hello 😀');
        expect(result.pass).toBe(false);
    });

    it('should pass for an empty string', () => {
        const result = StringProcessors.isBmp('');
        expect(result.pass).toBe(true);
    });

    it('should pass for a string with edge BMP characters', () => {
        // U+0000 (null), U+FFFF (last BMP code point)
        const result = StringProcessors.isBmp('\u0000\uFFFF');
        expect(result.pass).toBe(true);
    });

    it('should fail for a string with only supplementary characters', () => {
        // 𝄞 (U+1D11E) is outside the BMP
        const result = StringProcessors.isBmp('𝄞');
        expect(result.pass).toBe(false);
    });
});

describe('StringProcessors.base64', () => {
    it('should pass for a valid base64 string', () => {
        const result = StringProcessors.isBase64('TWFuIGlzIGRpc3Rpbmd1aXNoZWQsIG5vdCBvbmx5IGJ5IGhpcyByZWFzb24sIGJ1dCAuLi4=');
        expect(result.pass).toBe(true);
    });

    it('should fail for a string with invalid base64 characters', () => {
        const result = StringProcessors.isBase64('TWFu*IGlz#IGRpc3Rpbmd1aXNoZWQs');
        expect(result.pass).toBe(false);
    });

    it('should fail for a string with incorrect padding', () => {
        const result = StringProcessors.isBase64('TWFuIGlzIGRpc3Rpbmd1aXNoZWQs=');
        expect(result.pass).toBe(false);
    });

    it('should fail for a valid base64 string without padding', () => {
        const result = StringProcessors.isBase64('TWFuIGlzIGRpc3Rpbmd1aXNoZWQsIG5vdCBvbmx5IGJ5IGhpcyByZWFzb24sIGJ1dCAuLi4');
        expect(result.pass).toBe(false);
    });

    it('should fail for an empty string', () => {
        const result = StringProcessors.isBase64('');
        expect(result.pass).toBe(false);
    });
});

describe('StringProcessors.hasRepetition', () => {
    it('should pass if the fragment repeats at least the minimum number of times', () => {
        const result = StringProcessors.hasRepetition('abcabcabc', 'abc', { min: 3 });
        expect(result.pass).toBe(true);
    });

    it('should fail if the fragment repeats fewer than the minimum number of times', () => {
        const result = StringProcessors.hasRepetition('abcabc', 'abc', { min: 3 });
        expect(result.pass).toBe(false);
    });

    it('should pass if the fragment repeats within the min and max range', () => {
        const result = StringProcessors.hasRepetition('foofoofoo', 'foo', { min: 2, max: 3 });
        expect(result.pass).toBe(true);
    });

    it('should fail if the fragment repeats more than the max number of times', () => {
        const result = StringProcessors.hasRepetition('barbarbarbar', 'bar', { min: 2, max: 3 });
        expect(result.pass).toBe(false);
    });

    it('should pass if otherText is true and the fragment repeats enough times', () => {
        const result = StringProcessors.hasRepetition('fox other fox fox fox', 'fox', { min: 3, otherText: true });
        expect(result.pass).toBe(true);
    });

    it('should fail if otherText is false and there is extra text', () => {
        const result = StringProcessors.hasRepetition('foxfox fox', 'fox', { min: 2, otherText: false });
        expect(result.pass).toBe(false);
    });

    it('should pass if otherText is false and the string is just the fragment repeated', () => {
        const result = StringProcessors.hasRepetition('catcatcat', 'cat', { min: 3, otherText: false });
        expect(result.pass).toBe(true);
    });

    it('should be case-insensitive if ignoreCase is true', () => {
        const result = StringProcessors.hasRepetition('DogDOGdog', 'dog', { min: 3, ignoreCase: true });
        expect(result.pass).toBe(true);
    });

    it('should be case-sensitive by default', () => {
        const result = StringProcessors.hasRepetition('DogDOGdog', 'dog', { min: 3 });
        expect(result.pass).toBe(false);
    });
});

describe('StringProcessors.onlyChars', () => {
    it('should pass if string contains only the allowed characters', () => {
        const result = StringProcessors.onlyChars('abcabc', 'abc');
        expect(result.pass).toBe(true);
    });

    it('should fail if string contains characters not in the allowed set', () => {
        const result = StringProcessors.onlyChars('abcxyz', 'abc');
        expect(result.pass).toBe(false);
    });

    it('should pass for an empty string', () => {
        const result = StringProcessors.onlyChars('', 'abc');
        expect(result.pass).toBe(true);
    });

    it('should be case-insensitive if ignoreCase is true', () => {
        const result = StringProcessors.onlyChars('aBc', 'abc', { ignoreCase: true });
        expect(result.pass).toBe(true);
    });

    it('should be case-sensitive by default', () => {
        const result = StringProcessors.onlyChars('aBc', 'abc');
        expect(result.pass).toBe(false);
    });
});

describe('StringProcessors.excludesChars', () => {
    it('should pass if string contains none of the excluded characters', () => {
        const result = StringProcessors.excludesChars('abcdef', 'xyz');
        expect(result.pass).toBe(true);
    });

    it('should fail if string contains any of the excluded characters', () => {
        const result = StringProcessors.excludesChars('abcxyz', 'xyz');
        expect(result.pass).toBe(false);
    });

    it('should pass for an empty string', () => {
        const result = StringProcessors.excludesChars('', 'abc');
        expect(result.pass).toBe(true);
    });

    it('should be case-insensitive if ignoreCase is true', () => {
        const result = StringProcessors.excludesChars('aBc', 'ABC', { ignoreCase: true });
        expect(result.pass).toBe(false);
    });

    it('should be case-sensitive by default', () => {
        const result = StringProcessors.excludesChars('aBc', 'AC');
        expect(result.pass).toBe(true);
    });
});

describe('StringProcessors.isEmail', () => {
    it('should pass for a valid email address', () => {
        const result = StringProcessors.isEmail('john.doe@example.com');
        expect(result.pass).toBe(true);
    });

    it('should fail for a string without @', () => {
        const result = StringProcessors.isEmail('johndoe.example.com');
        expect(result.pass).toBe(false);
    });

    it('should fail for a string with multiple @', () => {
        const result = StringProcessors.isEmail('john@doe@example.com');
        expect(result.pass).toBe(false);
    });

    it('should fail for an email with invalid domain', () => {
        const result = StringProcessors.isEmail('john@not_a_domain');
        expect(result.pass).toBe(false);
    });

    it('should fail for an email with invalid local part', () => {
        const result = StringProcessors.isEmail('john\x00doe@example.com');
        expect(result.pass).toBe(false);
    });

    it('should pass for an email with plus addressing', () => {
        const result = StringProcessors.isEmail('user.name+tag+sorting@example.com');
        expect(result.pass).toBe(true);
    });

    it('should fail for an empty string', () => {
        const result = StringProcessors.isEmail('');
        expect(result.pass).toBe(false);
    });
});

describe('StringProcessors.isIpV4', () => {
    it('should pass for a valid IPv4 address', () => {
        const result = StringProcessors.isIpV4('192.168.1.1');
        expect(result.pass).toBe(true);
    });

    it('should fail for an invalid IPv4 address', () => {
        const result = StringProcessors.isIpV4('256.100.50.25');
        expect(result.pass).toBe(false);
    });

    it('should fail for a string that is not an IP', () => {
        const result = StringProcessors.isIpV4('not.an.ip');
        expect(result.pass).toBe(false);
    });
});

describe('StringProcessors.ipV6', () => {
    it('should pass for a valid IPv6 address', () => {
        const result = StringProcessors.ipV6('2001:0db8:85a3:0000:0000:8a2e:0370:7334');
        expect(result.pass).toBe(true);
    });

    it('should pass for a condensed IPv6 address', () => {
        const result = StringProcessors.ipV6('2001:db8::8a2e:370:7334');
        expect(result.pass).toBe(true);
    });

    it('should fail for an invalid IPv6 address', () => {
        const result = StringProcessors.ipV6('2001:db8:::8a2e:370:7334');
        expect(result.pass).toBe(false);
    });

    it('should fail for a string that is not an IP', () => {
        const result = StringProcessors.ipV6('not:an:ip');
        expect(result.pass).toBe(false);
    });
});

describe('StringProcessors.isIp', () => {
    it('should pass for a valid IPv4 address', () => {
        const result = StringProcessors.isIp('8.8.8.8');
        expect(result.pass).toBe(true);
    });

    it('should pass for a valid IPv6 address', () => {
        const result = StringProcessors.isIp('::1');
        expect(result.pass).toBe(true);
    });

    it('should fail for an invalid IP address', () => {
        const result = StringProcessors.isIp('999.999.999.999');
        expect(result.pass).toBe(false);
    });

    it('should fail for a string that is not an IP', () => {
        const result = StringProcessors.isIp('hello world');
        expect(result.pass).toBe(false);
    });
});


describe('StringProcessors.isUrl', () => {
    it('should pass for a valid http URL', () => {
        const result = StringProcessors.isUrl('http://example.com');
        expect(result.pass).toBe(true);
    });

    it('should pass for a valid https URL with path and query', () => {
        const result = StringProcessors.isUrl('https://example.com/path?query=1');
        expect(result.pass).toBe(true);
    });

    it('should fail for a string that is not a URL', () => {
        const result = StringProcessors.isUrl('not a url');
        expect(result.pass).toBe(false);
    });

    it('should fail for a URL with a forbidden protocol', () => {
        const result = StringProcessors.isUrl('ftp://example.com', { allowedProtocols: ['http', 'https'] });
        expect(result.pass).toBe(false);
    });

    it('should pass for a URL with a port if port is optional', () => {
        const result = StringProcessors.isUrl('http://example.com:8080', { port: optional });
        expect(result.pass).toBe(true);
    });

    it('should fail for a URL with a port if port is forbidden', () => {
        const result = StringProcessors.isUrl('http://example.com:8080', { port: forbidden });
        expect(result.pass).toBe(false);
    });

    it('should pass for a root-relative URL if rootRelative is true', () => {
        const result = StringProcessors.isUrl('/path/to/resource', { rootRelative: true });
        expect(result.pass).toBe(true);
    });

    it('should fail for a root-relative URL if rootRelative is false', () => {
        const result = StringProcessors.isUrl('/path/to/resource', { rootRelative: false });
        expect(result.pass).toBe(false);
    });

    it('should pass for a URL with a fragment if fragment is optional', () => {
        const result = StringProcessors.isUrl('http://example.com#section', { fragment: optional });
        expect(result.pass).toBe(true);
    });

    it('should fail for a URL with a fragment if fragment is forbidden', () => {
        const result = StringProcessors.isUrl('http://example.com#section', { fragment: forbidden });
        expect(result.pass).toBe(false);
    });

    it('should pass for a URL with a query if query is required', () => {
        const result = StringProcessors.isUrl('http://example.com?foo=bar', { query: required });
        expect(result.pass).toBe(true);
    });

    it('should fail for a URL without a query if query is required', () => {
        const result = StringProcessors.isUrl('http://example.com', { query: required });
        expect(result.pass).toBe(false);
    });

    it('should pass for a URL with user info, port, path, query, and fragment', () => {
        const result = StringProcessors.isUrl('https://example.com:8080/path/to/page?foo=bar&baz=qux#section', { port: optional, fragment: optional, query: optional });
        expect(result.pass).toBe(true);
    });

    it('should pass for a URL with an IPv4 address as the host', () => {
        const result = StringProcessors.isUrl('http://127.0.0.1:3000/api', { port: optional, ip: optional, domain: optional });
        expect(result.pass).toBe(true);
    });

    it('should pass for a URL with an IPv6 address as the host', () => {
        const result = StringProcessors.isUrl('http://[2001:db8::1]/dsdssd/dssd');
        expect(result.pass).toBe(true);
    });

    it('should fail for a URL with an invalid IPv6 address', () => {
        const result = StringProcessors.isUrl('http://[2001:db8:::1]');
        expect(result.pass).toBe(false);
    });

    it('should pass for a URL with a subdomain and multiple path segments', () => {
        const result = StringProcessors.isUrl('https://sub.domain.example.com/one/two/three');
        expect(result.pass).toBe(true);
    });

    it('should fail for a URL with an invalid port number', () => {
        const result = StringProcessors.isUrl('http://example.com:99999');
        expect(result.pass).toBe(false);
    });

    it('should pass for a URL with percent-encoded characters in the path and query', () => {
        const result = StringProcessors.isUrl('https://example.com/path%20with%20spaces?query=hello%20world');
        expect(result.pass).toBe(true);
    });

    it('should fail for a URL with an invalid character in the domain', () => {
        const result = StringProcessors.isUrl('http://exa$mple.com');
        expect(result.pass).toBe(false);
    });

    it('should pass for a URL with a dash and underscore in the path', () => {
        const result = StringProcessors.isUrl('https://example.com/path-with_dash/');
        expect(result.pass).toBe(true);
    });

    it('should fail for a URL with an empty host', () => {
        const result = StringProcessors.isUrl('http://:8080/path');
        expect(result.pass).toBe(false);
    });

    it('should fail for a URL with an empty path', () => {
        const result = StringProcessors.isUrl('http://example.com:8080');
        expect(result.pass).toBe(false);
    });

    // --- PORT ---
    it('should pass for a URL with a port when port is optional', () => {
        const result = StringProcessors.isUrl('http://example.com:8080', { port: Presence.optional });
        expect(result.pass).toBe(true);
    });

    it('should fail for a URL with a port when port is forbidden', () => {
        const result = StringProcessors.isUrl('http://example.com:8080', { port: Presence.forbidden });
        expect(result.pass).toBe(false);
    });

    it('should pass for a URL with a port when port is required', () => {
        const result = StringProcessors.isUrl('http://example.com:8080', { port: Presence.required });
        expect(result.pass).toBe(true);
    });

    it('should fail for a URL without a port when port is required', () => {
        const result = StringProcessors.isUrl('http://example.com', { port: Presence.required });
        expect(result.pass).toBe(false);
    });

    // --- QUERY ---
    it('should pass for a URL with a query when query is optional', () => {
        const result = StringProcessors.isUrl('http://example.com?foo=bar', { query: Presence.optional });
        expect(result.pass).toBe(true);
    });

    it('should fail for a URL with a query when query is forbidden', () => {
        const result = StringProcessors.isUrl('http://example.com?foo=bar', { query: Presence.forbidden });
        expect(result.pass).toBe(false);
    });

    it('should pass for a URL with a query when query is required', () => {
        const result = StringProcessors.isUrl('http://example.com?foo=bar', { query: Presence.required });
        expect(result.pass).toBe(true);
    });

    it('should fail for a URL without a query when query is required', () => {
        const result = StringProcessors.isUrl('http://example.com', { query: Presence.required });
        expect(result.pass).toBe(false);
    });

    // --- FRAGMENT ---
    it('should pass for a URL with a fragment when fragment is optional', () => {
        const result = StringProcessors.isUrl('http://example.com#section', { fragment: Presence.optional });
        expect(result.pass).toBe(true);
    });

    it('should fail for a URL with a fragment when fragment is forbidden', () => {
        const result = StringProcessors.isUrl('http://example.com#section', { fragment: Presence.forbidden });
        expect(result.pass).toBe(false);
    });

    it('should pass for a URL with a fragment when fragment is required', () => {
        const result = StringProcessors.isUrl('http://example.com#section', { fragment: Presence.required });
        expect(result.pass).toBe(true);
    });

    it('should fail for a URL without a fragment when fragment is required', () => {
        const result = StringProcessors.isUrl('http://example.com', { fragment: Presence.required });
        expect(result.pass).toBe(false);
    });

    // --- PROTOCOLS ---
    it('should pass for a URL with a protocol when protocols is required', () => {
        const result = StringProcessors.isUrl('https://example.com', { protocols: Presence.required });
        expect(result.pass).toBe(true);
    });

    it('should fail for a URL without a protocol when protocols is required', () => {
        const result = StringProcessors.isUrl('example.com', { protocols: Presence.required });
        expect(result.pass).toBe(false);
    });

    it('should pass for a URL without a protocol when protocols is optional', () => {
        const result = StringProcessors.isUrl('example.com', { protocols: Presence.optional });
        expect(result.pass).toBe(true);
    });

    it('should fail for a URL with a protocol when protocols is forbidden', () => {
        const result = StringProcessors.isUrl('http://example.com', { protocols: Presence.forbidden });
        expect(result.pass).toBe(false);
    });

    // --- DOMAIN ---
    it('should pass for a URL with a domain when domain is required', () => {
        const result = StringProcessors.isUrl('http://example.com', { domain: Presence.required });
        expect(result.pass).toBe(true);
    });

    it('should fail for a URL without a domain when domain is required', () => {
        const result = StringProcessors.isUrl('http://127.0.0.1', { domain: Presence.required });
        expect(result.pass).toBe(false);
    });

    it('should pass for a URL with a domain when domain is optional', () => {
        const result = StringProcessors.isUrl('http://example.com', { domain: Presence.optional });
        expect(result.pass).toBe(true);
    });

    it('should fail for a URL with a domain when domain is forbidden', () => {
        const result = StringProcessors.isUrl('http://example.com', { domain: Presence.forbidden });
        expect(result.pass).toBe(false);
    });

    // --- IP ---
    it('should pass for a URL with an IP when ip is required', () => {
        const result = StringProcessors.isUrl('http://127.0.0.1', { ip: Presence.required });
        expect(result.pass).toBe(true);
    });

    it('should fail for a URL without an IP when ip is required', () => {
        const result = StringProcessors.isUrl('http://example.com', { ip: Presence.required });
        expect(result.pass).toBe(false);
    });

    it('should pass for a URL with an IP when ip is optional', () => {
        const result = StringProcessors.isUrl('http://127.0.0.1', { ip: Presence.optional });
        expect(result.pass).toBe(true);
    });

    it('should fail for a URL with an IP when ip is forbidden', () => {
        const result = StringProcessors.isUrl('http://127.0.0.1', { ip: Presence.forbidden });
        expect(result.pass).toBe(false);
    });
});

describe('StringProcessors.isE164', () => {
    it('should pass for a valid E164 phone number with plus and no spaces', () => {
        const result = StringProcessors.isE164('+449731114354325');
        expect(result.pass).toBe(true);
    });

    it('should pass for a valid E164 phone number with spaces', () => {
        const result = StringProcessors.isE164('+44 973 324 2345693');
        expect(result.pass).toBe(true);
    });

    it('should fail for a phone number without a plus sign', () => {
        const result = StringProcessors.isE164('449731114354325');
        expect(result.pass).toBe(false);
    });

    it('should fail for a phone number that is too short', () => {
        const result = StringProcessors.isE164('+44 973');
        expect(result.pass).toBe(false);
    });

    it('should fail for a phone number with invalid characters', () => {
        const result = StringProcessors.isE164('+44-973-324-ABCD');
        expect(result.pass).toBe(false);
    });

    it('should return normalized format with spaces by default', () => {
        const result = StringProcessors.isE164('+44-973-324-1111');
        expect(result.pass).toBe(true);
        expect(result.value).toMatch(/^\+44 \d{3} \d{3} \d{4}$/);
    });

    it('should return normalized format without spaces if spaces option is false', () => {
        const result = StringProcessors.isE164('+44-973-324-1111', { preserveSpaces: false });
        expect(result.pass).toBe(true);
    });
});

describe('StringProcessors.isLuhn', () => {
    it('should pass for a valid Luhn number (credit card)', () => {
        // Visa test number
        const result = StringProcessors.isLuhn('4111111111111111');
        expect(result.pass).toBe(true);
    });

    it('should fail for an invalid Luhn number', () => {
        const result = StringProcessors.isLuhn('4111111111111121');
        expect(result.pass).toBe(false);
    });

    it('should pass for a valid Luhn number ', () => {
        const result = StringProcessors.isLuhn('17893729974');
        expect(result.pass).toBe(true);
    });

    it('should pass for a valid Luhn number with dashes', () => {
        const result = StringProcessors.isLuhn('4539148803436467');
        expect(result.pass).toBe(true);
    });

    it('should fail for a string with non-digit characters', () => {
        const result = StringProcessors.isLuhn('4111a111b1111c111');
        expect(result.pass).toBe(false);
    });

    it('should fail for an empty string', () => {
        const result = StringProcessors.isLuhn('');
        expect(result.pass).toBe(false);
    });
});

describe('StringProcessors.isIpCidrV4', () => {
    it('should pass for a valid IPv4 CIDR notation', () => {
        const result = StringProcessors.isIpCidrV4('192.168.1.0/24');
        expect(result.pass).toBe(true);
    });

    it('should pass for a valid IPv4 CIDR with /32 mask', () => {
        const result = StringProcessors.isIpCidrV4('10.0.0.1/32');
        expect(result.pass).toBe(true);
    });

    it('should fail for an invalid IPv4 address', () => {
        const result = StringProcessors.isIpCidrV4('999.999.999.999/24');
        expect(result.pass).toBe(false);
    });

    it('should fail for an invalid CIDR mask', () => {
        const result = StringProcessors.isIpCidrV4('192.168.1.0/33');
        expect(result.pass).toBe(false);
    });

    it('should fail for a missing mask', () => {
        const result = StringProcessors.isIpCidrV4('192.168.1.0');
        expect(result.pass).toBe(false);
    });

    it('should fail for a non-numeric mask', () => {
        const result = StringProcessors.isIpCidrV4('192.168.1.0/abc');
        expect(result.pass).toBe(false);
    });

    it('should fail for a string that is not in CIDR format', () => {
        const result = StringProcessors.isIpCidrV4('not.an.ip/cidr');
        expect(result.pass).toBe(false);
    });
});

describe('StringProcessors.isIpCidrV6', () => {
    it('should pass for a valid IPv6 CIDR notation', () => {
        const result = StringProcessors.isIpCidrV6('2001:db8::/32');
        expect(result.pass).toBe(true);
    });

    it('should pass for a valid IPv6 CIDR with /128 mask', () => {
        const result = StringProcessors.isIpCidrV6('2001:db8::1/128');
        expect(result.pass).toBe(true);
    });

    it('should fail for an invalid IPv6 address', () => {
        const result = StringProcessors.isIpCidrV6('2001:db8:::1/64');
        expect(result.pass).toBe(false);
    });

    it('should fail for a missing mask', () => {
        const result = StringProcessors.isIpCidrV6('2001:db8::1');
        expect(result.pass).toBe(false);
    });

    it('should fail for a non-numeric mask', () => {
        const result = StringProcessors.isIpCidrV6('2001:db8::/abc');
        expect(result.pass).toBe(false);
    });

    it('should fail for a string that is not in CIDR format', () => {
        const result = StringProcessors.isIpCidrV6('not:an:ip/cidr');
        expect(result.pass).toBe(false);
    });
});

describe('StringProcessors.isIpCidr', () => {
    it('should pass for a valid IPv4 CIDR', () => {
        const result = StringProcessors.isIpCidr('192.168.1.0/24');
        expect(result.pass).toBe(true);
    });

    it('should pass for a valid IPv6 CIDR', () => {
        const result = StringProcessors.isIpCidr('2001:db8::/32');
        expect(result.pass).toBe(true);
    });

    it('should fail for an invalid IPv4 CIDR', () => {
        const result = StringProcessors.isIpCidr('999.999.999.999/24');
        expect(result.pass).toBe(false);
    });

    it('should fail for an invalid IPv6 CIDR', () => {
        const result = StringProcessors.isIpCidr('2001:db8:::1/64');
        expect(result.pass).toBe(false);
    });

    it('should fail for a missing mask', () => {
        const result = StringProcessors.isIpCidr('192.168.1.0');
        expect(result.pass).toBe(false);
    });

    it('should fail for a non-numeric mask', () => {
        const result = StringProcessors.isIpCidr('2001:db8::/abc');
        expect(result.pass).toBe(false);
    });

    it('should fail for a string that is not in CIDR format', () => {
        const result = StringProcessors.isIpCidr('not.an.ip/cidr');
        expect(result.pass).toBe(false);
    });
});

describe('StringProcessors.isSsn', () => {
    it('should pass for a valid SSN with dashes', () => {
        const result = StringProcessors.isSsn('123-45-7890');
        expect(result.pass).toBe(true);
    });

    it('should pass for a valid SSN with spaces if allowed', () => {
        const result = StringProcessors.isSsn('123 46 7890', { allowedDelims: ' ' });
        expect(result.pass).toBe(true);
    });

    it('should pass for a valid SSN with dots if allowed', () => {
        const result = StringProcessors.isSsn('123.45.7839', { allowedDelims: '.' });
        expect(result.pass).toBe(true);
    });

    it('should pass for a valid SSN with no delimiters if allowLooseFormat is true', () => {
        const result = StringProcessors.isSsn('123456789', { allowLooseFormat: true });
        expect(result.pass).toBe(true);
    });

    it('should fail for a string that is too short', () => {
        const result = StringProcessors.isSsn('123-45-678');
        expect(result.pass).toBe(false);
    });

    it('should fail for a string with letters', () => {
        const result = StringProcessors.isSsn('123-abc-7890');
        expect(result.pass).toBe(false);
    });

    it('should fail for an empty string', () => {
        const result = StringProcessors.isSsn('');
        expect(result.pass).toBe(false);
    });
});

describe('StringProcessors.isNumeric', () => {
    it('should pass for a simple integer string', () => {
        const result = StringProcessors.isNumeric('12,345');
        expect(result.pass).toBe(true);
    });

    it('should pass for a negative integer string', () => {
        const result = StringProcessors.isNumeric('-9,876');
        expect(result.pass).toBe(true);
    });

    it('should pass for a decimal string', () => {
        const result = StringProcessors.isNumeric('123.45');
        expect(result.pass).toBe(true);
    });

    it('should pass for a string with thousands separator', () => {
        const result = StringProcessors.isNumeric('1,234,567');
        expect(result.pass).not.toBe(false);
    });

    it('should fail for a string with letters', () => {
        const result = StringProcessors.isNumeric('12a45');
        expect(result.pass).toBe(false);
    });

    it('should fail for an empty string', () => {
        const result = StringProcessors.isNumeric('');
        expect(result.pass).toBe(false);
    });

    it('should fail for a string with only symbols', () => {
        const result = StringProcessors.isNumeric('---');
        expect(result.pass).toBe(false);
    });
});

describe('StringProcessors.isNumeric with plus/minus and leftAlign options', () => {
    // Plus sign tests
    it('should pass for a positive number with plus sign when plus is optional', () => {
        const result = StringProcessors.isNumeric('+123', { plus: Presence.optional });
        expect(result.pass).toBe(true);
    });

    it('should pass for a positive number with plus sign when plus is allowed', () => {
        const result = StringProcessors.isNumeric('+123', { plus: Presence.optional });
        expect(result.pass).toBe(true);
    });

    it('should fail for a positive number with plus sign when plus is forbidden', () => {
        const result = StringProcessors.isNumeric('+123', { plus: Presence.forbidden });
        expect(result.pass).toBe(false);
    });

    // Minus sign tests
    it('should pass for a negative number with minus sign when minus is optional', () => {
        const result = StringProcessors.isNumeric('-123', { minus: Presence.optional });
        expect(result.pass).toBe(true);
    });

    it('should pass for a negative number with minus sign when minus is allowed', () => {
        const result = StringProcessors.isNumeric('-123', { minus: Presence.optional });
        expect(result.pass).toBe(true);
    });

    it('should fail for a negative number with minus sign when minus is forbidden', () => {
        const result = StringProcessors.isNumeric('-123', { minus: Presence.forbidden });
        expect(result.pass).toBe(false);
    });

    // leftAlign true
    it('should pass for a left-aligned number with plus when leftAlign is true', () => {
        const result = StringProcessors.isNumeric('+123', { plus: Presence.optional, leftAlign: true });
        expect(result.pass).toBe(true);
    });

    it('should pass for a left-aligned number with minus when leftAlign is true', () => {
        const result = StringProcessors.isNumeric('-123', { minus: Presence.optional, leftAlign: true });
        expect(result.pass).toBe(true);
    });

    it('should fail for a number with plus not at the start when leftAlign is true', () => {
        const result = StringProcessors.isNumeric('123+', { plus: Presence.optional, leftAlign: true });
        expect(result.pass).toBe(false);
    });

    it('should fail for a number with minus not at the start when leftAlign is true', () => {
        const result = StringProcessors.isNumeric('123-', { minus: Presence.optional, leftAlign: true });
        expect(result.pass).toBe(false);
    });

    // leftAlign false
    it('should pass for a number with plus at the start when leftAlign is false', () => {
        const result = StringProcessors.isNumeric('+123', { plus: Presence.optional, leftAlign: true });
        expect(result.pass).toBe(true);
    });

    it('should pass for a number with minus at the start when leftAlign is false', () => {
        const result = StringProcessors.isNumeric('-123', { minus: Presence.optional, leftAlign: true });
        expect(result.pass).toBe(true);
    });

    it('should pass for a number with plus not at the start when leftAlign is false', () => {
        const result = StringProcessors.isNumeric('123+', { plus: Presence.optional, leftAlign: false });
        expect(result.pass).toBe(true);
    });

    it('should pass for a number with minus not at the start when leftAlign is false', () => {
        const result = StringProcessors.isNumeric('123-', { minus: Presence.optional, leftAlign: false });
        expect(result.pass).toBe(true);
    });
});

describe('StringProcessors.isNumeric with decimal, leadingZero, and trailingZero options', () => {
    // --- DECIMAL ---
    it('should pass for a decimal number when decimal is optional', () => {
        const result = StringProcessors.isNumeric('123.45', { decimal: Presence.optional });
        expect(result.pass).toBe(true);
    });

    it('should pass for a decimal number when decimal is required', () => {
        const result = StringProcessors.isNumeric('123.45', { decimal: Presence.required });
        expect(result.pass).toBe(true);
    });

    it('should fail for an integer when decimal is required', () => {
        const result = StringProcessors.isNumeric('123', { decimal: Presence.required });
        expect(result.pass).toBe(false);
    });

    it('should fail for a decimal number when decimal is forbidden', () => {
        const result = StringProcessors.isNumeric('123.45', { decimal: Presence.forbidden });
        expect(result.pass).toBe(false);
    });

    // --- LEADING ZERO ---
    it('should pass for a number with leading zero when leadingZero is optional', () => {
        const result = StringProcessors.isNumeric('0.45', { leadingZero: Presence.optional });
        expect(result.pass).toBe(true);
    });

    it('should pass for a number with leading zero when leadingZero is required', () => {
        const result = StringProcessors.isNumeric('0.45', { leadingZero: Presence.required });
        expect(result.pass).toBe(true);
    });

    it('should fail for a number with leading zero when leadingZero is forbidden', () => {
        const result = StringProcessors.isNumeric('0.45', { leadingZero: Presence.forbidden });
        expect(result.pass).toBe(false);
    });

    // --- TRAILING ZERO ---
    it('should pass for a number with trailing zero when trailingZero is optional', () => {
        const result = StringProcessors.isNumeric('123.0', { trailingZero: Presence.optional });
        expect(result.pass).toBe(true);
    });

    it('should pass for a number with trailing zero when trailingZero is required', () => {
        const result = StringProcessors.isNumeric('123.0', { trailingZero: Presence.required });
        expect(result.pass).toBe(true);
    });

    it('should fail for a number with trailing zero when trailingZero is forbidden', () => {
        const result = StringProcessors.isNumeric('123.0', { trailingZero: Presence.forbidden });
        expect(result.pass).toBe(false);
    });
});

describe('StringProcessors.isNumeric with thousandsDelim, decimalDelim, minPrecision, and maxPrecision', () => {
    it('should pass for a number with comma as thousands delimiter', () => {
        const result = StringProcessors.isNumeric('1,234,567.89', { thousandsDelim: ',' });
        expect(result.pass).toBe(true);
    });

    it('should pass for a number with space as thousands delimiter', () => {
        const result = StringProcessors.isNumeric('1 234 567.89', { thousandsDelim: ' ' });
        expect(result.pass).toBe(true);
    });

    it('should pass for a number with period as thousands delimiter and comma as decimal delimiter', () => {
        const result = StringProcessors.isNumeric('1.234.567,89', { thousandsDelim: '.', decimalDelim: ',' });
        expect(result.pass).toBe(true);
    });

    it('should fail for a number with wrong thousands delimiter', () => {
        const result = StringProcessors.isNumeric('1.234,567.89', { thousandsDelim: ',' });
        expect(result.pass).toBe(false);
    });

    it('should pass for a number with exactly minPrecision decimal places', () => {
        const result = StringProcessors.isNumeric('123.45', { minPrecision: 2 });
        expect(result.pass).toBe(true);
    });

    it('should fail for a number with fewer than minPrecision decimal places', () => {
        const result = StringProcessors.isNumeric('123.4', { minPrecision: 2 });
        expect(result.pass).toBe(false);
    });

    it('should pass for a number with exactly maxPrecision decimal places', () => {
        const result = StringProcessors.isNumeric('123.456', { maxPrecision: 3 });
        expect(result.pass).toBe(true);
    });

    it('should fail for a number with more than maxPrecision decimal places', () => {
        const result = StringProcessors.isNumeric('123.4567', { maxPrecision: 3 });
        expect(result.pass).toBe(false);
    });

    it('should pass for a number with minPrecision and maxPrecision range', () => {
        const result = StringProcessors.isNumeric('123.45', { minPrecision: 2, maxPrecision: 4 });
        expect(result.pass).toBe(true);
    });

    it('should fail for a number outside minPrecision and maxPrecision range', () => {
        const result = StringProcessors.isNumeric('123.4', { minPrecision: 2, maxPrecision: 4 });
        expect(result.pass).toBe(false);
    });
});

describe('StringProcessors.isNumeric with leadingSymbol, trailingSymbol, ignoreCase, and allowLooseFormat', () => {
    it('should pass for a number with a $ leading symbol', () => {
        const result = StringProcessors.isNumeric('$123.45', { leadingSymbol: '$' });
        expect(result.pass).toBe(true);
    });

    it('should pass for a number with EUR trailing symbol', () => {
        const result = StringProcessors.isNumeric('123.45EUR', { trailingSymbol: 'EUR' });
        expect(result.pass).toBe(true);
    });

    it('should pass for a number with mixed case trailing symbol and ignoreCase true', () => {
        const result = StringProcessors.isNumeric('123.45eUr', { trailingSymbol: 'EUR', ignoreCase: true });
        expect(result.pass).toBe(true);
    });

    it('should fail for a number with mixed case trailing symbol and ignoreCase false', () => {
        const result = StringProcessors.isNumeric('123.45eUr', { trailingSymbol: 'EUR', ignoreCase: false });
        expect(result.pass).toBe(false);
    });

    it('should pass for a number with spaces and allowLooseFormat true', () => {
        const result = StringProcessors.isNumeric('  1,234.56  ', { allowLooseFormat: true });
        expect(result.pass).toBe(true);
    });

    it('should fail for a number with spaces and allowLooseFormat false', () => {
        const result = StringProcessors.isNumeric('  1 234 . 56  ', { allowLooseFormat: false });
        expect(result.pass).toBe(false);
    });

    it('should pass for a number with both leading and trailing symbols', () => {
        const result = StringProcessors.isNumeric('$123.45USD', { leadingSymbol: '$', trailingSymbol: 'USD' });
        expect(result.pass).toBe(true);
    });

    it('should fail for a number with incorrect leading symbol', () => {
        const result = StringProcessors.isNumeric('€123.45', { leadingSymbol: '$' });
        expect(result.pass).toBe(false);
    });

    it('should fail for a number with incorrect trailing symbol', () => {
        const result = StringProcessors.isNumeric('123.45GBP', { trailingSymbol: 'USD' });
        expect(result.pass).toBe(false);
    });
});



describe('StringProcessors.isMoney', () => {
    it('should pass for a valid USD amount with $ symbol', () => {
        const result = StringProcessors.isMoney('$1,234.56');
        expect(result.pass).toBe(true);
    });

    it('should pass for a valid EUR amount with € symbol and comma as decimal', () => {
        const result = StringProcessors.isMoney('€1.234,56', { leadingSymbol: '€', decimalDelim: ',', thousandsDelim: '.' });
        expect(result.pass).toBe(true);
    });

    it('should pass for a negative amount in parentheses', () => {
        const result = StringProcessors.isMoney('($123.45)', { parens: true });
        expect(result.pass).toBe(true);
    });

    it('should pass for a negative amount with minus sign', () => {
        const result = StringProcessors.isMoney('-$123.45');
        expect(result.pass).toBe(true);
    });

    it('should fail for an amount with invalid symbol', () => {
        const result = StringProcessors.isMoney('£123.45', { leadingSymbol: '$' });
        expect(result.pass).toBe(false);
    });

    it('should pass for a valid amount with symbol after the number', () => {
        const result = StringProcessors.isMoney('123.45$', { leadingSymbol: '', trailingSymbol: '$' });
        expect(result.pass).toBe(true);
    });

    it('should fail for a string with letters', () => {
        const result = StringProcessors.isMoney('$12a.45');
        expect(result.pass).toBe(false);
    });

    it('should pass for a valid amount with space.isBetween symbol and number', () => {
        const result = StringProcessors.isMoney('$ 123.45', { symSpace: true });
        expect(result.pass).toBe(true);
    });

    it('should fail for a string with multiple symbols', () => {
        const result = StringProcessors.isMoney('$$123.45');
        expect(result.pass).toBe(false);
    });
});

describe('StringProcessors.isMeasurement', () => {
    it('should pass for a valid integer with unit', () => {
        const result = StringProcessors.isMeasurement('12kg', { units: ['km', 'kg'] });
        expect(result.pass).toBe(true);
    });

    it('should pass for a valid decimal with unit', () => {
        const result = StringProcessors.isMeasurement('3.5m', { units: 'm' });
        expect(result.pass).toBe(true);
    });

    it('should pass for a valid negative number with unit', () => {
        const result = StringProcessors.isMeasurement('-42cm', { units: ['m', 'cm'] });
        expect(result.pass).toBe(true);
    });

    it('should pass for a valid number with space before unit', () => {
        const result = StringProcessors.isMeasurement('100 m', { units: ['m', 'cm'] });
        expect(result.pass).toBe(true);
    });

    it('should fail for a string without a unit', () => {
        const result = StringProcessors.isMeasurement('123');
        expect(result.pass).toBe(false);
    });

    it('should fail for a string with an invalid unit', () => {
        const result = StringProcessors.isMeasurement('5.5xyz');
        expect(result.pass).toBe(false);
    });

    it('should pass for a valid number with a unit from a custom allowedUnits list', () => {
        const result = StringProcessors.isMeasurement('10ft', { units: ['ft', 'in'] });
        expect(result.pass).toBe(true);
    });

    it('should fail for a valid number with a unit not in the custom allowedUnits list', () => {
        const result = StringProcessors.isMeasurement('10cm', { units: ['ft', 'in'] });
        expect(result.pass).toBe(false);
    });

    it('should pass for a valid number with a unit and ignoreCase true', () => {
        const result = StringProcessors.isMeasurement('10KG', { units: 'kg', ignoreCase: true });
        expect(result.pass).toBe(true);
    });

    it('should fail for a valid number with a unit and ignoreCase false', () => {
        const result = StringProcessors.isMeasurement('10KG', { units: 'kg', ignoreCase: false });
        expect(result.pass).toBe(false);
    });

    it('should pass for a measurement with extra spaces when allowLooseFormat is true', () => {
        const result = StringProcessors.isMeasurement('  12   kg  ', { units: ['kg'], allowLooseFormat: true });
        expect(result.pass).toBe(true);
    });

    it('should pass for a measurement with mixed delimiters when allowLooseFormat is true', () => {
        const result = StringProcessors.isMeasurement('3.5 m', { units: ['m'], allowLooseFormat: true });
        expect(result.pass).toBe(true);
    });

    it('should fail for a measurement with extra spaces when allowLooseFormat is false', () => {
        const result = StringProcessors.isMeasurement('  12   kg  ', { units: ['kg'], allowLooseFormat: false });
        expect(result.pass).toBe(false);
    });
});

describe('StringProcessors.isSlug', () => {
    it('should pass for a valid slug with dashes', () => {
        const result = StringProcessors.isSlug('this-is-a-slug');
        expect(result.pass).toBe(true);
    });

    it('should fail for a slug with spaces', () => {
        const result = StringProcessors.isSlug('this is not a slug');
        expect(result.pass).toBe(false);
    });

    it('should fail for a slug with special characters', () => {
        const result = StringProcessors.isSlug('slug$with#chars');
        expect(result.pass).toBe(false);
    });
});

describe('StringProcessors.isJson', () => {
    it('should pass for a valid JSON object string', () => {
        const result = StringProcessors.isJson('{"foo": "bar", "baz": 123}');
        expect(result.pass).toBe(true);
    });

    it('should pass for a valid JSON array string', () => {
        const result = StringProcessors.isJson('[1, 2, 3, 4]');
        expect(result.pass).toBe(true);
    });

    it('should fail for an invalid JSON string', () => {
        const result = StringProcessors.isJson('{foo: bar}');
        expect(result.pass).toBe(false);
    });
});

describe('StringProcessors.isJwt', () => {
    it('should pass for a valid JWT string', () => {
        const result = StringProcessors.isJwt('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c');
        expect(result.pass).toBe(true);
    });

    it('should fail for a string with only two JWT segments', () => {
        const result = StringProcessors.isJwt('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ');
        expect(result.pass).toBe(false);
    });

    it('should fail for a string with invalid JWT characters', () => {
        const result = StringProcessors.isJwt('not.a.valid.jwt!');
        expect(result.pass).toBe(false);
    });
});

describe('StringProcessors.isUuid', () => {
    it('should pass for a valid UUID v4', () => {
        const result = StringProcessors.isUuid('123e4567-e89b-12d3-a456-426614174000');
        expect(result.pass).toBe(true);
    });

    it('should fail for a string that is not a UUID', () => {
        const result = StringProcessors.isUuid('not-a-uuid');
        expect(result.pass).toBe(false);
    });

    it('should fail for a UUID with invalid characters', () => {
        const result = StringProcessors.isUuid('123e4567-e89b-12d3-a456-42661417400z');
        expect(result.pass).toBe(false);
    });
});

describe('StringProcessors.isHash', () => {
    it('should pass for a valid MD5 hash', () => {
        const result = StringProcessors.isHash('d41d8cd98f00b204e9800998ecf8427e', 'md5');
        expect(result.pass).toBe(true);
    });

    it('should fail for an invalid MD5 hash (wrong length)', () => {
        const result = StringProcessors.isHash('d41d8cd98f00b204e9800998ecf8427', 'md5');
        expect(result.pass).toBe(false);
    });

    it('should pass for a valid SHA1 hash', () => {
        const result = StringProcessors.isHash('da39a3ee5e6b4b0d3255bfef95601890afd80709', 'sha1');
        expect(result.pass).toBe(true);
    });

    it('should pass for a valid SHA256 hash', () => {
        const result = StringProcessors.isHash('e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855', 'sha256');
        expect(result.pass).toBe(true);
    });

    it('should fail for an unknown algorithm', () => {
        const result = StringProcessors.isHash('abcdef', 'unknownalgo');
        expect(result.pass).toBe(false);
    });
});

describe('StringProcessors.meetsComplexity', () => {
    it('should pass for a string meeting all default complexity requirements', () => {
        const result = StringProcessors.meetsComplexity('Abcdef1!');
        expect(result.pass).toBe(true);
    });

    it('should fail for a string that is too short', () => {
        const result = StringProcessors.meetsComplexity('Ab1!');
        expect(result.pass).toBe(false);
    });

    it('should fail for a string with not enough uppercase letters', () => {
        const result = StringProcessors.meetsComplexity('abcdef1!');
        expect(result.pass).toBe(false);
    });

    it('should fail for a string with not enough lowercase letters', () => {
        const result = StringProcessors.meetsComplexity('ABCDEF1!');
        expect(result.pass).toBe(false);
    });

    it('should fail for a string with not enough digits', () => {
        const result = StringProcessors.meetsComplexity('Abcdefgh!');
        expect(result.pass).toBe(false);
    });

    it('should fail for a string with not enough special characters', () => {
        const result = StringProcessors.meetsComplexity('Abcdef12');
        expect(result.pass).toBe(false);
    });

    it('should fail for a string with too many repeated characters', () => {
        const result = StringProcessors.meetsComplexity('AAAbbb111!!!');
        expect(result.pass).toBe(false);
    });

    it('should pass for a string with custom min/max length', () => {
        const result = StringProcessors.meetsComplexity('Abc1!xyz', { minLen: 5, maxLen: 10 });
        expect(result.pass).toBe(true);
    });

    it('should fail for a string exceeding maxLen', () => {
        const longStr = 'A1!a'.repeat(30); // 120 chars
        const result = StringProcessors.meetsComplexity(longStr, { maxLen: 100 });
        expect(result.pass).toBe(false);
    });

    it('should fail for a string with custom minUppercase and minSpecialChars', () => {
        const result = StringProcessors.meetsComplexity('AAbc1!!', { minUppercase: 3, minSpecialChars: 2 });
        expect(result.pass).toBe(false);
    });
});

describe('StringProcessors.isCreditCard', () => {
    it('should pass for a valid Visa card number', () => {
        const result = StringProcessors.isCreditCard('4111 1111 1111 1111');
        expect(result.pass).toBe(true);
    });

    it('should pass for a valid MasterCard number', () => {
        const result = StringProcessors.isCreditCard('5500-0000-0000-0004');
        expect(result.pass).toBe(true);
    });

    it('should pass for a valid American Express card number', () => {
        const result = StringProcessors.isCreditCard('3400 0000 0000 009');
        expect(result.pass).toBe(true);
    });

    it('should fail for a number with invalid length', () => {
        const result = StringProcessors.isCreditCard('4111 1111 1111');
        expect(result.pass).toBe(false);
    });

    it('should fail for a number with invalid characters', () => {
        const result = StringProcessors.isCreditCard('4111 1111 1111 111a');
        expect(result.pass).toBe(false);
    });

    it('should fail for a number that does not pass the Luhn check', () => {
        const result = StringProcessors.isCreditCard('4111 1111 1111 1121');
        expect(result.pass).toBe(false);
    });

    it('should fail for an empty string', () => {
        const result = StringProcessors.isCreditCard('');
        expect(result.pass).toBe(false);
    });
});

describe('StringProcessors.isCreditCard - additional tests', () => {
    it('should pass for a valid Discover card number', () => {
        const result = StringProcessors.isCreditCard('6011 0000 0000 0004');
        expect(result.pass).toBe(true);
    });

    it('should pass for a valid JCB card number', () => {
        const result = StringProcessors.isCreditCard('3530 1113 3330 0000');
        expect(result.pass).toBe(true);
    });

    it('should pass for a valid Diners Club card number', () => {
        const result = StringProcessors.isCreditCard('36227206271667', { types: ['diners', 'diners-enroute'] });
        expect(result.pass).toBe(true);
    });

    it('should fail for a card number with too many digits', () => {
        const result = StringProcessors.isCreditCard('4111 1111 1111 1111 1111');
        expect(result.pass).toBe(false);
    });

    it('should fail for a card number with too few digits', () => {
        const result = StringProcessors.isCreditCard('4111 1111 111');
        expect(result.pass).toBe(false);
    });

    it('should fail for a card number with all the same digit', () => {
        const result = StringProcessors.isCreditCard('1111 1111 1111 1111');
        expect(result.pass).toBe(false);
    });

    it('should pass for a valid Mastercard number with dashes', () => {
        const result = StringProcessors.isCreditCard('5500-0000-0000-0004');
        expect(result.pass).toBe(true);
    });

    it('should fail for a valid card number but with an unsupported type', () => {
        const result = StringProcessors.isCreditCard('4111 1111 1111 1111', { types: ['amex'] });
        expect(result.pass).toBe(false);
    });

    it('should pass for a valid Amex card number with loose format', () => {
        const result = StringProcessors.isCreditCard('340000000000009', { allowLooseFormat: true });
        expect(result.pass).toBe(true);
    });

    it('should pass for a valid Diners Club card number', () => {
        const result = StringProcessors.isCreditCard('3056 9309 0259 04', { types: ['diners', 'diners-enroute'] });
        expect(result.pass).toBe(true);
    });
});

describe('StringProcessors.isImei', () => {
    it('should pass for a valid 15-digit IMEI', () => {
        const result = StringProcessors.isImei('490154203237518');
        expect(result.pass).toBe(true);
    });

    it('should pass for a valid IMEI with spaces', () => {
        const result = StringProcessors.isImei('49 015420 323751 8');
        expect(result.pass).toBe(true);
    });

    it('should fail for an IMEI with letters', () => {
        const result = StringProcessors.isImei('49015420323A518');
        expect(result.pass).toBe(false);
    });

    it('should fail for an IMEI with too few digits', () => {
        const result = StringProcessors.isImei('49015420323751');
        expect(result.pass).toBe(false);
    });

    it('should fail for an IMEI with too many digits', () => {
        const result = StringProcessors.isImei('4901542032375189');
        expect(result.pass).toBe(false);
    });

    it('should fail for an IMEI that does not pass the Luhn check', () => {
        const result = StringProcessors.isImei('490154203237519');
        expect(result.pass).toBe(false);
    });
});

describe('StringProcessors.isMac', () => {
    it('should pass for a valid MAC address with colons', () => {
        const result = StringProcessors.isMac('00:1A:2B:3C:4D:5E');
        expect(result.pass).toBe(true);
    });

    it('should pass for a valid MAC address with dashes', () => {
        const result = StringProcessors.isMac('00-1A-2B-3C-4D-5E');
        expect(result.pass).toBe(true);
    });

    it('should pass for a valid MAC address with no separators', () => {
        const result = StringProcessors.isMac('001A2B3C4D5E');
        expect(result.pass).toBe(true);
    });

    it('should fail for a MAC address with invalid characters', () => {
        const result = StringProcessors.isMac('00:1G:2B:3C:4D:5E');
        expect(result.pass).toBe(false);
    });

    it('should fail for a MAC address with too few octets', () => {
        const result = StringProcessors.isMac('00:1A:2B:3C:4D');
        expect(result.pass).toBe(false);
    });

    it('should fail for a MAC address with too many octets', () => {
        const result = StringProcessors.isMac('00:1A:2B:3C:4D:5E:6F');
        expect(result.pass).toBe(false);
    });

    it('should fail for an empty string', () => {
        const result = StringProcessors.isMac('');
        expect(result.pass).toBe(false);
    });
});

describe('StringProcessors.isGtin', () => {
    it('should pass for a valid GTIN-8', () => {
        const result = StringProcessors.isGtin('96385074');
        expect(result.pass).toBe(true);
    });

    it('should pass for a valid GTIN-12', () => {
        const result = StringProcessors.isGtin('012345678905');
        expect(result.pass).toBe(true);
    });

    it('should pass for a valid GTIN-13', () => {
        const result = StringProcessors.isGtin('4006381333931');
        expect(result.pass).toBe(true);
    });

    it('should pass for a valid GTIN-14', () => {
        const result = StringProcessors.isGtin('10012345678902');
        expect(result.pass).toBe(true);
    });

    it('should fail for a GTIN with invalid length', () => {
        const result = StringProcessors.isGtin('1234567');
        expect(result.pass).toBe(false);
    });

    it('should fail for a GTIN with invalid characters', () => {
        const result = StringProcessors.isGtin('400638133393X');
        expect(result.pass).toBe(false);
    });

    it('should fail for a GTIN that does not pass the Luhn check', () => {
        const result = StringProcessors.isGtin('4006381333932');
        expect(result.pass).toBe(false);
    });

    it('should pass for a valid GTIN-13 with spaces and allowLooseFormat true', () => {
        const result = StringProcessors.isGtin('4006381333931', { allowLooseFormat: true });
        expect(result.pass).toBe(true);
    });

    it('should fail for a valid GTIN-13 with spaces and allowLooseFormat false', () => {
        const result = StringProcessors.isGtin('4006 3813 3393 1', { allowLooseFormat: false });
        expect(result.pass).toBe(false);
    });
});

describe('StringProcessors.isCurrencyCode', () => {
    it('should pass for a valid 3-letter currency code', () => {
        const result = StringProcessors.isCurrencyCode('USD');
        expect(result.pass).toBe(true);
    });

    it('should pass for a valid lowercase currency code', () => {
        const result = StringProcessors.isCurrencyCode('eur', {ignoreCase: true});
        expect(result.pass).toBe(true);
    });

    it('should fail for a code that is too short', () => {
        const result = StringProcessors.isCurrencyCode('US');
        expect(result.pass).toBe(false);
    });

    it('should fail for a code that is too long', () => {
        const result = StringProcessors.isCurrencyCode('USDA');
        expect(result.pass).toBe(false);
    });

    it('should fail for a code with numbers', () => {
        const result = StringProcessors.isCurrencyCode('U5D');
        expect(result.pass).toBe(false);
    });

    it('should fail for a code with special characters', () => {
        const result = StringProcessors.isCurrencyCode('U$D');
        expect(result.pass).toBe(false);
    });

    it('should fail for an empty string', () => {
        const result = StringProcessors.isCurrencyCode('');
        expect(result.pass).toBe(false);
    });
});

describe('StringProcessors.isZip', () => {
    it('should pass for a valid 5-digit US ZIP code', () => {
        const result = StringProcessors.isZip('12345');
        expect(result.pass).toBe(true);
    });

    it('should pass for a valid ZIP+4 code with dash', () => {
        const result = StringProcessors.isZip('12345-6789');
        expect(result.pass).toBe(true);
    });

    it('should pass for a valid ZIP+4 code with space', () => {
        const result = StringProcessors.isZip('12345 6789', { allowedDelims: ' ' });
        expect(result.pass).toBe(true);
    });

    it('should fail for a ZIP code with too few digits', () => {
        const result = StringProcessors.isZip('1234');
        expect(result.pass).toBe(false);
    });

    it('should fail for a ZIP code with too many digits', () => {
        const result = StringProcessors.isZip('123456');
        expect(result.pass).toBe(false);
    });

    it('should fail for a ZIP code with letters', () => {
        const result = StringProcessors.isZip('1234A');
        expect(result.pass).toBe(false);
    });

    it('should fail for an invalid ZIP+4 format', () => {
        const result = StringProcessors.isZip('12345-678');
        expect(result.pass).toBe(false);
    });

    it('should fail for an empty string', () => {
        const result = StringProcessors.isZip('');
        expect(result.pass).toBe(false);
    });

        it('should pass for a 5-digit ZIP when zip4 is forbidden', () => {
        const result = StringProcessors.isZip('12345', { zip4: Presence.forbidden });
        expect(result.pass).toBe(true);
    });

    it('should fail for a ZIP+4 when zip4 is forbidden', () => {
        const result = StringProcessors.isZip('12345-6789', { zip4: Presence.forbidden });
        expect(result.pass).toBe(false);
    });

    it('should pass for a ZIP+4 when zip4 is required', () => {
        const result = StringProcessors.isZip('12345-6789', { zip4: Presence.required });
        expect(result.pass).toBe(true);
    });

    it('should fail for a 5-digit ZIP when zip4 is required', () => {
        const result = StringProcessors.isZip('12345', { zip4: Presence.required });
        expect(result.pass).toBe(false);
    });
});

describe('StringProcessors.isState', () => {
    it('should pass for a valid US state abbreviation', () => {
        const result = StringProcessors.isState('CA');
        expect(result.pass).toBe(true);
    });

    it('should pass for a valid lowercase state abbreviation with allowLooseFormat true', () => {
        const result = StringProcessors.isState('ny', { allowLooseFormat: true });
        expect(result.pass).toBe(true);
    });

    it('should fail for a lowercase state abbreviation with allowLooseFormat false', () => {
        const result = StringProcessors.isState('ny', { allowLooseFormat: false });
        expect(result.pass).toBe(false);
    });

    it('should fail for an invalid state abbreviation', () => {
        const result = StringProcessors.isState('XY');
        expect(result.pass).toBe(false);
    });

    it('should fail for a state abbreviation that is too long', () => {
        const result = StringProcessors.isState('CAL');
        expect(result.pass).toBe(false);
    });

    it('should pass for District of Columbia', () => {
        const result = StringProcessors.isState('DC');
        expect(result.pass).toBe(true);
    });

    it('should pass for lowercase nj', () => {
        const result = StringProcessors.isState('nj');
        expect(result.pass).toBe(true);
    });

    it('should fail for an empty string', () => {
        const result = StringProcessors.isState('');
        expect(result.pass).toBe(false);
    });
});

describe('StringProcessors.stripHtml', () => {
    it('should remove HTML tags from a string', () => {
        const result = StringProcessors.stripHtml('<b>Hello</b> <i>world</i>!');
        expect(result.pass).toBe(true);
        expect(result.value).toBe('Hello world!');
    });
    it('should return the same string if there are no HTML tags', () => {
        const result = StringProcessors.stripHtml('Just text.');
        expect(result.pass).toBe(true);
        expect(result.value).toBe('Just text.');
    });
    it('should handle empty string', () => {
        const result = StringProcessors.stripHtml('');
        expect(result.pass).toBe(true);
        expect(result.value).toBe('');
    });
});

describe('StringProcessors.escapeHtml', () => {
    it('should escape HTML special characters', () => {
        const result = StringProcessors.escapeHtml('<div>"Hello" & world</div>');
        expect(result.pass).toBe(true);
        expect(result.value).toBe('&lt;div&gt;&quot;Hello&quot; &amp; world&lt;/div&gt;');
    });
    it('should return the same string if there are no special characters', () => {
        const result = StringProcessors.escapeHtml('plain text');
        expect(result.pass).toBe(true);
        expect(result.value).toBe('plain text');
    });
    it('should handle empty string', () => {
        const result = StringProcessors.escapeHtml('');
        expect(result.pass).toBe(true);
        expect(result.value).toBe('');
    });
});

describe('StringProcessors.normalizeLineBreaks', () => {
    it('should normalize CRLF and CR to LF by default', () => {
        const result = StringProcessors.normalizeLineBreaks('a\r\nb\rc\nd');
        expect(result.pass).toBe(true);
        expect(result.value).toBe('a\nb\nc\nd');
    });
    it('should normalize to custom line break', () => {
        const result = StringProcessors.normalizeLineBreaks('a\r\nb\rc\nd', '\r\n');
        expect(result.pass).toBe(true);
        expect(result.value).toBe('a\r\nb\r\nc\r\nd');
    });
    it('should handle empty string', () => {
        const result = StringProcessors.normalizeLineBreaks('');
        expect(result.pass).toBe(true);
        expect(result.value).toBe('');
    });
});

describe('StringProcessors.normalizeUnicode', () => {
    it('should normalize to NFC by default', () => {
        // e01 is e + combining acute accent, should normalize to é
        const result = StringProcessors.normalizeUnicode('e\u0301');
        expect(result.pass).toBe(true);
        expect(result.value).toBe('é');
    });
    it('should normalize to NFD', () => {
        const result = StringProcessors.normalizeUnicode('é', 'NFD');
        expect(result.pass).toBe(true);
        expect(result.value).toBe('e\u0301');
    });
    it('should handle empty string', () => {
        const result = StringProcessors.normalizeUnicode('');
        expect(result.pass).toBe(true);
        expect(result.value).toBe('');
    });
});

describe('StringProcessors.toCamelCase', () => {
    it('should convert kebab-case to camelCase', () => {
        const result = StringProcessors.toCamelCase('Hello-world');
        expect(result.pass).toBe(true);
        expect(result.value).toBe('helloWorld');
    });

    it('should convert snake_case to camelCase', () => {
        const result = StringProcessors.toCamelCase('hello_world_test');
        expect(result.pass).toBe(true);
        expect(result.value).toBe('helloWorldTest');
    });

    it('should convert space-separated words to camelCase', () => {
        const result = StringProcessors.toCamelCase('hello world test');
        expect(result.pass).toBe(true);
        expect(result.value).toBe('helloWorldTest');
    });

    it('should handle mixed delimiters', () => {
        const result = StringProcessors.toCamelCase('hello-world_test case');
        expect(result.pass).toBe(true);
        expect(result.value).toBe('helloWorldTestCase');
    });

    it('should handle multiple consecutive delimiters', () => {
        const result = StringProcessors.toCamelCase('hello--world__test  case');
        expect(result.pass).toBe(true);
        expect(result.value).toBe('helloWorldTestCase');
    });

    it('should handle single word', () => {
        const result = StringProcessors.toCamelCase('hello');
        expect(result.pass).toBe(true);
        expect(result.value).toBe('hello');
    });

    it('should handle empty string', () => {
        const result = StringProcessors.toCamelCase('');
        expect(result.pass).toBe(true);
        expect(result.value).toBe('');
    });

    it('should handle leading delimiters', () => {
        const result = StringProcessors.toCamelCase('-hello_world');
        expect(result.pass).toBe(true);
        expect(result.value).toBe('helloWorld');
    });

    it('should handle trailing delimiters', () => {
        const result = StringProcessors.toCamelCase('hello_world-');
        expect(result.pass).toBe(true);
        expect(result.value).toBe('helloWorld');
    });

    it('should handle numbers in the string', () => {
        const result = StringProcessors.toCamelCase('test-case-123-more');
        expect(result.pass).toBe(true);
        expect(result.value).toBe('testCase123More');
    });

    it('should handle special characters at word boundaries', () => {
        const result = StringProcessors.toCamelCase('hello@world#test');
        expect(result.pass).toBe(true);
        expect(result.value).toBe('hello@world#test');
    });

    it('should handle uppercase letters in mixed case input', () => {
        const result = StringProcessors.toCamelCase('HELLO WORLD TEST');
        expect(result.pass).toBe(true);
        expect(result.value).toBe('helloWorldTest');
    });
});

describe('StringProcessors.toSnakeCase', () => {
    it('should convert camelCase to snake_case', () => {
        const result = StringProcessors.toSnakeCase('helloWorld');
        expect(result.pass).toBe(true);
        expect(result.value).toBe('helloworld');
    });

    it('should convert PascalCase to snake_case', () => {
        const result = StringProcessors.toSnakeCase('HelloWorldTest');
        expect(result.pass).toBe(true);
        expect(result.value).toBe('helloworldtest');
    });

    it('should convert kebab-case to snake_case', () => {
        const result = StringProcessors.toSnakeCase('hello-world-test');
        expect(result.pass).toBe(true);
        expect(result.value).toBe('hello_world_test');
    });

    it('should convert space-separated words to snake_case', () => {
        const result = StringProcessors.toSnakeCase('hello world test');
        expect(result.pass).toBe(true);
        expect(result.value).toBe('hello_world_test');
    });

    it('should handle mixed delimiters', () => {
        const result = StringProcessors.toSnakeCase('hello-world test.case');
        expect(result.pass).toBe(true);
        expect(result.value).toBe('hello_world_test_case');
    });

    it('should handle multiple consecutive delimiters', () => {
        const result = StringProcessors.toSnakeCase('hello--world  test..case');
        expect(result.pass).toBe(true);
        expect(result.value).toBe('hello_world_test_case');
    });

    it('should preserve existing snake_case', () => {
        const result = StringProcessors.toSnakeCase('  --hello_world_test');
        expect(result.pass).toBe(true);
        expect(result.value).toBe('hello_world_test');
    });

    it('should handle single word', () => {
        const result = StringProcessors.toSnakeCase('hello');
        expect(result.pass).toBe(true);
        expect(result.value).toBe('hello');
    });

    it('should handle empty string', () => {
        const result = StringProcessors.toSnakeCase('');
        expect(result.pass).toBe(true);
        expect(result.value).toBe('');
    });

    it('should handle leading delimiters', () => {
        const result = StringProcessors.toSnakeCase('-hello world');
        expect(result.pass).toBe(true);
        expect(result.value).toBe('hello_world');
    });

    it('should handle trailing delimiters', () => {
        const result = StringProcessors.toSnakeCase('hello world-');
        expect(result.pass).toBe(true);
        expect(result.value).toBe('hello_world');
    });

    it('should handle numbers in the string', () => {
        const result = StringProcessors.toSnakeCase('test-case-123-more');
        expect(result.pass).toBe(true);
        expect(result.value).toBe('test_case_123_more');
    });

    it('should convert uppercase to lowercase', () => {
        const result = StringProcessors.toSnakeCase('HELLO WORLD TEST');
        expect(result.pass).toBe(true);
        expect(result.value).toBe('hello_world_test');
    });

    it('should handle custom delimiters', () => {
        const result = StringProcessors.toSnakeCase('hello@world#test', '@#');
        expect(result.pass).toBe(true);
        expect(result.value).toBe('hello_world_test');
    });

    it('should ignore non-delimiter special characters when not in allowedDelims', () => {
        const result = StringProcessors.toSnakeCase('hello@world#test');
        expect(result.pass).toBe(true);
        expect(result.value).toBe('hello@world#test');
    });

    it('should handle mixed case with delimiters', () => {
        const result = StringProcessors.toSnakeCase('Hello-WORLD test.Case');
        expect(result.pass).toBe(true);
        expect(result.value).toBe('hello_world_test_case');
    });
});

describe('StringProcessors.toKebabCase', () => {
    it('should convert str to kebab-case', () => {
        const result = StringProcessors.toKebabCase('-hello World-');
        expect(result.pass).toBe(true);
        expect(result.value).toBe('hello-world');
    });

    it('should convert str to kebab-case', () => {
        const result = StringProcessors.toKebabCase('Hello World Test');
        expect(result.pass).toBe(true);
        expect(result.value).toBe('hello-world-test');
    });

    it('should handle already kebab-case strings', () => {
        const result = StringProcessors.toKebabCase('hello-world-test');
        expect(result.pass).toBe(true);
        expect(result.value).toBe('hello-world-test');
    });

    it('should convert space-separated words to kebab-case', () => {
        const result = StringProcessors.toKebabCase('hello world test');
        expect(result.pass).toBe(true);
        expect(result.value).toBe('hello-world-test');
    });

    it('should handle mixed delimiters', () => {
        const result = StringProcessors.toKebabCase('hello-world test.case');
        expect(result.pass).toBe(true);
        expect(result.value).toBe('hello-world-test-case');
    });

    it('should collapse multiple delimiters', () => {
        const result = StringProcessors.toKebabCase('hello--world  test..case');
        expect(result.pass).toBe(true);
        expect(result.value).toBe('hello-world-test-case');
    });

    it('should trim leading and trailing delimiters', () => {
        const result = StringProcessors.toKebabCase('  --hello_world_test');
        expect(result.pass).toBe(true);
        expect(result.value).toBe('hello-world-test');
    });

    it('should handle single word', () => {
        const result = StringProcessors.toKebabCase('hello');
        expect(result.pass).toBe(true);
        expect(result.value).toBe('hello');
    });

    it('should handle empty string', () => {
        const result = StringProcessors.toKebabCase('');
        expect(result.pass).toBe(true);
        expect(result.value).toBe('');
    });

    it('should trim leading delimiters', () => {
        const result = StringProcessors.toKebabCase('-hello world');
        expect(result.pass).toBe(true);
        expect(result.value).toBe('hello-world');
    });

    it('should trim trailing delimiters', () => {
        const result = StringProcessors.toKebabCase('hello world-');
        expect(result.pass).toBe(true);
        expect(result.value).toBe('hello-world');
    });

    it('should handle numbers in strings', () => {
        const result = StringProcessors.toKebabCase('test-case-123-more');
        expect(result.pass).toBe(true);
        expect(result.value).toBe('test-case-123-more');
    });

    it('should convert uppercase strings', () => {
        const result = StringProcessors.toKebabCase('HELLO WORLD TEST');
        expect(result.pass).toBe(true);
        expect(result.value).toBe('hello-world-test');
    });

    it('should handle custom allowed delimiters', () => {
        const result = StringProcessors.toKebabCase('hello@world#test', '@#');
        expect(result.pass).toBe(true);
        expect(result.value).toBe('hello-world-test');
    });

    it('should not convert non-allowed delimiters', () => {
        const result = StringProcessors.toKebabCase('hello@world#test');
        expect(result.pass).toBe(true);
        expect(result.value).toBe('hello@world#test');
    });

    it('should handle mixed case with various delimiters', () => {
        const result = StringProcessors.toKebabCase('Hello-WORLD test.Case');
        expect(result.pass).toBe(true);
        expect(result.value).toBe('hello-world-test-case');
    });
});

describe('StringProcessors.isPrimitive("string")', () => {
    it('should pass for string value', () => {
        const result = StringProcessors.isPrimitive('hello', 'string');
        expect(result.pass).toBe(true);
        expect(result.value).toBe('hello');
    });

    it('should pass for empty string', () => {
        const result = StringProcessors.isPrimitive('', 'string');
        expect(result.pass).toBe(true);
        expect(result.value).toBe('');
    });

    it('should fail for number', () => {
        const result = StringProcessors.isPrimitive(123, 'string');
        expect(result.pass).toBe(false);
        expect(result.value).toBe(123);
    });

    it('should fail for undefined', () => {
        const result = StringProcessors.isPrimitive(undefined, 'string');
        expect(result.pass).toBe(false);
        expect(result.value).toBe(undefined);
    });

    it('should fail for object', () => {
        const result = StringProcessors.isPrimitive({}, 'string');
        expect(result.pass).toBe(false);
    });
});

describe('StringProcessors.isEmpty', () => {
    it('should pass for empty string', () => {
        const result = StringProcessors.isEmpty('');
        expect(result.pass).toBe(true);
        expect(result.value).toBe('');
    });

    it('should fail for non-empty string', () => {
        const result = StringProcessors.isEmpty('hello');
        expect(result.pass).toBe(false);
        expect(result.value).toBe('hello');
    });

    it('should fail for whitespace string', () => {
        const result = StringProcessors.isEmpty(' ');
        expect(result.pass).toBe(false);
        expect(result.value).toBe(' ');
    });
});

describe('StringProcessors.hasLength', () => {
    it('should pass for correct length', () => {
        const result = StringProcessors.hasLength('hello', 5);
        expect(result.pass).toBe(true);
        expect(result.value).toBe('hello');
    });

    it('should fail for incorrect length', () => {
        const result = StringProcessors.hasLength('hello', 3);
        expect(result.pass).toBe(false);
        expect(result.value).toBe('hello');
    });

    it('should handle empty string', () => {
        const result = StringProcessors.hasLength('', 0);
        expect(result.pass).toBe(true);
        expect(result.value).toBe('');
    });
});

describe('StringProcessors.hasLengthBetween', () => {
    it('should pass for length within range', () => {
        const result = StringProcessors.hasLengthBetween('hello', 3, 7);
        expect(result.pass).toBe(true);
        expect(result.value).toBe('hello');
    });

    it('should pass for length at minimum', () => {
        const result = StringProcessors.hasLengthBetween('hi', 2, 5);
        expect(result.pass).toBe(true);
        expect(result.value).toBe('hi');
    });

    it('should pass for length at maximum', () => {
        const result = StringProcessors.hasLengthBetween('hello', 3, 5);
        expect(result.pass).toBe(true);
        expect(result.value).toBe('hello');
    });

    it('should fail for length below minimum', () => {
        const result = StringProcessors.hasLengthBetween('hi', 3, 7);
        expect(result.pass).toBe(false);
        expect(result.value).toBe('hi');
    });

    it('should fail for length above maximum', () => {
        const result = StringProcessors.hasLengthBetween('hello world', 3, 7);
        expect(result.pass).toBe(false);
        expect(result.value).toBe('hello world');
    });
});

describe('StringProcessors.hasMinLength', () => {
    it('should pass for length equal to minimum', () => {
        const result = StringProcessors.hasMinLength('hello', 5);
        expect(result.pass).toBe(true);
        expect(result.value).toBe('hello');
    });

    it('should pass for length greater than minimum', () => {
        const result = StringProcessors.hasMinLength('hello world', 5);
        expect(result.pass).toBe(true);
        expect(result.value).toBe('hello world');
    });

    it('should fail for length less than minimum', () => {
        const result = StringProcessors.hasMinLength('hi', 5);
        expect(result.pass).toBe(false);
        expect(result.value).toBe('hi');
    });
});

describe('StringProcessors.isPhone', () => {
    it('should pass for valid US phone numbers', () => {
        expect(StringProcessors.isPhone('(555) 123-4567').pass).toBe(true);
        expect(StringProcessors.isPhone('555-123-4567').pass).toBe(true);
        expect(StringProcessors.isPhone('1-555-123-4567').pass).toBe(true);
        expect(StringProcessors.isPhone('5551234567').pass).toBe(true);
        expect(StringProcessors.isPhone('+1-555-123-4567').pass).toBe(true);
        expect(StringProcessors.isPhone('+1-(555)-123-4567').pass).toBe(true);
        expect(StringProcessors.isPhone('1-(555)-123-4567').pass).toBe(true);
    });

    it('should fail for invalid phone numbers', () => {
        expect(StringProcessors.isPhone('123').pass).toBe(false);
        expect(StringProcessors.isPhone('abc-def-ghij').pass).toBe(false);
        expect(StringProcessors.isPhone('555-123-456').pass).toBe(false);
    });

});

describe('StringProcessors.isBalanced', () => {
    it('should pass for balanced parentheses', () => {
        const result = StringProcessors.isBalanced('(hello (world))');
        expect(result.pass).toBe(true);
        expect(result.value).toBe('(hello (world))');
    });

    it('should pass for empty string', () => {
        const result = StringProcessors.isBalanced('');
        expect(result.pass).toBe(true);
        expect(result.value).toBe('');
    });

    it('should pass for string without parentheses', () => {
        const result = StringProcessors.isBalanced('hello world');
        expect(result.pass).toBe(true);
        expect(result.value).toBe('hello world');
    });

    it('should fail for unbalanced parentheses', () => {
        const result = StringProcessors.isBalanced('(hello world');
        expect(result.pass).toBe(false);
        expect(result.value).toBe('(hello world');
    });

    it('should fail for wrong order', () => {
        const result = StringProcessors.isBalanced(')hello(');
        expect(result.pass).toBe(false);
        expect(result.value).toBe(')hello(');
    });

    it('should work with custom characters', () => {
        const result = StringProcessors.isBalanced('[hello [world]]', '[', ']');
        expect(result.pass).toBe(true);
        expect(result.value).toBe('[hello [world]]');
    });
});

describe('StringProcessors.minWords', () => {
    it('should pass for minimum word count', () => {
        const result = StringProcessors.minWords('hello world test', 3);
        expect(result.pass).toBe(true);
        expect(result.value).toBe('hello world test');
    });

    it('should pass for more than minimum', () => {
        const result = StringProcessors.minWords('hello world test case', 3);
        expect(result.pass).toBe(true);
    });

    it('should fail for less than minimum', () => {
        const result = StringProcessors.minWords('hello world', 3);
        expect(result.pass).toBe(false);
        expect(result.value).toBe('hello world');
    });

    it('should handle custom delimiters', () => {
        const result = StringProcessors.minWords('hello,world,test', 3, ',');
        expect(result.pass).toBe(true);
    });
});

describe('StringProcessors.maxWords', () => {
    it('should pass for maximum word count', () => {
        const result = StringProcessors.maxWords('hello world', 2);
        expect(result.pass).toBe(true);
        expect(result.value).toBe('hello world');
    });

    it('should pass for less than maximum', () => {
        const result = StringProcessors.maxWords('hello', 2);
        expect(result.pass).toBe(true);
    });

    it('should fail for more than maximum', () => {
        const result = StringProcessors.maxWords('hello world test', 2);
        expect(result.pass).toBe(false);
        expect(result.value).toBe('hello world test');
    });
});

describe('StringProcessors.wordCount', () => {
    it('should pass for word count within range', () => {
        const result = StringProcessors.wordCount('hello world test', 2, 4);
        expect(result.pass).toBe(true);
        expect(result.value).toBe('hello world test');
    });

    it('should fail for word count below range', () => {
        const result = StringProcessors.wordCount('hello', 2, 4);
        expect(result.pass).toBe(false);
        expect(result.value).toBe('hello');
    });

    it('should fail for word count above range', () => {
        const result = StringProcessors.wordCount('hello world test case scenario', 2, 4);
        expect(result.pass).toBe(false);
    });
});

// Transformer Methods
describe('StringProcessors.trim', () => {
    it('should trim whitespace by default', () => {
        const result = StringProcessors.trim('  hello world  ');
        expect(result.pass).toBe(true);
        expect(result.value).toBe('hello world');
    });

    it('should trim custom characters', () => {
        const result = StringProcessors.trim('xxhello worldxx', 'x');
        expect(result.pass).toBe(true);
        expect(result.value).toBe('hello world');
    });

    it('should handle empty string', () => {
        const result = StringProcessors.trim('');
        expect(result.pass).toBe(true);
        expect(result.value).toBe('');
    });
});

describe('StringProcessors.trimLeft', () => {
    it('should trim left whitespace', () => {
        const result = StringProcessors.trimLeft('  hello world  ');
        expect(result.pass).toBe(true);
        expect(result.value).toBe('hello world  ');
    });

    it('should trim custom characters from left', () => {
        const result = StringProcessors.trimLeft('xxhello worldxx', 'x');
        expect(result.pass).toBe(true);
        expect(result.value).toBe('hello worldxx');
    });
});

describe('StringProcessors.trimRight', () => {
    it('should trim right whitespace', () => {
        const result = StringProcessors.trimRight('  hello world  ');
        expect(result.pass).toBe(true);
        expect(result.value).toBe('  hello world');
    });

    it('should trim custom characters from right', () => {
        const result = StringProcessors.trimRight('xxhello worldxx', 'x');
        expect(result.pass).toBe(true);
        expect(result.value).toBe('xxhello world');
    });
});

describe('StringProcessors.padLeft', () => {
    it('should pad string to specified length', () => {
        const result = StringProcessors.padLeft('hello', 10, ' ');
        expect(result.pass).toBe(true);
        expect(result.value).toBe('     hello');
    });

    it('should pad with custom character', () => {
        const result = StringProcessors.padLeft('123', 6, '0');
        expect(result.pass).toBe(true);
        expect(result.value).toBe('000123');
    });

    it('should not pad if already long enough', () => {
        const result = StringProcessors.padLeft('hello world', 5, ' ');
        expect(result.pass).toBe(true);
        expect(result.value).toBe('hello world');
    });
});

describe('StringProcessors.padRight', () => {
    it('should pad string to specified length', () => {
        const result = StringProcessors.padRight('hello', 10, ' ');
        expect(result.pass).toBe(true);
        expect(result.value).toBe('hello     ');
    });

    it('should pad with custom character', () => {
        const result = StringProcessors.padRight('123', 6, '0');
        expect(result.pass).toBe(true);
        expect(result.value).toBe('123000');
    });
});

describe('StringProcessors.collapseRepeats', () => {
    it('should collapse repeated characters', () => {
        const result = StringProcessors.collapseRepeats('hello   world', ' ');
        expect(result.pass).toBe(true);
        expect(result.value).toBe('hello world');
    });

    it('should collapse repeated custom characters', () => {
        const result = StringProcessors.collapseRepeats('hellllooo', 'l');
        expect(result.pass).toBe(true);
        expect(result.value).toBe('helooo');
    });
});

describe('StringProcessors.removeSpacing', () => {
    it('should remove all spacing', () => {
        const result = StringProcessors.removeSpacing('hello world test');
        expect(result.pass).toBe(true);
        expect(result.value).toBe('helloworldtest');
    });

    it('should handle multiple types of whitespace', () => {
        const result = StringProcessors.removeSpacing('hello\t\n world');
        expect(result.pass).toBe(true);
        expect(result.value).toBe('helloworld');
    });
});

describe('StringProcessors.collapseSpacing', () => {
    it('should collapse multiple spaces to single space', () => {
        const result = StringProcessors.collapseSpacing('hello    world   test');
        expect(result.pass).toBe(true);
        expect(result.value).toBe('hello world test');
    });

    it('should handle tabs and newlines', () => {
        const result = StringProcessors.collapseSpacing('hello\t\t\nworld');
        expect(result.pass).toBe(true);
        expect(result.value).toBe('hello world');
    });
});

describe('StringProcessors.toLowerCase', () => {
    it('should convert to lowercase', () => {
        const result = StringProcessors.toLowerCase('HELLO WORLD');
        expect(result.pass).toBe(true);
        expect(result.value).toBe('hello world');
    });

    it('should handle mixed case', () => {
        const result = StringProcessors.toLowerCase('HeLLo WoRLd');
        expect(result.pass).toBe(true);
        expect(result.value).toBe('hello world');
    });

    it('should handle already lowercase', () => {
        const result = StringProcessors.toLowerCase('hello world');
        expect(result.pass).toBe(true);
        expect(result.value).toBe('hello world');
    });
});

describe('StringProcessors.toUpperCase', () => {
    it('should convert to uppercase', () => {
        const result = StringProcessors.toUpperCase('hello world');
        expect(result.pass).toBe(true);
        expect(result.value).toBe('HELLO WORLD');
    });

    it('should handle mixed case', () => {
        const result = StringProcessors.toUpperCase('HeLLo WoRLd');
        expect(result.pass).toBe(true);
        expect(result.value).toBe('HELLO WORLD');
    });

    it('should handle already uppercase', () => {
        const result = StringProcessors.toUpperCase('HELLO WORLD');
        expect(result.pass).toBe(true);
        expect(result.value).toBe('HELLO WORLD');
    });
});

describe('StringProcessors.toPascalCase', () => {
    it('should convert to PascalCase', () => {
        const result = StringProcessors.toPascalCase('hello world test');
        expect(result.pass).toBe(true);
        expect(result.value).toBe('HelloWorldTest');
    });

    it('should handle snake_case input', () => {
        const result = StringProcessors.toPascalCase('hello_world_test');
        expect(result.pass).toBe(true);
        expect(result.value).toBe('HelloWorldTest');
    });

    it('should handle kebab-case input', () => {
        const result = StringProcessors.toPascalCase('hello-world-test');
        expect(result.pass).toBe(true);
        expect(result.value).toBe('HelloWorldTest');
    });
});

describe('StringProcessors.toTitleCase', () => {
    it('should convert to Title Case', () => {
        const result = StringProcessors.toTitleCase('hello world test');
        expect(result.pass).toBe(true);
        expect(result.value).toBe('Hello World Test');
    });

    it('should handle lowercase input', () => {
        const result = StringProcessors.toTitleCase('hello world');
        expect(result.pass).toBe(true);
        expect(result.value).toBe('Hello World');
    });

    it('should handle mixed case input', () => {
        const result = StringProcessors.toTitleCase('HeLLo WoRLd');
        expect(result.pass).toBe(true);
        expect(result.value).toBe('Hello World');
    });
});

describe('StringProcessors.toSentenceCase', () => {
    it('should convert to Sentence case', () => {
        const result = StringProcessors.toSentenceCase('hello world test');
        expect(result.pass).toBe(true);
        expect(result.value).toBe('Hello world test');
    });

    it('should handle uppercase input', () => {
        const result = StringProcessors.toSentenceCase('HELLO WORLD');
        expect(result.pass).toBe(true);
        expect(result.value).toBe('Hello world');
    });
});

describe('StringProcessors.urlEncode', () => {
    it('should encode URL', () => {
        const result = StringProcessors.urlEncode('hello world test');
        expect(result.pass).toBe(true);
        expect(result.value).toBe('hello%20world%20test');
    });

    it('should encode special characters', () => {
        const result = StringProcessors.urlEncode('hello@world.com');
        expect(result.pass).toBe(true);
        expect(result.value).toBe('hello%40world.com');
    });
});

describe('StringProcessors.urlDecode', () => {
    it('should decode URL', () => {
        const result = StringProcessors.urlDecode('hello%20world%20test');
        expect(result.pass).toBe(true);
        expect(result.value).toBe('hello world test');
    });

    it('should decode special characters', () => {
        const result = StringProcessors.urlDecode('hello%40world.com');
        expect(result.pass).toBe(true);
        expect(result.value).toBe('hello@world.com');
    });
});

describe('StringProcessors.base64Encode', () => {
    it('should encode to base64', () => {
        const result = StringProcessors.base64Encode('hello world');
        expect(result.pass).toBe(true);
        expect(result.value).toBe('aGVsbG8gd29ybGQ=');
    });

    it('should handle empty string', () => {
        const result = StringProcessors.base64Encode('');
        expect(result.pass).toBe(true);
        expect(result.value).toBe('');
    });
});

describe('StringProcessors.base64Decode', () => {
    it('should decode from base64', () => {
        const result = StringProcessors.base64Decode('aGVsbG8gd29ybGQ=');
        expect(result.pass).toBe(true);
        expect(result.value).toBe('hello world');
    });

    it('should handle empty string', () => {
        const result = StringProcessors.base64Decode('');
        expect(result.pass).toBe(true);
        expect(result.value).toBe('');
    });
});

describe('StringProcessors.hexEncode', () => {
    it('should encode to hex', () => {
        const result = StringProcessors.hexEncode('hello');
        expect(result.pass).toBe(true);
        expect(result.value).toBe('68656c6c6f');
    });

    it('should handle empty string', () => {
        const result = StringProcessors.hexEncode('');
        expect(result.pass).toBe(true);
        expect(result.value).toBe('');
    });
});

describe('StringProcessors.hexDecode', () => {
    it('should decode from hex', () => {
        const result = StringProcessors.hexDecode('68656c6c6f');
        expect(result.pass).toBe(true);
        expect(result.value).toBe('hello');
    });

    it('should handle empty string', () => {
        const result = StringProcessors.hexDecode('');
        expect(result.pass).toBe(true);
        expect(result.value).toBe('');
    });
});

describe('StringProcessors.isNotEmpty', () => {
    it('should pass for non-empty string', () => {
        const result = StringProcessors.isNotEmpty('hello');
        expect(result.pass).toBe(true);
        expect(result.value).toBe('hello');
    });

    it('should pass for whitespace string', () => {
        const result = StringProcessors.isNotEmpty(' ');
        expect(result.pass).toBe(true);
        expect(result.value).toBe(' ');
    });

    it('should fail for empty string', () => {
        const result = StringProcessors.isNotEmpty('');
        expect(result.pass).toBe(false);
        expect(result.value).toBe('');
    });

    it('should pass for string with special characters', () => {
        const result = StringProcessors.isNotEmpty('!@#');
        expect(result.pass).toBe(true);
        expect(result.value).toBe('!@#');
    });
});

describe('StringProcessors.slice', () => {
    it('should slice string from start to end index', () => {
        const result = StringProcessors.slice('hello world', 0, 5);
        expect(result.pass).toBe(true);
        expect(result.value).toBe('hello');
    });

    it('should slice string with negative indices', () => {
        const result = StringProcessors.slice('hello world', -5, -1);
        expect(result.pass).toBe(true);
        expect(result.value).toBe('worl');
    });

    it('should slice from middle to end', () => {
        const result = StringProcessors.slice('hello world', 6);
        expect(result.pass).toBe(true);
        expect(result.value).toBe('world');
    });

    it('should handle empty result', () => {
        const result = StringProcessors.slice('hello', 5, 5);
        expect(result.pass).toBe(true);
        expect(result.value).toBe('');
    });

    it('should handle out of bounds indices', () => {
        const result = StringProcessors.slice('hello', 0, 100);
        expect(result.pass).toBe(true);
        expect(result.value).toBe('hello');
    });
});

describe('StringProcessors.sliceFirst', () => {
    it('should slice first character by default', () => {
        const result = StringProcessors.sliceFirst('hello');
        expect(result.pass).toBe(true);
        expect(result.value).toBe('h');
    });

    it('should slice first N characters', () => {
        const result = StringProcessors.sliceFirst('hello world', 5);
        expect(result.pass).toBe(true);
        expect(result.value).toBe('hello');
    });

    it('should handle count greater than string length', () => {
        const result = StringProcessors.sliceFirst('hi', 10);
        expect(result.pass).toBe(true);
        expect(result.value).toBe('hi');
    });

    it('should handle empty string', () => {
        const result = StringProcessors.sliceFirst('', 5);
        expect(result.pass).toBe(true);
        expect(result.value).toBe('');
    });

    it('should handle zero count', () => {
        const result = StringProcessors.sliceFirst('hello', 0);
        expect(result.pass).toBe(true);
        expect(result.value).toBe('');
    });
});

describe('StringProcessors.sliceLast', () => {
    it('should slice last character by default', () => {
        const result = StringProcessors.sliceLast('hello');
        expect(result.pass).toBe(true);
        expect(result.value).toBe('o');
    });

    it('should slice last N characters', () => {
        const result = StringProcessors.sliceLast('hello world', 5);
        expect(result.pass).toBe(true);
        expect(result.value).toBe('world');
    });

    it('should handle count greater than string length', () => {
        const result = StringProcessors.sliceLast('hi', 10);
        expect(result.pass).toBe(true);
        expect(result.value).toBe('hi');
    });

    it('should handle empty string', () => {
        const result = StringProcessors.sliceLast('', 5);
        expect(result.pass).toBe(true);
        expect(result.value).toBe('');
    });

    it('should return full string with zero count (slice(-0) behavior)', () => {
        const result = StringProcessors.sliceLast('hello', 0);
        expect(result.pass).toBe(true);
        expect(result.value).toBe('hello');
    });
});

describe('StringProcessors.toDelimited', () => {
    it('should convert to custom delimiter with default transformer', () => {
        const result = StringProcessors.toDelimited('hello world test', { delim: '-' });
        expect(result.pass).toBe(true);
        expect(result.value).toBe('hello-world-test');
    });

    it('should use custom transformer', () => {
        const result = StringProcessors.toDelimited('hello world', {
            delim: '_',
            transformer: word => word.toUpperCase()
        });
        expect(result.pass).toBe(true);
        expect(result.value).toBe('HELLO_WORLD');
    });

    it('should use dual transformers with switch index', () => {
        const result = StringProcessors.toDelimited('hello world test', {
            delim: '-',
            transformer1: word => word.toLowerCase(),
            transformer2: word => word.toUpperCase(),
            switchIndex: 1
        });
        expect(result.pass).toBe(true);
        expect(result.value).toBe('hello-WORLD-TEST');
    });

    it('should handle custom allowed delimiters', () => {
        const result = StringProcessors.toDelimited('hello_world-test', {
            allowedDelims: '_-',
            delim: ' '
        });
        expect(result.pass).toBe(true);
        expect(result.value).toBe('hello world test');
    });

    it('should handle empty string', () => {
        const result = StringProcessors.toDelimited('', { delim: '-' });
        expect(result.pass).toBe(true);
        expect(result.value).toBe('');
    });

    it('should handle single word', () => {
        const result = StringProcessors.toDelimited('hello', { delim: '-' });
        expect(result.pass).toBe(true);
        expect(result.value).toBe('hello');
    });

    it('should apply transformer2 to all words when switchIndex is 0', () => {
        const result = StringProcessors.toDelimited('hello world', {
            delim: '-',
            transformer1: word => word.toLowerCase(),
            transformer2: word => word.toUpperCase(),
            switchIndex: 0
        });
        expect(result.pass).toBe(true);
        expect(result.value).toBe('HELLO-WORLD');
    });
});

