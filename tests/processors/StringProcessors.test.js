'use strict';

import StringHandler  from '../../lib/processors/StringHandler.js';
import Presence  from '../../lib/Presence.js';
const { optional, required, forbidden } = Presence;

describe('StringHandler.hasMaxLength', () => {
    it('should pass if string length is less than or equal to max', () => {
        const result = StringHandler.hasMaxLength('hello', 5);
        expect(result.pass).toBe(true);
    });

    it('should fail if string length is greater than max', () => {
        const result = StringHandler.hasMaxLength('hello world', 5);
        expect(result.pass).toBe(false);
    });
});

describe('StringHandler.contains', () => {
    it('should pass if string contains substring', () => {
        const result = StringHandler.contains('hello world', 'world', { ignoreCase: false });
        expect(result.pass).toBe(true);
    });

    it('should fail if string does not contain substring', () => {
        const result = StringHandler.contains('hello world', 'foo', { ignoreCase: false });
        expect(result.pass).toBe(false);
    });

    it('should pass with ignoreCase true', () => {
        const result = StringHandler.contains('Hello World', 'world', { ignoreCase: true });
        expect(result.pass).toBe(true);
    });
});

describe('StringHandler.startsWith', () => {
    it('should pass if string starts with prefix', () => {
        const result = StringHandler.startsWith('hello world', 'hello', { ignoreCase: false });
        expect(result.pass).toBe(true);
    });

    it('should fail if string does not start with prefix', () => {
        const result = StringHandler.startsWith('hello world', 'world', { ignoreCase: false });
        expect(result.pass).toBe(false);
    });

    it('should pass with ignoreCase true', () => {
        const result = StringHandler.startsWith('Hello World', 'hello', { ignoreCase: true });
        expect(result.pass).toBe(true);
    });
});

describe('StringHandler.endsWith', () => {
    it('should pass if string ends with suffix', () => {
        const result = StringHandler.endsWith('hello world', 'world', { ignoreCase: false });
        expect(result.pass).toBe(true);
    });

    it('should fail if string does not end with suffix', () => {
        const result = StringHandler.endsWith('hello world', 'hello', { ignoreCase: false });
        expect(result.pass).toBe(false);
    });

    it('should pass with ignoreCase true', () => {
        const result = StringHandler.endsWith('Hello World', 'WORLD', { ignoreCase: true });
        expect(result.pass).toBe(true);
    });
});

describe('StringHandler.matches', () => {
    it('should pass if string matches regex', () => {
        const result = StringHandler.matches('abc123', /^[a-z]+\d+$/);
        expect(result.pass).toBe(true);
    });

    it('should fail if string does not match regex', () => {
        const result = StringHandler.matches('abc', /^\d+$/);
        expect(result.pass).toBe(false);
    });
});

describe('StringHandler.isDomain', () => {
    it('should pass for a valid domain', () => {
        const result = StringHandler.isDomain('example.com');
        expect(result.pass).toBe(true);
    });

    it('should fail for an invalid domain', () => {
        const result = StringHandler.isDomain('not_a_domain');
        expect(result.pass).toBe(false);
    });

    it('should pass for a subdomain if allowed', () => {
        const result = StringHandler.isDomain('sub.example.com', { subdomains: 0 });
        expect(result.pass).toBe(true);
    });

    it('should fail for a domain with only numbers', () => {
        const result = StringHandler.isDomain('123456');
        expect(result.pass).toBe(false);
    });

    it('should pass for a wildcard domain if allowed', () => {
        const result = StringHandler.isDomain('*.example.com', { wildcards: 0 });
        expect(result.pass).toBe(true);
    });
});

describe('StringHandler.isLabel', () => {
    it('should pass for a valid domain label', () => {
        const result = StringHandler.isLabel('example');
        expect(result.pass).toBe(true);
    });

    it('should fail for a label with invalid characters', () => {
        const result = StringHandler.isLabel('ex@mple');
        expect(result.pass).toBe(false);
    });

    it('should fail for a label that is too long', () => {
        const longLabel = 'a'.repeat(64);
        const result = StringHandler.isLabel(longLabel);
        expect(result.pass).toBe(false);
    });

    it('should fail for a label that starts with a dash', () => {
        const result = StringHandler.isLabel('-example');
        expect(result.pass).toBe(false);
    });

    it('should fail for a label that ends with a dash', () => {
        const result = StringHandler.isLabel('example-');
        expect(result.pass).toBe(false);
    });
});

describe('StringHandler.isPath', () => {
    it('should fail for a path containing a null byte character', () => {
        const result = StringHandler.isPath('/usr/local/bin/\x00node');
        expect(result.pass).toBe(false);
    });

    it('should pass for a valid unix abs path', () => {
        const result = StringHandler.isPath('/usr/local/bin/node');
        expect(result.pass).toBe(true);
    });

    it('should pass for a valid windows abs path', () => {
        const result = StringHandler.isPath('C:\\Program Files\\Node', { style: 'win-drive' });
        expect(result.pass).toBe(true);
    });

    it('should fail for a windows path with invalid characters', () => {
        const result = StringHandler.isPath('C:\\Program Files\\No:de', { style: 'win-drive' });
        expect(result.pass).toBe(false);
    });

    it('should pass for a valid UNC path', () => {
        const result = StringHandler.isPath('\\\\server\\share\\folder', { style: 'win-unc' });
        expect(result.pass).toBe(true);
    });

    it('should fail for a path with a label that is too long', () => {
        const longLabel = '/thisisaverylonglabelnamethatisdefinitelymorethantheallowedlength';
        const result = StringHandler.isPath(longLabel, { maxLabelLength: 20 });
        expect(result.pass).toBe(false);
    });

    it('should pass for a file with a specific extension', () => {
        const result = StringHandler.isPath('/home/user/file.txt', { fileExtensions: ['txt'] });
        expect(result.pass).toBe(true);
    });

    it('should fail for a file with a forbidden extension', () => {
        const result = StringHandler.isPath('/home/user/file.exe', { fileExtensions: ['txt'] });
        expect(result.pass).toBe(false);
    });
});

describe('StringHandler.isDataUrl', () => {
    it('should pass for a valid image data URI', () => {
        const result = StringHandler.isDataUrl('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUA');
        expect(result.pass).toBe(true);
    });

    it('should pass for a valid text data URI', () => {
        const result = StringHandler.isDataUrl('data:text/plain;base64,SGVsbG8sIFdvcmxkIQ==');
        expect(result.pass).toBe(true);
    });

    it('should fail for a data URI with a forbidden type', () => {
        const result = StringHandler.isDataUrl('data:application/json;base64,eyJmb28iOiJiYXIifQ==', { allowedTypes: ['image', 'text'] });
        expect(result.pass).toBe(false);
    });

    it('should fail for a string that is not a data URI', () => {
        const result = StringHandler.isDataUrl('not-a-data-uri');
        expect(result.pass).toBe(false);
    });

    it('should pass for a valid audio data URI if allowed', () => {
        const result = StringHandler.isDataUrl('data:audio/mp3;base64,SUQzAwAAAAAA', { allowedTypes: ['audio'] });
        expect(result.pass).toBe(true);
    });
});

describe('StringHandler.isUpperCase', () => {
    it('should pass for an all uppercase string', () => {
        const result = StringHandler.isUpperCase('HELLO');
        expect(result.pass).toBe(true);
    });

    it('should fail for a string with lowercase letters', () => {
        const result = StringHandler.isUpperCase('Hello');
        expect(result.pass).toBe(false);
    });

    it('should pass for an empty string', () => {
        const result = StringHandler.isUpperCase('');
        expect(result.pass).toBe(true);
    });
});

describe('StringHandler.isLowerCase', () => {
    it('should pass for an all lowercase string', () => {
        const result = StringHandler.isLowerCase('hello');
        expect(result.pass).toBe(true);
    });

    it('should fail for a string with uppercase letters', () => {
        const result = StringHandler.isLowerCase('Hello');
        expect(result.pass).toBe(false);
    });

    it('should pass for an empty string', () => {
        const result = StringHandler.isLowerCase('');
        expect(result.pass).toBe(true);
    });
});

describe('StringHandler.isAlpha', () => {
    it('should pass for a string with only letters', () => {
        const result = StringHandler.isAlpha('abcXYZ');
        expect(result.pass).toBe(true);
    });

    it('should fail for a string with numbers', () => {
        const result = StringHandler.isAlpha('abc123');
        expect(result.pass).toBe(false);
    });

    it('should fail for a string with symbols', () => {
        const result = StringHandler.isAlpha('abc!');
        expect(result.pass).toBe(false);
    });
});

describe('StringHandler.isAlphanumeric', () => {
    it('should pass for a string with only letters and numbers', () => {
        const result = StringHandler.isAlphanumeric('abc123XYZ');
        expect(result.pass).toBe(true);
    });

    it('should fail for a string with symbols', () => {
        const result = StringHandler.isAlphanumeric('abc123!');
        expect(result.pass).toBe(false);
    });

    it('should fail for a string with spaces', () => {
        const result = StringHandler.isAlphanumeric('abc 123');
        expect(result.pass).toBe(false);
    });
});

describe('StringHandler.isAscii', () => {
    it('should pass for a string with only ASCII characters', () => {
        const result = StringHandler.isAscii('Hello123!@#');
        expect(result.pass).toBe(true);
    });

    it('should fail for a string with non-ASCII characters', () => {
        const result = StringHandler.isAscii('Héllo');
        expect(result.pass).toBe(false);
    });
});

describe('StringHandler.isDigits', () => {
    it('should pass for a string with only digits', () => {
        const result = StringHandler.isDigits('1234567890');
        expect(result.pass).toBe(true);
    });

    it('should fail for a string with letters', () => {
        const result = StringHandler.isDigits('123abc');
        expect(result.pass).toBe(false);
    });

    it('should fail for a string with symbols', () => {
        const result = StringHandler.isDigits('123!');
        expect(result.pass).toBe(false);
    });
});

describe('StringHandler.isBinary', () => {
    it('should pass for a string with only 0s and 1s', () => {
        const result = StringHandler.isBinary('101010');
        expect(result.pass).toBe(true);
    });

    it('should fail for a string with digits other than 0 or 1', () => {
        const result = StringHandler.isBinary('10201');
        expect(result.pass).toBe(false);
    });

    it('should fail for a string with letters', () => {
        const result = StringHandler.isBinary('10a01');
        expect(result.pass).toBe(false);
    });
});

describe('StringHandler.isOctal', () => {
    it('should pass for a string with only octal digits', () => {
        const result = StringHandler.isOctal('01234567');
        expect(result.pass).toBe(true);
    });

    it('should fail for a string with digits outside octal range', () => {
        const result = StringHandler.isOctal('128');
        expect(result.pass).toBe(false);
    });

    it('should fail for a string with letters', () => {
        const result = StringHandler.isOctal('123abc');
        expect(result.pass).toBe(false);
    });
});

describe('StringHandler.isHex', () => {
    it('should pass for a string with only hexadecimal digits', () => {
        const result = StringHandler.isHex('1a2b3c4d5e6f');
        expect(result.pass).toBe(true);
    });

    it('should pass for uppercase hexadecimal digits', () => {
        const result = StringHandler.isHex('ABCDEF123');
        expect(result.pass).toBe(true);
    });

    it('should fail for a string with non-hex characters', () => {
        const result = StringHandler.isHex('123xyz');
        expect(result.pass).toBe(false);
    });
});

describe('StringHandler.isHexColor', () => {
    it('should pass for a valid 6-digit hex color with #', () => {
        const result = StringHandler.isHexColor('#1a2b3c');
        expect(result.pass).toBe(true);
    });

    it('should pass for a valid 3-digit hex color with #', () => {
        const result = StringHandler.isHexColor('#abc');
        expect(result.pass).toBe(true);
    });

    it('should pass for a valid 6-digit hex color without #', () => {
        const result = StringHandler.isHexColor('1a2b3c');
        expect(result.pass).toBe(true);
    });

    it('should fail for a string with invalid hex color', () => {
        const result = StringHandler.isHexColor('#12345g');
        expect(result.pass).toBe(false);
    });

    it('should fail for a string with wrong length', () => {
        const result = StringHandler.isHexColor('#1234');
        expect(result.pass).toBe(false);
    });
});

describe('StringHandler.isBmp', () => {
    it('should pass for a string with only BMP Unicode characters', () => {
        // All characters are in the Basic Multilingual Plane (U+0000 to U+FFFF)
        const result = StringHandler.isBmp('Hello, 世界!');
        expect(result.pass).toBe(true);
    });

    it('should fail for a string containing a supplementary Unicode character (outside BMP)', () => {
        // 😀 (U+1F600) is outside the BMP
        const result = StringHandler.isBmp('Hello 😀');
        expect(result.pass).toBe(false);
    });

    it('should pass for an empty string', () => {
        const result = StringHandler.isBmp('');
        expect(result.pass).toBe(true);
    });

    it('should pass for a string with edge BMP characters', () => {
        // U+0000 (null), U+FFFF (last BMP code point)
        const result = StringHandler.isBmp('\u0000\uFFFF');
        expect(result.pass).toBe(true);
    });

    it('should fail for a string with only supplementary characters', () => {
        // 𝄞 (U+1D11E) is outside the BMP
        const result = StringHandler.isBmp('𝄞');
        expect(result.pass).toBe(false);
    });
});

