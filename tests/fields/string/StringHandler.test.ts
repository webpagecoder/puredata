'use strict';

import { StringHandler } from '../../../lib/fields/string/StringHandler.ts';
import { runFailTests, runPassTests } from '../../helpers/runCases.ts';



describe('StringHandler overrides', () => {
	let handler: StringHandler;

	beforeEach(() => {
		handler = new StringHandler();
	});

	it('empty', () => {
		runPassTests(handler.empty.bind(handler), [
			{ input: '' },
		]);

		runFailTests(handler.empty.bind(handler), [
			{ input: ' ' },
			{ input: 'abc1' },
			{ input: '#' },
		]);
	});

	it('notEmpty', () => {
		runPassTests(handler.notEmpty.bind(handler), [
			{ input: ' ' },
			{ input: 'abc1' },
			{ input: '#' },

		]);

		runFailTests(handler.notEmpty.bind(handler), [
			{ input: '' },
		]);
	});
});







describe('StringHandler validators basic', () => {
	let handler: StringHandler;

	beforeEach(() => {
		handler = new StringHandler();
	});

	it('alpha', () => {
		runPassTests(handler.alpha.bind(handler), [
			{ input: '' },
			{ input: 'aNfk' },
			{ input: 'abc' },
			{ input: 'ABC' },
			{ input: 'AbCdEfGhIjKlMnOpQrStUvWxYz' },
			{ input: 'abcdefghijklmnopqrstuvwxyz' },
			{ input: 'ABC' }
		]);

		runFailTests(handler.alpha.bind(handler), [
			{ input: 'aNfk ' },
			{ input: 'abc1' },
			{ input: '#' },
		]);
	});

	it('alphanumeric', () => {
		runPassTests(handler.alphanumeric.bind(handler), [
			{ input: '' },
			{ input: 'abc123' },
			{ input: 'A1b2C3' },
			{ input: '0' },
		]);

		runFailTests(handler.alphanumeric.bind(handler), [
			{ input: 'abc-123' },
			{ input: 'abc 123' },
			{ input: '#123' },
		]);
	});

	it('ascii', () => {
		runPassTests(handler.ascii.bind(handler), [
			{ input: '' },
			{ input: 'ABC123!' },
			{ input: 'line\nbreak\tand tab' },
		]);

		runFailTests(handler.ascii.bind(handler), [
			{ input: 'cafe\u00E9' },
			{ input: 'snowman \u2603' },
		]);
	});

	it('base64', () => {
		runPassTests(handler.base64.bind(handler), [
			{ input: 'TWFu' },
			{ input: 'TWE=' },
			{ input: 'TQ==' },
			{ input: 'QUJDRA==' },
		]);

		runFailTests(handler.base64.bind(handler), [
			{ input: 'TWFu=' },
			{ input: 'TWE' },
			{ input: 'TQ===' },
			{ input: 'TW!u' },
		]);
	});

	it('binary', () => {
		runPassTests(handler.binary.bind(handler), [
			{ input: '' },
			{ input: '0' },
			{ input: '1' },
			{ input: '101010' },
		]);

		runFailTests(handler.binary.bind(handler), [
			{ input: '10201' },
			{ input: 'abc' },
			{ input: '10 01' },
		]);
	});

	it('bmp', () => {
		runPassTests(handler.bmp.bind(handler), [
			{ input: '' },
			{ input: 'ASCII text 123' },
			{ input: '\u0000\u0001\u007F' },
			{ input: '\uD7FF\uE000\uFFFF' },
			{ input: 'A\u2603B' },
		]);

		runFailTests(handler.bmp.bind(handler), [
			{ input: 'a\u{1F600}' },
			{ input: 'music \u{1D11E}' },
		]);
	});

	it('digits', () => {
		runPassTests(handler.digits.bind(handler), [
			{ input: '' },
			{ input: '0' },
			{ input: '0123456789' },
			{ input: '000000' },
		]);

		runFailTests(handler.digits.bind(handler), [
			{ input: '123a' },
			{ input: '12 34' },
			{ input: '-123' },
			{ input: '1.23' },
			{ input: '١٢٣' },
		]);
	});

	it('hex', () => {
		runPassTests(handler.hex.bind(handler), [
			{ input: '' },
			{ input: 'A1b2', output: 'a1b2' },
			{ input: 'ABCDEF', output: 'abcdef' },
			{ input: '00FF00', output: '00ff00' },
			{ input: 'deadbeef' },
			{ input: 'A1b2', args: [{ normalize: false }] },
			{ input: 'ABCDEF', args: [{ normalize: false }] },
		]);

		runFailTests(handler.hex.bind(handler), [
			{ input: 'G1' },
			{ input: '0xFF' },
			{ input: 'ab cd' },
			{ input: '#A1B2' },
		]);
	});

	it('hexColor', () => {
		runPassTests(handler.hexColor.bind(handler), [
			{ input: '#A1b2C3', output: '#a1b2c3' },
			{ input: '#ABC', output: '#abc' },
			{ input: 'A1b2C3', output: 'a1b2c3' },
			{ input: 'ABC', output: 'abc' },
			{ input: '#A1b2C3', args: [{ normalize: false }] },
			{ input: 'ABC', args: [{ normalize: false }] },
		]);

		runFailTests(handler.hexColor.bind(handler), [
			{ input: '' },
			{ input: '#abcd' },
			{ input: '#12' },
			{ input: '#12345' },
			{ input: '#1234567' },
			{ input: '#GGG' },
			{ input: '##123456' },
		]);
	});

	it('blank', () => {
		runPassTests(handler.blank.bind(handler), [
			{ input: '' },
			{ input: ' ' },
			{ input: '\t ' },
			{ input: '\n\n' },
		]);

		runFailTests(handler.blank.bind(handler), [
			{ input: '\naNfk ' },
			{ input: 'abc1' },
			{ input: '#' },
		]);
	});

	it('notBlank', () => {
		runPassTests(handler.notBlank.bind(handler), [
			{ input: '\naNfk ' },
			{ input: 'abc1' },
			{ input: '#' },
		]);

		runFailTests(handler.notBlank.bind(handler), [
			{ input: '' },
			{ input: ' ' },
			{ input: '\t ' },
			{ input: '\n\n' },
		]);
	});

	it('octal', () => {
		runPassTests(handler.octal.bind(handler), [
			{ input: '' },
			{ input: '0' },
			{ input: '7' },
			{ input: '70123456' },
			{ input: '000777' },
		]);

		runFailTests(handler.octal.bind(handler), [
			{ input: '8' },
			{ input: '128' },
			{ input: '70 12' },
			{ input: '-701' },
			{ input: 'abc' },
		]);
	});
});












