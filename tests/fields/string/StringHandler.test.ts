'use strict';

import { StringHandler, CommonStringMatchingDefaults } from '../../../lib/fields/string/StringHandler.ts';

const handler = new StringHandler();

describe('StringHandler validators (up to line 330)', () => {
    test('alpha passes alphabetic strings and fails non-alpha', () => {
        const result = handler.alpha('abcXYZ');
        expect(result.pass).toBe(true);

        const result2 = handler.alpha('OnlyLetters');
        expect(result2.pass).toBe(true);

        const result3 = handler.alpha('abc123');
        expect(result3.fail).toBe(true);
    });

    test('alphanumeric accepts letters+numbers and rejects symbols', () => {
        const result = handler.alphanumeric('abc123XYZ');
        expect(result.pass).toBe(true);

        const result2 = handler.alphanumeric('A1B2C3');
        expect(result2.pass).toBe(true);

        const result3 = handler.alphanumeric('abc-123');
        expect(result3.fail).toBe(true);
    });

    test('ascii enforces 7-bit ascii range', () => {
        const result = handler.ascii('hello world');
        expect(result.pass).toBe(true);

        const result2 = handler.ascii('line\nwith\ttabs');
        expect(result2.pass).toBe(true);

        const result3 = handler.ascii('caf\u00e9');
        expect(result3.fail).toBe(true);
    });

    test('balanced validates paired characters', () => {
        const result = handler.balanced('(a(b)c)');
        expect(result.pass).toBe(true);

        const result2 = handler.balanced('{a{b}c}', '{', '}');
        expect(result2.pass).toBe(true);

        const result3 = handler.balanced('(()');
        expect(result3.fail).toBe(true);
    });

    test('base64 validates encoding shape', () => {
        const result = handler.base64('aGVsbG8=');
        expect(result.pass).toBe(true);

        const result2 = handler.base64('QUJDRA==');
        expect(result2.pass).toBe(true);

        const result3 = handler.base64('not_base64!');
        expect(result3.fail).toBe(true);
    });

    test('base64Decode decodes valid base64 payloads', () => {
        const result = handler.base64Decode('aGVsbG8=');
        expect(result.pass).toBe(true);
        expect(result.value).toBe('hello');

        const result2 = handler.base64Decode('4pyTIMOgIGxhIG1vZGU=');
        expect(result2.pass).toBe(true);
        expect(result2.value).toBe('✓ à la mode');

        const result3 = handler.base64Decode('');
        expect(result3.pass).toBe(true);
        expect(result3.value).toBe('');
    });

    test('base64Encode encodes ascii and unicode text', () => {
        const result = handler.base64Encode('hello');
        expect(result.pass).toBe(true);
        expect(result.value).toBe('aGVsbG8=');

        const result2 = handler.base64Encode('✓ à la mode');
        expect(result2.pass).toBe(true);
        expect(result2.value).toBe('4pyTIMOgIGxhIG1vZGU=');

        const result3 = handler.base64Encode('');
        expect(result3.pass).toBe(true);
        expect(result3.value).toBe('');
    });

    test('binary accepts only 0 and 1', () => {
        const result = handler.binary('101010');
        expect(result.pass).toBe(true);

        const result2 = handler.binary('000111000');
        expect(result2.pass).toBe(true);

        const result3 = handler.binary('10201');
        expect(result3.fail).toBe(true);
    });

    test('bmp allows basic multilingual plane only', () => {
        const result = handler.bmp('hello');
        expect(result.pass).toBe(true);

        const result2 = handler.bmp('\u6f22\u5b57');
        expect(result2.pass).toBe(true);

        const result3 = handler.bmp('😀');
        expect(result3.fail).toBe(true);
    });

    test('complex validates password complexity rules and edge failures', () => {
        const result = handler.complex('Aa1!bcde');
        expect(result.pass).toBe(true);

        const result2 = handler.complex('Ab1!Ab1!Ab1!');
        expect(result2.pass).toBe(true);

        const result3 = handler.complex('Aa1!a');
        expect(result3.fail).toBe(true);

        const result4 = handler.complex('aa1!bcde');
        expect(result4.fail).toBe(true);

        const result5 = handler.complex('AAa!bcde');
        expect(result5.fail).toBe(true);

        const result6 = handler.complex('AAAa1!bc');
        expect(result6.fail).toBe(true);

        const result7 = handler.complex('aaaa', { minLength: 4, minUppercase: 0, minDigits: 0, minSpecialChars: 0 });
        expect(result7.pass).toBe(true);
    });

    test('contains supports case sensitivity options', () => {
        const result = handler.contains('Hello World', 'World');
        expect(result.pass).toBe(true);

        const result2 = handler.contains('Hello World', 'world', { ignoreCase: true });
        expect(result2.pass).toBe(true);

        const result3 = handler.contains('Hello World', 'world');
        expect(result3.fail).toBe(true);
    });

    test('creditCard validates major card formats, luhn, type filters, and normalization', () => {
        
        handler.configMatchingDefaults({
            normalizedDelim: '',
            cleanDelims: ' -',
            normalize: false,
            ignoreCase: false,
        });
        
        const result = handler.creditCard('4111111111111111');
        expect(result.pass).toBe(true);

        const result2 = handler.creditCard('5555555555554444');
        expect(result2.pass).toBe(true);

        const result3 = handler.creditCard('378282246310005');
        expect(result3.pass).toBe(true);

        const result4 = handler.creditCard('4111111111111112');
        expect(result4.fail).toBe(true);

        const result5 = handler.creditCard('4111 1111 1111 1111', {
            cleanDelims: ' -',
            normalize: true
        });
        expect(result5.pass).toBe(true);
        expect(result5.value.replace(/[\s-]/g, '')).toBe('4111111111111111');

        const result6 = handler.creditCard('4111111111111111', { types: ['amex'] });
        expect(result6.fail).toBe(true);

        const result7 = handler.creditCard('4111 1111 1111 1111');
        expect(result7.fail).toBe(true);

        const result8 = handler.creditCard('4111-1111-1111-1112', {
            cleanDelims: ' -',
            normalize: true
        });
        expect(result8.fail).toBe(true);

        const result9 = handler.creditCard('0000000000000000');
        expect(result9.fail).toBe(true);

        const result10 = handler.creditCard('1234567890123456');
        expect(result10.fail).toBe(true);

        const result11 = handler.creditCard('4111x1111x1111x1111', {
            cleanDelims: ' -',
            normalize: true
        });
        expect(result11.fail).toBe(true);
    });
});