describe('StringHandler.base64', () => {
    it('should pass for a valid base64 string', () => {
        const result = StringHandler.isBase64('TWFuIGlzIGRpc3Rpbmd1aXNoZWQsIG5vdCBvbmx5IGJ5IGhpcyByZWFzb24sIGJ1dCAuLi4=');
        expect(result.pass).toBe(true);
    });

    it('should fail for a string with invalid base64 characters', () => {
        const result = StringHandler.isBase64('TWFu*IGlz#IGRpc3Rpbmd1aXNoZWQs');
        expect(result.pass).toBe(false);
    });

    it('should fail for a string with incorrect padding', () => {
        const result = StringHandler.isBase64('TWFuIGlzIGRpc3Rpbmd1aXNoZWQs=');
        expect(result.pass).toBe(false);
    });

    it('should fail for a valid base64 string without padding', () => {
        const result = StringHandler.isBase64('TWFuIGlzIGRpc3Rpbmd1aXNoZWQsIG5vdCBvbmx5IGJ5IGhpcyByZWFzb24sIGJ1dCAuLi4');
        expect(result.pass).toBe(false);
    });

    it('should fail for an empty string', () => {
        const result = StringHandler.isBase64('');
        expect(result.pass).toBe(false);
    });
});

describe('StringHandler.hasRepetition', () => {
    it('should pass if the fragment repeats at least the minimum number of times', () => {
        const result = StringHandler.hasRepetition('abcabcabc', 'abc', { min: 3 });
        expect(result.pass).toBe(true);
    });

    it('should fail if the fragment repeats fewer than the minimum number of times', () => {
        const result = StringHandler.hasRepetition('abcabc', 'abc', { min: 3 });
        expect(result.pass).toBe(false);
    });

    it('should pass if the fragment repeats within the min and max range', () => {
        const result = StringHandler.hasRepetition('foofoofoo', 'foo', { min: 2, max: 3 });
        expect(result.pass).toBe(true);
    });

    it('should fail if the fragment repeats more than the max number of times', () => {
        const result = StringHandler.hasRepetition('barbarbarbar', 'bar', { min: 2, max: 3 });
        expect(result.pass).toBe(false);
    });

    it('should pass if otherText is true and the fragment repeats enough times', () => {
        const result = StringHandler.hasRepetition('fox other fox fox fox', 'fox', { min: 3, otherText: true });
        expect(result.pass).toBe(true);
    });

    it('should fail if otherText is false and there is extra text', () => {
        const result = StringHandler.hasRepetition('foxfox fox', 'fox', { min: 2, otherText: false });
        expect(result.pass).toBe(false);
    });

    it('should pass if otherText is false and the string is just the fragment repeated', () => {
        const result = StringHandler.hasRepetition('catcatcat', 'cat', { min: 3, otherText: false });
        expect(result.pass).toBe(true);
    });

    it('should be case-insensitive if ignoreCase is true', () => {
        const result = StringHandler.hasRepetition('DogDOGdog', 'dog', { min: 3, ignoreCase: true });
        expect(result.pass).toBe(true);
    });

    it('should be case-sensitive by default', () => {
        const result = StringHandler.hasRepetition('DogDOGdog', 'dog', { min: 3 });
        expect(result.pass).toBe(false);
    });
});

describe('StringHandler.onlyChars', () => {
    it('should pass if string contains only the allowed characters', () => {
        const result = StringHandler.onlyChars('abcabc', 'abc');
        expect(result.pass).toBe(true);
    });

    it('should fail if string contains characters not in the allowed set', () => {
        const result = StringHandler.onlyChars('abcxyz', 'abc');
        expect(result.pass).toBe(false);
    });

    it('should pass for an empty string', () => {
        const result = StringHandler.onlyChars('', 'abc');
        expect(result.pass).toBe(true);
    });

    it('should be case-insensitive if ignoreCase is true', () => {
        const result = StringHandler.onlyChars('aBc', 'abc', { ignoreCase: true });
        expect(result.pass).toBe(true);
    });

    it('should be case-sensitive by default', () => {
        const result = StringHandler.onlyChars('aBc', 'abc');
        expect(result.pass).toBe(false);
    });
});

describe('StringHandler.excludesChars', () => {
    it('should pass if string contains none of the excluded characters', () => {
        const result = StringHandler.excludesChars('abcdef', 'xyz');
        expect(result.pass).toBe(true);
    });

    it('should fail if string contains any of the excluded characters', () => {
        const result = StringHandler.excludesChars('abcxyz', 'xyz');
        expect(result.pass).toBe(false);
    });

    it('should pass for an empty string', () => {
        const result = StringHandler.excludesChars('', 'abc');
        expect(result.pass).toBe(true);
    });

    it('should be case-insensitive if ignoreCase is true', () => {
        const result = StringHandler.excludesChars('aBc', 'ABC', { ignoreCase: true });
        expect(result.pass).toBe(false);
    });

    it('should be case-sensitive by default', () => {
        const result = StringHandler.excludesChars('aBc', 'AC');
        expect(result.pass).toBe(true);
    });
});

describe('StringHandler.isEmail', () => {
    it('should pass for a valid email address', () => {
        const result = StringHandler.isEmail('john.doe@example.com');
        expect(result.pass).toBe(true);
    });

    it('should fail for a string without @', () => {
        const result = StringHandler.isEmail('johndoe.example.com');
        expect(result.pass).toBe(false);
    });

    it('should fail for a string with multiple @', () => {
        const result = StringHandler.isEmail('john@doe@example.com');
        expect(result.pass).toBe(false);
    });

    it('should fail for an email with invalid domain', () => {
        const result = StringHandler.isEmail('john@not_a_domain');
        expect(result.pass).toBe(false);
    });

    it('should fail for an email with invalid local part', () => {
        const result = StringHandler.isEmail('john\x00doe@example.com');
        expect(result.pass).toBe(false);
    });

    it('should pass for an email with plus addressing', () => {
        const result = StringHandler.isEmail('user.name+tag+sorting@example.com');
        expect(result.pass).toBe(true);
    });

    it('should fail for an empty string', () => {
        const result = StringHandler.isEmail('');
        expect(result.pass).toBe(false);
    });
});

describe('StringHandler.isIpV4', () => {
    it('should pass for a valid IPv4 address', () => {
        const result = StringHandler.isIpV4('192.168.1.1');
        expect(result.pass).toBe(true);
    });

    it('should fail for an invalid IPv4 address', () => {
        const result = StringHandler.isIpV4('256.100.50.25');
        expect(result.pass).toBe(false);
    });

    it('should fail for a string that is not an IP', () => {
        const result = StringHandler.isIpV4('not.an.ip');
        expect(result.pass).toBe(false);
    });
});

describe('StringHandler.ipV6', () => {
    it('should pass for a valid IPv6 address', () => {
        const result = StringHandler.ipV6('2001:0db8:85a3:0000:0000:8a2e:0370:7334');
        expect(result.pass).toBe(true);
    });

    it('should pass for a condensed IPv6 address', () => {
        const result = StringHandler.ipV6('2001:db8::8a2e:370:7334');
        expect(result.pass).toBe(true);
    });

    it('should fail for an invalid IPv6 address', () => {
        const result = StringHandler.ipV6('2001:db8:::8a2e:370:7334');
        expect(result.pass).toBe(false);
    });

    it('should fail for a string that is not an IP', () => {
        const result = StringHandler.ipV6('not:an:ip');
        expect(result.pass).toBe(false);
    });
});

describe('StringHandler.isIp', () => {
    it('should pass for a valid IPv4 address', () => {
        const result = StringHandler.isIp('8.8.8.8');
        expect(result.pass).toBe(true);
    });

    it('should pass for a valid IPv6 address', () => {
        const result = StringHandler.isIp('::1');
        expect(result.pass).toBe(true);
    });

    it('should fail for an invalid IP address', () => {
        const result = StringHandler.isIp('999.999.999.999');
        expect(result.pass).toBe(false);
    });

    it('should fail for a string that is not an IP', () => {
        const result = StringHandler.isIp('hello world');
        expect(result.pass).toBe(false);
    });
});