describe('StringHandler validators digital', () => {
	let handler: StringHandler;

	beforeEach(() => {
		handler = new StringHandler();
	});

	it('dataUrl', () => {

		runPassTests(handler.dataUrl.bind(handler), [
			{ input: 'data:image/png;base64,QUJD' },
			{ input: 'data:audio/mp3;base64,QUJD' },
			{ input: 'data:image/png;base64,QUJD', args: [{ allowedTypes: ['image'] }] },
			{ input: 'data:text/plain;base64,QUJD', args: [{ allowedTypes: ['text', 'audio'] }] },
			{ input: 'data:text/plain;base64,TQ==' },
			{ input: 'DATA:IMAGE/SVG+XML;BASE64,QUJD' },
			{ input: 'data:video/x-matroska;base64,QUJDRA==' },
			{ input: 'data:image/vnd.microsoft.icon;base64,QUJD' },
			{ input: 'data:text/plain;base64,AB+/=' },
			{ input: 'data:audio/mp3;base64,QUJD', args: [{ allowedTypes: ['audio'] }] },
			{ input: 'data:video/mp4;base64,QUJD', args: [{ allowedTypes: ['video'] }] },
		]);

		runFailTests(handler.dataUrl.bind(handler), [
			{ input: 'data:audio/mp3;base64,QUJD', args: [{ allowedTypes: ['image'] }] },
			{ input: 'data:image/png;base64,QUJD', args: [{ allowedTypes: ['text', 'audio'] }] },
			{ input: 'data:image/png,QUJD' },
			{ input: 'data:image/png;base64,' },
			{ input: 'data:image/png;base64,QUJD*' },
			{ input: 'data:application/json;base64,QUJD' },
			{ input: 'data:image/png;base64,QUJD', args: [{ allowedTypes: [] }] },
			{ input: 'http:image/png;base64,QUJD' },
			{ input: 'data:image/png;base64,QU JD' },
		]);

	});

	describe('domain', () => {
		it('normalizes by default and preserves case when normalize is false', () => {
			runPassTests(handler.domain.bind(handler), [
				{ input: 'ExAmPlE.CoM', output: 'example.com' },
				{ input: 'ExAmPlE.CoM', args: [{ normalize: false }] },
			]);
		});

		it('supports normalize option across additional domain shapes', () => {
			runPassTests(handler.domain.bind(handler), [
				{ input: 'Api.Example.COM', output: 'api.example.com' },
				{ input: 'Api.Example.COM', args: [{ normalize: false }] },
				{ input: '*.Api.Example.COM', args: [{ wildcards: 'optional' }], output: '*.api.example.com' },
				{ input: '*.Api.Example.COM', args: [{ wildcards: 'optional', normalize: false }] },
			]);
		});

		it('supports all subdomains modes', () => {
			runPassTests(handler.domain.bind(handler), [
				{ input: 'example.com', args: [{ subdomains: 'optional' }] },
				{ input: 'api.example.com', args: [{ subdomains: 'optional' }] },
				{ input: 'api.example.com', args: [{ subdomains: 'required' }] },
				{ input: 'example.com', args: [{ subdomains: 'forbidden' }] },
			]);

			runFailTests(handler.domain.bind(handler), [
				{ input: 'example.com', args: [{ subdomains: 'required' }] },
				{ input: 'api.example.com', args: [{ subdomains: 'forbidden' }] },
			]);
		});

		it('supports all wildcards modes', () => {
			// Existing commented coverage brought into active tests first.
			runPassTests(handler.domain.bind(handler), [
				{ input: 'example.com', args: [{ wildcards: 'optional' }] },
				{ input: '*.example.com', args: [{ wildcards: 'optional' }] },
				{ input: '*.example.com', args: [{ wildcards: 'required' }] },
			]);

			runFailTests(handler.domain.bind(handler), [
				{ input: '*.example.com', args: [{ wildcards: 'forbidden' }] },
				{ input: 'example.com', args: [{ wildcards: 'required' }] },
			]);
		});

		it('supports extensions array option via args', () => {
			runPassTests(handler.domain.bind(handler), [
				{ input: 'example.com', args: [{ extensions: ['com'] }] },
				{ input: 'example.io', args: [{ extensions: ['com', 'io'] }] },
				{ input: 'api.example.com', args: [{ extensions: ['com'], subdomains: 'required' }] },
				{ input: 'example.xn--p1ai', args: [{ extensions: ['xn--p1ai'] }] },
				{ input: 'ExAmPlE.CoM', args: [{ extensions: ['com'], normalize: false }] },
			]);

			runFailTests(handler.domain.bind(handler), [
				{ input: 'example.net', args: [{ extensions: ['com', 'io'] }] },
				{ input: 'example.com', args: [{ extensions: ['.com'] }] },
				{ input: 'api.example.co.uk', args: [{ extensions: ['com'] }] },
				{ input: 'example.com', args: [{ extensions: [], subdomains: 'required' }] },
			]);
		});

		it('supports domain extensions and rejects invalid TLD shapes', () => {
			runPassTests(handler.domain.bind(handler), [
				{ input: 'example.com' },
				{ input: 'example.co.uk' },
				{ input: 'example.io' },
				{ input: 'example.net' },
				{ input: 'example.org' },
				{ input: 'example.12a' },
				{ input: 'service.example.co.uk' },
				{ input: 'service.example.com.au' },
				{ input: 'service.example.gov.uk' },
				{ input: 'example.xn--p1ai' },
				{ input: 'example.xn--fiqs8s' },
				{ input: 'EXAMPLE.ORG', output: 'example.org' },
				{ input: 'example.co.uk' },
			]);

			runFailTests(handler.domain.bind(handler), [
				{ input: 'example.c' },
				{ input: 'example.abcdefghijklmnopqrstuvwxyz' },
				{ input: 'example.123' },
				{ input: 'example.-com' },
				{ input: 'example.c_m' },
				{ input: 'example.com-' },
				{ input: 'example..co.uk' },
			]);
		});

		it('rejects malformed domain labels and handles edge cases', () => {

			runPassTests(handler.domain.bind(handler), [
				{ input: 'xn--bcher-kva.de' },
				{ input: '*.API.Example.COM', args: [{ wildcards: 'optional' }], output: '*.api.example.com' },
				{ input: '*.example.com', args: [{ wildcards: 'required', subdomains: 'forbidden' }] },
				{ input: '*.api.example.com', args: [{ wildcards: 'required', subdomains: 'required' }] },
				{ input: 'api.example.com', args: [{ wildcards: 'forbidden', subdomains: 'required' }] },
				{ input: 'example.a23456789012345678901234' },
			]);

			runFailTests(handler.domain.bind(handler), [
				{ input: '*.example.co.uk', args: [{ wildcards: 'required', subdomains: 'forbidden' }] },
				{ input: '-example.com' },
				{ input: 'example..com' },
				{ input: 'example.com.' },
				{ input: '.example.com' },
				{ input: 'exa_mple.com' },
				{ input: 'example.123' },
				{ input: '*.example.com', args: [{ wildcards: 'forbidden', subdomains: 'required' }] },
				{ input: '*.com', args: [{ wildcards: 'required', subdomains: 'required' }] },
				{ input: 'api.example.com', args: [{ wildcards: 'required' }] },
				{ input: 'example.com', args: [{ subdomains: 'required', wildcards: 'required' }] },
				{ input: 'toolongtld.abcdefghijklmnopqrstuvwxyz' },
			]);
		});


	});

	describe('e123', () => {
		it('validates strict by default and enforces length bounds', () => {
			runPassTests(handler.e123.bind(handler), [
				{ input: '+1 212 555 1234' },
				{ input: '+12 34567' },
				{ input: '+123 456789012345' },
			]);

			runFailTests(handler.e123.bind(handler), [
				{ input: '123' },
				{ input: '+123456' },
				{ input: '+123 4567890123456' },
				{ input: '+1.212.555.1234' },
				{ input: '+1 212 ABC 1234' },
			]);
		});

		it('supports mode option (strict vs loose)', () => {
			runPassTests(handler.e123.bind(handler), [
				{ input: '+1.212.555.1234', args: [{ mode: 'loose' }], output: '+1 212 555 1234' },
				{ input: '+1/212/555/1234', args: [{ mode: 'loose' }], output: '+1 212 555 1234' },
			]);

			runFailTests(handler.e123.bind(handler), [
				{ input: '+1.212.555.1234', args: [{ mode: 'strict' }] },
				{ input: '1.212.555.1234', args: [{ mode: 'loose' }] },
			]);
		});

		it('supports normalize option', () => {
			runPassTests(handler.e123.bind(handler), [
				{ input: '+1.212.555.1234', args: [{ mode: 'loose' }], output: '+1 212 555 1234' },
				{ input: '+1.212.555.1234', args: [{ mode: 'loose', normalize: false }] },
			]);
		});

		it('supports acceptableDelims option', () => {
			runPassTests(handler.e123.bind(handler), [
				{ input: '+1_212_555_1234', args: [{ mode: 'loose', acceptableDelims: ' _' }], output: '+1 212 555 1234' },
			]);

			runFailTests(handler.e123.bind(handler), [
				{ input: '+1_212_555_1234', args: [{ mode: 'loose' }] },
			]);
		});

		it('supports normalizedDelim option', () => {
			runPassTests(handler.e123.bind(handler), [
				{
					input: '+1_212_555_1234',
					args: [{ mode: 'loose', acceptableDelims: ' _', normalizedDelim: '-' }],
					output: '+1-212-555-1234'
				},
			]);
		});

		it('supports stripDelims option for noisy input', () => {
			runPassTests(handler.e123.bind(handler), [
				{
					input: '+1 (212) 555-1234',
					args: [{ mode: 'loose', stripDelims: ' ()' }],
					output: '+1 212 555 1234'
				},
			]);

			runFailTests(handler.e123.bind(handler), [
				{ input: '+1 (212) 555-1234', args: [{ mode: 'loose' }] },
			]);
		});
	});

	describe('e164', () => {
		type E164CallOptions = NonNullable<Parameters<StringHandler['e164']>[1]> & {
			mode?: 'strict' | 'loose';
			normalize?: boolean;
		};

		it('validates strict by default and enforces + with digit-length bounds', () => {
			runPassTests(handler.e164.bind(handler), [
				{ input: '+12125551234' },
				{ input: '+1234567' },
				{ input: '+123456789012345' },
			]);

			runFailTests(handler.e164.bind(handler), [
				{ input: '12125551234' },
				{ input: '+123456' },
				{ input: '+1234567890123456' },
				{ input: '+1-212-555-1234' },
				{ input: '++12125551234' },
				{ input: '+12A25551234' },
			]);
		});

		it('supports mode option (strict vs loose)', () => {
			const strictOptions: E164CallOptions = { mode: 'strict' };
			const looseOptions: E164CallOptions = { mode: 'loose' };

			runPassTests(handler.e164.bind(handler), [
				{ input: '12125551234', args: [looseOptions], output: '+12125551234' },
				{ input: '+1-212-555-1234', args: [looseOptions], output: '+12125551234' },
			]);

			runFailTests(handler.e164.bind(handler), [
				{ input: '12125551234', args: [strictOptions], output: '12125551234' },
			]);


		});

		it('supports normalize option', () => {
			const looseOptions: E164CallOptions = { mode: 'loose' };
			const looseNormalizedOptions: E164CallOptions = { mode: 'loose', normalize: true };

			runPassTests(handler.e164.bind(handler), [
				{ input: '+1-212-555-1234', args: [looseOptions], output: '+12125551234' },
			]);

			runPassTests(handler.e164.bind(handler), [
				{ input: '+1-212-555-1234', args: [looseNormalizedOptions], output: '+12125551234' },
				{ input: '1 212 555 1234', args: [looseNormalizedOptions], output: '+12125551234' },
			]);
		});

		it('supports acceptableDelims option in loose matching', () => {
			const options: E164CallOptions = { mode: 'loose', normalize: true };
			runPassTests(handler.e164.bind(handler), [
				{ input: '+1_212_555_1234', args: [{ ...options, acceptableDelims: ' _' }], output: '+12125551234' },
			]);

			runFailTests(handler.e164.bind(handler), [
				{ input: '+1_212_555_1234', args: [options] },
			]);
		});

		it('supports stripDelims option in loose matching', () => {
			const options: E164CallOptions = { mode: 'loose', normalize: true };
			runPassTests(handler.e164.bind(handler), [
				{ input: '+1(212)5551234', args: [{ ...options, stripDelims: ' ()' }], output: '+12125551234' },
			]);

			runFailTests(handler.e164.bind(handler), [
				{ input: '+1(212)5551234', args: [options] },
			]);
		});

		it('supports normalizedDelim option behavior', () => {
			const options: E164CallOptions = { mode: 'loose', normalize: true };
			runPassTests(handler.e164.bind(handler), [
				{ input: '+1 212 555 1234', args: [{ ...options, acceptableDelims: '', stripDelims: ' ' }], output: '+12125551234' },
			]);

			runFailTests(handler.e164.bind(handler), [
				{ input: '+1 212 555 1234', args: [{ ...options, normalizedDelim: '-' }] },
			]);
		});
	});

	describe('email', () => {
		it('accepts valid emails and normalizes by default', () => {
			runPassTests(handler.email.bind(handler), [
				{ input: 'A.B+Tag@Example.COM', output: 'a.b+tag@example.com' },
				{ input: "o'hara@sub.example.co.uk" },
				{ input: 'user_name-123@example.io' },
				{ input: 'x@x.io' },
			]);
		});

		it('supports normalize option', () => {
			runPassTests(handler.email.bind(handler), [
				{ input: 'A.B+Tag@Example.COM', args: [{ normalize: false }] },
				{ input: 'A.B+Tag@Example.COM', args: [{ normalize: true }], output: 'a.b+tag@example.com' },
			]);
		});

		it('rejects malformed local or domain parts', () => {
			runFailTests(handler.email.bind(handler), [
				{ input: '' },
				{ input: 'invalid@@example.com' },
				{ input: '@example.com' },
				{ input: 'user@' },
				{ input: '.user@example.com' },
				{ input: 'user.@example.com' },
				{ input: 'user@-example.com' },
				{ input: 'user@exa_mple.com' },
				{ input: 'user@example.123' },
			]);
		});
	});

	describe('ip', () => {
		it('accepts valid IPv4 and IPv6 forms and rejects malformed inputs', () => {
			runPassTests(handler.ip.bind(handler), [
				{ input: '8.8.8.8' },
				{ input: '127.0.0.1' },
				{ input: '2001:db8::1' },
				{ input: '::1' },
				{ input: 'FE80::ABCD', output: 'fe80::abcd' },
			]);

			runFailTests(handler.ip.bind(handler), [
				{ input: '' },
				{ input: '999.8.8.8' },
				{ input: '1.2.3' },
				{ input: '2001:::1' },
				{ input: 'gggg::1' },
				{ input: 'not-an-ip' },
			]);
		});

		it('supports normalize option', () => {
			runPassTests(handler.ip.bind(handler), [
				{ input: 'FE80::ABCD', args: [{ normalize: false }] },
				{ input: 'FE80::ABCD', args: [{ normalize: true }], output: 'fe80::abcd' },
			]);
		});
	});

	it('ipCidr', () => {
		runPassTests(handler.ipCidr.bind(handler), [
			{ input: '192.168.0.1/24' },
			{ input: '0.0.0.0/0' },
			{ input: '255.255.255.255/32' },
			{ input: '2001:db8::1/64' },
			{ input: '::/0' },
			{ input: '::1/128' },
		]);

		runFailTests(handler.ipCidr.bind(handler), [
			{ input: '192.168.0.1/33' },
			{ input: '2001:db8::1/129' },
			{ input: '192.168.0.1/-1' },
			{ input: '192.168.0.1/abc' },
			{ input: '192.168.0.1' },
			{ input: '1.2.3.4/24/extra' },
		]);
	});

	it('ipCidrV4', () => {
		runPassTests(handler.ipCidrV4.bind(handler), [
			{ input: '10.0.0.1/8' },
			{ input: '0.0.0.0/0' },
			{ input: '255.255.255.255/32' },
		]);

		runFailTests(handler.ipCidrV4.bind(handler), [
			{ input: '10.0.0.1/33' },
			{ input: '10.0.0.1/50' },
			{ input: '10.0.0.1' },
			{ input: '10.0.0.1/abc' },
			{ input: '256.0.0.1/24' },
			{ input: '2001:db8::1/64' },
		]);
	});

	it('ipCidrV6', () => {
		runPassTests(handler.ipCidrV6.bind(handler), [
			{ input: '2001:db8::1/64' },
			{ input: '::/0' },
			{ input: '::1/128' },
		]);

		runFailTests(handler.ipCidrV6.bind(handler), [
			{ input: '2001:db8::1/129' },
			{ input: '2001:db8::1' },
			{ input: '2001:db8::1/abc' },
			{ input: 'gggg::1/64' },
			{ input: '10.0.0.1/24' },
		]);
	});

	describe('ipV4', () => {
		it('accepts valid edge values and rejects malformed IPv4', () => {
			runPassTests(handler.ipV4.bind(handler), [
				{ input: '0.0.0.0' },
				{ input: '1.2.3.4' },
				{ input: '127.0.0.1' },
				{ input: '255.255.255.255' },
			]);

			runFailTests(handler.ipV4.bind(handler), [
				{ input: '' },
				{ input: '256.0.0.1' },
				{ input: '01.2.3.4' },
				{ input: '1.2.3' },
				{ input: '1.2.3.4.5' },
				{ input: '1..3.4' },
				{ input: '1.2.3.-1' },
			]);
		});

		it('supports normalize option', () => {
			runPassTests(handler.ipV4.bind(handler), [
				{ input: '127.0.0.1', args: [{ normalize: false }] },
				{ input: '127.0.0.1', args: [{ normalize: true }] },
			]);
		});
	});

	describe('ipV6', () => {
		it('accepts standard and condensed IPv6 forms and rejects malformed values', () => {
			runPassTests(handler.ipV6.bind(handler), [
				{ input: '2001:0db8:85a3:0000:0000:8a2e:0370:7334' },
				{ input: '2001:db8::1' },
				{ input: 'fe80::1' },
				{ input: '::1' },
				{ input: '::' },
				{ input: 'FE80::ABCD', output: 'fe80::abcd' },
			]);

			runFailTests(handler.ipV6.bind(handler), [
				{ input: '' },
				{ input: '2001:::1' },
				{ input: 'gggg::1' },
				{ input: '12345::' },
				{ input: '1:2:3:4:5:6:7:8:9' },
			]);
		});

		it('supports normalize option', () => {
			runPassTests(handler.ipV6.bind(handler), [
				{ input: 'FE80::ABCD', args: [{ normalize: false }] },
				{ input: 'FE80::ABCD', args: [{ normalize: true }], output: 'fe80::abcd' },
			]);
		});
	});

	it('json', () => {
		runPassTests(handler.json.bind(handler), [
			{ input: '{}' },
			{ input: '[]' },
			{ input: '{"a":1,"b":[true,null,"x"]}' },
			{ input: 'true' },
			{ input: 'null' },
			{ input: '"text"' },
			{ input: '  {"a":[1,2,3]}  ' },
		]);

		runFailTests(handler.json.bind(handler), [
			{ input: '' },
			{ input: '{a:1}' },
			{ input: '{"a":1,}' },
			{ input: '[1,2,]' },
			{ input: 'undefined' },
			{ input: '{"a": Infinity}' },
		]);
	});

	it('jwt', () => {
		runPassTests(handler.jwt.bind(handler), [
			{ input: 'aaa.bbb.ccc' },
			{ input: 'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxMjM0NTYifQ.c2ln' },
			{ input: 'a-b_c.d-e_f.g-h_i' },
			{ input: 'aaa=.bbb=.ccc=' },
		]);

		runFailTests(handler.jwt.bind(handler), [
			{ input: '' },
			{ input: 'aaa.bbb' },
			{ input: 'aaa.bbb.ccc.ddd' },
			{ input: 'aaa..ccc' },
			{ input: '.bbb.ccc' },
			{ input: 'aa+/bb.ccc.ddd' },
		]);
	});

	describe('label', () => {
		it('accepts valid label forms and rejects invalid shapes', () => {
			runPassTests(handler.label.bind(handler), [
				{ input: 'My-Label', output: 'my-label' },
				{ input: 'a' },
				{ input: 'a'.repeat(63) },
				{ input: 'abc-123' },
				{ input: '0abc' },
			]);

			runFailTests(handler.label.bind(handler), [
				{ input: '' },
				{ input: '-bad' },
				{ input: 'bad-' },
				{ input: 'a'.repeat(64) },
				{ input: 'bad_label' },
				{ input: 'bad label' },
			]);
		});

		it('supports normalize option', () => {
			runPassTests(handler.label.bind(handler), [
				{ input: 'My-Label', args: [{ normalize: false }] },
				{ input: 'My-Label', args: [{ normalize: true }], output: 'my-label' },
			]);
		});
	});

	describe('mac', () => {
		it('validates strict default format and rejects malformed values', () => {
			runPassTests(handler.mac.bind(handler), [
				{ input: 'AA:BB:CC:DD:EE:FF', output: 'aa:bb:cc:dd:ee:ff' },
				{ input: 'aa:bb:cc:dd:ee:ff' },
			]);

			runFailTests(handler.mac.bind(handler), [
				{ input: '' },
				{ input: 'AA-BB-CC-DD-EE-FF' },
				{ input: 'AA:BB:CC:DD:EE' },
				{ input: 'AA:BB:CC:DD:EE:FF:11' },
				{ input: 'GG:BB:CC:DD:EE:FF' },
				{ input: 'A:BB:CC:DD:EE:FF' },
			]);
		});

		it('supports normalize option', () => {
			runPassTests(handler.mac.bind(handler), [
				{ input: 'AA:BB:CC:DD:EE:FF', args: [{ normalize: false }] },
				{ input: 'AA:BB:CC:DD:EE:FF', args: [{ normalize: true }], output: 'aa:bb:cc:dd:ee:ff' },
			]);
		});

		it('supports mode option (strict vs loose)', () => {
			runPassTests(handler.mac.bind(handler), [
				{ input: 'AA-BB-CC-DD-EE-FF', args: [{ mode: 'loose' }], output: 'aa:bb:cc:dd:ee:ff' },
				{ input: 'AA.BB.CC.DD.EE.FF', args: [{ mode: 'loose' }], output: 'aa:bb:cc:dd:ee:ff' },
			]);

			runFailTests(handler.mac.bind(handler), [
				{ input: 'AA-BB-CC-DD-EE-FF', args: [{ mode: 'strict' }] },
				{ input: 'AABBCCDDEEF', args: [{ mode: 'loose' }] },
			]);
		});

		it('supports normalizedDelim option in loose mode', () => {
			runPassTests(handler.mac.bind(handler), [
				{ input: 'AA_BB_CC_DD_EE_FF', args: [{ mode: 'loose', normalizedDelim: '-' }], output: 'aa-bb-cc-dd-ee-ff' },
				{ input: 'AA/BB/CC/DD/EE/FF', args: [{ mode: 'loose', normalizedDelim: '.' }], output: 'aa.bb.cc.dd.ee.ff' },
			]);
		});

		it('supports acceptableDelims option in loose mode', () => {
			runPassTests(handler.mac.bind(handler), [
				{ input: 'AA~BB~CC~DD~EE~FF', args: [{ mode: 'loose', acceptableDelims: ':~' }], output: 'aa:bb:cc:dd:ee:ff' },
			]);

			runFailTests(handler.mac.bind(handler), [
				{ input: 'AA~BB~CC~DD~EE~FF', args: [{ mode: 'loose' }] },
			]);
		});

		it('supports stripDelims option in loose mode', () => {
			runPassTests(handler.mac.bind(handler), [
				{ input: '(AA)(BB)(CC)(DD)(EE)(FF)', args: [{ mode: 'loose', stripDelims: '()' }], output: 'aa:bb:cc:dd:ee:ff' },
			]);

			runFailTests(handler.mac.bind(handler), [
				{ input: '(AA)(BB)(CC)(DD)(EE)(FF)', args: [{ mode: 'loose' }] },
			]);
		});
	});

	describe('path', () => {
		it('supports lowercase option', () => {
			runPassTests(handler.path.bind(handler), [
				{ input: '/UsR/LoCaL/File.TXT' },
				{ input: '/UsR/LoCaL/File.TXT', args: [{ lowercase: true }], output: '/usr/local/file.txt' },
				{ input: 'C:\\Users\\Me\\File.TXT', args: [{ style: 'win' }] },
				{ input: 'C:\\Users\\Me\\File.TXT', args: [{ style: 'win', lowercase: true }], output: 'c:\\users\\me\\file.txt' },
			]);
		});

		it('supports absolute option modes for unix style', () => {
			runPassTests(handler.path.bind(handler), [
				{ input: '/usr/local/file.txt', args: [{ absolute: 'required' }] },
				{ input: '/usr/local/file.txt', args: [{ absolute: 'optional' }] },
				{ input: 'usr/local/file.txt', args: [{ absolute: 'optional' }] },
				{ input: 'usr/local/file.txt', args: [{ absolute: 'forbidden' }] },
			]);

			runFailTests(handler.path.bind(handler), [
				{ input: 'usr/local/file.txt', args: [{ absolute: 'required' }] },
				{ input: '/usr/local/file.txt', args: [{ absolute: 'forbidden' }] },
			]);
		});

		it('supports absolute option modes for win style', () => {
			runPassTests(handler.path.bind(handler), [
				{ input: 'C:\\Users\\Me\\file.txt', args: [{ style: 'win', absolute: 'required' }] },
				{ input: 'C:\\Users\\Me\\file.txt', args: [{ style: 'win', absolute: 'optional' }] },
				{ input: 'Users\\Me\\file.txt', args: [{ style: 'win', absolute: 'optional' }] },
				{ input: 'Users\\Me\\file.txt', args: [{ style: 'win', absolute: 'forbidden' }] },
			]);

			runFailTests(handler.path.bind(handler), [
				{ input: 'Users\\Me\\file.txt', args: [{ style: 'win', absolute: 'required' }] },
				{ input: 'C:\\Users\\Me\\file.txt', args: [{ style: 'win', absolute: 'forbidden' }] },
			]);
		});

		it('supports style option: unix, win, and win-unc', () => {
			runPassTests(handler.path.bind(handler), [
				{ input: '/usr/local/file.txt', args: [{ style: 'unix' }] },
				{ input: 'C:\\Users\\Me\\file.txt', args: [{ style: 'win' }] },
				{ input: '\\\\server\\share\\folder\\file.txt', args: [{ style: 'win-unc' }] },
			]);

			runFailTests(handler.path.bind(handler), [
				{ input: 'Users\\Me\\file.txt', args: [{ style: 'win' }] },
				{ input: 'C:\\Users\\Me\\file.txt', args: [{ style: 'win-unc' }] },
				{ input: '/usr/local/file.txt', args: [{ style: 'win' }] },
			]);
		});

		it('supports extensions option', () => {
			runPassTests(handler.path.bind(handler), [
				{ input: '/usr/local/file.txt', args: [{ extensions: ['.txt'] }] },
				{ input: '/usr/local/file.jpg', args: [{ extensions: ['.*'] }] },
				{ input: '/usr/local/file.tar.gz', args: [{ extensions: ['.tar.gz'] }] },
				{ input: '/usr/local/file.TXT', args: [{ extensions: ['.txt'] }] },
				{ input: '/usr/local/file.TXT', args: [{ extensions: ['.txt'], lowercase: true }], output: '/usr/local/file.txt' },
			]);

			runFailTests(handler.path.bind(handler), [
				{ input: '/usr/local/file.jpg', args: [{ extensions: ['.txt'] }] },
				{ input: '/usr/local/file', args: [{ extensions: ['.*'] }] },
				{ input: '/usr/local/file', args: [{ extensions: ['.txt'] }] },
				{ input: '/usr/local/.txt', args: [{ extensions: ['.txt'] }] },
			]);
		});

		it('supports segmentMaxLen option for file and folder segments', () => {
			const validFileSegment = '/usr/' + 'a'.repeat(10) + '.txt';
			const tooLongFileSegment = '/usr/' + 'a'.repeat(11) + '.txt';
			const tooLongFolderSegment = '/' + 'b'.repeat(11) + '/file.txt';

			runPassTests(handler.path.bind(handler), [
				{ input: validFileSegment, args: [{ segmentMaxLen: 10 }] },
			]);

			runFailTests(handler.path.bind(handler), [
				{ input: tooLongFileSegment, args: [{ segmentMaxLen: 10 }] },
				{ input: tooLongFolderSegment, args: [{ segmentMaxLen: 10 }] },
			]);
		});


	});

	it('slug', () => {
		runPassTests(handler.slug.bind(handler), [
			{ input: 'my-slug-1' },
			{ input: 'a' },
			{ input: 'z9' },
			{ input: 'abc123' },
			{ input: 'abc-123-def-456' },
			{ input: '0' },
		]);

		runFailTests(handler.slug.bind(handler), [
			{ input: '' },
			{ input: 'My Slug' },
			{ input: 'My-Slug' },
			{ input: '-slug' },
			{ input: 'slug-' },
			{ input: 'two--hyphens' },
			{ input: 'has_underscore' },
			{ input: 'has.dot' },
			{ input: 'white space' },
			{ input: 'slug!' },
		]);
	});

	describe('url', () => {
		it('normalizes by default and can preserve case', () => {
			runPassTests(handler.url.bind(handler), [
				{ input: 'HTTPS://EXAMPLE.COM/Path?X=1#Top', output: 'https://example.com/path?x=1#top' },
				{ input: 'HTTPS://EXAMPLE.COM/Path?X=1#Top', args: [{ normalize: false }] },
			]);
		});

		it('allows explicit normalize override per call', () => {
			runPassTests(handler.url.bind(handler), [
				{ input: 'HTTPS://EXAMPLE.COM/Path', args: [{ normalize: false }] },
				{ input: 'HTTPS://EXAMPLE.COM/Path', args: [{ normalize: true }], output: 'https://example.com/path' },
			]);
		});

		it('supports allowedProtocols option', () => {
			runPassTests(handler.url.bind(handler), [
				{ input: 'https://example.com', args: [{ allowedProtocols: ['https'] }] },
				{ input: 'ftp://example.com', args: [{ allowedProtocols: ['ftp'], protocols: 'required' }] },
			]);

			runFailTests(handler.url.bind(handler), [
				{ input: 'http://example.com', args: [{ allowedProtocols: ['https'] }] },
				{ input: 'ftp://example.com' },
			]);
		});

		it('supports protocols option modes', () => {
			runPassTests(handler.url.bind(handler), [
				{ input: 'https://example.com', args: [{ protocols: 'required' }] },
				{ input: 'example.com', args: [{ protocols: 'forbidden' }] },
			]);

			runFailTests(handler.url.bind(handler), [
				{ input: 'example.com', args: [{ protocols: 'required' }] },
				{ input: 'https://example.com', args: [{ protocols: 'forbidden' }] },
			]);
		});

		it('supports host type options: domain, ip, and label', () => {
			runPassTests(handler.url.bind(handler), [
				{ input: 'https://example.com', args: [{ domain: 'required', ip: 'forbidden', label: 'forbidden' }] },
				{ input: 'https://127.0.0.1', args: [{ ip: 'required', domain: 'forbidden', label: 'forbidden' }] },
				{ input: 'localhost', args: [{ label: 'required', domain: 'forbidden', ip: 'forbidden', protocols: 'forbidden' }] },
				{ input: 'https://[2001:db8::1]', args: [{ ip: 'required', domain: 'forbidden', label: 'forbidden' }] },
			]);

			runFailTests(handler.url.bind(handler), [
				{ input: 'https://127.0.0.1', args: [{ domain: 'required', ip: 'forbidden', label: 'forbidden' }] },
				{ input: 'https://example.com', args: [{ ip: 'required', domain: 'forbidden', label: 'forbidden' }] },
				{ input: 'example.com', args: [{ label: 'required', domain: 'forbidden', ip: 'forbidden', protocols: 'forbidden' }] },
				{ input: 'https://2001:db8::1', args: [{ ip: 'required' }] },
			]);
		});

		it('supports port option modes and validates port range', () => {
			runPassTests(handler.url.bind(handler), [
				{ input: 'https://example.com:8080', args: [{ port: 'required' }] },
				{ input: 'https://example.com', args: [{ port: 'forbidden' }] },
				{ input: 'https://example.com:1', args: [{ port: 'required' }] },
				{ input: 'https://example.com:65535', args: [{ port: 'required' }] },
			]);

			runFailTests(handler.url.bind(handler), [
				{ input: 'https://example.com', args: [{ port: 'required' }] },
				{ input: 'https://example.com:8080', args: [{ port: 'forbidden' }] },
				{ input: 'https://example.com:70000', args: [{ port: 'optional' }] },
				{ input: 'https://example.com:0', args: [{ port: 'required' }] },
			]);
		});

		it('supports query option modes', () => {
			runPassTests(handler.url.bind(handler), [
				{ input: 'https://example.com?a=1', args: [{ query: 'required' }] },
				{ input: 'https://example.com', args: [{ query: 'forbidden' }] },
			]);

			runFailTests(handler.url.bind(handler), [
				{ input: 'https://example.com', args: [{ query: 'required' }] },
				{ input: 'https://example.com?a=1', args: [{ query: 'forbidden' }] },
			]);
		});

		it('supports fragment option modes', () => {
			runPassTests(handler.url.bind(handler), [
				{ input: 'https://example.com#top', args: [{ fragment: 'required' }] },
				{ input: 'https://example.com', args: [{ fragment: 'forbidden' }] },
			]);

			runFailTests(handler.url.bind(handler), [
				{ input: 'https://example.com', args: [{ fragment: 'required' }] },
				{ input: 'https://example.com#top', args: [{ fragment: 'forbidden' }] },
			]);
		});

		it('supports rootRelative option and rejects host/protocol when enabled', () => {
			runPassTests(handler.url.bind(handler), [
				{ input: '/docs/page?x=1#t', args: [{ rootRelative: true }] },
				{ input: '/docs', args: [{ rootRelative: true }] },
			]);

			runFailTests(handler.url.bind(handler), [
				{ input: 'https://example.com/docs', args: [{ rootRelative: true }] },
				{ input: 'example.com/docs', args: [{ rootRelative: true }] },
			]);
		});

		it('accepts more complex valid URLs', () => {
			runPassTests(handler.url.bind(handler), [
				{ input: 'https://sub.example.com:443/path/to/resource-name_1.2~ok?q=abc%2Fdef&x=1#frag-1', output: 'https://sub.example.com:443/path/to/resource-name_1.2~ok?q=abc%2fdef&x=1#frag-1' },
				{ input: 'https://[2001:db8::1]:8443/path/to/resource?token=a-b_c~d%2E1#section-2', output: 'https://[2001:db8::1]:8443/path/to/resource?token=a-b_c~d%2e1#section-2' },
				{ input: 'sub.example.com:8080/path-here?query=value#frag' },
			]);
		});

		it('rejects complex malformed URLs', () => {
			runFailTests(handler.url.bind(handler), [
				{ input: 'https://[2001:db8::1/path?x=1#f' },
				{ input: 'https://example.com:99999/path?x=1#f' },
				{ input: 'https://example.com/path?x=%ZZ#f' },
				{ input: 'https://example.com:abc/path' },
			]);
		});
	});

	describe('uuid', () => {
		it('validates canonical UUID and rejects malformed values', () => {
			runPassTests(handler.uuid.bind(handler), [
				{ input: '550e8400-e29b-41d4-a716-446655440000' },
				{ input: '550E8400-E29B-41D4-A716-446655440000', output: '550e8400-e29b-41d4-a716-446655440000' },
			]);

			runFailTests(handler.uuid.bind(handler), [
				{ input: '550e8400-e29b-61d4-a716-446655440000' },
				{ input: '550e8400-e29b-41d4-a716-44665544000' },
				{ input: '550e8400-e29b-41d4-c716-446655440000' },
			]);
		});

		it('supports version option', () => {
			runPassTests(handler.uuid.bind(handler), [
				{ input: '550e8400-e29b-11d4-a716-446655440000', args: [{ version: 1 }] },
				{ input: '550e8400-e29b-41d4-a716-446655440000', args: [{ version: 4 }] },
				{ input: '550e8400-e29b-41d4-a716-446655440000', args: [{ version: '4' }] },
			]);

			runFailTests(handler.uuid.bind(handler), [
				{ input: '550e8400-e29b-11d4-a716-446655440000', args: [{ version: 4 }] },
				{ input: '550e8400-e29b-41d4-a716-446655440000', args: [{ version: 1 }] },
			]);
		});

		it('supports mode option (strict and loose)', () => {
			runPassTests(handler.uuid.bind(handler), [
				{ input: '550e8400e29b41d4a716446655440000', args: [{ mode: 'loose' }], output: '550e8400-e29b-41d4-a716-446655440000' },
				{ input: 'urn:uuid:550e8400-e29b-41d4-a716-446655440000', args: [{ mode: 'loose' }], output: '550e8400-e29b-41d4-a716-446655440000' },
				{ input: '{550e8400-e29b-41d4-a716-446655440000}', args: [{ mode: 'loose' }], output: '550e8400-e29b-41d4-a716-446655440000' },
			]);

			runFailTests(handler.uuid.bind(handler), [
				{ input: '550e8400e29b41d4a716446655440000', args: [{ mode: 'strict' }] },
				{ input: 'urn:uuid:550e8400-e29b-41d4-a716-446655440000', args: [{ mode: 'strict' }] },
			]);
		});

		it('supports normalize option', () => {
			runPassTests(handler.uuid.bind(handler), [
				{ input: '550E8400-E29B-41D4-A716-446655440000', args: [{ normalize: false }] },
				{ input: '550E8400-E29B-41D4-A716-446655440000', args: [{ normalize: true }], output: '550e8400-e29b-41d4-a716-446655440000' },
			]);
		});

		it('supports normalizedDelim and acceptableDelims options in loose mode', () => {
			runPassTests(handler.uuid.bind(handler), [
				{ input: '550e8400_e29b_41d4_a716_446655440000', args: [{ mode: 'loose' }], output: '550e8400-e29b-41d4-a716-446655440000' },
				{ input: '550e8400_e29b_41d4_a716_446655440000', args: [{ mode: 'loose', acceptableDelims: ' _' }], output: '550e8400-e29b-41d4-a716-446655440000' },
				{ input: '550e8400_e29b_41d4_a716_446655440000', args: [{ mode: 'loose', acceptableDelims: ' _', normalizedDelim: ':' }], output: '550e8400:e29b:41d4:a716:446655440000' },
			]);

			runFailTests(handler.uuid.bind(handler), [
				{ input: '550e8400~e29b~41d4~a716~446655440000', args: [{ mode: 'loose' }] },
			]);
		});

		it('supports stripDelims option', () => {
			runPassTests(handler.uuid.bind(handler), [
				{ input: '550e8400#e29b#41d4#a716#446655440000', args: [{ mode: 'loose', stripDelims: ' #' }], output: '550e8400-e29b-41d4-a716-446655440000' },
			]);

			runFailTests(handler.uuid.bind(handler), [
				{ input: '550e8400#e29b#41d4#a716#446655440000', args: [{ mode: 'loose' }] },
			]);
		});
	});

});