describe('StringHandler mutators', () => {
    test('collapseRepeats collapses repeated target char', () => {
        const result = handler.collapseRepeats('aa---bbb---c', '-');
        expect(result.pass).toBe(true);
        expect(result.value).toBe('aa-bbb-c');
        
        const result2 = handler.collapseRepeats('xxaaaxbbx', 'x');
        expect(result2.pass).toBe(true);
        expect(result2.value).toBe('xaaaxbbx');
        
        const result3 = handler.collapseRepeats('no repeats here', 'x');
        expect(result3.pass).toBe(true);
        expect(result3.value).toBe('no repeats here');
    });

    test('collapseSpacing normalizes whitespace runs to single spaces', () => {
        const result = handler.collapseSpacing('a\t\t b\n\n c');
        expect(result.pass).toBe(true);
        expect(result.value).toBe('a b c');
        
        const result2 = handler.collapseSpacing('  hello   world  ');
        expect(result2.pass).toBe(true);
        expect(result2.value).toBe(' hello world ');
        
        const result3 = handler.collapseSpacing('no  extra  space');
        expect(result3.pass).toBe(true);
        expect(result3.value).toBe('no extra space');
    });

    test('escapeHtml escapes core HTML entities', () => {
        const result = handler.escapeHtml('<div class="x">Tom & Jerry\'s</div>');
        expect(result.pass).toBe(true);
        expect(result.value).toBe('&lt;div class=&quot;x&quot;&gt;Tom &amp; Jerry&#39;s&lt;/div&gt;');
        
        const result2 = handler.escapeHtml('plain text no special chars');
        expect(result2.pass).toBe(true);
        expect(result2.value).toBe('plain text no special chars');
        
        const result3 = handler.escapeHtml('&&&&<<<<>>>>"""\'\'\'\'');
        expect(result3.pass).toBe(true);
        expect(result3.value).toBe('&amp;&amp;&amp;&amp;&lt;&lt;&lt;&lt;&gt;&gt;&gt;&gt;&quot;&quot;&quot;&#39;&#39;&#39;&#39;');
    });

    test('hexDecode decodes hex byte pairs', () => {
        const result = handler.hexDecode('68656c6c6f');
        expect(result.pass).toBe(true);
        expect(result.value).toBe('hello');
        
        const result2 = handler.hexDecode('48454c4c4f');
        expect(result2.pass).toBe(true);
        expect(result2.value).toBe('HELLO');
        
        const result3 = handler.hexDecode('4a61');
        expect(result3.pass).toBe(true);
        expect(result3.value).toBe('Ja');
    });

    test('hexEncode encodes to lowercase hex', () => {
        const result = handler.hexEncode('Hi');
        expect(result.pass).toBe(true);
        expect(result.value).toBe('4869');
        
        const result2 = handler.hexEncode('ABC');
        expect(result2.pass).toBe(true);
        expect(result2.value).toBe('414243');
        
        const result3 = handler.hexEncode('A');
        expect(result3.pass).toBe(true);
        expect(result3.value).toBe('41');
    });

    test('normalizeLineBreaks replaces all newline variants', () => {
        const result = handler.normalizeLineBreaks('a\r\nb\rc\nd', '|');
        expect(result.pass).toBe(true);
        expect(result.value).toBe('a|b|c|d');
        
        const result2 = handler.normalizeLineBreaks('line1\r\nline2\r\nline3');
        expect(result2.pass).toBe(true);
        expect(result2.value).toBe('line1\nline2\nline3');
        
        const result3 = handler.normalizeLineBreaks('no breaks here', '|');
        expect(result3.pass).toBe(true);
        expect(result3.value).toBe('no breaks here');
    });

    test('normalizeUnicode normalizes combining sequences', () => {
        const result = handler.normalizeUnicode('e\u0301', 'NFC');
        expect(result.pass).toBe(true);
        expect(result.value).toBe('\u00e9');
        
        const result2 = handler.normalizeUnicode('\u00e9', 'NFD');
        expect(result2.pass).toBe(true);
        expect(result2.value).toBe('e\u0301');
        
        const result3 = handler.normalizeUnicode('plain ascii', 'NFC');
        expect(result3.pass).toBe(true);
        expect(result3.value).toBe('plain ascii');
    });

    test('padLeft pads from the left', () => {
        const result = handler.padLeft('7', 3, '0');
        expect(result.pass).toBe(true);
        expect(result.value).toBe('007');
        
        const result2 = handler.padLeft('abc', 5, '*');
        expect(result2.pass).toBe(true);
        expect(result2.value).toBe('**abc');
        
        const result3 = handler.padLeft('test', 4, '-');
        expect(result3.pass).toBe(true);
        expect(result3.value).toBe('test');
    });

    test('padRight pads from the right', () => {
        const result = handler.padRight('7', 3, '0');
        expect(result.pass).toBe(true);
        expect(result.value).toBe('700');
        
        const result2 = handler.padRight('abc', 5, '*');
        expect(result2.pass).toBe(true);
        expect(result2.value).toBe('abc**');
        
        const result3 = handler.padRight('hi', 4, '.');
        expect(result3.pass).toBe(true);
        expect(result3.value).toBe('hi..');
    });

    test('removeSpacing removes all whitespace', () => {
        const result = handler.removeSpacing(' a\t b\n c ');
        expect(result.pass).toBe(true);
        expect(result.value).toBe('abc');
        
        const result2 = handler.removeSpacing('no   spaces   between');
        expect(result2.pass).toBe(true);
        expect(result2.value).toBe('nospacesbetween');
        
        const result3 = handler.removeSpacing('hello');
        expect(result3.pass).toBe(true);
        expect(result3.value).toBe('hello');
    });

    test('slice returns substring range', () => {
        const result = handler.slice('abcdef', 1, 4);
        expect(result.pass).toBe(true);
        expect(result.value).toBe('bcd');
        
        const result2 = handler.slice('hello', 0, 5);
        expect(result2.pass).toBe(true);
        expect(result2.value).toBe('hello');
        
        const result3 = handler.slice('test', 2, 4);
        expect(result3.pass).toBe(true);
        expect(result3.value).toBe('st');
    });

    test('sliceFirst returns first n characters', () => {
        const result = handler.sliceFirst('abcdef', 2);
        expect(result.pass).toBe(true);
        expect(result.value).toBe('ab');
        
        const result2 = handler.sliceFirst('hello', 1);
        expect(result2.pass).toBe(true);
        expect(result2.value).toBe('h');
        
        const result3 = handler.sliceFirst('test');
        expect(result3.pass).toBe(true);
        expect(result3.value).toBe('t');
    });

    test('sliceLast returns last n characters', () => {
        const result = handler.sliceLast('abcdef', 2);
        expect(result.pass).toBe(true);
        expect(result.value).toBe('ef');
        
        const result2 = handler.sliceLast('hello', 1);
        expect(result2.pass).toBe(true);
        expect(result2.value).toBe('o');
        
        const result3 = handler.sliceLast('world', 3);
        expect(result3.pass).toBe(true);
        expect(result3.value).toBe('rld');
    });

    test('stripHtml removes HTML tags', () => {
        const result = handler.stripHtml('<p>Hello <strong>World</strong></p>');
        expect(result.pass).toBe(true);
        expect(result.value).toBe('Hello World');
        
        const result2 = handler.stripHtml('<div class="box">content</div>');
        expect(result2.pass).toBe(true);
        expect(result2.value).toBe('content');
        
        const result3 = handler.stripHtml('plain text without tags');
        expect(result3.pass).toBe(true);
        expect(result3.value).toBe('plain text without tags');
    });

    test('toDelimited uses switch index between transformer1 and transformer2', () => {
        const result = handler.toDelimited('ONE two THREE four', {
            fromDelims: ' ',
            toDelim: '-',
            transformer1: (word: string): string => word.toLowerCase(),
            transformer2: (word: string): string => word.toUpperCase(),
            transformerSwitchIndex: 2
        });
        expect(result.pass).toBe(true);
        expect(result.value).toBe('one-two-THREE-FOUR');
        
        const result2 = handler.toDelimited('a b c d', {
            fromDelims: ' ',
            toDelim: '_'
        });
        expect(result2.pass).toBe(true);
        expect(result2.value).toBe('a_b_c_d');
        
        const result3 = handler.toDelimited('hello world');
        expect(result3.pass).toBe(true);
        expect(result3.value).toBe('hello world');
    });

    test('toCamelCase converts delimited words to camelCase', () => {
        const result = handler.toCamelCase('HELLO-world_example', '-_');
        expect(result.pass).toBe(true);
        expect(result.value).toBe('helloWorldExample');
        
        const result2 = handler.toCamelCase('hello');
        expect(result2.pass).toBe(true);
        expect(result2.value).toBe('hello');
        
        const result3 = handler.toCamelCase('one two three', ' ');
        expect(result3.pass).toBe(true);
        expect(result3.value).toBe('oneTwoThree');
    });

    test('toKebabCase converts to kebab-case', () => {
        const result = handler.toKebabCase('Hello World_test', ' _');
        expect(result.pass).toBe(true);
        expect(result.value).toBe('hello-world-test');
        
        const result2 = handler.toKebabCase('already-kebab');
        expect(result2.pass).toBe(true);
        expect(result2.value).toBe('already-kebab');
        
        const result3 = handler.toKebabCase('CamelCaseString', null);
        expect(result3.pass).toBe(true);
        expect(result3.value).toBe('camelcasestring');
    });

    test('toLowerCase lowercases letters', () => {
        const result = handler.toLowerCase('HeLLo 123');
        expect(result.pass).toBe(true);
        expect(result.value).toBe('hello 123');
        
        const result2 = handler.toLowerCase('UPPERCASE');
        expect(result2.pass).toBe(true);
        expect(result2.value).toBe('uppercase');
        
        const result3 = handler.toLowerCase('123 ABC-def');
        expect(result3.pass).toBe(true);
        expect(result3.value).toBe('123 abc-def');
    });

    test('toPascalCase converts to PascalCase', () => {
        const result = handler.toPascalCase('hello WORLD_test', ' _');
        expect(result.pass).toBe(true);
        expect(result.value).toBe('HelloWorldTest');
        
        const result2 = handler.toPascalCase('single');
        expect(result2.pass).toBe(true);
        expect(result2.value).toBe('Single');
        
        const result3 = handler.toPascalCase('foo-bar-baz', '-');
        expect(result3.pass).toBe(true);
        expect(result3.value).toBe('FooBarBaz');
    });

    test('toSentenceCase converts to sentence case', () => {
        const result = handler.toSentenceCase('hELLo-WORLD_example', '-_');
        expect(result.pass).toBe(true);
        expect(result.value).toBe('Hello world example');
        
        const result2 = handler.toSentenceCase('one two three', ' ');
        expect(result2.pass).toBe(true);
        expect(result2.value).toBe('One two three');
        
        const result3 = handler.toSentenceCase('test');
        expect(result3.pass).toBe(true);
        expect(result3.value).toBe('Test');
    });

    test('toSnakeCase converts to snake_case', () => {
        const result = handler.toSnakeCase('Hello World-test', ' -');
        expect(result.pass).toBe(true);
        expect(result.value).toBe('hello_world_test');
        
        const result2 = handler.toSnakeCase('already_snake_case');
        expect(result2.pass).toBe(true);
        expect(result2.value).toBe('already_snake_case');
        
        const result3 = handler.toSnakeCase('FirstSecondThird', null);
        expect(result3.pass).toBe(true);
        expect(result3.value).toBe('firstsecondthird');
    });

    test('toTitleCase converts to Title Case', () => {
        const result = handler.toTitleCase('hello-WORLD_example', '-_');
        expect(result.pass).toBe(true);
        expect(result.value).toBe('Hello World Example');
        
        const result2 = handler.toTitleCase('one two three', ' ');
        expect(result2.pass).toBe(true);
        expect(result2.value).toBe('One Two Three');
        
        const result3 = handler.toTitleCase('single word');
        expect(result3.pass).toBe(true);
        expect(result3.value).toBe('Single word');
    });

    test('toUpperCase uppercases letters', () => {
        const result = handler.toUpperCase('HeLLo 123');
        expect(result.pass).toBe(true);
        expect(result.value).toBe('HELLO 123');
        
        const result2 = handler.toUpperCase('lowercase text');
        expect(result2.pass).toBe(true);
        expect(result2.value).toBe('LOWERCASE TEXT');
        
        const result3 = handler.toUpperCase('ABC def-123');
        expect(result3.pass).toBe(true);
        expect(result3.value).toBe('ABC DEF-123');
    });

    test('trim default chars trims all surrounding whitespace', () => {
        const result = handler.trim('  \t hello \n  ');
        expect(result.pass).toBe(true);
        expect(result.value).toBe('hello');
        
        const result2 = handler.trim('   test   ');
        expect(result2.pass).toBe(true);
        expect(result2.value).toBe('test');
        
        const result3 = handler.trim('no trim needed');
        expect(result3.pass).toBe(true);
        expect(result3.value).toBe('no trim needed');
    });

    test('trimLeft default chars trims left-side whitespace only', () => {
        const result = handler.trimLeft(' \t hello \n ');
        expect(result.pass).toBe(true);
        expect(result.value).toBe('hello \n ');
        
        const result2 = handler.trimLeft('   test   ');
        expect(result2.pass).toBe(true);
        expect(result2.value).toBe('test   ');
        
        const result3 = handler.trimLeft('\t\tno tabs');
        expect(result3.pass).toBe(true);
        expect(result3.value).toBe('no tabs');
    });

    test('trimRight default chars trims right-side whitespace only', () => {
        const result = handler.trimRight(' \t hello \n ');
        expect(result.pass).toBe(true);
        expect(result.value).toBe(' \t hello');
        
        const result2 = handler.trimRight('   test   ');
        expect(result2.pass).toBe(true);
        expect(result2.value).toBe('   test');
        
        const result3 = handler.trimRight('text\n\n\n');
        expect(result3.pass).toBe(true);
        expect(result3.value).toBe('text');
    });

    test('urlDecode decodes percent-encoded values', () => {
        const result = handler.urlDecode('hello%20world%21');
        expect(result.pass).toBe(true);
        expect(result.value).toBe('hello world!');
        
        const result2 = handler.urlDecode('test%40example.com');
        expect(result2.pass).toBe(true);
        expect(result2.value).toBe('test@example.com');
        
        const result3 = handler.urlDecode('plain%20text%20here');
        expect(result3.pass).toBe(true);
        expect(result3.value).toBe('plain text here');
    });

    test('urlEncode encodes reserved URL characters', () => {
        const result = handler.urlEncode('/api/v1?q=test');
        expect(result.pass).toBe(true);
        expect(result.value).toBe('%2Fapi%2Fv1%3Fq%3Dtest');
        
        const result2 = handler.urlEncode('hello@example.com');
        expect(result2.pass).toBe(true);
        expect(result2.value).toBe('hello%40example.com');
        
        const result3 = handler.urlEncode('test string with spaces');
        expect(result3.pass).toBe(true);
        expect(result3.value).toBe('test%20string%20with%20spaces');
    });
});