describe('StringHandler.isUrl', () => {
    it('should pass for a valid http URL', () => {
        const result = StringHandler.isUrl('http://example.com');
        expect(result.pass).toBe(true);
    });

    it('should pass for a valid https URL with path and query', () => {
        const result = StringHandler.isUrl('https://example.com/path?query=1');
        expect(result.pass).toBe(true);
    });

    it('should fail for a string that is not a URL', () => {
        const result = StringHandler.isUrl('not a url');
        expect(result.pass).toBe(false);
    });

    it('should fail for a URL with a forbidden protocol', () => {
        const result = StringHandler.isUrl('ftp://example.com', { allowedProtocols: ['http', 'https'] });
        expect(result.pass).toBe(false);
    });

    it('should pass for a URL with a port if port is optional', () => {
        const result = StringHandler.isUrl('http://example.com:8080', { port: optional });
        expect(result.pass).toBe(true);
    });

    it('should fail for a URL with a port if port is forbidden', () => {
        const result = StringHandler.isUrl('http://example.com:8080', { port: forbidden });
        expect(result.pass).toBe(false);
    });

    it('should pass for a root-relative URL if rootRelative is true', () => {
        const result = StringHandler.isUrl('/path/to/resource', { rootRelative: true });
        expect(result.pass).toBe(true);
    });

    it('should fail for a root-relative URL if rootRelative is false', () => {
        const result = StringHandler.isUrl('/path/to/resource', { rootRelative: false });
        expect(result.pass).toBe(false);
    });

    it('should pass for a URL with a fragment if fragment is optional', () => {
        const result = StringHandler.isUrl('http://example.com#section', { fragment: optional });
        expect(result.pass).toBe(true);
    });

    it('should fail for a URL with a fragment if fragment is forbidden', () => {
        const result = StringHandler.isUrl('http://example.com#section', { fragment: forbidden });
        expect(result.pass).toBe(false);
    });

    it('should pass for a URL with a query if query is required', () => {
        const result = StringHandler.isUrl('http://example.com?foo=bar', { query: required });
        expect(result.pass).toBe(true);
    });

    it('should fail for a URL without a query if query is required', () => {
        const result = StringHandler.isUrl('http://example.com', { query: required });
        expect(result.pass).toBe(false);
    });

    it('should pass for a URL with user info, port, path, query, and fragment', () => {
        const result = StringHandler.isUrl('https://example.com:8080/path/to/page?foo=bar&baz=qux#section', { port: optional, fragment: optional, query: optional });
        expect(result.pass).toBe(true);
    });

    it('should pass for a URL with an IPv4 address as the host', () => {
        const result = StringHandler.isUrl('http://127.0.0.1:3000/api', { port: optional, ip: optional, domain: optional });
        expect(result.pass).toBe(true);
    });

    it('should pass for a URL with an IPv6 address as the host', () => {
        const result = StringHandler.isUrl('http://[2001:db8::1]/dsdssd/dssd');
        expect(result.pass).toBe(true);
    });

    it('should fail for a URL with an invalid IPv6 address', () => {
        const result = StringHandler.isUrl('http://[2001:db8:::1]');
        expect(result.pass).toBe(false);
    });

    it('should pass for a URL with a subdomain and multiple path segments', () => {
        const result = StringHandler.isUrl('https://sub.domain.example.com/one/two/three');
        expect(result.pass).toBe(true);
    });

    it('should fail for a URL with an invalid port number', () => {
        const result = StringHandler.isUrl('http://example.com:99999');
        expect(result.pass).toBe(false);
    });

    it('should pass for a URL with percent-encoded characters in the path and query', () => {
        const result = StringHandler.isUrl('https://example.com/path%20with%20spaces?query=hello%20world');
        expect(result.pass).toBe(true);
    });

    it('should fail for a URL with an invalid character in the domain', () => {
        const result = StringHandler.isUrl('http://exa$mple.com');
        expect(result.pass).toBe(false);
    });

    it('should pass for a URL with a dash and underscore in the path', () => {
        const result = StringHandler.isUrl('https://example.com/path-with_dash/');
        expect(result.pass).toBe(true);
    });

    it('should fail for a URL with an empty host', () => {
        const result = StringHandler.isUrl('http://:8080/path');
        expect(result.pass).toBe(false);
    });

    it('should fail for a URL with an empty path', () => {
        const result = StringHandler.isUrl('http://example.com:8080');
        expect(result.pass).toBe(false);
    });

    // --- PORT ---
    it('should pass for a URL with a port when port is optional', () => {
        const result = StringHandler.isUrl('http://example.com:8080', { port: Presence.optional });
        expect(result.pass).toBe(true);
    });

    it('should fail for a URL with a port when port is forbidden', () => {
        const result = StringHandler.isUrl('http://example.com:8080', { port: Presence.forbidden });
        expect(result.pass).toBe(false);
    });

    it('should pass for a URL with a port when port is required', () => {
        const result = StringHandler.isUrl('http://example.com:8080', { port: Presence.required });
        expect(result.pass).toBe(true);
    });

    it('should fail for a URL without a port when port is required', () => {
        const result = StringHandler.isUrl('http://example.com', { port: Presence.required });
        expect(result.pass).toBe(false);
    });

    // --- QUERY ---
    it('should pass for a URL with a query when query is optional', () => {
        const result = StringHandler.isUrl('http://example.com?foo=bar', { query: Presence.optional });
        expect(result.pass).toBe(true);
    });

    it('should fail for a URL with a query when query is forbidden', () => {
        const result = StringHandler.isUrl('http://example.com?foo=bar', { query: Presence.forbidden });
        expect(result.pass).toBe(false);
    });

    it('should pass for a URL with a query when query is required', () => {
        const result = StringHandler.isUrl('http://example.com?foo=bar', { query: Presence.required });
        expect(result.pass).toBe(true);
    });

    it('should fail for a URL without a query when query is required', () => {
        const result = StringHandler.isUrl('http://example.com', { query: Presence.required });
        expect(result.pass).toBe(false);
    });

    // --- FRAGMENT ---
    it('should pass for a URL with a fragment when fragment is optional', () => {
        const result = StringHandler.isUrl('http://example.com#section', { fragment: Presence.optional });
        expect(result.pass).toBe(true);
    });

    it('should fail for a URL with a fragment when fragment is forbidden', () => {
        const result = StringHandler.isUrl('http://example.com#section', { fragment: Presence.forbidden });
        expect(result.pass).toBe(false);
    });

    it('should pass for a URL with a fragment when fragment is required', () => {
        const result = StringHandler.isUrl('http://example.com#section', { fragment: Presence.required });
        expect(result.pass).toBe(true);
    });

    it('should fail for a URL without a fragment when fragment is required', () => {
        const result = StringHandler.isUrl('http://example.com', { fragment: Presence.required });
        expect(result.pass).toBe(false);
    });

    // --- PROTOCOLS ---
    it('should pass for a URL with a protocol when protocols is required', () => {
        const result = StringHandler.isUrl('https://example.com', { protocols: Presence.required });
        expect(result.pass).toBe(true);
    });

    it('should fail for a URL without a protocol when protocols is required', () => {
        const result = StringHandler.isUrl('example.com', { protocols: Presence.required });
        expect(result.pass).toBe(false);
    });

    it('should pass for a URL without a protocol when protocols is optional', () => {
        const result = StringHandler.isUrl('example.com', { protocols: Presence.optional });
        expect(result.pass).toBe(true);
    });

    it('should fail for a URL with a protocol when protocols is forbidden', () => {
        const result = StringHandler.isUrl('http://example.com', { protocols: Presence.forbidden });
        expect(result.pass).toBe(false);
    });

    // --- DOMAIN ---
    it('should pass for a URL with a domain when domain is required', () => {
        const result = StringHandler.isUrl('http://example.com', { domain: Presence.required });
        expect(result.pass).toBe(true);
    });

    it('should fail for a URL without a domain when domain is required', () => {
        const result = StringHandler.isUrl('http://127.0.0.1', { domain: Presence.required });
        expect(result.pass).toBe(false);
    });

    it('should pass for a URL with a domain when domain is optional', () => {
        const result = StringHandler.isUrl('http://example.com', { domain: Presence.optional });
        expect(result.pass).toBe(true);
    });

    it('should fail for a URL with a domain when domain is forbidden', () => {
        const result = StringHandler.isUrl('http://example.com', { domain: Presence.forbidden });
        expect(result.pass).toBe(false);
    });

    // --- IP ---
    it('should pass for a URL with an IP when ip is required', () => {
        const result = StringHandler.isUrl('http://127.0.0.1', { ip: Presence.required });
        expect(result.pass).toBe(true);
    });

    it('should fail for a URL without an IP when ip is required', () => {
        const result = StringHandler.isUrl('http://example.com', { ip: Presence.required });
        expect(result.pass).toBe(false);
    });

    it('should pass for a URL with an IP when ip is optional', () => {
        const result = StringHandler.isUrl('http://127.0.0.1', { ip: Presence.optional });
        expect(result.pass).toBe(true);
    });

    it('should fail for a URL with an IP when ip is forbidden', () => {
        const result = StringHandler.isUrl('http://127.0.0.1', { ip: Presence.forbidden });
        expect(result.pass).toBe(false);
    });
});

describe('StringHandler.isE164', () => {
    it('should pass for a valid E164 phone number with plus and no spaces', () => {
        const result = StringHandler.isE164('+449731114354325');
        expect(result.pass).toBe(true);
    });

    it('should pass for a valid E164 phone number with spaces', () => {
        const result = StringHandler.isE164('+44 973 324 2345693');
        expect(result.pass).toBe(true);
    });

    it('should fail for a phone number without a plus sign', () => {
        const result = StringHandler.isE164('449731114354325');
        expect(result.pass).toBe(false);
    });

    it('should fail for a phone number that is too short', () => {
        const result = StringHandler.isE164('+44 973');
        expect(result.pass).toBe(false);
    });

    it('should fail for a phone number with invalid characters', () => {
        const result = StringHandler.isE164('+44-973-324-ABCD');
        expect(result.pass).toBe(false);
    });

    it('should return normalized format with spaces by default', () => {
        const result = StringHandler.isE164('+44-973-324-1111');
        expect(result.pass).toBe(true);
        expect(result.value).toMatch(/^\+44 \d{3} \d{3} \d{4}$/);
    });

    it('should return normalized format without spaces if spaces option is false', () => {
        const result = StringHandler.isE164('+44-973-324-1111', { preserveSpaces: false });
        expect(result.pass).toBe(true);
    });
});

describe('StringHandler.isLuhn', () => {
    it('should pass for a valid Luhn number (credit card)', () => {
        // Visa test number
        const result = StringHandler.isLuhn('4111111111111111');
        expect(result.pass).toBe(true);
    });

    it('should fail for an invalid Luhn number', () => {
        const result = StringHandler.isLuhn('4111111111111121');
        expect(result.pass).toBe(false);
    });

    it('should pass for a valid Luhn number ', () => {
        const result = StringHandler.isLuhn('17893729974');
        expect(result.pass).toBe(true);
    });

    it('should pass for a valid Luhn number with dashes', () => {
        const result = StringHandler.isLuhn('4539148803436467');
        expect(result.pass).toBe(true);
    });

    it('should fail for a string with non-digit characters', () => {
        const result = StringHandler.isLuhn('4111a111b1111c111');
        expect(result.pass).toBe(false);
    });

    it('should fail for an empty string', () => {
        const result = StringHandler.isLuhn('');
        expect(result.pass).toBe(false);
    });
});

describe('StringHandler.isIpCidrV4', () => {
    it('should pass for a valid IPv4 CIDR notation', () => {
        const result = StringHandler.isIpCidrV4('192.168.1.0/24');
        expect(result.pass).toBe(true);
    });

    it('should pass for a valid IPv4 CIDR with /32 mask', () => {
        const result = StringHandler.isIpCidrV4('10.0.0.1/32');
        expect(result.pass).toBe(true);
    });

    it('should fail for an invalid IPv4 address', () => {
        const result = StringHandler.isIpCidrV4('999.999.999.999/24');
        expect(result.pass).toBe(false);
    });

    it('should fail for an invalid CIDR mask', () => {
        const result = StringHandler.isIpCidrV4('192.168.1.0/33');
        expect(result.pass).toBe(false);
    });

    it('should fail for a missing mask', () => {
        const result = StringHandler.isIpCidrV4('192.168.1.0');
        expect(result.pass).toBe(false);
    });

    it('should fail for a non-numeric mask', () => {
        const result = StringHandler.isIpCidrV4('192.168.1.0/abc');
        expect(result.pass).toBe(false);
    });

    it('should fail for a string that is not in CIDR format', () => {
        const result = StringHandler.isIpCidrV4('not.an.ip/cidr');
        expect(result.pass).toBe(false);
    });
});

describe('StringHandler.isIpCidrV6', () => {
    it('should pass for a valid IPv6 CIDR notation', () => {
        const result = StringHandler.isIpCidrV6('2001:db8::/32');
        expect(result.pass).toBe(true);
    });

    it('should pass for a valid IPv6 CIDR with /128 mask', () => {
        const result = StringHandler.isIpCidrV6('2001:db8::1/128');
        expect(result.pass).toBe(true);
    });

    it('should fail for an invalid IPv6 address', () => {
        const result = StringHandler.isIpCidrV6('2001:db8:::1/64');
        expect(result.pass).toBe(false);
    });

    it('should fail for a missing mask', () => {
        const result = StringHandler.isIpCidrV6('2001:db8::1');
        expect(result.pass).toBe(false);
    });

    it('should fail for a non-numeric mask', () => {
        const result = StringHandler.isIpCidrV6('2001:db8::/abc');
        expect(result.pass).toBe(false);
    });

    it('should fail for a string that is not in CIDR format', () => {
        const result = StringHandler.isIpCidrV6('not:an:ip/cidr');
        expect(result.pass).toBe(false);
    });
});

describe('StringHandler.isIpCidr', () => {
    it('should pass for a valid IPv4 CIDR', () => {
        const result = StringHandler.isIpCidr('192.168.1.0/24');
        expect(result.pass).toBe(true);
    });

    it('should pass for a valid IPv6 CIDR', () => {
        const result = StringHandler.isIpCidr('2001:db8::/32');
        expect(result.pass).toBe(true);
    });

    it('should fail for an invalid IPv4 CIDR', () => {
        const result = StringHandler.isIpCidr('999.999.999.999/24');
        expect(result.pass).toBe(false);
    });

    it('should fail for an invalid IPv6 CIDR', () => {
        const result = StringHandler.isIpCidr('2001:db8:::1/64');
        expect(result.pass).toBe(false);
    });

    it('should fail for a missing mask', () => {
        const result = StringHandler.isIpCidr('192.168.1.0');
        expect(result.pass).toBe(false);
    });

    it('should fail for a non-numeric mask', () => {
        const result = StringHandler.isIpCidr('2001:db8::/abc');
        expect(result.pass).toBe(false);
    });

    it('should fail for a string that is not in CIDR format', () => {
        const result = StringHandler.isIpCidr('not.an.ip/cidr');
        expect(result.pass).toBe(false);
    });
});

describe('StringHandler.isSsn', () => {
    it('should pass for a valid SSN with dashes', () => {
        const result = StringHandler.isSsn('123-45-7890');
        expect(result.pass).toBe(true);
    });

    it('should pass for a valid SSN with spaces if allowed', () => {
        const result = StringHandler.isSsn('123 46 7890', { allowedDelims: ' ' });
        expect(result.pass).toBe(true);
    });

    it('should pass for a valid SSN with dots if allowed', () => {
        const result = StringHandler.isSsn('123.45.7839', { allowedDelims: '.' });
        expect(result.pass).toBe(true);
    });

    it('should pass for a valid SSN with no delimiters if allowLooseFormat is true', () => {
        const result = StringHandler.isSsn('123456789', { allowLooseFormat: true });
        expect(result.pass).toBe(true);
    });

    it('should fail for a string that is too short', () => {
        const result = StringHandler.isSsn('123-45-678');
        expect(result.pass).toBe(false);
    });

    it('should fail for a string with letters', () => {
        const result = StringHandler.isSsn('123-abc-7890');
        expect(result.pass).toBe(false);
    });

    it('should fail for an empty string', () => {
        const result = StringHandler.isSsn('');
        expect(result.pass).toBe(false);
    });
});

describe('StringHandler.isNumeric', () => {
    it('should pass for a simple integer string', () => {
        const result = StringHandler.isNumeric('12,345');
        expect(result.pass).toBe(true);
    });

    it('should pass for a negative integer string', () => {
        const result = StringHandler.isNumeric('-9,876');
        expect(result.pass).toBe(true);
    });

    it('should pass for a decimal string', () => {
        const result = StringHandler.isNumeric('123.45');
        expect(result.pass).toBe(true);
    });

    it('should pass for a string with thousands separator', () => {
        const result = StringHandler.isNumeric('1,234,567');
        expect(result.pass).not.toBe(false);
    });

    it('should fail for a string with letters', () => {
        const result = StringHandler.isNumeric('12a45');
        expect(result.pass).toBe(false);
    });

    it('should fail for an empty string', () => {
        const result = StringHandler.isNumeric('');
        expect(result.pass).toBe(false);
    });

    it('should fail for a string with only symbols', () => {
        const result = StringHandler.isNumeric('---');
        expect(result.pass).toBe(false);
    });
});