describe('StringHandler content validators', () => {
	let handler: StringHandler;

	beforeEach(() => {
		handler = new StringHandler();
	});

	it('balanced', () => {
		runPassTests(handler.balanced.bind(handler), [
			{ input: '' },
			{ input: '()' },
			{ input: '(a(b)c)' },
			{ input: 'no delimiters here' },
			{ input: '[x[y]z]', args: ['[', ']'] },
			{ input: '<<>>', args: ['<', '>'] },
		]);

		runFailTests(handler.balanced.bind(handler), [
			{ input: ')(' },
			{ input: '(()' },
			{ input: '())' },
			{ input: '][', args: ['[', ']'] },
			{ input: '[[', args: ['[', ']'] },
		]);
	});

	describe('complex', () => {
		it('enforces default complexity requirements', () => {
			runPassTests(handler.complex.bind(handler), [
				{ input: 'Aa1!bCd2' },
				{ input: 'Ab3$xyZ9' },
			]);

			runFailTests(handler.complex.bind(handler), [
				{ input: 'Aa1!abc' },
				{ input: 'aa1!bcde' },
				{ input: 'AA1!BCDE' },
				{ input: 'Ab!cDefg' },
				{ input: 'Ab1cDefg' },
				{ input: 'Ab1!cccd' },
			]);
		});

		it('supports minLength and maxLength options', () => {
			runPassTests(handler.complex.bind(handler), [
				{ input: 'Ab1!xyZa', args: [{ minLength: 8 }] },
				{ input: 'Ab1!xy', args: [{ minLength: 1, maxLength: 6 }] },
			]);

			runFailTests(handler.complex.bind(handler), [
				{ input: 'Ab1!xy', args: [{ minLength: 8 }] },
				{ input: 'Ab1!xyZa', args: [{ minLength: 1, maxLength: 6 }] },
			]);
		});

		it('supports count thresholds and maxRepeats options', () => {
			runPassTests(handler.complex.bind(handler), [
				{ input: 'AAbb11!!', args: [{ minUppercase: 2, minLowercase: 2, minDigits: 2, minSpecialChars: 2 }] },
				{ input: 'Aaa1!bbb', args: [{ maxRepeats: 3 }] },
			]);

			runFailTests(handler.complex.bind(handler), [
				{ input: 'Ab1!cdef', args: [{ minUppercase: 2 }] },
				{ input: 'AB1!CDEF', args: [{ minLowercase: 2 }] },
				{ input: 'Abc!Defg', args: [{ minDigits: 2 }] },
				{ input: 'Ab12Defg', args: [{ minSpecialChars: 2 }] },
				{ input: 'Aaaaa1!b', args: [{ maxRepeats: 3 }] },
			]);
		});
	});

	it('contains', () => {
		runPassTests(handler.contains.bind(handler), [
			{ input: 'hello world', args: ['world'] },
			{ input: 'abc', args: [''] },
			{ input: 'abc', args: ['abc'] },
			{ input: 'Hello World', args: ['WORLD', { ignoreCase: true }], output: 'hello world' },
		]);

		runFailTests(handler.contains.bind(handler), [
			{ input: 'hello world', args: ['mars'] },
			{ input: 'abc', args: ['abcd'] },
			{ input: 'Hello World', args: ['WORLD'] },
		]);
	});

	it('endsWith', () => {
		runPassTests(handler.endsWith.bind(handler), [
			{ input: 'report.pdf', args: ['.pdf'] },
			{ input: 'abc', args: [''] },
			{ input: 'abc', args: ['abc'] },
			{ input: 'Hello.TXT', args: ['.txt', { ignoreCase: true }], output: 'hello.txt' },
		]);

		runFailTests(handler.endsWith.bind(handler), [
			{ input: 'report.pdf', args: ['.txt'] },
			{ input: 'abc', args: ['zabc'] },
			{ input: 'Hello.TXT', args: ['.txt'] },
		]);
	});

	it('excludesChars', () => {
		runPassTests(handler.excludesChars.bind(handler), [
			{ input: 'abcdef', args: ['xyz'] },
			{ input: 'ABC', args: ['a', { ignoreCase: false }] },
			{ input: 'a.c+d', args: ['[]()'] },
		]);

		runFailTests(handler.excludesChars.bind(handler), [
			{ input: 'abc', args: ['b'] },
			{ input: 'ABC', args: ['a', { ignoreCase: true }] },
			{ input: 'a.c+d', args: ['.+'] },
		]);
	});

	it('length', () => {
		runPassTests(handler.length.bind(handler), [
			{ input: '', args: [0] },
			{ input: 'abcd', args: [4] },
		]);

		runFailTests(handler.length.bind(handler), [
			{ input: 'abc', args: [2] },
			{ input: '', args: [1] },
		]);
	});

	it('lengthBetween', () => {
		runPassTests(handler.lengthBetween.bind(handler), [
			{ input: '', args: [0, 0] },
			{ input: 'abc', args: [1, 3] },
			{ input: 'abc', args: [3, 3] },
		]);

		runFailTests(handler.lengthBetween.bind(handler), [
			{ input: '', args: [1, 2] },
			{ input: 'abcd', args: [1, 3] },
			{ input: 'abc', args: [4, 2] },
		]);
	});

	it('lowerCase', () => {
		runPassTests(handler.lowerCase.bind(handler), [
			{ input: '' },
			{ input: 'abc' },
			{ input: 'abc123!_-' },
		]);

		runFailTests(handler.lowerCase.bind(handler), [
			{ input: 'Abc' },
			{ input: 'ABC' },
		]);
	});

	it('matches', () => {
		runPassTests(handler.matches.bind(handler), [
			{ input: 'abc123', args: [/^[a-z]+\d+$/] },
			{ input: 'HELLO', args: [/^[a-z]+$/i] },
		]);

		runFailTests(handler.matches.bind(handler), [
			{ input: 'abc', args: [/^\d+$/] },
			{ input: 'abc123', args: [/^[a-z]+$/] },
		]);
	});

	it('maxLength', () => {
		runPassTests(handler.maxLength.bind(handler), [
			{ input: '', args: [0] },
			{ input: 'abc', args: [3] },
			{ input: 'abc', args: [5] },
		]);

		runFailTests(handler.maxLength.bind(handler), [
			{ input: 'abcd', args: [3] },
		]);
	});

	it('maxWords', () => {
		runPassTests(handler.maxWords.bind(handler), [
			{ input: 'one two', args: [2] },
			{ input: 'one|two|three', args: [3, '|'] },
			{ input: 'a  b', args: [3, ' '] },
			{ input: 'a, b, c', args: [3, ', '] },
		]);

		runFailTests(handler.maxWords.bind(handler), [
			{ input: 'one two three', args: [2] },
			{ input: 'one|two|three', args: [2, '|'] },
			{ input: ' one', args: [1] },
		]);
	});

	it('minLength', () => {
		runPassTests(handler.minLength.bind(handler), [
			{ input: 'abc', args: [3] },
			{ input: 'abcd', args: [3] },
		]);

		runFailTests(handler.minLength.bind(handler), [
			{ input: '', args: [1] },
			{ input: 'ab', args: [3] },
		]);
	});

	it('minWords', () => {
		runPassTests(handler.minWords.bind(handler), [
			{ input: 'one two', args: [2] },
			{ input: 'one|two|three', args: [3, '|'] },
			{ input: 'a  b', args: [3, ' '] },
			{ input: ' one', args: [2] },
		]);

		runFailTests(handler.minWords.bind(handler), [
			{ input: 'one', args: [2] },
			{ input: 'one|two', args: [3, '|'] },
			{ input: 'a, b, c', args: [4, ', '] },
		]);
	});

	it('onlyChars', () => {
		runPassTests(handler.onlyChars.bind(handler), [
			{ input: '', args: ['abc'] },
			{ input: 'abccba', args: ['abc'] },
			{ input: 'AbC', args: ['abc', { ignoreCase: true }] },
			{ input: '.+*', args: ['.+*'] },
		]);

		runFailTests(handler.onlyChars.bind(handler), [
			{ input: 'abcd', args: ['abc'] },
			{ input: 'AbC', args: ['abc'] },
			{ input: '.+x', args: ['.+*'] },
		]);
	});

	it('repeats', () => {
		runPassTests(handler.repeats.bind(handler), [
			{ input: 'abcabcXabc', args: ['abc', 2] },
			{ input: 'abcabc', args: ['abc', 2, 2] },
			{ input: 'AAxxaa', args: ['aa', 2, 2, { ignoreCase: true }] },
			{ input: 'abab', args: ['ab', 2, 2, { otherText: false }] },
			{ input: 'aaaa', args: ['aa', 2, 2] },
		]);

		runFailTests(handler.repeats.bind(handler), [
			{ input: 'abcX', args: ['abc', 2] },
			{ input: 'abcabcabc', args: ['abc', 1, 2] },
			{ input: 'AAxxaa', args: ['aa', 2, 2, { ignoreCase: false }] },
			{ input: 'abXab', args: ['ab', 2, 2, { otherText: false }] },
			{ input: '', args: ['x', 0, null, { otherText: false }] },
		]);
	});

	it('startsWith', () => {
		runPassTests(handler.startsWith.bind(handler), [
			{ input: 'prefix-value', args: ['pre'] },
			{ input: 'abc', args: [''] },
			{ input: 'HelloWorld', args: ['hello', { ignoreCase: true }], output: 'helloworld' },
		]);

		runFailTests(handler.startsWith.bind(handler), [
			{ input: 'prefix-value', args: ['value'] },
			{ input: 'HelloWorld', args: ['hello'] },
		]);
	});

	it('upperCase', () => {
		runPassTests(handler.upperCase.bind(handler), [
			{ input: '' },
			{ input: 'ABC' },
			{ input: 'ABC123!_-' },
		]);

		runFailTests(handler.upperCase.bind(handler), [
			{ input: 'AbC' },
			{ input: 'abc' },
		]);
	});

	it('wordCount', () => {
		runPassTests(handler.wordCount.bind(handler), [
			{ input: 'one two three', args: [3, 3] },
			{ input: '  one\n two\tthree  ', args: [3, null] },
			{ input: '', args: [0, 0] },
			{ input: '\n\t ', args: [0, 0] },
			{ input: 'one-two', args: [1, 1] },
			{ input: 'single' },
		]);

		runFailTests(handler.wordCount.bind(handler), [
			{ input: 'one two', args: [3, null] },
			{ input: 'one two three', args: [1, 2] },
			{ input: '   ', args: [1, null] },
		]);
	});


});