describe('StringHandler.isNumeric with plus/minus and leftAlign options', () => {
    // Plus sign tests
    it('should pass for a positive number with plus sign when plus is optional', () => {
        const result = StringHandler.isNumeric('+123', { plus: Presence.optional });
        expect(result.pass).toBe(true);
    });

    it('should pass for a positive number with plus sign when plus is allowed', () => {
        const result = StringHandler.isNumeric('+123', { plus: Presence.optional });
        expect(result.pass).toBe(true);
    });

    it('should fail for a positive number with plus sign when plus is forbidden', () => {
        const result = StringHandler.isNumeric('+123', { plus: Presence.forbidden });
        expect(result.pass).toBe(false);
    });

    // Minus sign tests
    it('should pass for a negative number with minus sign when minus is optional', () => {
        const result = StringHandler.isNumeric('-123', { minus: Presence.optional });
        expect(result.pass).toBe(true);
    });

    it('should pass for a negative number with minus sign when minus is allowed', () => {
        const result = StringHandler.isNumeric('-123', { minus: Presence.optional });
        expect(result.pass).toBe(true);
    });

    it('should fail for a negative number with minus sign when minus is forbidden', () => {
        const result = StringHandler.isNumeric('-123', { minus: Presence.forbidden });
        expect(result.pass).toBe(false);
    });

    // leftAlign true
    it('should pass for a left-aligned number with plus when leftAlign is true', () => {
        const result = StringHandler.isNumeric('+123', { plus: Presence.optional, leftAlign: true });
        expect(result.pass).toBe(true);
    });

    it('should pass for a left-aligned number with minus when leftAlign is true', () => {
        const result = StringHandler.isNumeric('-123', { minus: Presence.optional, leftAlign: true });
        expect(result.pass).toBe(true);
    });

    it('should fail for a number with plus not at the start when leftAlign is true', () => {
        const result = StringHandler.isNumeric('123+', { plus: Presence.optional, leftAlign: true });
        expect(result.pass).toBe(false);
    });

    it('should fail for a number with minus not at the start when leftAlign is true', () => {
        const result = StringHandler.isNumeric('123-', { minus: Presence.optional, leftAlign: true });
        expect(result.pass).toBe(false);
    });

    // leftAlign false
    it('should pass for a number with plus at the start when leftAlign is false', () => {
        const result = StringHandler.isNumeric('+123', { plus: Presence.optional, leftAlign: true });
        expect(result.pass).toBe(true);
    });

    it('should pass for a number with minus at the start when leftAlign is false', () => {
        const result = StringHandler.isNumeric('-123', { minus: Presence.optional, leftAlign: true });
        expect(result.pass).toBe(true);
    });

    it('should pass for a number with plus not at the start when leftAlign is false', () => {
        const result = StringHandler.isNumeric('123+', { plus: Presence.optional, leftAlign: false });
        expect(result.pass).toBe(true);
    });

    it('should pass for a number with minus not at the start when leftAlign is false', () => {
        const result = StringHandler.isNumeric('123-', { minus: Presence.optional, leftAlign: false });
        expect(result.pass).toBe(true);
    });
});

describe('StringHandler.isNumeric with decimal, leadingZero, and trailingZero options', () => {
    // --- DECIMAL ---
    it('should pass for a decimal number when decimal is optional', () => {
        const result = StringHandler.isNumeric('123.45', { decimal: Presence.optional });
        expect(result.pass).toBe(true);
    });

    it('should pass for a decimal number when decimal is required', () => {
        const result = StringHandler.isNumeric('123.45', { decimal: Presence.required });
        expect(result.pass).toBe(true);
    });

    it('should fail for an integer when decimal is required', () => {
        const result = StringHandler.isNumeric('123', { decimal: Presence.required });
        expect(result.pass).toBe(false);
    });

    it('should fail for a decimal number when decimal is forbidden', () => {
        const result = StringHandler.isNumeric('123.45', { decimal: Presence.forbidden });
        expect(result.pass).toBe(false);
    });

    // --- LEADING ZERO ---
    it('should pass for a number with leading zero when leadingZero is optional', () => {
        const result = StringHandler.isNumeric('0.45', { leadingZero: Presence.optional });
        expect(result.pass).toBe(true);
    });

    it('should pass for a number with leading zero when leadingZero is required', () => {
        const result = StringHandler.isNumeric('0.45', { leadingZero: Presence.required });
        expect(result.pass).toBe(true);
    });

    it('should fail for a number with leading zero when leadingZero is forbidden', () => {
        const result = StringHandler.isNumeric('0.45', { leadingZero: Presence.forbidden });
        expect(result.pass).toBe(false);
    });

    // --- TRAILING ZERO ---
    it('should pass for a number with trailing zero when trailingZero is optional', () => {
        const result = StringHandler.isNumeric('123.0', { trailingZero: Presence.optional });
        expect(result.pass).toBe(true);
    });

    it('should pass for a number with trailing zero when trailingZero is required', () => {
        const result = StringHandler.isNumeric('123.0', { trailingZero: Presence.required });
        expect(result.pass).toBe(true);
    });

    it('should fail for a number with trailing zero when trailingZero is forbidden', () => {
        const result = StringHandler.isNumeric('123.0', { trailingZero: Presence.forbidden });
        expect(result.pass).toBe(false);
    });
});

describe('StringHandler.isNumeric with thousandsDelim, decimalDelim, minPrecision, and maxPrecision', () => {
    it('should pass for a number with comma as thousands delimiter', () => {
        const result = StringHandler.isNumeric('1,234,567.89', { thousandsDelim: ',' });
        expect(result.pass).toBe(true);
    });

    it('should pass for a number with space as thousands delimiter', () => {
        const result = StringHandler.isNumeric('1 234 567.89', { thousandsDelim: ' ' });
        expect(result.pass).toBe(true);
    });

    it('should pass for a number with period as thousands delimiter and comma as decimal delimiter', () => {
        const result = StringHandler.isNumeric('1.234.567,89', { thousandsDelim: '.', decimalDelim: ',' });
        expect(result.pass).toBe(true);
    });

    it('should fail for a number with wrong thousands delimiter', () => {
        const result = StringHandler.isNumeric('1.234,567.89', { thousandsDelim: ',' });
        expect(result.pass).toBe(false);
    });

    it('should pass for a number with exactly minPrecision decimal places', () => {
        const result = StringHandler.isNumeric('123.45', { minPrecision: 2 });
        expect(result.pass).toBe(true);
    });

    it('should fail for a number with fewer than minPrecision decimal places', () => {
        const result = StringHandler.isNumeric('123.4', { minPrecision: 2 });
        expect(result.pass).toBe(false);
    });

    it('should pass for a number with exactly maxPrecision decimal places', () => {
        const result = StringHandler.isNumeric('123.456', { maxPrecision: 3 });
        expect(result.pass).toBe(true);
    });

    it('should fail for a number with more than maxPrecision decimal places', () => {
        const result = StringHandler.isNumeric('123.4567', { maxPrecision: 3 });
        expect(result.pass).toBe(false);
    });

    it('should pass for a number with minPrecision and maxPrecision range', () => {
        const result = StringHandler.isNumeric('123.45', { minPrecision: 2, maxPrecision: 4 });
        expect(result.pass).toBe(true);
    });

    it('should fail for a number outside minPrecision and maxPrecision range', () => {
        const result = StringHandler.isNumeric('123.4', { minPrecision: 2, maxPrecision: 4 });
        expect(result.pass).toBe(false);
    });
});

describe('StringHandler.isNumeric with leadingSymbol, trailingSymbol, ignoreCase, and allowLooseFormat', () => {
    it('should pass for a number with a $ leading symbol', () => {
        const result = StringHandler.isNumeric('$123.45', { leadingSymbol: '$' });
        expect(result.pass).toBe(true);
    });

    it('should pass for a number with EUR trailing symbol', () => {
        const result = StringHandler.isNumeric('123.45EUR', { trailingSymbol: 'EUR' });
        expect(result.pass).toBe(true);
    });

    it('should pass for a number with mixed case trailing symbol and ignoreCase true', () => {
        const result = StringHandler.isNumeric('123.45eUr', { trailingSymbol: 'EUR', ignoreCase: true });
        expect(result.pass).toBe(true);
    });

    it('should fail for a number with mixed case trailing symbol and ignoreCase false', () => {
        const result = StringHandler.isNumeric('123.45eUr', { trailingSymbol: 'EUR', ignoreCase: false });
        expect(result.pass).toBe(false);
    });

    it('should pass for a number with spaces and allowLooseFormat true', () => {
        const result = StringHandler.isNumeric('  1,234.56  ', { allowLooseFormat: true });
        expect(result.pass).toBe(true);
    });

    it('should fail for a number with spaces and allowLooseFormat false', () => {
        const result = StringHandler.isNumeric('  1 234 . 56  ', { allowLooseFormat: false });
        expect(result.pass).toBe(false);
    });

    it('should pass for a number with both leading and trailing symbols', () => {
        const result = StringHandler.isNumeric('$123.45USD', { leadingSymbol: '$', trailingSymbol: 'USD' });
        expect(result.pass).toBe(true);
    });

    it('should fail for a number with incorrect leading symbol', () => {
        const result = StringHandler.isNumeric('€123.45', { leadingSymbol: '$' });
        expect(result.pass).toBe(false);
    });

    it('should fail for a number with incorrect trailing symbol', () => {
        const result = StringHandler.isNumeric('123.45GBP', { trailingSymbol: 'USD' });
        expect(result.pass).toBe(false);
    });
});



describe('StringHandler.isMoney', () => {
    it('should pass for a valid USD amount with $ symbol', () => {
        const result = StringHandler.isMoney('$1,234.56');
        expect(result.pass).toBe(true);
    });

    it('should pass for a valid EUR amount with € symbol and comma as decimal', () => {
        const result = StringHandler.isMoney('€1.234,56', { leadingSymbol: '€', decimalDelim: ',', thousandsDelim: '.' });
        expect(result.pass).toBe(true);
    });

    it('should pass for a negative amount in parentheses', () => {
        const result = StringHandler.isMoney('($123.45)', { parens: true });
        expect(result.pass).toBe(true);
    });

    it('should pass for a negative amount with minus sign', () => {
        const result = StringHandler.isMoney('-$123.45');
        expect(result.pass).toBe(true);
    });

    it('should fail for an amount with invalid symbol', () => {
        const result = StringHandler.isMoney('£123.45', { leadingSymbol: '$' });
        expect(result.pass).toBe(false);
    });

    it('should pass for a valid amount with symbol after the number', () => {
        const result = StringHandler.isMoney('123.45$', { leadingSymbol: '', trailingSymbol: '$' });
        expect(result.pass).toBe(true);
    });

    it('should fail for a string with letters', () => {
        const result = StringHandler.isMoney('$12a.45');
        expect(result.pass).toBe(false);
    });

    it('should pass for a valid amount with space.isBetween symbol and number', () => {
        const result = StringHandler.isMoney('$ 123.45', { symSpace: true });
        expect(result.pass).toBe(true);
    });

    it('should fail for a string with multiple symbols', () => {
        const result = StringHandler.isMoney('$$123.45');
        expect(result.pass).toBe(false);
    });
});

describe('StringHandler.isMeasurement', () => {
    it('should pass for a valid integer with unit', () => {
        const result = StringHandler.isMeasurement('12kg', { units: ['km', 'kg'] });
        expect(result.pass).toBe(true);
    });

    it('should pass for a valid decimal with unit', () => {
        const result = StringHandler.isMeasurement('3.5m', { units: 'm' });
        expect(result.pass).toBe(true);
    });

    it('should pass for a valid negative number with unit', () => {
        const result = StringHandler.isMeasurement('-42cm', { units: ['m', 'cm'] });
        expect(result.pass).toBe(true);
    });

    it('should pass for a valid number with space before unit', () => {
        const result = StringHandler.isMeasurement('100 m', { units: ['m', 'cm'] });
        expect(result.pass).toBe(true);
    });

    it('should fail for a string without a unit', () => {
        const result = StringHandler.isMeasurement('123');
        expect(result.pass).toBe(false);
    });

    it('should fail for a string with an invalid unit', () => {
        const result = StringHandler.isMeasurement('5.5xyz');
        expect(result.pass).toBe(false);
    });

    it('should pass for a valid number with a unit from a custom allowedUnits list', () => {
        const result = StringHandler.isMeasurement('10ft', { units: ['ft', 'in'] });
        expect(result.pass).toBe(true);
    });

    it('should fail for a valid number with a unit not in the custom allowedUnits list', () => {
        const result = StringHandler.isMeasurement('10cm', { units: ['ft', 'in'] });
        expect(result.pass).toBe(false);
    });

    it('should pass for a valid number with a unit and ignoreCase true', () => {
        const result = StringHandler.isMeasurement('10KG', { units: 'kg', ignoreCase: true });
        expect(result.pass).toBe(true);
    });

    it('should fail for a valid number with a unit and ignoreCase false', () => {
        const result = StringHandler.isMeasurement('10KG', { units: 'kg', ignoreCase: false });
        expect(result.pass).toBe(false);
    });

    it('should pass for a measurement with extra spaces when allowLooseFormat is true', () => {
        const result = StringHandler.isMeasurement('  12   kg  ', { units: ['kg'], allowLooseFormat: true });
        expect(result.pass).toBe(true);
    });

    it('should pass for a measurement with mixed delimiters when allowLooseFormat is true', () => {
        const result = StringHandler.isMeasurement('3.5 m', { units: ['m'], allowLooseFormat: true });
        expect(result.pass).toBe(true);
    });

    it('should fail for a measurement with extra spaces when allowLooseFormat is false', () => {
        const result = StringHandler.isMeasurement('  12   kg  ', { units: ['kg'], allowLooseFormat: false });
        expect(result.pass).toBe(false);
    });
});

describe('StringHandler.isSlug', () => {
    it('should pass for a valid slug with dashes', () => {
        const result = StringHandler.isSlug('this-is-a-slug');
        expect(result.pass).toBe(true);
    });

    it('should fail for a slug with spaces', () => {
        const result = StringHandler.isSlug('this is not a slug');
        expect(result.pass).toBe(false);
    });

    it('should fail for a slug with special characters', () => {
        const result = StringHandler.isSlug('slug$with#chars');
        expect(result.pass).toBe(false);
    });
});

describe('StringHandler.isJson', () => {
    it('should pass for a valid JSON object string', () => {
        const result = StringHandler.isJson('{"foo": "bar", "baz": 123}');
        expect(result.pass).toBe(true);
    });

    it('should pass for a valid JSON array string', () => {
        const result = StringHandler.isJson('[1, 2, 3, 4]');
        expect(result.pass).toBe(true);
    });

    it('should fail for an invalid JSON string', () => {
        const result = StringHandler.isJson('{foo: bar}');
        expect(result.pass).toBe(false);
    });
});

describe('StringHandler.isJwt', () => {
    it('should pass for a valid JWT string', () => {
        const result = StringHandler.isJwt('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c');
        expect(result.pass).toBe(true);
    });

    it('should fail for a string with only two JWT segments', () => {
        const result = StringHandler.isJwt('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ');
        expect(result.pass).toBe(false);
    });

    it('should fail for a string with invalid JWT characters', () => {
        const result = StringHandler.isJwt('not.a.valid.jwt!');
        expect(result.pass).toBe(false);
    });
});

describe('StringHandler.isUuid', () => {
    it('should pass for a valid UUID v4', () => {
        const result = StringHandler.isUuid('123e4567-e89b-12d3-a456-426614174000');
        expect(result.pass).toBe(true);
    });

    it('should fail for a string that is not a UUID', () => {
        const result = StringHandler.isUuid('not-a-uuid');
        expect(result.pass).toBe(false);
    });

    it('should fail for a UUID with invalid characters', () => {
        const result = StringHandler.isUuid('123e4567-e89b-12d3-a456-42661417400z');
        expect(result.pass).toBe(false);
    });
});

describe('StringHandler.isHash', () => {
    it('should pass for a valid MD5 hash', () => {
        const result = StringHandler.isHash('d41d8cd98f00b204e9800998ecf8427e', 'md5');
        expect(result.pass).toBe(true);
    });

    it('should fail for an invalid MD5 hash (wrong length)', () => {
        const result = StringHandler.isHash('d41d8cd98f00b204e9800998ecf8427', 'md5');
        expect(result.pass).toBe(false);
    });

    it('should pass for a valid SHA1 hash', () => {
        const result = StringHandler.isHash('da39a3ee5e6b4b0d3255bfef95601890afd80709', 'sha1');
        expect(result.pass).toBe(true);
    });

    it('should pass for a valid SHA256 hash', () => {
        const result = StringHandler.isHash('e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855', 'sha256');
        expect(result.pass).toBe(true);
    });

    it('should fail for an unknown algorithm', () => {
        const result = StringHandler.isHash('abcdef', 'unknownalgo');
        expect(result.pass).toBe(false);
    });
});

describe('StringHandler.complex', () => {
    it('should pass for a string meeting all default complexity requirements', () => {
        const result = StringHandler.complex('Abcdef1!');
        expect(result.pass).toBe(true);
    });

    it('should fail for a string that is too short', () => {
        const result = StringHandler.complex('Ab1!');
        expect(result.pass).toBe(false);
    });

    it('should fail for a string with not enough uppercase letters', () => {
        const result = StringHandler.complex('abcdef1!');
        expect(result.pass).toBe(false);
    });

    it('should fail for a string with not enough lowercase letters', () => {
        const result = StringHandler.complex('ABCDEF1!');
        expect(result.pass).toBe(false);
    });

    it('should fail for a string with not enough digits', () => {
        const result = StringHandler.complex('Abcdefgh!');
        expect(result.pass).toBe(false);
    });

    it('should fail for a string with not enough special characters', () => {
        const result = StringHandler.complex('Abcdef12');
        expect(result.pass).toBe(false);
    });

    it('should fail for a string with too many repeated characters', () => {
        const result = StringHandler.complex('AAAbbb111!!!');
        expect(result.pass).toBe(false);
    });

    it('should pass for a string with custom min/max length', () => {
        const result = StringHandler.complex('Abc1!xyz', { minLen: 5, maxLen: 10 });
        expect(result.pass).toBe(true);
    });

    it('should fail for a string exceeding maxLen', () => {
        const longStr = 'A1!a'.repeat(30); // 120 chars
        const result = StringHandler.complex(longStr, { maxLen: 100 });
        expect(result.pass).toBe(false);
    });

    it('should fail for a string with custom minUppercase and minSpecialChars', () => {
        const result = StringHandler.complex('AAbc1!!', { minUppercase: 3, minSpecialChars: 2 });
        expect(result.pass).toBe(false);
    });
});

describe('StringHandler.isCreditCard', () => {
    it('should pass for a valid Visa card number', () => {
        const result = StringHandler.isCreditCard('4111 1111 1111 1111');
        expect(result.pass).toBe(true);
    });

    it('should pass for a valid MasterCard number', () => {
        const result = StringHandler.isCreditCard('5500-0000-0000-0004');
        expect(result.pass).toBe(true);
    });

    it('should pass for a valid American Express card number', () => {
        const result = StringHandler.isCreditCard('3400 0000 0000 009');
        expect(result.pass).toBe(true);
    });

    it('should fail for a number with invalid length', () => {
        const result = StringHandler.isCreditCard('4111 1111 1111');
        expect(result.pass).toBe(false);
    });

    it('should fail for a number with invalid characters', () => {
        const result = StringHandler.isCreditCard('4111 1111 1111 111a');
        expect(result.pass).toBe(false);
    });

    it('should fail for a number that does not pass the Luhn check', () => {
        const result = StringHandler.isCreditCard('4111 1111 1111 1121');
        expect(result.pass).toBe(false);
    });

    it('should fail for an empty string', () => {
        const result = StringHandler.isCreditCard('');
        expect(result.pass).toBe(false);
    });
});

describe('StringHandler.isCreditCard - additional tests', () => {
    it('should pass for a valid Discover card number', () => {
        const result = StringHandler.isCreditCard('6011 0000 0000 0004');
        expect(result.pass).toBe(true);
    });

    it('should pass for a valid JCB card number', () => {
        const result = StringHandler.isCreditCard('3530 1113 3330 0000');
        expect(result.pass).toBe(true);
    });

    it('should pass for a valid Diners Club card number', () => {
        const result = StringHandler.isCreditCard('36227206271667', { types: ['diners', 'diners-enroute'] });
        expect(result.pass).toBe(true);
    });

    it('should fail for a card number with too many digits', () => {
        const result = StringHandler.isCreditCard('4111 1111 1111 1111 1111');
        expect(result.pass).toBe(false);
    });

    it('should fail for a card number with too few digits', () => {
        const result = StringHandler.isCreditCard('4111 1111 111');
        expect(result.pass).toBe(false);
    });

    it('should fail for a card number with all the same digit', () => {
        const result = StringHandler.isCreditCard('1111 1111 1111 1111');
        expect(result.pass).toBe(false);
    });

    it('should pass for a valid Mastercard number with dashes', () => {
        const result = StringHandler.isCreditCard('5500-0000-0000-0004');
        expect(result.pass).toBe(true);
    });

    it('should fail for a valid card number but with an unsupported type', () => {
        const result = StringHandler.isCreditCard('4111 1111 1111 1111', { types: ['amex'] });
        expect(result.pass).toBe(false);
    });

    it('should pass for a valid Amex card number with loose format', () => {
        const result = StringHandler.isCreditCard('340000000000009', { allowLooseFormat: true });
        expect(result.pass).toBe(true);
    });

    it('should pass for a valid Diners Club card number', () => {
        const result = StringHandler.isCreditCard('3056 9309 0259 04', { types: ['diners', 'diners-enroute'] });
        expect(result.pass).toBe(true);
    });
});

describe('StringHandler.isImei', () => {
    it('should pass for a valid 15-digit IMEI', () => {
        const result = StringHandler.isImei('490154203237518');
        expect(result.pass).toBe(true);
    });

    it('should pass for a valid IMEI with spaces', () => {
        const result = StringHandler.isImei('49 015420 323751 8');
        expect(result.pass).toBe(true);
    });

    it('should fail for an IMEI with letters', () => {
        const result = StringHandler.isImei('49015420323A518');
        expect(result.pass).toBe(false);
    });

    it('should fail for an IMEI with too few digits', () => {
        const result = StringHandler.isImei('49015420323751');
        expect(result.pass).toBe(false);
    });

    it('should fail for an IMEI with too many digits', () => {
        const result = StringHandler.isImei('4901542032375189');
        expect(result.pass).toBe(false);
    });

    it('should fail for an IMEI that does not pass the Luhn check', () => {
        const result = StringHandler.isImei('490154203237519');
        expect(result.pass).toBe(false);
    });
});

describe('StringHandler.isMac', () => {
    it('should pass for a valid MAC address with colons', () => {
        const result = StringHandler.isMac('00:1A:2B:3C:4D:5E');
        expect(result.pass).toBe(true);
    });

    it('should pass for a valid MAC address with dashes', () => {
        const result = StringHandler.isMac('00-1A-2B-3C-4D-5E');
        expect(result.pass).toBe(true);
    });

    it('should pass for a valid MAC address with no separators', () => {
        const result = StringHandler.isMac('001A2B3C4D5E');
        expect(result.pass).toBe(true);
    });

    it('should fail for a MAC address with invalid characters', () => {
        const result = StringHandler.isMac('00:1G:2B:3C:4D:5E');
        expect(result.pass).toBe(false);
    });

    it('should fail for a MAC address with too few octets', () => {
        const result = StringHandler.isMac('00:1A:2B:3C:4D');
        expect(result.pass).toBe(false);
    });

    it('should fail for a MAC address with too many octets', () => {
        const result = StringHandler.isMac('00:1A:2B:3C:4D:5E:6F');
        expect(result.pass).toBe(false);
    });

    it('should fail for an empty string', () => {
        const result = StringHandler.isMac('');
        expect(result.pass).toBe(false);
    });
});

describe('StringHandler.isGtin', () => {
    it('should pass for a valid GTIN-8', () => {
        const result = StringHandler.isGtin('96385074');
        expect(result.pass).toBe(true);
    });

    it('should pass for a valid GTIN-12', () => {
        const result = StringHandler.isGtin('012345678905');
        expect(result.pass).toBe(true);
    });

    it('should pass for a valid GTIN-13', () => {
        const result = StringHandler.isGtin('4006381333931');
        expect(result.pass).toBe(true);
    });

    it('should pass for a valid GTIN-14', () => {
        const result = StringHandler.isGtin('10012345678902');
        expect(result.pass).toBe(true);
    });

    it('should fail for a GTIN with invalid length', () => {
        const result = StringHandler.isGtin('1234567');
        expect(result.pass).toBe(false);
    });

    it('should fail for a GTIN with invalid characters', () => {
        const result = StringHandler.isGtin('400638133393X');
        expect(result.pass).toBe(false);
    });

    it('should fail for a GTIN that does not pass the Luhn check', () => {
        const result = StringHandler.isGtin('4006381333932');
        expect(result.pass).toBe(false);
    });

    it('should pass for a valid GTIN-13 with spaces and allowLooseFormat true', () => {
        const result = StringHandler.isGtin('4006381333931', { allowLooseFormat: true });
        expect(result.pass).toBe(true);
    });

    it('should fail for a valid GTIN-13 with spaces and allowLooseFormat false', () => {
        const result = StringHandler.isGtin('4006 3813 3393 1', { allowLooseFormat: false });
        expect(result.pass).toBe(false);
    });
});