describe('StringHandler identifiers/financial', () => {
	let handler: StringHandler;

	beforeEach(() => {
		handler = new StringHandler();
	});

	describe('creditCard', () => {
		it('validates known brands and luhn by default', () => {
			runPassTests(handler.creditCard.bind(handler), [
				{ input: '4111111111111111' },
				{ input: '5555555555554444' },
				{ input: '378282246310005' },
				{ input: '6011111111111117' },
				{ input: '30569309025904' },
				{ input: '3530111333300000' },
			]);

			runFailTests(handler.creditCard.bind(handler), [
				{ input: '' },
				{ input: '4111111111111112' },
				{ input: '1234567890123456' },
			]);
		});

		it('supports types filtering including null and empty-array behavior', () => {
			runPassTests(handler.creditCard.bind(handler), [
				{ input: '4111111111111111', args: [{ types: ['visa'] }] },
				{ input: '378282246310005', args: [{ types: ['amex'] }] },
				{ input: '30569309025904', args: [{ types: ['diners'] }] },
				{ input: '6011111111111117', args: [{ types: ['discover'] }] },
				{ input: '3530111333300000', args: [{ types: ['jcb'] }] },
				{ input: '4111111111111111', args: [{ types: ['visa', 'amex'] }] },
				{ input: '4111111111111111', args: [{ types: [] }] },
				{ input: '5555555555554444', args: [{ types: null }] },
			]);

			runFailTests(handler.creditCard.bind(handler), [
				{ input: '4111111111111111', args: [{ types: ['amex'] }] },
				{ input: '378282246310005', args: [{ types: ['visa'] }] },
				{ input: '30569309025904', args: [{ types: ['diners16'] }] },
				{ input: '6011111111111117', args: [{ types: ['jcb'] }] },
				{ input: '3530111333300000', args: [{ types: ['discover'] }] },
			]);
		});

		it('supports loose mode normalize and delimiter options', () => {
			runPassTests(handler.creditCard.bind(handler), [
				{ input: '4111 1111 1111 1111', args: [{ mode: 'loose' }], output: '4111111111111111' },
				{ input: '4111 1111 1111 1111', args: [{ mode: 'loose', normalize: false }] },
				{ input: '4111 1111 1111 1111', args: [{ mode: 'loose', normalizedDelim: '-' }], output: '4111-1111-1111-1111' },
				{ input: '4111~1111~1111~1111', args: [{ mode: 'loose', acceptableDelims: ' ~' }], output: '4111111111111111' },
				{ input: '(4111)(1111)(1111)(1111)', args: [{ mode: 'loose', stripDelims: '()' }], output: '4111111111111111' },
			]);

			runFailTests(handler.creditCard.bind(handler), [
				{ input: '4111 1111 1111 1111' },
				{ input: '4111~1111~1111~1111', args: [{ mode: 'loose' }] },
				{ input: '(4111)(1111)(1111)(1111)', args: [{ mode: 'loose' }] },
			]);
		});

		it('supports additional delimiter shapes and strict-vs-loose boundaries', () => {
			runPassTests(handler.creditCard.bind(handler), [
				{ input: '4111:1111:1111:1111', args: [{ mode: 'loose', acceptableDelims: ' :' }], output: '4111111111111111' },
				{ input: '[4111].[1111].[1111].[1111]', args: [{ mode: 'loose', stripDelims: '[]', acceptableDelims: ' .', normalizedDelim: '.' }], output: '4111.1111.1111.1111' },
				{ input: '4111/1111/1111/1111', args: [{ mode: 'loose', normalizedDelim: '/' }], output: '4111/1111/1111/1111' },
				{ input: '4111111111111111', args: [{ mode: 'loose', normalizedDelim: '-' }], output: '4111-1111-1111-1111' },
				{ input: '4111 1111 1111 1111', args: [{ mode: 'loose', types: ['visa'] }], output: '4111111111111111' },
			]);

			runFailTests(handler.creditCard.bind(handler), [
				{ input: '4111:1111:1111:1111', args: [{ mode: 'loose' }] },
				{ input: '[4111].[1111].[1111].[1111]', args: [{ mode: 'loose', acceptableDelims: ' .' }] },
				{ input: '4111/1111/1111/1111', args: [{ mode: 'strict' }] },
				{ input: '4111 1111 1111 1111', args: [{ mode: 'loose', types: ['amex'] }] },
			]);
		});
	});

	describe('currencyCode', () => {
		it('validates strict case by default', () => {
			runPassTests(handler.currencyCode.bind(handler), [
				{ input: 'USD' },
				{ input: 'EUR' },
			]);

			runFailTests(handler.currencyCode.bind(handler), [
				{ input: 'usd' },
				{ input: 'US' },
				{ input: 'ZZZ' },
			]);
		});

		it('supports ignoreCase and normalize options', () => {
			runPassTests(handler.currencyCode.bind(handler), [
				{ input: 'usd', args: [{ ignoreCase: true }], output: 'USD' },
				{ input: 'usd', args: [{ ignoreCase: true, normalize: false }] },
			]);
		});
	});

	describe('gtin', () => {
		it('validates check digit and default allowed lengths', () => {
			runPassTests(handler.gtin.bind(handler), [
				{ input: '96385074' },
				{ input: '036000291452' },
				{ input: '4006381333931' },
				{ input: '12345678901231' },
			]);

			runFailTests(handler.gtin.bind(handler), [
				{ input: '4006381333932' },
				{ input: '96385075' },
			]);
		});

		it('supports lengths option', () => {
			runPassTests(handler.gtin.bind(handler), [
				{ input: '96385074', args: [{ lengths: [8] }] },
				{ input: '4006381333931', args: [{ lengths: [13] }] },
			]);

			runFailTests(handler.gtin.bind(handler), [
				{ input: '96385074', args: [{ lengths: [13] }] },
				{ input: '4006381333931', args: [{ lengths: [8] }] },
			]);
		});

		it('supports loose mode normalize and delimiter options', () => {
			runPassTests(handler.gtin.bind(handler), [
				{ input: '4 006381 333931', args: [{ mode: 'loose' }], output: '4006381333931' },
				{ input: '4 006381 333931', args: [{ mode: 'loose', normalize: false }] },
				{ input: '4 006381 333931', args: [{ mode: 'loose', normalizedDelim: '.' }], output: '4.006381.333931' },
				{ input: '4~006381~333931', args: [{ mode: 'loose', acceptableDelims: ' ~' }], output: '4006381333931' },
				{ input: '(4)(006381)(333931)', args: [{ mode: 'loose', stripDelims: '()' }], output: '4006381333931' },
			]);

			runFailTests(handler.gtin.bind(handler), [
				{ input: '4 006381 333931' },
				{ input: '4~006381~333931', args: [{ mode: 'loose' }] },
				{ input: '(4)(006381)(333931)', args: [{ mode: 'loose' }] },
			]);
		});
	});

	describe('hash', () => {
		it('supports default and explicit algorithms', () => {
			runPassTests(handler.hash.bind(handler), [
				{ input: 'd41d8cd98f00b204e9800998ecf8427e' },
				{ input: 'd41d8cd98f00b204e9800998ecf8427e', args: ['md5'] },
				{ input: 'da39a3ee5e6b4b0d3255bfef95601890afd80709', args: ['sha1'] },
				{ input: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855', args: ['sha256'] },
			]);

			runFailTests(handler.hash.bind(handler), [
				{ input: 'xyz', args: ['md5'] },
				{ input: 'd41d8cd98f00b204e9800998ecf8427e', args: ['unknown'] },
			]);
		});
	});

	describe('imei', () => {
		it('validates check digit and strict form', () => {
			runPassTests(handler.imei.bind(handler), [
				{ input: '490154203237518' },
			]);

			runFailTests(handler.imei.bind(handler), [
				{ input: '490154203237519' },
				{ input: '49.015420.323751.8' },
			]);
		});

		it('supports loose mode normalize and delimiter options', () => {
			runPassTests(handler.imei.bind(handler), [
				{ input: '49.015420.323751.8', args: [{ mode: 'loose' }], output: '490154203237518' },
				{ input: '49 015420 323751 8', args: [{ mode: 'loose', normalize: false }] },
				{ input: '49 015420 323751 8', args: [{ mode: 'loose', normalizedDelim: '.' }], output: '49.015420.323751.8' },
				{ input: '49~015420~323751~8', args: [{ mode: 'loose', acceptableDelims: ' ~' }], output: '490154203237518' },
				{ input: '(49)(015420)(323751)(8)', args: [{ mode: 'loose', stripDelims: '()' }], output: '490154203237518' },
			]);

			runFailTests(handler.imei.bind(handler), [
				{ input: '49~015420~323751~8', args: [{ mode: 'loose' }] },
			]);
		});
	});

	it('luhn', () => {
		runPassTests(handler.luhn.bind(handler), [
			{ input: '79927398713' },
			{ input: '4242424242424242' },
			{ input: '0000000000000000' },
		]);

		runFailTests(handler.luhn.bind(handler), [
			{ input: '79927398714' },
			{ input: '4242424242424241' },
			{ input: 'abc123' },
		]);
	});

	describe('phone', () => {
		it('validates strict default format and malformed inputs', () => {
			runPassTests(handler.phone.bind(handler), [
				{ input: '212-555-1234' },
			]);

			runFailTests(handler.phone.bind(handler), [
				{ input: '2125551234' },
				{ input: '(212)555-1234' },
				{ input: '+44 20 7946 0958' },
			]);
		});

		it('supports mode normalize and delimiter options', () => {
			runPassTests(handler.phone.bind(handler), [
				{ input: '2125551234', args: [{ mode: 'loose' }], output: '212-555-1234' },
				{ input: '212 555 1234', args: [{ mode: 'loose', normalize: false }] },
				{ input: '212 555 1234', args: [{ mode: 'loose', normalizedDelim: '.' }], output: '212.555.1234' },
				{ input: '212~555~1234', args: [{ mode: 'loose', acceptableDelims: ' ~' }], output: '212-555-1234' },
				{ input: '(212)5551234', args: [{ mode: 'loose', stripDelims: '()' }], output: '212-555-1234' },
				{ input: '+1 (212) 555-1234', args: [{ mode: 'loose' }], output: '212-555-1234' },
			]);

			runFailTests(handler.phone.bind(handler), [
				{ input: '212~555~1234', args: [{ mode: 'loose' }] },
				{ input: '212-555-123', args: [{ mode: 'loose' }] },
			]);
		});
	});

	describe('ssn', () => {
		it('validates structural constraints in strict mode', () => {
			runPassTests(handler.ssn.bind(handler), [
				{ input: '123-45-6789' },
			]);

			runFailTests(handler.ssn.bind(handler), [
				{ input: '000-45-6789' },
				{ input: '666-45-6789' },
				{ input: '900-45-6789' },
				{ input: '123-00-6789' },
				{ input: '123-45-0000' },
			]);
		});

		it('supports loose mode normalize and delimiter options', () => {
			runPassTests(handler.ssn.bind(handler), [
				{ input: '123456789', args: [{ mode: 'loose' }], output: '123-45-6789' },
				{ input: '123 45 6789', args: [{ mode: 'loose', normalize: false }] },
				{ input: '123 45 6789', args: [{ mode: 'loose', normalizedDelim: '.' }], output: '123.45.6789' },
				{ input: '123~45~6789', args: [{ mode: 'loose', acceptableDelims: ' ~' }], output: '123-45-6789' },
				{ input: '(123)(45)(6789)', args: [{ mode: 'loose', stripDelims: '()' }], output: '123-45-6789' },
			]);

			runFailTests(handler.ssn.bind(handler), [
				{ input: '123~45~6789', args: [{ mode: 'loose' }] },
			]);
		});
	});

	describe('state', () => {
		it('validates strict case and rejects unknown values', () => {
			runPassTests(handler.state.bind(handler), [
				{ input: 'CA' },
				{ input: 'NY' },
			]);

			runFailTests(handler.state.bind(handler), [
				{ input: 'ca' },
				{ input: 'XX' },
				{ input: 'PR' },
			]);
		});

		it('supports ignoreCase and normalize options', () => {
			runPassTests(handler.state.bind(handler), [
				{ input: 'ca', args: [{ ignoreCase: true }], output: 'CA' },
				{ input: 'ny', args: [{ ignoreCase: true, normalize: false }] },
			]);
		});
	});

	describe('zip', () => {
		it('validates strict base forms and zip4 modes', () => {
			runPassTests(handler.zip.bind(handler), [
				{ input: '12345-6789' },
				{ input: '12345-6789', args: [{ zip4: 'required' }] },
				{ input: '12345', args: [{ mode: 'loose', zip4: 'forbidden' }], output: '12345-' },
			]);

			runFailTests(handler.zip.bind(handler), [
				{ input: '12345' },
				{ input: '12345', args: [{ mode: 'loose', zip4: 'required' }] },
				{ input: '12345-6789', args: [{ zip4: 'forbidden' }] },
			]);
		});

		it('supports loose mode normalize and delimiter options', () => {
			runPassTests(handler.zip.bind(handler), [
				{ input: '123456789', args: [{ mode: 'loose' }], output: '12345-6789' },
				{ input: '123456789', args: [{ mode: 'loose', normalize: false }] },
				{ input: '123456789', args: [{ mode: 'loose', normalizedDelim: '.' }], output: '12345.6789' },
				{ input: '12345~6789', args: [{ mode: 'loose', acceptableDelims: ' ~' }], output: '12345-6789' },
				{ input: '(12345)(6789)', args: [{ mode: 'loose', stripDelims: '()' }], output: '12345-6789' },
			]);

			runFailTests(handler.zip.bind(handler), [
				{ input: '12345~6789', args: [{ mode: 'loose' }] },
				{ input: '00000-1234' },
				{ input: '12345-0000' },
			]);
		});
	});
});






describe('StringHandler validators numeric', () => {
	let handler: StringHandler;

	beforeEach(() => {
		handler = new StringHandler();
	});

	describe('numeric', () => {
		it('supports sign and alignment options', () => {
			runPassTests(handler.numeric.bind(handler), [
				{ input: '+12', args: [{ plus: 'required' }] },
				{ input: '-12', args: [{ minus: 'required' }] },
				{ input: '12+', args: [{ alignment: 'right', plus: 'required' }] },
				{ input: '12-', args: [{ alignment: 'right', minus: 'required' }] },
			]);

			runFailTests(handler.numeric.bind(handler), [
				{ input: '12', args: [{ plus: 'required' }] },
				{ input: '+12', args: [{ plus: 'forbidden' }] },
				{ input: '12', args: [{ minus: 'required' }] },
				{ input: '-12', args: [{ minus: 'forbidden' }] },
				{ input: '+12', args: [{ alignment: 'right', plus: 'required' }] },
				{ input: '12+', args: [{ alignment: 'left', plus: 'required' }] },
			]);
		});

		it('supports min max decimal and precision options', () => {
			runPassTests(handler.numeric.bind(handler), [
				{ input: '10', args: [{ min: 10 }] },
				{ input: '10', args: [{ max: 10 }] },
				{ input: '12.3', args: [{ decimal: 'required' }] },
				{ input: '12', args: [{ decimal: 'forbidden' }] },
				{ input: '12.34', args: [{ decimal: 'required', minPrecision: 2, maxPrecision: 2 }] },
				{ input: '12.345', args: [{ decimal: 'required', minPrecision: 2, maxPrecision: 3 }] },
			]);

			runFailTests(handler.numeric.bind(handler), [
				{ input: '9', args: [{ min: 10 }] },
				{ input: '11', args: [{ max: 10 }] },
				{ input: '12', args: [{ decimal: 'required' }] },
				{ input: '12.3', args: [{ decimal: 'forbidden' }] },
				{ input: '12.3', args: [{ decimal: 'required', minPrecision: 2, maxPrecision: 2 }] },
				{ input: '12.3456', args: [{ decimal: 'required', minPrecision: 2, maxPrecision: 3 }] },
			]);
		});

		it('supports delimiters symbols and loose spacing', () => {
			runPassTests(handler.numeric.bind(handler), [
				{ input: '1_234', args: [{ thousandsDelim: '_' }] },
				{ input: '12,5', args: [{ decimalDelim: ',', decimal: 'required' }] },
				{ input: 'USD12', args: [{ leadingSymbols: ['USD'] }] },
				{ input: '12kg', args: [{ trailingSymbols: ['kg'] }] },
				{ input: '+   USD12   kg', args: [{ leadingSymbols: ['USD'], trailingSymbols: ['kg'], plus: 'required', looseSpacing: true }], output: '+USD12kg' },
			]);

			runFailTests(handler.numeric.bind(handler), [
				{ input: '1,234', args: [{ thousandsDelim: '_' }] },
				{ input: '$12', args: [{ leadingSymbols: ['USD'] }] },
				{ input: '12lb', args: [{ trailingSymbols: ['kg'] }] },
				{ input: '+   USD12   kg', args: [{ leadingSymbols: ['USD'], trailingSymbols: ['kg'], plus: 'required', looseSpacing: false }] },
			]);
		});

		it('supports leadingZero and trailingZero edge behavior', () => {
			runPassTests(handler.numeric.bind(handler), [
				{ input: '0.5', args: [{ decimal: 'required', leadingZero: 'required' }] },
				{ input: '.5', args: [{ decimal: 'required', leadingZero: 'forbidden' }] },
				{ input: '12.0', args: [{ decimal: 'required', trailingZero: 'required' }] },
				{ input: '12.5', args: [{ decimal: 'required', trailingZero: 'forbidden' }] },
			]);

			runFailTests(handler.numeric.bind(handler), [
				{ input: '.5', args: [{ decimal: 'required', leadingZero: 'required' }] },
				{ input: '0.5', args: [{ decimal: 'required', leadingZero: 'forbidden' }] },
				{ input: '12', args: [{ decimal: 'required', trailingZero: 'required' }] },
				{ input: '12.0', args: [{ decimal: 'required', trailingZero: 'forbidden' }] },
			]);
		});

		it('handles grouping and delimiter edge cases', () => {
			runPassTests(handler.numeric.bind(handler), [
				{ input: '1,234,567' },
				{ input: '1234', args: [{ thousandsDelim: '' }] },
				{ input: '1.234.567,89', args: [{ thousandsDelim: '.', decimalDelim: ',', decimal: 'required' }] },
			]);

			runFailTests(handler.numeric.bind(handler), [
				{ input: '12,34' },
				{ input: '1,234', args: [{ thousandsDelim: '' }] },
				{ input: '1.234,56', args: [{ thousandsDelim: ',', decimalDelim: '.', decimal: 'required' }] },
			]);
		});

		it('handles sign conflicts and signed bounds', () => {
			runPassTests(handler.numeric.bind(handler), [
				{ input: '-12', args: [{ minus: 'required', max: -10 }] },
				{ input: '-12', args: [{ min: -20, max: -1 }] },
				{ input: '12-', args: [{ alignment: 'right', minus: 'required', min: -20, max: -1 }] },
			]);

			runFailTests(handler.numeric.bind(handler), [
				{ input: '+-12', args: [{ plus: 'required', minus: 'required' }] },
				{ input: '-+', args: [{ alignment: 'right', plus: 'required', minus: 'required' }] },
				{ input: '-12', args: [{ min: -10 }] },
				{ input: '-12', args: [{ max: -20 }] },
			]);
		});

		it('supports symbol arrays and precision interaction with optional decimal', () => {
			runPassTests(handler.numeric.bind(handler), [
				{ input: '12', args: [{ leadingSymbols: [], trailingSymbols: [] }] },
				{ input: 'EUR12kg', args: [{ leadingSymbols: ['USD', 'EUR'], trailingSymbols: ['kg', 'lb'] }] },
				{ input: '12.34', args: [{ decimal: 'optional', minPrecision: 2, maxPrecision: 2 }] },

			]);

			runFailTests(handler.numeric.bind(handler), [
				{ input: '12..3', args: [{ leadingSymbols: [], trailingSymbols: [] }] },
				{ input: '12+', args: [{ leadingSymbols: [], trailingSymbols: [] }] },
				{ input: 'GBP12kg', args: [{ leadingSymbols: ['USD', 'EUR'], trailingSymbols: ['kg', 'lb'] }] },
				{ input: '12', args: [{ decimal: 'optional', minPrecision: 2, maxPrecision: 2 }] },
				{ input: '12.3', args: [{ decimal: 'optional', minPrecision: 2, maxPrecision: 2 }] },

			]);
		});

		it('supports right-aligned signs with loose spacing around symbols', () => {
			runPassTests(handler.numeric.bind(handler), [
				{ input: 'USD12   +', args: [{ leadingSymbols: ['USD'], alignment: 'right', plus: 'required', looseSpacing: true }], output: 'USD12+' },
				{ input: 'EUR12kg   -', args: [{ leadingSymbols: ['EUR'], trailingSymbols: ['kg'], alignment: 'right', minus: 'required', looseSpacing: true }], output: 'EUR12kg-' },
			]);

			runFailTests(handler.numeric.bind(handler), [
				{ input: 'USD12   +', args: [{ leadingSymbols: ['USD'], alignment: 'right', plus: 'required', looseSpacing: false }] },
				{ input: 'EUR12kg   -', args: [{ leadingSymbols: ['EUR'], trailingSymbols: ['kg'], alignment: 'right', minus: 'required', looseSpacing: false }] },
			]);
		});
	});

	describe('measurement', () => {
		it('supports units and inherited numeric options', () => {
			runPassTests(handler.measurement.bind(handler), [
				{ input: '12cm' },
				{ input: '12kg', args: [{ units: ['kg'] }] },
				{ input: '+12cm', args: [{ plus: 'required' }] },
				{ input: '12cm-', args: [{ alignment: 'right', minus: 'required' }] },
				{ input: '12.30cm', args: [{ decimal: 'required', minPrecision: 2, maxPrecision: 2 }] },
				{ input: '1_234cm', args: [{ thousandsDelim: '_' }] },
				{ input: '12,5cm', args: [{ decimalDelim: ',', decimal: 'required' }] },
			]);

			runFailTests(handler.measurement.bind(handler), [
				{ input: '12kg' },
				{ input: '12cm', args: [{ decimal: 'required' }] },
				{ input: '9cm', args: [{ min: 10 }] },
				{ input: '11cm', args: [{ max: 10 }] },
			]);
		});

		it('supports symbol zero and loose spacing options with unit overrides', () => {
			runPassTests(handler.measurement.bind(handler), [
				{ input: '~12cm', args: [{ leadingSymbols: ['~'] }] },
				{ input: '12kg', args: [{ units: ['cm'], trailingSymbols: ['kg'] }] },
				{ input: '+  ~12  cm', args: [{ leadingSymbols: ['~'], plus: 'required', looseSpacing: true }], output: '+~12cm' },
			]);

			runFailTests(handler.measurement.bind(handler), [
				{ input: '.5cm', args: [{ decimal: 'required', leadingZero: 'required' }] },
				{ input: '0.5cm', args: [{ decimal: 'required', leadingZero: 'forbidden' }] },
				{ input: '12.0cm', args: [{ decimal: 'required', trailingZero: 'forbidden' }] },
				{ input: '+  ~12  cm', args: [{ leadingSymbols: ['~'], plus: 'required', looseSpacing: false }] },
			]);
		});
	});

	describe('money', () => {
		it('supports parens symbols and sign options', () => {
			runPassTests(handler.money.bind(handler), [
				{ input: '$12' },
				{ input: '(USD12)', args: [{ parens: 'required', leadingSymbols: ['USD'] }] },
				{ input: 'USD12', args: [{ parens: 'optional', leadingSymbols: ['USD'] }] },
				{ input: '(USD12)', args: [{ parens: 'optional', leadingSymbols: ['USD'] }] },
				{ input: '+USD12', args: [{ plus: 'required', leadingSymbols: ['USD'] }] },
				{ input: '-USD12', args: [{ minus: 'required', leadingSymbols: ['USD'] }] },
			]);

			runFailTests(handler.money.bind(handler), [
				{ input: '12' },
				{ input: 'USD12', args: [{ parens: 'required', leadingSymbols: ['USD'] }] },
				{ input: '(USD12)', args: [{ parens: 'forbidden', leadingSymbols: ['USD'] }] },
				{ input: '+USD12', args: [{ plus: 'forbidden', leadingSymbols: ['USD'] }] },
				{ input: '-USD12', args: [{ minus: 'forbidden', leadingSymbols: ['USD'] }] },
				{ input: '12+USD', args: [{ alignment: 'right', plus: 'required', leadingSymbols: ['USD'] }] },
			]);
		});

		it('supports inherited numeric format options', () => {
			runPassTests(handler.money.bind(handler), [
				{ input: 'USD12.3', args: [{ leadingSymbols: ['USD'], decimal: 'required' }] },
				{ input: 'USD1_234', args: [{ leadingSymbols: ['USD'], thousandsDelim: '_' }] },
				{ input: 'USD12,5', args: [{ leadingSymbols: ['USD'], decimalDelim: ',', decimal: 'required' }] },
				{ input: 'USD12.30', args: [{ leadingSymbols: ['USD'], decimal: 'required', minPrecision: 2, maxPrecision: 2 }] },
				{ input: 'USD12.0', args: [{ leadingSymbols: ['USD'], decimal: 'required', trailingZero: 'required' }] },
			]);

			runFailTests(handler.money.bind(handler), [
				{ input: 'USD9', args: [{ leadingSymbols: ['USD'], min: 10 }] },
				{ input: 'USD11', args: [{ leadingSymbols: ['USD'], max: 10 }] },
				{ input: 'USD12', args: [{ leadingSymbols: ['USD'], decimal: 'required' }] },
				{ input: 'USD12.3', args: [{ leadingSymbols: ['USD'], decimal: 'forbidden' }] },
				{ input: 'USD1,234', args: [{ leadingSymbols: ['USD'], thousandsDelim: '_' }] },
				{ input: 'USD12.3', args: [{ leadingSymbols: ['USD'], decimal: 'required', minPrecision: 2, maxPrecision: 2 }] },
				{ input: 'USD12.300', args: [{ leadingSymbols: ['USD'], decimal: 'required', minPrecision: 2, maxPrecision: 2 }] },
				{ input: 'USD.5', args: [{ leadingSymbols: ['USD'], decimal: 'required', leadingZero: 'required' }] },
				{ input: 'USD0.5', args: [{ leadingSymbols: ['USD'], decimal: 'required', leadingZero: 'forbidden' }] },
				{ input: 'USD12', args: [{ leadingSymbols: ['USD'], decimal: 'required', trailingZero: 'required' }] },
				{ input: 'USD12.0', args: [{ leadingSymbols: ['USD'], decimal: 'required', trailingZero: 'forbidden' }] },
			]);
		});

		it('supports trailing symbols and loose spacing options', () => {
			runPassTests(handler.money.bind(handler), [
				{ input: '12USD', args: [{ leadingSymbols: [''], trailingSymbols: ['USD'] }] },
				{ input: '+   USD12', args: [{ leadingSymbols: ['USD'], plus: 'required', looseSpacing: true }], output: '+USD12' },
			]);

			runFailTests(handler.money.bind(handler), [
				{ input: '+   USD12', args: [{ leadingSymbols: ['USD'], plus: 'required', looseSpacing: false }] },
			]);
		});
	});
});


describe('StringHandler mutators', () => {
	let handler: StringHandler;

	beforeEach(() => {
		handler = new StringHandler();
	});

	it('base64Decode', () => {
		runPassTests(handler.base64Decode.bind(handler), [
			{ input: 'TWFu', output: 'Man' },
			{ input: '', output: '' },
			{ input: '8J+YgA==', output: '😀' },
		]);
	});

	it('base64Encode', () => {
		runPassTests(handler.base64Encode.bind(handler), [
			{ input: 'Man', output: 'TWFu' },
			{ input: '', output: '' },
			{ input: '😀', output: '8J+YgA==' },
		]);
	});

	it('collapseRepeats', () => {
		runPassTests(handler.collapseRepeats.bind(handler), [
			{ input: 'aaabbbcc', args: ['a'], output: 'abbbcc' },
			{ input: 'aaabbbcc', args: [''], output: 'abc' },
			{ input: '....', args: ['.'], output: '.' },
			{ input: 'abba', args: ['a'] },
		]);
	});

	it('collapseSpacing', () => {
		runPassTests(handler.collapseSpacing.bind(handler), [
			{ input: 'a\t  b\n\n c', output: 'a b c' },
			{ input: '   a   ', output: ' a ' },
			{ input: '', output: '' },
		]);
	});

	it('escapeHtml', () => {
		runPassTests(handler.escapeHtml.bind(handler), [
			{ input: '&<>' + '"' + "'", output: '&amp;&lt;&gt;&quot;&#39;' },
			{ input: 'safe text' },
			{ input: '&amp;', output: '&amp;amp;' },
		]);
	});

	it('hexDecode', () => {
		runPassTests(handler.hexDecode.bind(handler), [
			{ input: '4869', output: 'Hi' },
			{ input: '414243', output: 'ABC' },
			{ input: '', output: '' },
		]);
	});

	it('hexEncode', () => {
		runPassTests(handler.hexEncode.bind(handler), [
			{ input: 'Hi', output: '4869' },
			{ input: 'ABC', output: '414243' },
			{ input: '', output: '' },
		]);
	});

	it('normalizeLineBreaks', () => {
		runPassTests(handler.normalizeLineBreaks.bind(handler), [
			{ input: 'a\r\nb\rc\nd', output: 'a\nb\nc\nd' },
			{ input: 'a\r\nb\rc\nd', args: ['|'], output: 'a|b|c|d' },
			{ input: 'a\r\nb\rc\nd', args: ['\r\n'], output: 'a\r\nb\r\nc\r\nd' },
		]);
	});

	it('normalizeUnicode', () => {
		runPassTests(handler.normalizeUnicode.bind(handler), [
			{ input: '\u0065\u0301', output: '\u00E9' },
			{ input: '\u00E9', args: ['NFD'], output: '\u0065\u0301' },
			{ input: '\u2460', args: ['NFKD'], output: '1' },
		]);
	});

	it('padLeft', () => {
		runPassTests(handler.padLeft.bind(handler), [
			{ input: '7', args: [3, '0'], output: '007' },
			{ input: 'abc', args: [2, '0'] },
			{ input: '', args: [3, '.'], output: '...' },
		]);
	});

	it('padRight', () => {
		runPassTests(handler.padRight.bind(handler), [
			{ input: '7', args: [3, '0'], output: '700' },
			{ input: 'abc', args: [2, '0'] },
			{ input: '', args: [3, '.'], output: '...' },
		]);
	});

	it('slice', () => {
		runPassTests(handler.slice.bind(handler), [
			{ input: 'abcdef', args: [1, 4], output: 'bcd' },
			{ input: 'abcdef', args: [-3, -1], output: 'de' },
			{ input: 'abcdef', args: [3, 3], output: '' },
		]);
	});

	it('sliceFirst', () => {
		runPassTests(handler.sliceFirst.bind(handler), [
			{ input: 'abcdef', output: 'a' },
			{ input: 'abcdef', args: [3], output: 'abc' },
			{ input: 'abcdef', args: [0], output: '' },
			{ input: 'ab', args: [99], output: 'ab' },
		]);
	});

	it('sliceLast', () => {
		runPassTests(handler.sliceLast.bind(handler), [
			{ input: 'abcdef', output: 'f' },
			{ input: 'abcdef', args: [3], output: 'def' },
			{ input: 'abcdef', args: [0] },
			{ input: 'ab', args: [99], output: 'ab' },
		]);
	});

	it('stripChars', () => {
		runPassTests(handler.stripChars.bind(handler), [
			{ input: 'a-b_c.d', args: ['-_.'], output: 'abcd' },
			{ input: 'abc', args: [''] },
			{ input: '[a](b)', args: ['[]()'], output: 'ab' },
		]);
	});

	it('stripHtml', () => {
		runPassTests(handler.stripHtml.bind(handler), [
			{ input: '<p>Hello <b>World</b></p>', output: 'Hello World' },
			{ input: '<div><span>x</span></div>', output: 'x' },
			{ input: 'plain text' },
		]);
	});

	it('stripWhitespace', () => {
		runPassTests(handler.stripWhitespace.bind(handler), [
			{ input: ' a\t b\n c ', output: 'abc' },
			{ input: '\r\n\t', output: '' },
			{ input: 'noSpaces' },
		]);
	});

	it('toDelimited', () => {
		runPassTests(handler.toDelimited.bind(handler), [
			{
				input: 'one_two-three',
				args: [{
					fromDelims: '_-',
					toDelim: '.',
					transformer1: (word: string): string => word.toUpperCase(),
				}],
				output: 'ONE.TWO.THREE'
			},
			{
				input: 'one_two_three',
				args: [{
					fromDelims: '_',
					toDelim: '-',
					transformer1: (word: string): string => word.toLowerCase(),
					transformer2: (word: string): string => word[0].toUpperCase() + word.slice(1).toLowerCase(),
					transformerSwitchIndex: 1,
				}],
				output: 'one-Two-Three'
			},
			{
				input: 'MiXeD',
				args: [{
					fromDelims: null,
					toDelim: '',
					transformer1: (word: string): string => word.toLowerCase(),
					transformer2: (word: string): string => word.toUpperCase(),
					transformerSwitchIndex: null,
				}],
				output: 'mixed'
			},
			{
				input: '__a__b__',
				args: [{
					fromDelims: '_',
					toDelim: ':',
					transformer1: (word: string): string => word,
				}],
				output: 'a:b'
			}
		]);
	});

	it('toCamelCase', () => {
		runPassTests(handler.toCamelCase.bind(handler), [
			{ input: 'HELLO WORLD', output: 'helloWorld' },
			{ input: 'hello_world_test', args: ['_'], output: 'helloWorldTest' },
			{ input: 'one-two_three', args: ['_-'], output: 'oneTwoThree' },
		]);
	});

	it('toKebabCase', () => {
		runPassTests(handler.toKebabCase.bind(handler), [
			{ input: 'Hello World', output: 'hello-world' },
			{ input: 'One_Two_Three', args: ['_'], output: 'one-two-three' },
			{ input: 'ONE--TWO', args: ['-'], output: 'one-two' },
		]);
	});

	it('toPascalCase', () => {
		runPassTests(handler.toPascalCase.bind(handler), [
			{ input: 'hello world', output: 'HelloWorld' },
			{ input: 'hello_world', args: ['_'], output: 'HelloWorld' },
			{ input: 'multi-part-value', args: ['-'], output: 'MultiPartValue' },
		]);
	});

	it('toSentenceCase', () => {
		runPassTests(handler.toSentenceCase.bind(handler), [
			{ input: 'HELLO WORLD TEST', output: 'Hello world test' },
			{ input: 'hello_world_test', args: ['_'], output: 'Hello world test' },
			{ input: 'ONE-TWO-THREE', args: ['-'], output: 'One two three' },
		]);
	});

	it('toSnakeCase', () => {
		runPassTests(handler.toSnakeCase.bind(handler), [
			{ input: 'Hello World', output: 'hello_world' },
			{ input: 'One-Two-Three', args: ['-'], output: 'one_two_three' },
			{ input: 'A__B__C', args: ['_'], output: 'a_b_c' },
		]);
	});

	it('toTitleCase', () => {
		runPassTests(handler.toTitleCase.bind(handler), [
			{ input: 'hello world test', output: 'Hello World Test' },
			{ input: 'hello_world_test', args: ['_'], output: 'Hello World Test' },
			{ input: 'ONE-TWO', args: ['-'], output: 'One Two' },
		]);
	});

	it('toLowerCase', () => {
		runPassTests(handler.toLowerCase.bind(handler), [
			{ input: 'AbC', output: 'abc' },
			{ input: '123!@#' },
		]);
	});

	it('toUpperCase', () => {
		runPassTests(handler.toUpperCase.bind(handler), [
			{ input: 'AbC', output: 'ABC' },
			{ input: '123!@#' },
		]);
	});

	it('trim', () => {
		runPassTests(handler.trim.bind(handler), [
			{ input: ' \t abc \n', output: 'abc' },
			{ input: '..abc..', args: ['.'], output: 'abc' },
			{ input: '***abc***', args: ['*'], output: 'abc' },
		]);
	});

	it('trimLeft', () => {
		runPassTests(handler.trimLeft.bind(handler), [
			{ input: ' \t abc ', output: 'abc ' },
			{ input: '..abc..', args: ['.'], output: 'abc..' },
			{ input: '***abc***', args: ['*'], output: 'abc***' },
		]);
	});

	it('trimRight', () => {
		runPassTests(handler.trimRight.bind(handler), [
			{ input: ' abc \n\t ', output: ' abc' },
			{ input: '..abc..', args: ['.'], output: '..abc' },
			{ input: '***abc***', args: ['*'], output: '***abc' },
		]);
	});

	it('urlEncode', () => {
		runPassTests(handler.urlEncode.bind(handler), [
			{ input: 'a b/c?d=e&f', output: 'a%20b%2Fc%3Fd%3De%26f' },
			{ input: 'hello', output: 'hello' },
			{ input: 'cafe\u00E9', output: 'cafe%C3%A9' },
		]);
	});

	it('urlDecode', () => {
		runPassTests(handler.urlDecode.bind(handler), [
			{ input: 'a%20b%2Fc%3Fd%3De%26f', output: 'a b/c?d=e&f' },
			{ input: 'hello', output: 'hello' },
			{ input: 'cafe%C3%A9', output: 'cafe\u00E9' },
		]);
	});

	it('urlDecode throws on malformed escapes', () => {
		expect(() => handler.urlDecode('%E0%A4%A')).toThrow();
	});
});