describe('StringHandler.isCurrencyCode', () => {
    it('should pass for a valid 3-letter currency code', () => {
        const result = StringHandler.isCurrencyCode('USD');
        expect(result.pass).toBe(true);
    });

    it('should pass for a valid lowercase currency code', () => {
        const result = StringHandler.isCurrencyCode('eur', {ignoreCase: true});
        expect(result.pass).toBe(true);
    });

    it('should fail for a code that is too short', () => {
        const result = StringHandler.isCurrencyCode('US');
        expect(result.pass).toBe(false);
    });

    it('should fail for a code that is too long', () => {
        const result = StringHandler.isCurrencyCode('USDA');
        expect(result.pass).toBe(false);
    });

    it('should fail for a code with numbers', () => {
        const result = StringHandler.isCurrencyCode('U5D');
        expect(result.pass).toBe(false);
    });

    it('should fail for a code with special characters', () => {
        const result = StringHandler.isCurrencyCode('U$D');
        expect(result.pass).toBe(false);
    });

    it('should fail for an empty string', () => {
        const result = StringHandler.isCurrencyCode('');
        expect(result.pass).toBe(false);
    });
});

describe('StringHandler.isZip', () => {
    it('should pass for a valid 5-digit US ZIP code', () => {
        const result = StringHandler.isZip('12345');
        expect(result.pass).toBe(true);
    });

    it('should pass for a valid ZIP+4 code with dash', () => {
        const result = StringHandler.isZip('12345-6789');
        expect(result.pass).toBe(true);
    });

    it('should pass for a valid ZIP+4 code with space', () => {
        const result = StringHandler.isZip('12345 6789', { allowedDelims: ' ' });
        expect(result.pass).toBe(true);
    });

    it('should fail for a ZIP code with too few digits', () => {
        const result = StringHandler.isZip('1234');
        expect(result.pass).toBe(false);
    });

    it('should fail for a ZIP code with too many digits', () => {
        const result = StringHandler.isZip('123456');
        expect(result.pass).toBe(false);
    });

    it('should fail for a ZIP code with letters', () => {
        const result = StringHandler.isZip('1234A');
        expect(result.pass).toBe(false);
    });

    it('should fail for an invalid ZIP+4 format', () => {
        const result = StringHandler.isZip('12345-678');
        expect(result.pass).toBe(false);
    });

    it('should fail for an empty string', () => {
        const result = StringHandler.isZip('');
        expect(result.pass).toBe(false);
    });

        it('should pass for a 5-digit ZIP when zip4 is forbidden', () => {
        const result = StringHandler.isZip('12345', { zip4: Presence.forbidden });
        expect(result.pass).toBe(true);
    });

    it('should fail for a ZIP+4 when zip4 is forbidden', () => {
        const result = StringHandler.isZip('12345-6789', { zip4: Presence.forbidden });
        expect(result.pass).toBe(false);
    });

    it('should pass for a ZIP+4 when zip4 is required', () => {
        const result = StringHandler.isZip('12345-6789', { zip4: Presence.required });
        expect(result.pass).toBe(true);
    });

    it('should fail for a 5-digit ZIP when zip4 is required', () => {
        const result = StringHandler.isZip('12345', { zip4: Presence.required });
        expect(result.pass).toBe(false);
    });
});

describe('StringHandler.isState', () => {
    it('should pass for a valid US state abbreviation', () => {
        const result = StringHandler.isState('CA');
        expect(result.pass).toBe(true);
    });

    it('should pass for a valid lowercase state abbreviation with allowLooseFormat true', () => {
        const result = StringHandler.isState('ny', { allowLooseFormat: true });
        expect(result.pass).toBe(true);
    });

    it('should fail for a lowercase state abbreviation with allowLooseFormat false', () => {
        const result = StringHandler.isState('ny', { allowLooseFormat: false });
        expect(result.pass).toBe(false);
    });

    it('should fail for an invalid state abbreviation', () => {
        const result = StringHandler.isState('XY');
        expect(result.pass).toBe(false);
    });

    it('should fail for a state abbreviation that is too long', () => {
        const result = StringHandler.isState('CAL');
        expect(result.pass).toBe(false);
    });

    it('should pass for District of Columbia', () => {
        const result = StringHandler.isState('DC');
        expect(result.pass).toBe(true);
    });

    it('should pass for lowercase nj', () => {
        const result = StringHandler.isState('nj');
        expect(result.pass).toBe(true);
    });

    it('should fail for an empty string', () => {
        const result = StringHandler.isState('');
        expect(result.pass).toBe(false);
    });
});

describe('StringHandler.stripHtml', () => {
    it('should remove HTML tags from a string', () => {
        const result = StringHandler.stripHtml('<b>Hello</b> <i>world</i>!');
        expect(result.pass).toBe(true);
        expect(result.value).toBe('Hello world!');
    });
    it('should return the same string if there are no HTML tags', () => {
        const result = StringHandler.stripHtml('Just text.');
        expect(result.pass).toBe(true);
        expect(result.value).toBe('Just text.');
    });
    it('should handle empty string', () => {
        const result = StringHandler.stripHtml('');
        expect(result.pass).toBe(true);
        expect(result.value).toBe('');
    });
});

describe('StringHandler.escapeHtml', () => {
    it('should escape HTML special characters', () => {
        const result = StringHandler.escapeHtml('<div>"Hello" & world</div>');
        expect(result.pass).toBe(true);
        expect(result.value).toBe('&lt;div&gt;&quot;Hello&quot; &amp; world&lt;/div&gt;');
    });
    it('should return the same string if there are no special characters', () => {
        const result = StringHandler.escapeHtml('plain text');
        expect(result.pass).toBe(true);
        expect(result.value).toBe('plain text');
    });
    it('should handle empty string', () => {
        const result = StringHandler.escapeHtml('');
        expect(result.pass).toBe(true);
        expect(result.value).toBe('');
    });
});

describe('StringHandler.normalizeLineBreaks', () => {
    it('should normalize CRLF and CR to LF by default', () => {
        const result = StringHandler.normalizeLineBreaks('a\r\nb\rc\nd');
        expect(result.pass).toBe(true);
        expect(result.value).toBe('a\nb\nc\nd');
    });
    it('should normalize to custom line break', () => {
        const result = StringHandler.normalizeLineBreaks('a\r\nb\rc\nd', '\r\n');
        expect(result.pass).toBe(true);
        expect(result.value).toBe('a\r\nb\r\nc\r\nd');
    });
    it('should handle empty string', () => {
        const result = StringHandler.normalizeLineBreaks('');
        expect(result.pass).toBe(true);
        expect(result.value).toBe('');
    });
});

describe('StringHandler.normalizeUnicode', () => {
    it('should normalize to NFC by default', () => {
        // e01 is e + combining acute accent, should normalize to é
        const result = StringHandler.normalizeUnicode('e\u0301');
        expect(result.pass).toBe(true);
        expect(result.value).toBe('é');
    });
    it('should normalize to NFD', () => {
        const result = StringHandler.normalizeUnicode('é', 'NFD');
        expect(result.pass).toBe(true);
        expect(result.value).toBe('e\u0301');
    });
    it('should handle empty string', () => {
        const result = StringHandler.normalizeUnicode('');
        expect(result.pass).toBe(true);
        expect(result.value).toBe('');
    });
});

describe('StringHandler.toCamelCase', () => {
    it('should convert kebab-case to camelCase', () => {
        const result = StringHandler.toCamelCase('Hello-world');
        expect(result.pass).toBe(true);
        expect(result.value).toBe('helloWorld');
    });

    it('should convert snake_case to camelCase', () => {
        const result = StringHandler.toCamelCase('hello_world_test');
        expect(result.pass).toBe(true);
        expect(result.value).toBe('helloWorldTest');
    });

    it('should convert space-separated words to camelCase', () => {
        const result = StringHandler.toCamelCase('hello world test');
        expect(result.pass).toBe(true);
        expect(result.value).toBe('helloWorldTest');
    });

    it('should handle mixed delimiters', () => {
        const result = StringHandler.toCamelCase('hello-world_test case');
        expect(result.pass).toBe(true);
        expect(result.value).toBe('helloWorldTestCase');
    });

    it('should handle multiple consecutive delimiters', () => {
        const result = StringHandler.toCamelCase('hello--world__test  case');
        expect(result.pass).toBe(true);
        expect(result.value).toBe('helloWorldTestCase');
    });

    it('should handle single word', () => {
        const result = StringHandler.toCamelCase('hello');
        expect(result.pass).toBe(true);
        expect(result.value).toBe('hello');
    });

    it('should handle empty string', () => {
        const result = StringHandler.toCamelCase('');
        expect(result.pass).toBe(true);
        expect(result.value).toBe('');
    });

    it('should handle leading delimiters', () => {
        const result = StringHandler.toCamelCase('-hello_world');
        expect(result.pass).toBe(true);
        expect(result.value).toBe('helloWorld');
    });

    it('should handle trailing delimiters', () => {
        const result = StringHandler.toCamelCase('hello_world-');
        expect(result.pass).toBe(true);
        expect(result.value).toBe('helloWorld');
    });

    it('should handle numbers in the string', () => {
        const result = StringHandler.toCamelCase('test-case-123-more');
        expect(result.pass).toBe(true);
        expect(result.value).toBe('testCase123More');
    });

    it('should handle special characters at word boundaries', () => {
        const result = StringHandler.toCamelCase('hello@world#test');
        expect(result.pass).toBe(true);
        expect(result.value).toBe('hello@world#test');
    });

    it('should handle uppercase letters in mixed case input', () => {
        const result = StringHandler.toCamelCase('HELLO WORLD TEST');
        expect(result.pass).toBe(true);
        expect(result.value).toBe('helloWorldTest');
    });
});

describe('StringHandler.toSnakeCase', () => {
    it('should convert camelCase to snake_case', () => {
        const result = StringHandler.toSnakeCase('helloWorld');
        expect(result.pass).toBe(true);
        expect(result.value).toBe('helloworld');
    });

    it('should convert PascalCase to snake_case', () => {
        const result = StringHandler.toSnakeCase('HelloWorldTest');
        expect(result.pass).toBe(true);
        expect(result.value).toBe('helloworldtest');
    });

    it('should convert kebab-case to snake_case', () => {
        const result = StringHandler.toSnakeCase('hello-world-test');
        expect(result.pass).toBe(true);
        expect(result.value).toBe('hello_world_test');
    });

    it('should convert space-separated words to snake_case', () => {
        const result = StringHandler.toSnakeCase('hello world test');
        expect(result.pass).toBe(true);
        expect(result.value).toBe('hello_world_test');
    });

    it('should handle mixed delimiters', () => {
        const result = StringHandler.toSnakeCase('hello-world test.case');
        expect(result.pass).toBe(true);
        expect(result.value).toBe('hello_world_test_case');
    });

    it('should handle multiple consecutive delimiters', () => {
        const result = StringHandler.toSnakeCase('hello--world  test..case');
        expect(result.pass).toBe(true);
        expect(result.value).toBe('hello_world_test_case');
    });

    it('should preserve existing snake_case', () => {
        const result = StringHandler.toSnakeCase('  --hello_world_test');
        expect(result.pass).toBe(true);
        expect(result.value).toBe('hello_world_test');
    });

    it('should handle single word', () => {
        const result = StringHandler.toSnakeCase('hello');
        expect(result.pass).toBe(true);
        expect(result.value).toBe('hello');
    });

    it('should handle empty string', () => {
        const result = StringHandler.toSnakeCase('');
        expect(result.pass).toBe(true);
        expect(result.value).toBe('');
    });

    it('should handle leading delimiters', () => {
        const result = StringHandler.toSnakeCase('-hello world');
        expect(result.pass).toBe(true);
        expect(result.value).toBe('hello_world');
    });

    it('should handle trailing delimiters', () => {
        const result = StringHandler.toSnakeCase('hello world-');
        expect(result.pass).toBe(true);
        expect(result.value).toBe('hello_world');
    });

    it('should handle numbers in the string', () => {
        const result = StringHandler.toSnakeCase('test-case-123-more');
        expect(result.pass).toBe(true);
        expect(result.value).toBe('test_case_123_more');
    });

    it('should convert uppercase to lowercase', () => {
        const result = StringHandler.toSnakeCase('HELLO WORLD TEST');
        expect(result.pass).toBe(true);
        expect(result.value).toBe('hello_world_test');
    });

    it('should handle custom delimiters', () => {
        const result = StringHandler.toSnakeCase('hello@world#test', '@#');
        expect(result.pass).toBe(true);
        expect(result.value).toBe('hello_world_test');
    });

    it('should ignore non-delimiter special characters when not in allowedDelims', () => {
        const result = StringHandler.toSnakeCase('hello@world#test');
        expect(result.pass).toBe(true);
        expect(result.value).toBe('hello@world#test');
    });

    it('should handle mixed case with delimiters', () => {
        const result = StringHandler.toSnakeCase('Hello-WORLD test.Case');
        expect(result.pass).toBe(true);
        expect(result.value).toBe('hello_world_test_case');
    });
});

describe('StringHandler.toKebabCase', () => {
    it('should convert str to kebab-case', () => {
        const result = StringHandler.toKebabCase('-hello World-');
        expect(result.pass).toBe(true);
        expect(result.value).toBe('hello-world');
    });

    it('should convert str to kebab-case', () => {
        const result = StringHandler.toKebabCase('Hello World Test');
        expect(result.pass).toBe(true);
        expect(result.value).toBe('hello-world-test');
    });

    it('should handle already kebab-case strings', () => {
        const result = StringHandler.toKebabCase('hello-world-test');
        expect(result.pass).toBe(true);
        expect(result.value).toBe('hello-world-test');
    });

    it('should convert space-separated words to kebab-case', () => {
        const result = StringHandler.toKebabCase('hello world test');
        expect(result.pass).toBe(true);
        expect(result.value).toBe('hello-world-test');
    });

    it('should handle mixed delimiters', () => {
        const result = StringHandler.toKebabCase('hello-world test.case');
        expect(result.pass).toBe(true);
        expect(result.value).toBe('hello-world-test-case');
    });

    it('should collapse multiple delimiters', () => {
        const result = StringHandler.toKebabCase('hello--world  test..case');
        expect(result.pass).toBe(true);
        expect(result.value).toBe('hello-world-test-case');
    });

    it('should trim leading and trailing delimiters', () => {
        const result = StringHandler.toKebabCase('  --hello_world_test');
        expect(result.pass).toBe(true);
        expect(result.value).toBe('hello-world-test');
    });

    it('should handle single word', () => {
        const result = StringHandler.toKebabCase('hello');
        expect(result.pass).toBe(true);
        expect(result.value).toBe('hello');
    });

    it('should handle empty string', () => {
        const result = StringHandler.toKebabCase('');
        expect(result.pass).toBe(true);
        expect(result.value).toBe('');
    });

    it('should trim leading delimiters', () => {
        const result = StringHandler.toKebabCase('-hello world');
        expect(result.pass).toBe(true);
        expect(result.value).toBe('hello-world');
    });

    it('should trim trailing delimiters', () => {
        const result = StringHandler.toKebabCase('hello world-');
        expect(result.pass).toBe(true);
        expect(result.value).toBe('hello-world');
    });

    it('should handle numbers in strings', () => {
        const result = StringHandler.toKebabCase('test-case-123-more');
        expect(result.pass).toBe(true);
        expect(result.value).toBe('test-case-123-more');
    });

    it('should convert uppercase strings', () => {
        const result = StringHandler.toKebabCase('HELLO WORLD TEST');
        expect(result.pass).toBe(true);
        expect(result.value).toBe('hello-world-test');
    });

    it('should handle custom allowed delimiters', () => {
        const result = StringHandler.toKebabCase('hello@world#test', '@#');
        expect(result.pass).toBe(true);
        expect(result.value).toBe('hello-world-test');
    });

    it('should not convert non-allowed delimiters', () => {
        const result = StringHandler.toKebabCase('hello@world#test');
        expect(result.pass).toBe(true);
        expect(result.value).toBe('hello@world#test');
    });

    it('should handle mixed case with various delimiters', () => {
        const result = StringHandler.toKebabCase('Hello-WORLD test.Case');
        expect(result.pass).toBe(true);
        expect(result.value).toBe('hello-world-test-case');
    });
});

describe('StringHandler.isPrimitive("string")', () => {
    it('should pass for string value', () => {
        const result = StringHandler.isPrimitive('hello', 'string');
        expect(result.pass).toBe(true);
        expect(result.value).toBe('hello');
    });

    it('should pass for empty string', () => {
        const result = StringHandler.isPrimitive('', 'string');
        expect(result.pass).toBe(true);
        expect(result.value).toBe('');
    });

    it('should fail for number', () => {
        const result = StringHandler.isPrimitive(123, 'string');
        expect(result.pass).toBe(false);
        expect(result.value).toBe(123);
    });

    it('should fail for undefined', () => {
        const result = StringHandler.isPrimitive(undefined, 'string');
        expect(result.pass).toBe(false);
        expect(result.value).toBe(undefined);
    });

    it('should fail for object', () => {
        const result = StringHandler.isPrimitive({}, 'string');
        expect(result.pass).toBe(false);
    });
});

describe('StringHandler.isEmpty', () => {
    it('should pass for empty string', () => {
        const result = StringHandler.isEmpty('');
        expect(result.pass).toBe(true);
        expect(result.value).toBe('');
    });

    it('should fail for non-empty string', () => {
        const result = StringHandler.isEmpty('hello');
        expect(result.pass).toBe(false);
        expect(result.value).toBe('hello');
    });

    it('should fail for whitespace string', () => {
        const result = StringHandler.isEmpty(' ');
        expect(result.pass).toBe(false);
        expect(result.value).toBe(' ');
    });
});

describe('StringHandler.hasLength', () => {
    it('should pass for correct length', () => {
        const result = StringHandler.hasLength('hello', 5);
        expect(result.pass).toBe(true);
        expect(result.value).toBe('hello');
    });

    it('should fail for incorrect length', () => {
        const result = StringHandler.hasLength('hello', 3);
        expect(result.pass).toBe(false);
        expect(result.value).toBe('hello');
    });

    it('should handle empty string', () => {
        const result = StringHandler.hasLength('', 0);
        expect(result.pass).toBe(true);
        expect(result.value).toBe('');
    });
});

describe('StringHandler.hasLengthBetween', () => {
    it('should pass for length within range', () => {
        const result = StringHandler.hasLengthBetween('hello', 3, 7);
        expect(result.pass).toBe(true);
        expect(result.value).toBe('hello');
    });

    it('should pass for length at minimum', () => {
        const result = StringHandler.hasLengthBetween('hi', 2, 5);
        expect(result.pass).toBe(true);
        expect(result.value).toBe('hi');
    });

    it('should pass for length at maximum', () => {
        const result = StringHandler.hasLengthBetween('hello', 3, 5);
        expect(result.pass).toBe(true);
        expect(result.value).toBe('hello');
    });

    it('should fail for length below minimum', () => {
        const result = StringHandler.hasLengthBetween('hi', 3, 7);
        expect(result.pass).toBe(false);
        expect(result.value).toBe('hi');
    });

    it('should fail for length above maximum', () => {
        const result = StringHandler.hasLengthBetween('hello world', 3, 7);
        expect(result.pass).toBe(false);
        expect(result.value).toBe('hello world');
    });
});

describe('StringHandler.hasMinLength', () => {
    it('should pass for length equal to minimum', () => {
        const result = StringHandler.hasMinLength('hello', 5);
        expect(result.pass).toBe(true);
        expect(result.value).toBe('hello');
    });

    it('should pass for length greater than minimum', () => {
        const result = StringHandler.hasMinLength('hello world', 5);
        expect(result.pass).toBe(true);
        expect(result.value).toBe('hello world');
    });

    it('should fail for length less than minimum', () => {
        const result = StringHandler.hasMinLength('hi', 5);
        expect(result.pass).toBe(false);
        expect(result.value).toBe('hi');
    });
});

describe('StringHandler.isPhone', () => {
    it('should pass for valid US phone numbers', () => {
        expect(StringHandler.isPhone('(555) 123-4567').pass).toBe(true);
        expect(StringHandler.isPhone('555-123-4567').pass).toBe(true);
        expect(StringHandler.isPhone('1-555-123-4567').pass).toBe(true);
        expect(StringHandler.isPhone('5551234567').pass).toBe(true);
        expect(StringHandler.isPhone('+1-555-123-4567').pass).toBe(true);
        expect(StringHandler.isPhone('+1-(555)-123-4567').pass).toBe(true);
        expect(StringHandler.isPhone('1-(555)-123-4567').pass).toBe(true);
    });

    it('should fail for invalid phone numbers', () => {
        expect(StringHandler.isPhone('123').pass).toBe(false);
        expect(StringHandler.isPhone('abc-def-ghij').pass).toBe(false);
        expect(StringHandler.isPhone('555-123-456').pass).toBe(false);
    });

});

describe('StringHandler.isBalanced', () => {
    it('should pass for balanced parentheses', () => {
        const result = StringHandler.isBalanced('(hello (world))');
        expect(result.pass).toBe(true);
        expect(result.value).toBe('(hello (world))');
    });

    it('should pass for empty string', () => {
        const result = StringHandler.isBalanced('');
        expect(result.pass).toBe(true);
        expect(result.value).toBe('');
    });

    it('should pass for string without parentheses', () => {
        const result = StringHandler.isBalanced('hello world');
        expect(result.pass).toBe(true);
        expect(result.value).toBe('hello world');
    });

    it('should fail for unbalanced parentheses', () => {
        const result = StringHandler.isBalanced('(hello world');
        expect(result.pass).toBe(false);
        expect(result.value).toBe('(hello world');
    });

    it('should fail for wrong order', () => {
        const result = StringHandler.isBalanced(')hello(');
        expect(result.pass).toBe(false);
        expect(result.value).toBe(')hello(');
    });

    it('should work with custom characters', () => {
        const result = StringHandler.isBalanced('[hello [world]]', '[', ']');
        expect(result.pass).toBe(true);
        expect(result.value).toBe('[hello [world]]');
    });
});

describe('StringHandler.minWords', () => {
    it('should pass for minimum word count', () => {
        const result = StringHandler.minWords('hello world test', 3);
        expect(result.pass).toBe(true);
        expect(result.value).toBe('hello world test');
    });

    it('should pass for more than minimum', () => {
        const result = StringHandler.minWords('hello world test case', 3);
        expect(result.pass).toBe(true);
    });

    it('should fail for less than minimum', () => {
        const result = StringHandler.minWords('hello world', 3);
        expect(result.pass).toBe(false);
        expect(result.value).toBe('hello world');
    });

    it('should handle custom delimiters', () => {
        const result = StringHandler.minWords('hello,world,test', 3, ',');
        expect(result.pass).toBe(true);
    });
});

describe('StringHandler.maxWords', () => {
    it('should pass for maximum word count', () => {
        const result = StringHandler.maxWords('hello world', 2);
        expect(result.pass).toBe(true);
        expect(result.value).toBe('hello world');
    });

    it('should pass for less than maximum', () => {
        const result = StringHandler.maxWords('hello', 2);
        expect(result.pass).toBe(true);
    });

    it('should fail for more than maximum', () => {
        const result = StringHandler.maxWords('hello world test', 2);
        expect(result.pass).toBe(false);
        expect(result.value).toBe('hello world test');
    });
});

describe('StringHandler.wordCount', () => {
    it('should pass for word count within range', () => {
        const result = StringHandler.wordCount('hello world test', 2, 4);
        expect(result.pass).toBe(true);
        expect(result.value).toBe('hello world test');
    });

    it('should fail for word count below range', () => {
        const result = StringHandler.wordCount('hello', 2, 4);
        expect(result.pass).toBe(false);
        expect(result.value).toBe('hello');
    });

    it('should fail for word count above range', () => {
        const result = StringHandler.wordCount('hello world test case scenario', 2, 4);
        expect(result.pass).toBe(false);
    });
});

// Transformer Methods
describe('StringHandler.trim', () => {
    it('should trim whitespace by default', () => {
        const result = StringHandler.trim('  hello world  ');
        expect(result.pass).toBe(true);
        expect(result.value).toBe('hello world');
    });

    it('should trim custom characters', () => {
        const result = StringHandler.trim('xxhello worldxx', 'x');
        expect(result.pass).toBe(true);
        expect(result.value).toBe('hello world');
    });

    it('should handle empty string', () => {
        const result = StringHandler.trim('');
        expect(result.pass).toBe(true);
        expect(result.value).toBe('');
    });
});

describe('StringHandler.trimLeft', () => {
    it('should trim left whitespace', () => {
        const result = StringHandler.trimLeft('  hello world  ');
        expect(result.pass).toBe(true);
        expect(result.value).toBe('hello world  ');
    });

    it('should trim custom characters from left', () => {
        const result = StringHandler.trimLeft('xxhello worldxx', 'x');
        expect(result.pass).toBe(true);
        expect(result.value).toBe('hello worldxx');
    });
});

describe('StringHandler.trimRight', () => {
    it('should trim right whitespace', () => {
        const result = StringHandler.trimRight('  hello world  ');
        expect(result.pass).toBe(true);
        expect(result.value).toBe('  hello world');
    });

    it('should trim custom characters from right', () => {
        const result = StringHandler.trimRight('xxhello worldxx', 'x');
        expect(result.pass).toBe(true);
        expect(result.value).toBe('xxhello world');
    });
});

describe('StringHandler.padLeft', () => {
    it('should pad string to specified length', () => {
        const result = StringHandler.padLeft('hello', 10, ' ');
        expect(result.pass).toBe(true);
        expect(result.value).toBe('     hello');
    });

    it('should pad with custom character', () => {
        const result = StringHandler.padLeft('123', 6, '0');
        expect(result.pass).toBe(true);
        expect(result.value).toBe('000123');
    });

    it('should not pad if already long enough', () => {
        const result = StringHandler.padLeft('hello world', 5, ' ');
        expect(result.pass).toBe(true);
        expect(result.value).toBe('hello world');
    });
});

describe('StringHandler.padRight', () => {
    it('should pad string to specified length', () => {
        const result = StringHandler.padRight('hello', 10, ' ');
        expect(result.pass).toBe(true);
        expect(result.value).toBe('hello     ');
    });

    it('should pad with custom character', () => {
        const result = StringHandler.padRight('123', 6, '0');
        expect(result.pass).toBe(true);
        expect(result.value).toBe('123000');
    });
});

describe('StringHandler.collapseRepeats', () => {
    it('should collapse repeated characters', () => {
        const result = StringHandler.collapseRepeats('hello   world', ' ');
        expect(result.pass).toBe(true);
        expect(result.value).toBe('hello world');
    });

    it('should collapse repeated custom characters', () => {
        const result = StringHandler.collapseRepeats('hellllooo', 'l');
        expect(result.pass).toBe(true);
        expect(result.value).toBe('helooo');
    });
});

describe('StringHandler.removeSpacing', () => {
    it('should remove all spacing', () => {
        const result = StringHandler.removeSpacing('hello world test');
        expect(result.pass).toBe(true);
        expect(result.value).toBe('helloworldtest');
    });

    it('should handle multiple types of whitespace', () => {
        const result = StringHandler.removeSpacing('hello\t\n world');
        expect(result.pass).toBe(true);
        expect(result.value).toBe('helloworld');
    });
});

describe('StringHandler.collapseSpacing', () => {
    it('should collapse multiple spaces to single space', () => {
        const result = StringHandler.collapseSpacing('hello    world   test');
        expect(result.pass).toBe(true);
        expect(result.value).toBe('hello world test');
    });

    it('should handle tabs and newlines', () => {
        const result = StringHandler.collapseSpacing('hello\t\t\nworld');
        expect(result.pass).toBe(true);
        expect(result.value).toBe('hello world');
    });
});

describe('StringHandler.toLowerCase', () => {
    it('should convert to lowercase', () => {
        const result = StringHandler.toLowerCase('HELLO WORLD');
        expect(result.pass).toBe(true);
        expect(result.value).toBe('hello world');
    });

    it('should handle mixed case', () => {
        const result = StringHandler.toLowerCase('HeLLo WoRLd');
        expect(result.pass).toBe(true);
        expect(result.value).toBe('hello world');
    });

    it('should handle already lowercase', () => {
        const result = StringHandler.toLowerCase('hello world');
        expect(result.pass).toBe(true);
        expect(result.value).toBe('hello world');
    });
});

describe('StringHandler.toUpperCase', () => {
    it('should convert to uppercase', () => {
        const result = StringHandler.toUpperCase('hello world');
        expect(result.pass).toBe(true);
        expect(result.value).toBe('HELLO WORLD');
    });

    it('should handle mixed case', () => {
        const result = StringHandler.toUpperCase('HeLLo WoRLd');
        expect(result.pass).toBe(true);
        expect(result.value).toBe('HELLO WORLD');
    });

    it('should handle already uppercase', () => {
        const result = StringHandler.toUpperCase('HELLO WORLD');
        expect(result.pass).toBe(true);
        expect(result.value).toBe('HELLO WORLD');
    });
});

describe('StringHandler.toPascalCase', () => {
    it('should convert to PascalCase', () => {
        const result = StringHandler.toPascalCase('hello world test');
        expect(result.pass).toBe(true);
        expect(result.value).toBe('HelloWorldTest');
    });

    it('should handle snake_case input', () => {
        const result = StringHandler.toPascalCase('hello_world_test');
        expect(result.pass).toBe(true);
        expect(result.value).toBe('HelloWorldTest');
    });

    it('should handle kebab-case input', () => {
        const result = StringHandler.toPascalCase('hello-world-test');
        expect(result.pass).toBe(true);
        expect(result.value).toBe('HelloWorldTest');
    });
});

describe('StringHandler.toTitleCase', () => {
    it('should convert to Title Case', () => {
        const result = StringHandler.toTitleCase('hello world test');
        expect(result.pass).toBe(true);
        expect(result.value).toBe('Hello World Test');
    });

    it('should handle lowercase input', () => {
        const result = StringHandler.toTitleCase('hello world');
        expect(result.pass).toBe(true);
        expect(result.value).toBe('Hello World');
    });

    it('should handle mixed case input', () => {
        const result = StringHandler.toTitleCase('HeLLo WoRLd');
        expect(result.pass).toBe(true);
        expect(result.value).toBe('Hello World');
    });
});

describe('StringHandler.toSentenceCase', () => {
    it('should convert to Sentence case', () => {
        const result = StringHandler.toSentenceCase('hello world test');
        expect(result.pass).toBe(true);
        expect(result.value).toBe('Hello world test');
    });

    it('should handle uppercase input', () => {
        const result = StringHandler.toSentenceCase('HELLO WORLD');
        expect(result.pass).toBe(true);
        expect(result.value).toBe('Hello world');
    });
});

describe('StringHandler.urlEncode', () => {
    it('should encode URL', () => {
        const result = StringHandler.urlEncode('hello world test');
        expect(result.pass).toBe(true);
        expect(result.value).toBe('hello%20world%20test');
    });

    it('should encode special characters', () => {
        const result = StringHandler.urlEncode('hello@world.com');
        expect(result.pass).toBe(true);
        expect(result.value).toBe('hello%40world.com');
    });
});

describe('StringHandler.urlDecode', () => {
    it('should decode URL', () => {
        const result = StringHandler.urlDecode('hello%20world%20test');
        expect(result.pass).toBe(true);
        expect(result.value).toBe('hello world test');
    });

    it('should decode special characters', () => {
        const result = StringHandler.urlDecode('hello%40world.com');
        expect(result.pass).toBe(true);
        expect(result.value).toBe('hello@world.com');
    });
});

describe('StringHandler.base64Encode', () => {
    it('should encode to base64', () => {
        const result = StringHandler.base64Encode('hello world');
        expect(result.pass).toBe(true);
        expect(result.value).toBe('aGVsbG8gd29ybGQ=');
    });

    it('should handle empty string', () => {
        const result = StringHandler.base64Encode('');
        expect(result.pass).toBe(true);
        expect(result.value).toBe('');
    });
});

describe('StringHandler.base64Decode', () => {
    it('should decode from base64', () => {
        const result = StringHandler.base64Decode('aGVsbG8gd29ybGQ=');
        expect(result.pass).toBe(true);
        expect(result.value).toBe('hello world');
    });

    it('should handle empty string', () => {
        const result = StringHandler.base64Decode('');
        expect(result.pass).toBe(true);
        expect(result.value).toBe('');
    });
});

describe('StringHandler.hexEncode', () => {
    it('should encode to hex', () => {
        const result = StringHandler.hexEncode('hello');
        expect(result.pass).toBe(true);
        expect(result.value).toBe('68656c6c6f');
    });

    it('should handle empty string', () => {
        const result = StringHandler.hexEncode('');
        expect(result.pass).toBe(true);
        expect(result.value).toBe('');
    });
});

describe('StringHandler.hexDecode', () => {
    it('should decode from hex', () => {
        const result = StringHandler.hexDecode('68656c6c6f');
        expect(result.pass).toBe(true);
        expect(result.value).toBe('hello');
    });

    it('should handle empty string', () => {
        const result = StringHandler.hexDecode('');
        expect(result.pass).toBe(true);
        expect(result.value).toBe('');
    });
});

describe('StringHandler.isNotEmpty', () => {
    it('should pass for non-empty string', () => {
        const result = StringHandler.isNotEmpty('hello');
        expect(result.pass).toBe(true);
        expect(result.value).toBe('hello');
    });

    it('should pass for whitespace string', () => {
        const result = StringHandler.isNotEmpty(' ');
        expect(result.pass).toBe(true);
        expect(result.value).toBe(' ');
    });

    it('should fail for empty string', () => {
        const result = StringHandler.isNotEmpty('');
        expect(result.pass).toBe(false);
        expect(result.value).toBe('');
    });

    it('should pass for string with special characters', () => {
        const result = StringHandler.isNotEmpty('!@#');
        expect(result.pass).toBe(true);
        expect(result.value).toBe('!@#');
    });
});

describe('StringHandler.slice', () => {
    it('should slice string from start to end index', () => {
        const result = StringHandler.slice('hello world', 0, 5);
        expect(result.pass).toBe(true);
        expect(result.value).toBe('hello');
    });

    it('should slice string with negative indices', () => {
        const result = StringHandler.slice('hello world', -5, -1);
        expect(result.pass).toBe(true);
        expect(result.value).toBe('worl');
    });

    it('should slice from middle to end', () => {
        const result = StringHandler.slice('hello world', 6);
        expect(result.pass).toBe(true);
        expect(result.value).toBe('world');
    });

    it('should handle empty result', () => {
        const result = StringHandler.slice('hello', 5, 5);
        expect(result.pass).toBe(true);
        expect(result.value).toBe('');
    });

    it('should handle out of bounds indices', () => {
        const result = StringHandler.slice('hello', 0, 100);
        expect(result.pass).toBe(true);
        expect(result.value).toBe('hello');
    });
});

describe('StringHandler.sliceFirst', () => {
    it('should slice first character by default', () => {
        const result = StringHandler.sliceFirst('hello');
        expect(result.pass).toBe(true);
        expect(result.value).toBe('h');
    });

    it('should slice first N characters', () => {
        const result = StringHandler.sliceFirst('hello world', 5);
        expect(result.pass).toBe(true);
        expect(result.value).toBe('hello');
    });

    it('should handle count greater than string length', () => {
        const result = StringHandler.sliceFirst('hi', 10);
        expect(result.pass).toBe(true);
        expect(result.value).toBe('hi');
    });

    it('should handle empty string', () => {
        const result = StringHandler.sliceFirst('', 5);
        expect(result.pass).toBe(true);
        expect(result.value).toBe('');
    });

    it('should handle zero count', () => {
        const result = StringHandler.sliceFirst('hello', 0);
        expect(result.pass).toBe(true);
        expect(result.value).toBe('');
    });
});

describe('StringHandler.sliceLast', () => {
    it('should slice last character by default', () => {
        const result = StringHandler.sliceLast('hello');
        expect(result.pass).toBe(true);
        expect(result.value).toBe('o');
    });

    it('should slice last N characters', () => {
        const result = StringHandler.sliceLast('hello world', 5);
        expect(result.pass).toBe(true);
        expect(result.value).toBe('world');
    });

    it('should handle count greater than string length', () => {
        const result = StringHandler.sliceLast('hi', 10);
        expect(result.pass).toBe(true);
        expect(result.value).toBe('hi');
    });

    it('should handle empty string', () => {
        const result = StringHandler.sliceLast('', 5);
        expect(result.pass).toBe(true);
        expect(result.value).toBe('');
    });

    it('should return full string with zero count (slice(-0) behavior)', () => {
        const result = StringHandler.sliceLast('hello', 0);
        expect(result.pass).toBe(true);
        expect(result.value).toBe('hello');
    });
});

describe('StringHandler.toDelimited', () => {
    it('should convert to custom delimiter with default transformer', () => {
        const result = StringHandler.toDelimited('hello world test', { delim: '-' });
        expect(result.pass).toBe(true);
        expect(result.value).toBe('hello-world-test');
    });

    it('should use custom transformer', () => {
        const result = StringHandler.toDelimited('hello world', {
            delim: '_',
            transformer: word => word.toUpperCase()
        });
        expect(result.pass).toBe(true);
        expect(result.value).toBe('HELLO_WORLD');
    });

    it('should use dual transformers with switch index', () => {
        const result = StringHandler.toDelimited('hello world test', {
            delim: '-',
            transformer1: word => word.toLowerCase(),
            transformer2: word => word.toUpperCase(),
            switchIndex: 1
        });
        expect(result.pass).toBe(true);
        expect(result.value).toBe('hello-WORLD-TEST');
    });

    it('should handle custom allowed delimiters', () => {
        const result = StringHandler.toDelimited('hello_world-test', {
            allowedDelims: '_-',
            delim: ' '
        });
        expect(result.pass).toBe(true);
        expect(result.value).toBe('hello world test');
    });

    it('should handle empty string', () => {
        const result = StringHandler.toDelimited('', { delim: '-' });
        expect(result.pass).toBe(true);
        expect(result.value).toBe('');
    });

    it('should handle single word', () => {
        const result = StringHandler.toDelimited('hello', { delim: '-' });
        expect(result.pass).toBe(true);
        expect(result.value).toBe('hello');
    });

    it('should apply transformer2 to all words when switchIndex is 0', () => {
        const result = StringHandler.toDelimited('hello world', {
            delim: '-',
            transformer1: word => word.toLowerCase(),
            transformer2: word => word.toUpperCase(),
            switchIndex: 0
        });
        expect(result.pass).toBe(true);
        expect(result.value).toBe('HELLO-WORLD');
    });
});

