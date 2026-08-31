'use strict';

import { StringHandler } from '../../../lib/fields/string/StringHandler.ts';
import { runFailTests, runPassTests } from '../../helpers/runCases.ts';



describe('StringHandler validators overrides', () => {
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
});










// describe('StringHandler validators: basic', () => {
// 	let handler: StringHandler;

// 	beforeEach(() => {
// 		handler = new StringHandler();
// 	});

// 	it('alpha', () => {
// 		runCases(handler.alpha.bind(handler), [
// 			{ input: 'AbCd', pass: true },
// 			{ input: 'abc123', pass: false, errorKey: 'string/alpha' }
// 		]);
// 	});

// 	it('alphanumeric', () => {
// 		runCases(handler.alphanumeric.bind(handler), [
// 			{ input: 'a1B2', pass: true },
// 			{ input: 'abc-123', pass: false, errorKey: 'string/alphanumeric' }
// 		]);
// 	});

// 	it('ascii', () => {
// 		runCases(handler.ascii.bind(handler), [
// 			{ input: 'ABC123!', pass: true },
// 			{ input: 'cafe\u00E9', pass: false, errorKey: 'string/ascii' }
// 		]);
// 	});

// 	it('base64', () => {
// 		runCases(handler.base64.bind(handler), [
// 			{ input: 'TWFu', pass: true },
// 			{ input: 'TWFu=', pass: false, errorKey: 'string/base64' }
// 		]);
// 	});

// 	it('binary', () => {
// 		runCases(handler.binary.bind(handler), [
// 			{ input: '101010', pass: true },
// 			{ input: '10201', pass: false, errorKey: 'string/binary' }
// 		]);
// 	});

// 	it('bmp', () => {
// 		runCases(handler.bmp.bind(handler), [
// 			{ input: 'ABC\u2603', pass: true },
// 			{ input: 'a\u{1F600}', pass: false, errorKey: 'string/bmp' }
// 		]);
// 	});

// 	it('digits', () => {
// 		runCases(handler.digits.bind(handler), [
// 			{ input: '012345', pass: true },
// 			{ input: '123a', pass: false, errorKey: 'string/digits' }
// 		]);
// 	});

// 	it('hex', () => {
// 		runCases(handler.hex.bind(handler), [
// 			{ input: 'A1b2', pass: true, value: 'a1b2' },
// 			{ input: 'A1b2', options: { normalize: false }, pass: true, value: 'A1b2' },
// 			{ input: 'G1', pass: false, errorKey: 'string/hex' }
// 		]);
// 	});

// 	it('hexColor', () => {
// 		runCases(handler.hexColor.bind(handler), [
// 			{ input: '#A1b2C3', pass: true, value: '#a1b2c3' },
// 			{ input: '#A1b2C3', options: { normalize: false }, pass: true, value: '#A1b2C3' },
// 			{ input: '#abcd', pass: false, errorKey: 'string/hexColor' }
// 		]);
// 	});

// 	it('octal', () => {
// 		runCases(handler.octal.bind(handler), [
// 			{ input: '7012', pass: true },
// 			{ input: '128', pass: false, errorKey: 'string/octal' }
// 		]);
// 	});
// });

// describe('StringHandler validators: digital', () => {
// 	let handler: StringHandler;

// 	beforeEach(() => {
// 		handler = new StringHandler();
// 	});

// 	it('dataUrl', () => {
// 		runCases(handler.dataUrl.bind(handler), [
// 			{ input: 'data:image/png;base64,QUJD', pass: true },
// 			{ input: 'data:audio/mp3;base64,QUJD', pass: true },
// 			{ input: 'data:image/png;base64,QUJD', options: { allowedTypes: ['image'] }, pass: true },
// 			{ input: 'data:audio/mp3;base64,QUJD', options: { allowedTypes: ['image'] }, pass: false, errorKey: 'string/dataUrl' },
// 			{ input: 'data:text/plain;base64,QUJD', options: { allowedTypes: ['text', 'audio'] }, pass: true },
// 			{ input: 'data:image/png;base64,QUJD', options: { allowedTypes: ['text', 'audio'] }, pass: false, errorKey: 'string/dataUrl' }
// 		]);
// 	});

// 	describe('domain', () => {
// 		it('normalizes by default and can preserve case when normalize is false', () => {
// 			runCases(handler.domain.bind(handler), [
// 				{ input: 'ExAmPlE.CoM', pass: true, value: 'example.com' },
// 				{ input: 'ExAmPlE.CoM', options: { normalize: false }, pass: true, value: 'ExAmPlE.CoM' }
// 			]);
// 		});

// 		it('supports all subdomains modes', () => {
// 			runCases(handler.domain.bind(handler), [
// 				{ input: 'example.com', options: { subdomains: 'optional' }, pass: true },
// 				{ input: 'api.example.com', options: { subdomains: 'optional' }, pass: true },
// 				{ input: 'api.example.com', options: { subdomains: 'required' }, pass: true },
// 				{ input: 'example.com', options: { subdomains: 'required' }, pass: false, errorKey: 'string/domain' },
// 				{ input: 'example.com', options: { subdomains: 'forbidden' }, pass: true },
// 				{ input: 'api.example.com', options: { subdomains: 'forbidden' }, pass: false, errorKey: 'string/domain' }
// 			]);
// 		});

// 		it('supports all wildcards modes', () => {
// 			runCases(handler.domain.bind(handler), [
// 				{ input: '*.example.com', options: { wildcards: 'forbidden' }, pass: false, errorKey: 'string/domain' },
// 				{ input: 'example.com', options: { wildcards: 'optional' }, pass: true },
// 				{ input: '*.example.com', options: { wildcards: 'optional' }, pass: true },
// 				{ input: '*.example.com', options: { wildcards: 'required' }, pass: true },
// 				{ input: 'example.com', options: { wildcards: 'required' }, pass: false, errorKey: 'string/domain' }
// 			]);
// 		});

// 		it('still rejects malformed domain labels', () => {
// 			runCases(handler.domain.bind(handler), [{ input: '-example.com', pass: false, errorKey: 'string/domain' }]);
// 		});
// 	});

// 	describe('e123', () => {
// 		it('uses strict mode by default and fails malformed input', () => {
// 			runCases(handler.e123.bind(handler), [
// 				{ input: '+1 212 555 1234', pass: true },
// 				{ input: '123', pass: false, errorKey: 'string/e123' }
// 			]);
// 		});

// 		it('supports mode option (strict vs loose)', () => {
// 			runCases(handler.e123.bind(handler), [
// 				{ input: '+1.212.555.1234', options: { mode: 'strict' }, pass: false, errorKey: 'string/e123' },
// 				{ input: '+1.212.555.1234', options: { mode: 'loose' }, pass: true }
// 			]);
// 		});

// 		it('supports normalize option', () => {
// 			runCases(handler.e123.bind(handler), [
// 				{ input: '+1.212.555.1234', options: { mode: 'loose' }, pass: true, value: '+1 212 555 1234' },
// 				{ input: '+1.212.555.1234', options: { mode: 'loose', normalize: false }, pass: true, value: '+1.212.555.1234' }
// 			]);
// 		});

// 		it('supports acceptableDelims and normalizedDelim options', () => {
// 			runCases(handler.e123.bind(handler), [
// 				{ input: '+1_212_555_1234', options: { mode: 'loose' }, pass: false, errorKey: 'string/e123' },
// 				{
// 					input: '+1_212_555_1234',
// 					options: { mode: 'loose', acceptableDelims: ' _', normalizedDelim: '-' },
// 					pass: true,
// 					value: '+1-212-555-1234'
// 				}
// 			]);
// 		});

// 		it('supports stripDelims option', () => {
// 			runCases(handler.e123.bind(handler), [
// 				{ input: '+1 (212) 555-1234', options: { mode: 'loose' }, pass: false, errorKey: 'string/e123' },
// 				{
// 					input: '+1 (212) 555-1234',
// 					options: { mode: 'loose', stripDelims: ' ()' },
// 					pass: true,
// 					value: '+1 212 555 1234'
// 				}
// 			]);
// 		});
// 	});

// 	describe('e164', () => {
// 		it('uses strict mode by default and requires leading +', () => {
// 			runCases(handler.e164.bind(handler), [
// 				{ input: '+12125551234', pass: true },
// 				{ input: '12125551234', pass: false, errorKey: 'string/e164' }
// 			]);
// 		});

// 		it('supports mode via matching defaults (strict vs loose)', () => {
// 			handler.configMatchingDefaults({ mode: 'strict' });
// 			runCases(handler.e164.bind(handler), [{ input: '12125551234', pass: false, errorKey: 'string/e164' }]);

// 			handler.configMatchingDefaults({ mode: 'loose' });
// 			runCases(handler.e164.bind(handler), [{ input: '12125551234', pass: true }]);
// 		});

// 		it('supports normalize via matching defaults', () => {
// 			handler.configMatchingDefaults({ mode: 'loose' });
// 			runCases(handler.e164.bind(handler), [{ input: '+1-212-555-1234', pass: true, value: '+1-212-555-1234' }]);

// 			handler.configMatchingDefaults({ mode: 'loose', normalize: true });
// 			runCases(handler.e164.bind(handler), [{ input: '+1-212-555-1234', pass: true, value: '+12125551234' }]);
// 		});

// 		it('supports acceptableDelims and stripDelims options', () => {
// 			handler.configMatchingDefaults({ mode: 'loose', normalize: true });
// 			runCases(handler.e164.bind(handler), [
// 				{ input: '+1(212)5551234', pass: false, errorKey: 'string/e164' },
// 				{ input: '+1(212)5551234', options: { stripDelims: ' ()' }, pass: true, value: '+12125551234' },
// 				{ input: '+1_212_555_1234', pass: false, errorKey: 'string/e164' },
// 				{ input: '+1_212_555_1234', options: { acceptableDelims: ' _' }, pass: true, value: '+12125551234' }
// 			]);
// 		});

// 		it('supports normalizedDelim option behavior', () => {
// 			handler.configMatchingDefaults({ mode: 'loose', normalize: true });
// 			runCases(handler.e164.bind(handler), [
// 				{ input: '+1 212 555 1234', options: { normalizedDelim: '-' }, pass: false, errorKey: 'string/e164' },
// 				{ input: '+1 212 555 1234', options: { normalizedDelim: '' }, pass: true, value: '+12125551234' }
// 			]);
// 		});
// 	});

// 	describe('email', () => {
// 		it('normalizes to lowercase by default', () => {
// 			runCases(handler.email.bind(handler), [{ input: 'A.B+Tag@Example.COM', pass: true, value: 'a.b+tag@example.com' }]);
// 		});

// 		it('supports normalize false option', () => {
// 			runCases(handler.email.bind(handler), [
// 				{ input: 'A.B+Tag@Example.COM', options: { normalize: false }, pass: true, value: 'A.B+Tag@Example.COM' }
// 			]);
// 		});

// 		it('applies configMatchingDefaults and allows per-call override', () => {
// 			handler.configMatchingDefaults({ normalize: false });
// 			runCases(handler.email.bind(handler), [{ input: 'A.B+Tag@Example.COM', pass: true, value: 'A.B+Tag@Example.COM' }]);
// 			runCases(handler.email.bind(handler), [
// 				{ input: 'A.B+Tag@Example.COM', options: { normalize: true }, pass: true, value: 'a.b+tag@example.com' }
// 			]);
// 		});

// 		it('fails when address does not have exactly one @', () => {
// 			runCases(handler.email.bind(handler), [{ input: 'invalid@@example.com', pass: false, errorKey: 'string/email' }]);
// 		});

// 		it('fails when domain part is invalid', () => {
// 			runCases(handler.email.bind(handler), [{ input: 'user@-example.com', pass: false, errorKey: 'string/email' }]);
// 		});

// 		it('fails when local part starts with a dot', () => {
// 			runCases(handler.email.bind(handler), [{ input: '.user@example.com', pass: false, errorKey: 'string/email' }]);
// 		});
// 	});

// 	describe('ip', () => {
// 		it('accepts valid IPv4 and IPv6 and rejects invalid input', () => {
// 			runCases(handler.ip.bind(handler), [
// 				{ input: '8.8.8.8', pass: true },
// 				{ input: '2001:db8::1', pass: true },
// 				{ input: '999.8.8.8', pass: false, errorKey: 'string/ip' }
// 			]);
// 		});

// 		it('normalizes IPv6 to lowercase by default and can preserve case', () => {
// 			runCases(handler.ip.bind(handler), [
// 				{ input: 'FE80::ABCD', pass: true, value: 'fe80::abcd' },
// 				{ input: 'FE80::ABCD', options: { normalize: false }, pass: true, value: 'FE80::ABCD' }
// 			]);
// 		});

// 		it('applies configMatchingDefaults and allows per-call override', () => {
// 			handler.configMatchingDefaults({ normalize: false });
// 			runCases(handler.ip.bind(handler), [{ input: 'FE80::ABCD', pass: true, value: 'FE80::ABCD' }]);
// 			runCases(handler.ip.bind(handler), [{ input: 'FE80::ABCD', options: { normalize: true }, pass: true, value: 'fe80::abcd' }]);
// 		});
// 	});

// 	it('ipCidr', () => {
// 		runCases(handler.ipCidr.bind(handler), [
// 			{ input: '192.168.0.1/24', pass: true },
// 			{ input: '192.168.0.1/33', pass: false, errorKey: 'string/ipCidr' }
// 		]);
// 	});

// 	it('ipCidrV4', () => {
// 		runCases(handler.ipCidrV4.bind(handler), [
// 			{ input: '10.0.0.1/8', pass: true },
// 			{ input: '10.0.0.1/50', pass: false, errorKey: 'string/ipCidrV4' }
// 		]);
// 	});

// 	it('ipCidrV6', () => {
// 		runCases(handler.ipCidrV6.bind(handler), [
// 			{ input: '2001:db8::1/64', pass: true },
// 			{ input: '2001:db8::1/129', pass: false, errorKey: 'string/ipCidrV6' }
// 		]);
// 	});

// 	describe('ipV4', () => {
// 		it('accepts valid IPv4 and rejects invalid IPv4', () => {
// 			runCases(handler.ipV4.bind(handler), [
// 				{ input: '127.0.0.1', pass: true },
// 				{ input: '256.0.0.1', pass: false, errorKey: 'string/ipV4' }
// 			]);
// 		});

// 		it('supports normalize option and defaults for option precedence', () => {
// 			runCases(handler.ipV4.bind(handler), [
// 				{ input: '127.0.0.1', pass: true, value: '127.0.0.1' },
// 				{ input: '127.0.0.1', options: { normalize: false }, pass: true, value: '127.0.0.1' }
// 			]);

// 			handler.configMatchingDefaults({ normalize: false });
// 			runCases(handler.ipV4.bind(handler), [{ input: '127.0.0.1', pass: true, value: '127.0.0.1' }]);
// 			runCases(handler.ipV4.bind(handler), [{ input: '127.0.0.1', options: { normalize: true }, pass: true, value: '127.0.0.1' }]);
// 		});
// 	});

// 	describe('ipV6', () => {
// 		it('accepts valid IPv6 and rejects invalid IPv6', () => {
// 			runCases(handler.ipV6.bind(handler), [
// 				{ input: 'fe80::1', pass: true },
// 				{ input: 'gggg::1', pass: false, errorKey: 'string/ipV6' }
// 			]);
// 		});

// 		it('normalizes to lowercase by default and can preserve case', () => {
// 			runCases(handler.ipV6.bind(handler), [
// 				{ input: 'FE80::ABCD', pass: true, value: 'fe80::abcd' },
// 				{ input: 'FE80::ABCD', options: { normalize: false }, pass: true, value: 'FE80::ABCD' }
// 			]);
// 		});

// 		it('applies configMatchingDefaults and allows per-call override', () => {
// 			handler.configMatchingDefaults({ normalize: false });
// 			runCases(handler.ipV6.bind(handler), [{ input: 'FE80::ABCD', pass: true, value: 'FE80::ABCD' }]);
// 			runCases(handler.ipV6.bind(handler), [{ input: 'FE80::ABCD', options: { normalize: true }, pass: true, value: 'fe80::abcd' }]);
// 		});
// 	});

// 	it('json', () => {
// 		runCases(handler.json.bind(handler), [
// 			{ input: '{"a":1}', pass: true },
// 			{ input: '{a:1}', pass: false, errorKey: 'string/json' }
// 		]);
// 	});

// 	it('jwt', () => {
// 		runCases(handler.jwt.bind(handler), [
// 			{ input: 'aaa.bbb.ccc', pass: true },
// 			{ input: 'aaa.bbb', pass: false, errorKey: 'string/jwt' }
// 		]);
// 	});

// 	describe('label', () => {
// 		it('normalizes to lowercase by default', () => {
// 			runCases(handler.label.bind(handler), [{ input: 'My-Label', pass: true, value: 'my-label' }]);
// 		});

// 		it('supports normalize false option', () => {
// 			runCases(handler.label.bind(handler), [
// 				{ input: 'My-Label', options: { normalize: false }, pass: true, value: 'My-Label' }
// 			]);
// 		});

// 		it('applies configMatchingDefaults and allows per-call override', () => {
// 			handler.configMatchingDefaults({ normalize: false });
// 			runCases(handler.label.bind(handler), [{ input: 'My-Label', pass: true, value: 'My-Label' }]);
// 			runCases(handler.label.bind(handler), [{ input: 'My-Label', options: { normalize: true }, pass: true, value: 'my-label' }]);
// 		});

// 		it('fails on invalid labels', () => {
// 			runCases(handler.label.bind(handler), [
// 				{ input: '-bad', pass: false, errorKey: 'string/label' },
// 				{ input: 'bad-', pass: false, errorKey: 'string/label' },
// 				{ input: 'a'.repeat(64), pass: false, errorKey: 'string/label' },
// 				{ input: 'bad_label', pass: false, errorKey: 'string/label' }
// 			]);
// 		});
// 	});

// 	describe('mac', () => {
// 		it('validates strict default format and rejects malformed values', () => {
// 			runCases(handler.mac.bind(handler), [
// 				{ input: 'AA:BB:CC:DD:EE:FF', pass: true, value: 'aa:bb:cc:dd:ee:ff' },
// 				{ input: 'AA-BB-CC', pass: false, errorKey: 'string/mac' }
// 			]);
// 		});

// 		it('supports normalize false option', () => {
// 			runCases(handler.mac.bind(handler), [
// 				{ input: 'AA:BB:CC:DD:EE:FF', options: { normalize: false }, pass: true, value: 'AA:BB:CC:DD:EE:FF' }
// 			]);
// 		});

// 		it('supports loose mode and delimiter options', () => {
// 			runCases(handler.mac.bind(handler), [
// 				{ input: 'AA-BB-CC-DD-EE-FF', options: { mode: 'strict' }, pass: false, errorKey: 'string/mac' },
// 				{ input: 'AA-BB-CC-DD-EE-FF', options: { mode: 'loose' }, pass: true, value: 'aa:bb:cc:dd:ee:ff' },
// 				{ input: 'AA_BB_CC_DD_EE_FF', options: { mode: 'loose', normalizedDelim: '-' }, pass: true, value: 'aa-bb-cc-dd-ee-ff' },
// 				{ input: 'AA~BB~CC~DD~EE~FF', options: { mode: 'loose', acceptableDelims: '~' }, pass: true, value: 'aa:bb:cc:dd:ee:ff' }
// 			]);
// 		});

// 		it('applies configMatchingDefaults and allows per-call override', () => {
// 			handler.configMatchingDefaults({ mode: 'loose', normalize: false });
// 			runCases(handler.mac.bind(handler), [{ input: 'AA-BB-CC-DD-EE-FF', pass: true, value: 'AA-BB-CC-DD-EE-FF' }]);
// 			runCases(handler.mac.bind(handler), [
// 				{ input: 'AA-BB-CC-DD-EE-FF', options: { normalize: true, normalizedDelim: '-' }, pass: true, value: 'aa-bb-cc-dd-ee-ff' }
// 			]);
// 		});
// 	});

// 	describe('path', () => {
// 		it('supports normalize option and matching-default precedence', () => {
// 			runCases(handler.path.bind(handler), [
// 				{ input: '/UsR/LoCaL/File.TXT', pass: true, value: '/usr/local/file.txt' },
// 				{ input: '/UsR/LoCaL/File.TXT', options: { normalize: false }, pass: true, value: '/UsR/LoCaL/File.TXT' }
// 			]);

// 			handler.configMatchingDefaults({ normalize: false });
// 			runCases(handler.path.bind(handler), [{ input: '/UsR/LoCaL/File.TXT', pass: true, value: '/UsR/LoCaL/File.TXT' }]);
// 			runCases(handler.path.bind(handler), [
// 				{ input: '/UsR/LoCaL/File.TXT', options: { normalize: true }, pass: true, value: '/usr/local/file.txt' }
// 			]);
// 		});

// 		it('supports absolute option modes for unix style', () => {
// 			runCases(handler.path.bind(handler), [
// 				{ input: '/usr/local/file.txt', options: { absolute: 'required' }, pass: true },
// 				{ input: 'usr/local/file.txt', options: { absolute: 'required' }, pass: false, errorKey: 'string/path' },
// 				{ input: '/usr/local/file.txt', options: { absolute: 'optional' }, pass: true },
// 				{ input: 'usr/local/file.txt', options: { absolute: 'optional' }, pass: true },
// 				{ input: 'usr/local/file.txt', options: { absolute: 'forbidden' }, pass: true },
// 				{ input: '/usr/local/file.txt', options: { absolute: 'forbidden' }, pass: false, errorKey: 'string/path' }
// 			]);
// 		});

// 		it('supports style option: unix, win, and win-unc', () => {
// 			runCases(handler.path.bind(handler), [
// 				{ input: '/usr/local/file.txt', options: { style: 'unix' }, pass: true },
// 				{ input: 'C:\\Users\\Me\\file.txt', options: { style: 'win' }, pass: true },
// 				{ input: 'Users\\Me\\file.txt', options: { style: 'win' }, pass: false, errorKey: 'string/path' },
// 				{ input: '\\\\server\\share\\folder\\file.txt', options: { style: 'win-unc' }, pass: true },
// 				{ input: 'C:\\Users\\Me\\file.txt', options: { style: 'win-unc' }, pass: false, errorKey: 'string/path' }
// 			]);
// 		});

// 		it('supports extensions option', () => {
// 			runCases(handler.path.bind(handler), [
// 				{ input: '/usr/local/file.txt', options: { extensions: ['.txt'] }, pass: true },
// 				{ input: '/usr/local/file.jpg', options: { extensions: ['.txt'] }, pass: false, errorKey: 'string/path' },
// 				{ input: '/usr/local/file.jpg', options: { extensions: ['.*'] }, pass: true },
// 				{ input: '/usr/local/file', options: { extensions: ['.*'] }, pass: false, errorKey: 'string/path' }
// 			]);
// 		});

// 		it('supports segmentMaxLen option', () => {
// 			const validSegment = '/usr/' + 'a'.repeat(10) + '.txt';
// 			const tooLongSegment = '/usr/' + 'a'.repeat(11) + '.txt';
// 			runCases(handler.path.bind(handler), [
// 				{ input: validSegment, options: { segmentMaxLen: 10 }, pass: true },
// 				{ input: tooLongSegment, options: { segmentMaxLen: 10 }, pass: false, errorKey: 'string/path' }
// 			]);
// 		});
// 	});

// 	it('slug', () => {
// 		runCases(handler.slug.bind(handler), [
// 			{ input: 'my-slug-1', pass: true },
// 			{ input: 'My Slug', pass: false, errorKey: 'string/slug' }
// 		]);
// 	});

// 	describe('url', () => {
// 		it('normalizes by default and can preserve case', () => {
// 			runCases(handler.url.bind(handler), [
// 				{ input: 'HTTPS://EXAMPLE.COM/Path?X=1#Top', pass: true, value: 'https://example.com/path?x=1#top' },
// 				{ input: 'HTTPS://EXAMPLE.COM/Path?X=1#Top', options: { normalize: false }, pass: true, value: 'HTTPS://EXAMPLE.COM/Path?X=1#Top' }
// 			]);
// 		});

// 		it('applies configMatchingDefaults and allows per-call normalize override', () => {
// 			handler.configMatchingDefaults({ normalize: false });
// 			runCases(handler.url.bind(handler), [{ input: 'HTTPS://EXAMPLE.COM/Path', pass: true, value: 'HTTPS://EXAMPLE.COM/Path' }]);
// 			runCases(handler.url.bind(handler), [
// 				{ input: 'HTTPS://EXAMPLE.COM/Path', options: { normalize: true }, pass: true, value: 'https://example.com/path' }
// 			]);
// 		});

// 		it('supports allowedProtocols option', () => {
// 			runCases(handler.url.bind(handler), [
// 				{ input: 'https://example.com', options: { allowedProtocols: ['https'] }, pass: true },
// 				{ input: 'http://example.com', options: { allowedProtocols: ['https'] }, pass: false, errorKey: 'string/url' }
// 			]);
// 		});

// 		it('supports protocols option modes', () => {
// 			runCases(handler.url.bind(handler), [
// 				{ input: 'https://example.com', options: { protocols: 'required' }, pass: true },
// 				{ input: 'example.com', options: { protocols: 'required' }, pass: false, errorKey: 'string/url' },
// 				{ input: 'example.com', options: { protocols: 'forbidden' }, pass: true },
// 				{ input: 'https://example.com', options: { protocols: 'forbidden' }, pass: false, errorKey: 'string/url' }
// 			]);
// 		});

// 		it('supports host type options: domain, ip, and label', () => {
// 			runCases(handler.url.bind(handler), [
// 				{ input: 'https://example.com', options: { domain: 'required', ip: 'forbidden', label: 'forbidden' }, pass: true },
// 				{ input: 'https://127.0.0.1', options: { domain: 'required', ip: 'forbidden', label: 'forbidden' }, pass: false, errorKey: 'string/url' },
// 				{ input: 'https://127.0.0.1', options: { ip: 'required', domain: 'forbidden', label: 'forbidden' }, pass: true },
// 				{ input: 'https://example.com', options: { ip: 'required', domain: 'forbidden', label: 'forbidden' }, pass: false, errorKey: 'string/url' },
// 				{ input: 'localhost', options: { label: 'required', domain: 'forbidden', ip: 'forbidden', protocols: 'forbidden' }, pass: true },
// 				{ input: 'example.com', options: { label: 'required', domain: 'forbidden', ip: 'forbidden', protocols: 'forbidden' }, pass: false, errorKey: 'string/url' }
// 			]);
// 		});

// 		it('supports port option modes and validates port range', () => {
// 			runCases(handler.url.bind(handler), [
// 				{ input: 'https://example.com:8080', options: { port: 'required' }, pass: true },
// 				{ input: 'https://example.com', options: { port: 'required' }, pass: false, errorKey: 'string/url' },
// 				{ input: 'https://example.com', options: { port: 'forbidden' }, pass: true },
// 				{ input: 'https://example.com:8080', options: { port: 'forbidden' }, pass: false, errorKey: 'string/url' },
// 				{ input: 'https://example.com:70000', options: { port: 'optional' }, pass: false, errorKey: 'string/url' }
// 			]);
// 		});

// 		it('supports query option modes', () => {
// 			runCases(handler.url.bind(handler), [
// 				{ input: 'https://example.com?a=1', options: { query: 'required' }, pass: true },
// 				{ input: 'https://example.com', options: { query: 'required' }, pass: false, errorKey: 'string/url' },
// 				{ input: 'https://example.com', options: { query: 'forbidden' }, pass: true },
// 				{ input: 'https://example.com?a=1', options: { query: 'forbidden' }, pass: false, errorKey: 'string/url' }
// 			]);
// 		});

// 		it('supports fragment option modes', () => {
// 			runCases(handler.url.bind(handler), [
// 				{ input: 'https://example.com#top', options: { fragment: 'required' }, pass: true },
// 				{ input: 'https://example.com', options: { fragment: 'required' }, pass: false, errorKey: 'string/url' },
// 				{ input: 'https://example.com', options: { fragment: 'forbidden' }, pass: true },
// 				{ input: 'https://example.com#top', options: { fragment: 'forbidden' }, pass: false, errorKey: 'string/url' }
// 			]);
// 		});

// 		it('supports rootRelative option and rejects host/protocol when enabled', () => {
// 			runCases(handler.url.bind(handler), [
// 				{ input: '/docs/page?x=1#t', options: { rootRelative: true }, pass: true },
// 				{ input: 'https://example.com/docs', options: { rootRelative: true }, pass: false, errorKey: 'string/url' }
// 			]);
// 		});

// 		it('accepts more complex valid URLs', () => {
// 			runCases(handler.url.bind(handler), [
// 				{ input: 'https://sub.example.com:443/path/to/resource-name_1.2~ok?q=abc%2Fdef&x=1#frag-1', pass: true },
// 				{ input: 'https://[2001:db8::1]:8443/path/to/resource?token=a-b_c~d%2E1#section-2', pass: true },
// 				{ input: 'sub.example.com:8080/path-here?query=value#frag', pass: true }
// 			]);
// 		});

// 		it('rejects complex malformed URLs', () => {
// 			runCases(handler.url.bind(handler), [
// 				{ input: 'https://[2001:db8::1/path?x=1#f', pass: false, errorKey: 'string/url' },
// 				{ input: 'https://example.com:99999/path?x=1#f', pass: false, errorKey: 'string/url' },
// 				{ input: 'https://example.com/path?x=%ZZ#f', pass: false, errorKey: 'string/url' }
// 			]);
// 		});

// 		it('returns url error key on invalid protocol usage', () => {
// 			runCases(handler.url.bind(handler), [{ input: 'ftp://example.com', pass: false, errorKey: 'string/url' }]);
// 		});
// 	});

// 	describe('uuid', () => {
// 		it('validates a canonical UUID and rejects malformed/unsupported version', () => {
// 			runCases(handler.uuid.bind(handler), [
// 				{ input: '550e8400-e29b-41d4-a716-446655440000', pass: true },
// 				{ input: '550e8400-e29b-61d4-a716-446655440000', pass: false, errorKey: 'string/uuid' },
// 				{ input: '550e8400-e29b-41d4-a716-44665544000', pass: false, errorKey: 'string/uuid' }
// 			]);
// 		});

// 		it('supports version option', () => {
// 			runCases(handler.uuid.bind(handler), [
// 				{
// 					input: '550e8400-e29b-11d4-a716-446655440000',
// 					options: { version: 1 },
// 					pass: true
// 				},
// 				{
// 					input: '550e8400-e29b-11d4-a716-446655440000',
// 					options: { version: 4 },
// 					pass: false,
// 					errorKey: 'string/uuid'
// 				},
// 				{
// 					input: '550e8400-e29b-41d4-a716-446655440000',
// 					options: { version: 4 },
// 					pass: true
// 				},
// 				{
// 					input: '550e8400-e29b-41d4-a716-446655440000',
// 					options: { version: '4' },
// 					pass: true
// 				}
// 			]);
// 		});

// 		it('supports mode strict and loose', () => {
// 			runCases(handler.uuid.bind(handler), [
// 				{
// 					input: '550e8400e29b41d4a716446655440000',
// 					options: { mode: 'strict' },
// 					pass: false,
// 					errorKey: 'string/uuid'
// 				},
// 				{
// 					input: '550e8400e29b41d4a716446655440000',
// 					options: { mode: 'loose' },
// 					pass: true
// 				},
// 				{
// 					input: 'urn:uuid:550e8400-e29b-41d4-a716-446655440000',
// 					options: { mode: 'strict' },
// 					pass: false,
// 					errorKey: 'string/uuid'
// 				},
// 				{
// 					input: 'urn:uuid:550e8400-e29b-41d4-a716-446655440000',
// 					options: { mode: 'loose' },
// 					pass: true
// 				},
// 				{
// 					input: '{550e8400-e29b-41d4-a716-446655440000}',
// 					options: { mode: 'loose' },
// 					pass: true
// 				}
// 			]);
// 		});

// 		it('supports normalize option', () => {
// 			runCases(handler.uuid.bind(handler), [
// 				{
// 					input: '550E8400-E29B-41D4-A716-446655440000',
// 					pass: true,
// 					value: '550e8400-e29b-41d4-a716-446655440000'
// 				},
// 				{
// 					input: '550E8400-E29B-41D4-A716-446655440000',
// 					options: { normalize: false },
// 					pass: true,
// 					value: '550E8400-E29B-41D4-A716-446655440000'
// 				}
// 			]);
// 		});

// 		it('supports normalizedDelim and acceptableDelims options in loose mode', () => {
// 			runCases(handler.uuid.bind(handler), [
// 				{
// 					input: '550e8400_e29b_41d4_a716_446655440000',
// 					options: { mode: 'loose' },
// 					pass: true
// 				},
// 				{
// 					input: '550e8400~e29b~41d4~a716~446655440000',
// 					options: { mode: 'loose' },
// 					pass: false,
// 					errorKey: 'string/uuid'
// 				},
// 				{
// 					input: '550e8400_e29b_41d4_a716_446655440000',
// 					options: { mode: 'loose', acceptableDelims: ' _' },
// 					pass: true,
// 					value: '550e8400-e29b-41d4-a716-446655440000'
// 				},
// 				{
// 					input: '550e8400_e29b_41d4_a716_446655440000',
// 					options: { mode: 'loose', acceptableDelims: ' _', normalizedDelim: ':' },
// 					pass: true,
// 					value: '550e8400:e29b:41d4:a716:446655440000'
// 				}
// 			]);
// 		});

// 		it('supports stripDelims option', () => {
// 			runCases(handler.uuid.bind(handler), [
// 				{
// 					input: '550e8400#e29b#41d4#a716#446655440000',
// 					options: { mode: 'loose' },
// 					pass: false,
// 					errorKey: 'string/uuid'
// 				},
// 				{
// 					input: '550e8400#e29b#41d4#a716#446655440000',
// 					options: { mode: 'loose', stripDelims: ' #' },
// 					pass: true,
// 					value: '550e8400-e29b-41d4-a716-446655440000'
// 				}
// 			]);
// 		});

// 		it('applies configMatchingDefaults and allows per-call override', () => {
// 			handler.configMatchingDefaults({ mode: 'loose', normalize: false });
// 			runCases(handler.uuid.bind(handler), [
// 				{ input: '550E8400E29B41D4A716446655440000', pass: true, value: '550E8400E29B41D4A716446655440000' }
// 			]);
// 			runCases(handler.uuid.bind(handler), [
// 				{
// 					input: '550E8400E29B41D4A716446655440000',
// 					options: { normalize: true, normalizedDelim: '-' },
// 					pass: true,
// 					value: '550e8400-e29b-41d4-a716-446655440000'
// 				}
// 			]);
// 		});
// 	});
// });

// describe('StringHandler validators: identifiers/financial', () => {
// 	let handler: StringHandler;

// 	beforeEach(() => {
// 		handler = new StringHandler();
// 	});

// 	describe('creditCard', () => {
// 		it('validates defaults, types, and luhn failures', () => {
// 			runCases(handler.creditCard.bind(handler), [
// 				{ input: '4111111111111111', pass: true, value: '4111111111111111' },
// 				{ input: '4111111111111111', options: { types: ['visa'] }, pass: true },
// 				{ input: '4111111111111111', options: { types: ['amex'] }, pass: false, errorKey: 'string/creditCard' },
// 				{ input: '4111111111111111', options: { types: null }, pass: true },
// 				{ input: '4111111111111112', pass: false, errorKey: 'string/creditCard' }
// 			]);
// 		});

// 		it('validates additional card brands and strict type filtering', () => {
// 			runCases(handler.creditCard.bind(handler), [
// 				{ input: '5555555555554444', pass: true },
// 				{ input: '5555555555554444', options: { types: ['mastercard'] }, pass: true },
// 				{ input: '5555555555554444', options: { types: ['visa'] }, pass: false, errorKey: 'string/creditCard' },
// 				{ input: '378282246310005', pass: true },
// 				{ input: '378282246310005', options: { types: ['amex'] }, pass: true },
// 				{ input: '378282246310005', options: { types: ['discover'] }, pass: false, errorKey: 'string/creditCard' },
// 				{ input: '6011111111111117', pass: true },
// 				{ input: '6011111111111117', options: { types: ['discover'] }, pass: true },
// 				{ input: '6011111111111117', options: { types: ['jcb'] }, pass: false, errorKey: 'string/creditCard' },
// 				{ input: '30569309025904', pass: true },
// 				{ input: '30569309025904', options: { types: ['diners'] }, pass: true },
// 				{ input: '30569309025904', options: { types: ['diners16'] }, pass: false, errorKey: 'string/creditCard' },
// 				{ input: '5500000000000004', pass: true },
// 				{ input: '5500000000000004', options: { types: ['diners16'] }, pass: true },
// 				{ input: '5500000000000004', options: { types: ['diners'] }, pass: false, errorKey: 'string/creditCard' },
// 				{ input: '3530111333300000', pass: true },
// 				{ input: '3530111333300000', options: { types: ['jcb'] }, pass: true },
// 				{ input: '3530111333300000', options: { types: ['mastercard'] }, pass: false, errorKey: 'string/creditCard' }
// 			]);
// 		});

// 		it('supports mode, normalize, delimiter options, and stripDelims', () => {
// 			runCases(handler.creditCard.bind(handler), [
// 				{ input: '4111 1111 1111 1111', pass: false, errorKey: 'string/creditCard' },
// 				{ input: '4111 1111 1111 1111', options: { mode: 'loose' }, pass: true, value: '4111111111111111' },
// 				{ input: '4111 1111 1111 1111', options: { mode: 'loose', normalize: false }, pass: true, value: '4111 1111 1111 1111' },
// 				{ input: '4111 1111 1111 1111', options: { mode: 'loose', normalizedDelim: '-' }, pass: true, value: '4111-1111-1111-1111' },
// 				{ input: '4111~1111~1111~1111', options: { mode: 'loose' }, pass: false, errorKey: 'string/creditCard' },
// 				{ input: '4111~1111~1111~1111', options: { mode: 'loose', acceptableDelims: ' ~' }, pass: true, value: '4111111111111111' },
// 				{ input: '(4111)(1111)(1111)(1111)', options: { mode: 'loose', stripDelims: '()' }, pass: true, value: '4111111111111111' }
// 			]);
// 		});

// 		it('applies configMatchingDefaults and allows per-call override', () => {
// 			handler.configMatchingDefaults({ mode: 'loose', normalize: false });
// 			runCases(handler.creditCard.bind(handler), [{ input: '4111 1111 1111 1111', pass: true, value: '4111 1111 1111 1111' }]);
// 			runCases(handler.creditCard.bind(handler), [
// 				{ input: '4111 1111 1111 1111', options: { normalize: true, normalizedDelim: '-' }, pass: true, value: '4111-1111-1111-1111' }
// 			]);
// 		});
// 	});

// 	describe('currencyCode', () => {
// 		it('supports ignoreCase and normalize options', () => {
// 			runCases(handler.currencyCode.bind(handler), [
// 				{ input: 'USD', pass: true, value: 'USD' },
// 				{ input: 'usd', pass: false, errorKey: 'string/currencyCode' },
// 				{ input: 'usd', options: { ignoreCase: true }, pass: true, value: 'USD' },
// 				{ input: 'usd', options: { ignoreCase: true, normalize: false }, pass: true, value: 'usd' }
// 			]);
// 		});

// 		it('applies configMatchingDefaults and allows per-call override', () => {
// 			handler.configMatchingDefaults({ ignoreCase: true, normalize: false });
// 			runCases(handler.currencyCode.bind(handler), [{ input: 'eur', pass: true, value: 'eur' }]);
// 			runCases(handler.currencyCode.bind(handler), [{ input: 'eur', options: { normalize: true }, pass: true, value: 'EUR' }]);
// 		});
// 	});

// 	describe('gtin', () => {
// 		it('validates allowed lengths and check-digit failures', () => {
// 			runCases(handler.gtin.bind(handler), [
// 				{ input: '4006381333931', pass: true, value: '4006381333931' },
// 				{ input: '4006381333932', pass: false, errorKey: 'string/gtin' },
// 				{ input: '96385074', options: { lengths: [8] }, pass: true },
// 				{ input: '96385074', options: { lengths: [13] }, pass: false, errorKey: 'string/gtin' }
// 			]);
// 		});

// 		it('supports mode, normalize, delimiter options, and stripDelims', () => {
// 			runCases(handler.gtin.bind(handler), [
// 				{ input: '4 006381 333931', pass: false, errorKey: 'string/gtin' },
// 				{ input: '4 006381 333931', options: { mode: 'loose' }, pass: true, value: '4006381333931' },
// 				{ input: '4 006381 333931', options: { mode: 'loose', normalize: false }, pass: true, value: '4 006381 333931' },
// 				{ input: '4 006381 333931', options: { mode: 'loose', normalizedDelim: '.' }, pass: true, value: '4.006381.333931' },
// 				{ input: '4~006381~333931', options: { mode: 'loose' }, pass: false, errorKey: 'string/gtin' },
// 				{ input: '4~006381~333931', options: { mode: 'loose', acceptableDelims: ' ~' }, pass: true, value: '4006381333931' },
// 				{ input: '(4)(006381)(333931)', options: { mode: 'loose', stripDelims: '()' }, pass: true, value: '4006381333931' }
// 			]);
// 		});

// 		it('applies configMatchingDefaults and allows per-call override', () => {
// 			handler.configMatchingDefaults({ mode: 'loose', normalize: false });
// 			runCases(handler.gtin.bind(handler), [{ input: '4 006381 333931', pass: true, value: '4 006381 333931' }]);
// 			runCases(handler.gtin.bind(handler), [{ input: '4 006381 333931', options: { normalize: true }, pass: true, value: '4006381333931' }]);
// 		});
// 	});

// 	describe('hash', () => {
// 		it('supports known algorithms, default algorithm, and rejects invalid/unknown', () => {
// 			runCases(handler.hash.bind(handler), [
// 				{ input: 'd41d8cd98f00b204e9800998ecf8427e', options: 'md5', pass: true },
// 				{ input: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855', options: 'sha256', pass: true },
// 				{ input: 'd41d8cd98f00b204e9800998ecf8427e', pass: true },
// 				{ input: 'xyz', options: 'md5', pass: false, errorKey: 'string/hash' },
// 				{ input: 'd41d8cd98f00b204e9800998ecf8427e', options: 'unknown', pass: false, errorKey: 'string/hash' }
// 			]);
// 		});
// 	});

// 	describe('imei', () => {
// 		it('validates check digit and supports mode/normalization options', () => {
// 			runCases(handler.imei.bind(handler), [
// 				{ input: '490154203237518', pass: true, value: '490154203237518' },
// 				{ input: '490154203237519', pass: false, errorKey: 'string/imei' },
// 				{ input: '49.015420.323751.8', pass: false, errorKey: 'string/imei' },
// 				{ input: '49.015420.323751.8', options: { mode: 'loose' }, pass: true, value: '490154203237518' },
// 				{ input: '49 015420 323751 8', options: { mode: 'loose', normalize: false }, pass: true, value: '49 015420 323751 8' },
// 				{ input: '49 015420 323751 8', options: { mode: 'loose', normalizedDelim: '.' }, pass: true, value: '49.015420.323751.8' }
// 			]);
// 		});

// 		it('supports acceptableDelims and stripDelims', () => {
// 			runCases(handler.imei.bind(handler), [
// 				{ input: '49~015420~323751~8', options: { mode: 'loose' }, pass: false, errorKey: 'string/imei' },
// 				{ input: '49~015420~323751~8', options: { mode: 'loose', acceptableDelims: ' ~' }, pass: true, value: '490154203237518' },
// 				{ input: '(49)(015420)(323751)(8)', options: { mode: 'loose', stripDelims: '()' }, pass: true, value: '490154203237518' }
// 			]);
// 		});
// 	});

// 	it('luhn', () => {
// 		runCases(handler.luhn.bind(handler), [
// 			{ input: '79927398713', pass: true },
// 			{ input: '79927398714', pass: false, errorKey: 'string/luhn' }
// 		]);
// 	});

// 	it('luhn supports varied lengths and rejects non-digit input', () => {
// 		runCases(handler.luhn.bind(handler), [
// 			{ input: '4242424242424242', pass: true },
// 			{ input: '4242424242424241', pass: false, errorKey: 'string/luhn' },
// 			{ input: '0000000000000000', pass: true },
// 			{ input: 'abc123', pass: false, errorKey: 'string/luhn' }
// 		]);
// 	});

// 	describe('phone', () => {
// 		it('supports mode, normalize, delimiter options, and stripDelims', () => {
// 			runCases(handler.phone.bind(handler), [
// 				{ input: '212-555-1234', pass: true, value: '212-555-1234' },
// 				{ input: '2125551234', pass: false, errorKey: 'string/phone' },
// 				{ input: '2125551234', options: { mode: 'loose' }, pass: true, value: '212-555-1234' },
// 				{ input: '212 555 1234', options: { mode: 'loose', normalize: false }, pass: true, value: '212 555 1234' },
// 				{ input: '212 555 1234', options: { mode: 'loose', normalizedDelim: '.' }, pass: true, value: '212.555.1234' },
// 				{ input: '212~555~1234', options: { mode: 'loose' }, pass: false, errorKey: 'string/phone' },
// 				{ input: '212~555~1234', options: { mode: 'loose', acceptableDelims: ' ~' }, pass: true, value: '212-555-1234' },
// 				{ input: '(212)5551234', options: { mode: 'loose', stripDelims: '()' }, pass: true, value: '212-555-1234' }
// 			]);
// 		});

// 		it('handles country-code variants and rejects malformed/unsupported formats', () => {
// 			runCases(handler.phone.bind(handler), [
// 				{ input: '(212)555-1234', pass: false, errorKey: 'string/phone' },
// 				{ input: '+1 (212) 555-1234', pass: false, errorKey: 'string/phone' },
// 				{ input: '+1 (212) 555-1234', options: { mode: 'loose' }, pass: true, value: '212-555-1234' },
// 				{ input: '1-212-555-1234', options: { mode: 'loose' }, pass: true, value: '212-555-1234' },
// 				{ input: '212.555.1234', options: { mode: 'strict' }, pass: false, errorKey: 'string/phone' },
// 				{ input: '212.555.1234', options: { mode: 'loose' }, pass: true, value: '212-555-1234' },
// 				{ input: '212/555/1234', options: { mode: 'loose' }, pass: true, value: '212-555-1234' },
// 				{ input: '(212) 555 1234', options: { mode: 'loose', stripDelims: '()', normalizedDelim: ' ' }, pass: true, value: '212 555 1234' },
// 				{ input: '+44 20 7946 0958', options: { mode: 'loose' }, pass: false, errorKey: 'string/phone' },
// 				{ input: '212-555-123', options: { mode: 'loose' }, pass: false, errorKey: 'string/phone' },
// 				{ input: '123-45-6789', pass: false, errorKey: 'string/phone' }
// 			]);
// 		});
// 	});

// 	describe('ssn', () => {
// 		it('validates structural constraints and supports regex options', () => {
// 			runCases(handler.ssn.bind(handler), [
// 				{ input: '123-45-6789', pass: true, value: '123-45-6789' },
// 				{ input: '000-45-6789', pass: false, errorKey: 'string/ssn' },
// 				{ input: '123456789', options: { mode: 'loose' }, pass: true, value: '123-45-6789' },
// 				{ input: '123 45 6789', options: { mode: 'loose', normalize: false }, pass: true, value: '123 45 6789' },
// 				{ input: '123 45 6789', options: { mode: 'loose', normalizedDelim: '.' }, pass: true, value: '123.45.6789' },
// 				{ input: '123~45~6789', options: { mode: 'loose' }, pass: false, errorKey: 'string/ssn' },
// 				{ input: '123~45~6789', options: { mode: 'loose', acceptableDelims: ' ~' }, pass: true, value: '123-45-6789' },
// 				{ input: '(123)(45)(6789)', options: { mode: 'loose', stripDelims: '()' }, pass: true, value: '123-45-6789' }
// 			]);
// 		});
// 	});

// 	describe('state', () => {
// 		it('supports ignoreCase and normalize options', () => {
// 			runCases(handler.state.bind(handler), [
// 				{ input: 'CA', pass: true, value: 'CA' },
// 				{ input: 'ca', pass: false, errorKey: 'string/state' },
// 				{ input: 'ca', options: { ignoreCase: true }, pass: true, value: 'CA' },
// 				{ input: 'ca', options: { ignoreCase: true, normalize: false }, pass: true, value: 'ca' }
// 			]);
// 		});

// 		it('applies configMatchingDefaults and allows per-call override', () => {
// 			handler.configMatchingDefaults({ ignoreCase: true, normalize: false });
// 			runCases(handler.state.bind(handler), [{ input: 'ny', pass: true, value: 'ny' }]);
// 			runCases(handler.state.bind(handler), [{ input: 'ny', options: { normalize: true }, pass: true, value: 'NY' }]);
// 		});
// 	});

// 	describe('zip', () => {
// 		it('validates base format and zip4 presence modes', () => {
// 			runCases(handler.zip.bind(handler), [
// 				{ input: '12345', pass: false, errorKey: 'string/zip/base' },
// 				{ input: '12345-6789', pass: true, value: '12345-6789' },
// 				{ input: '123456789', options: { mode: 'loose' }, pass: true, value: '12345-6789' },
// 				{ input: '12345', options: { mode: 'loose', zip4: 'required' }, pass: false, errorKey: 'string/zip/required4' },
// 				{ input: '123456789', options: { mode: 'loose', zip4: 'required' }, pass: true, value: '12345-6789' },
// 				{ input: '123456789', options: { mode: 'loose', zip4: 'forbidden' }, pass: false, errorKey: 'string/zip/forbidden4' },
// 				{ input: '12345', options: { mode: 'loose', zip4: 'forbidden' }, pass: true, value: '12345-' }
// 			]);
// 		});

// 		it('supports normalize and delimiter options', () => {
// 			runCases(handler.zip.bind(handler), [
// 				{ input: '123456789', options: { mode: 'loose', normalize: false }, pass: true, value: '123456789' },
// 				{ input: '123456789', options: { mode: 'loose', normalizedDelim: '.' }, pass: true, value: '12345.6789' },
// 				{ input: '12345~6789', options: { mode: 'loose' }, pass: false, errorKey: 'string/zip/base' },
// 				{ input: '12345~6789', options: { mode: 'loose', acceptableDelims: ' ~' }, pass: true, value: '12345-6789' },
// 				{ input: '(12345)(6789)', options: { mode: 'loose', stripDelims: '()' }, pass: true, value: '12345-6789' }
// 			]);
// 		});
// 	});
// });

// describe('StringHandler validators: numeric', () => {
// 	let handler: StringHandler;

// 	beforeEach(() => {
// 		handler = new StringHandler();
// 	});

// 	describe('numeric', () => {
// 		it('numeric: sign and alignment options', () => {
// 			runCases(handler.numeric.bind(handler), [
// 				{ input: '+12', options: { plus: 'required' }, pass: true, value: '+12' },
// 				{ input: '12', options: { plus: 'required' }, pass: false, errorKey: 'string/numeric/missingPlusSign' },
// 				{ input: '+12', options: { plus: 'forbidden' }, pass: false, errorKey: 'string/numeric/forbiddenPlusSign' },
// 				{ input: '-12', options: { minus: 'required' }, pass: true, value: '-12' },
// 				{ input: '12', options: { minus: 'required' }, pass: false, errorKey: 'string/numeric/missingMinusSign' },
// 				{ input: '-12', options: { minus: 'forbidden' }, pass: false, errorKey: 'string/numeric/forbiddenMinusSign' },
// 				{ input: '12+', options: { alignment: 'right', plus: 'required' }, pass: true, value: '12+' },
// 				{ input: '+12', options: { alignment: 'right', plus: 'required' }, pass: false, errorKey: 'string/numeric/missingSign' }
// 			]);
// 		});

// 		it('numeric: min, max, and decimal presence options', () => {
// 			runCases(handler.numeric.bind(handler), [
// 				{ input: '9', options: { min: 10 }, pass: false, errorKey: 'string/numeric/min' },
// 				{ input: '10', options: { min: 10 }, pass: true, value: '10' },
// 				{ input: '11', options: { max: 10 }, pass: false, errorKey: 'string/numeric/max' },
// 				{ input: '10', options: { max: 10 }, pass: true, value: '10' },
// 				{ input: '12', options: { decimal: 'required' }, pass: false, errorKey: 'string/numeric/missingDecimal' },
// 				{ input: '12.3', options: { decimal: 'required' }, pass: true, value: '12.3' },
// 				{ input: '12.3', options: { decimal: 'forbidden' }, pass: false, errorKey: 'string/numeric/forbiddenDecimal' },
// 				{ input: '12', options: { decimal: 'forbidden' }, pass: true, value: '12' }
// 			]);
// 		});

// 		it('numeric: delimiter and precision options', () => {
// 			runCases(handler.numeric.bind(handler), [
// 				{ input: '1_234', options: { thousandsDelim: '_' }, pass: true, value: '1_234' },
// 				{ input: '1,234', options: { thousandsDelim: '_' }, pass: false, errorKey: 'string/numeric/invalidIntegral' },
// 				{ input: '12,5', options: { decimalDelim: ',', decimal: 'required' }, pass: true, value: '12,5' },
// 				{ input: '12.34', options: { decimal: 'required', minPrecision: 2, maxPrecision: 2 }, pass: true, value: '12.34' },
// 				{ input: '12.3', options: { decimal: 'required', minPrecision: 2, maxPrecision: 2 }, pass: false, errorKey: 'string/numeric/invalidFractional' },
// 				{ input: '12.345', options: { decimal: 'required', minPrecision: 2, maxPrecision: 2 }, pass: false, errorKey: 'string/numeric/invalidFractional' }
// 			]);
// 		});

// 		it('numeric: leading and trailing zero options', () => {
// 			runCases(handler.numeric.bind(handler), [
// 				{ input: '.5', options: { decimal: 'required', leadingZero: 'required' }, pass: false, errorKey: 'string/numeric/missingLeadingZero' },
// 				{ input: '0.5', options: { decimal: 'required', leadingZero: 'required' }, pass: true, value: '0.5' },
// 				{ input: '0.5', options: { decimal: 'required', leadingZero: 'forbidden' }, pass: false, errorKey: 'string/numeric/forbiddenLeadingZero' },
// 				{ input: '.5', options: { decimal: 'required', leadingZero: 'forbidden' }, pass: true, value: '.5' },
// 				{ input: '12', options: { decimal: 'required', trailingZero: 'required' }, pass: false, errorKey: 'string/numeric/missingDecimal' },
// 				{ input: '12.0', options: { decimal: 'required', trailingZero: 'required' }, pass: true, value: '12.0' },
// 				{ input: '12.0', options: { decimal: 'required', trailingZero: 'forbidden' }, pass: false, errorKey: 'string/numeric/forbiddenTrailingZero' },
// 				{ input: '12.5', options: { decimal: 'required', trailingZero: 'forbidden' }, pass: true, value: '12.5' }
// 			]);
// 		});

// 		it('numeric: symbol and loose spacing options', () => {
// 			runCases(handler.numeric.bind(handler), [
// 				{ input: 'USD12', options: { leadingSymbols: ['USD'] }, pass: true, value: 'USD12' },
// 				{ input: '$12', options: { leadingSymbols: ['USD'] }, pass: false, errorKey: 'string/numeric/base' },
// 				{ input: '12kg', options: { trailingSymbols: ['kg'] }, pass: true, value: '12kg' },
// 				{ input: '12lb', options: { trailingSymbols: ['kg'] }, pass: false, errorKey: 'string/numeric/base' },
// 				{
// 					input: '+   USD12   kg',
// 					options: { leadingSymbols: ['USD'], trailingSymbols: ['kg'], plus: 'required', looseSpacing: true },
// 					pass: true,
// 					value: '+USD12kg'
// 				},
// 				{
// 					input: '+   USD12   kg',
// 					options: { leadingSymbols: ['USD'], trailingSymbols: ['kg'], plus: 'required', looseSpacing: false },
// 					pass: false,
// 					errorKey: 'string/numeric/base'
// 				}
// 			]);
// 		});

// 		it('applies configMatchingDefaults and allows per-call override', () => {
// 			handler.configMatchingDefaults({ plus: 'required' });
// 			runCases(handler.numeric.bind(handler), [{ input: '12', pass: false, errorKey: 'string/numeric/missingPlusSign' }]);
// 			runCases(handler.numeric.bind(handler), [{ input: '12', options: { plus: 'optional' }, pass: true, value: '12' }]);
// 		});
// 	});

// 	describe('measurement', () => {
// 		it('measurement: units and inherited numeric options', () => {
// 			runCases(handler.measurement.bind(handler), [
// 				{ input: '12cm', pass: true, value: '12cm' },
// 				{ input: '12kg', pass: false, errorKey: 'string/measurement' },
// 				{ input: '12kg', options: { units: ['kg'] }, pass: true, value: '12kg' },
// 				{ input: '+12cm', options: { plus: 'required' }, pass: true, value: '+12cm' },
// 				{ input: '12cm-', options: { alignment: 'right', minus: 'required' }, pass: true, value: '12cm-' },
// 				{ input: '12cm', options: { decimal: 'required' }, pass: false, errorKey: 'string/measurement' },
// 				{ input: '12.30cm', options: { decimal: 'required', minPrecision: 2, maxPrecision: 2 }, pass: true, value: '12.30cm' },
// 				{ input: '9cm', options: { min: 10 }, pass: false, errorKey: 'string/measurement' },
// 				{ input: '11cm', options: { max: 10 }, pass: false, errorKey: 'string/measurement' },
// 				{ input: '1_234cm', options: { thousandsDelim: '_' }, pass: true, value: '1_234cm' },
// 				{ input: '12,5cm', options: { decimalDelim: ',', decimal: 'required' }, pass: true, value: '12,5cm' }
// 			]);
// 		});

// 		it('measurement: symbol, zero, and spacing options', () => {
// 			runCases(handler.measurement.bind(handler), [
// 				{ input: '~12cm', options: { leadingSymbols: ['~'] }, pass: true, value: '~12cm' },
// 				{ input: '12kg', options: { units: ['cm'], trailingSymbols: ['kg'] }, pass: true, value: '12kg' },
// 				{ input: '.5cm', options: { decimal: 'required', leadingZero: 'required' }, pass: false, errorKey: 'string/measurement' },
// 				{ input: '0.5cm', options: { decimal: 'required', leadingZero: 'forbidden' }, pass: false, errorKey: 'string/measurement' },
// 				{ input: '12.0cm', options: { decimal: 'required', trailingZero: 'forbidden' }, pass: false, errorKey: 'string/measurement' },
// 				{ input: '+  ~12  cm', options: { leadingSymbols: ['~'], plus: 'required', looseSpacing: true }, pass: true, value: '+~12cm' },
// 				{ input: '+  ~12  cm', options: { leadingSymbols: ['~'], plus: 'required', looseSpacing: false }, pass: false, errorKey: 'string/measurement' }
// 			]);
// 		});

// 		it('applies configMatchingDefaults and allows per-call override', () => {
// 			handler.configMatchingDefaults({ plus: 'required' });
// 			runCases(handler.measurement.bind(handler), [{ input: '12cm', pass: false, errorKey: 'string/measurement' }]);
// 			runCases(handler.measurement.bind(handler), [{ input: '12cm', options: { plus: 'optional' }, pass: true, value: '12cm' }]);
// 		});
// 	});

// 	describe('money', () => {
// 		it('money: parens, symbols, and sign options', () => {
// 			runCases(handler.money.bind(handler), [
// 				{ input: '$12', pass: true, value: '$12' },
// 				{ input: '12', pass: false, errorKey: 'string/money' },
// 				{ input: '(USD12)', options: { parens: 'required', leadingSymbols: ['USD'] }, pass: true, value: '(USD12)' },
// 				{ input: 'USD12', options: { parens: 'required', leadingSymbols: ['USD'] }, pass: false, errorKey: 'string/money' },
// 				{ input: '(USD12)', options: { parens: 'forbidden', leadingSymbols: ['USD'] }, pass: false, errorKey: 'string/money' },
// 				{ input: 'USD12', options: { parens: 'optional', leadingSymbols: ['USD'] }, pass: true, value: 'USD12' },
// 				{ input: '(USD12)', options: { parens: 'optional', leadingSymbols: ['USD'] }, pass: true, value: '(USD12)' },
// 				{ input: '+USD12', options: { plus: 'required', leadingSymbols: ['USD'] }, pass: true, value: '+USD12' },
// 				{ input: '+USD12', options: { plus: 'forbidden', leadingSymbols: ['USD'] }, pass: false, errorKey: 'string/money' },
// 				{ input: '-USD12', options: { minus: 'required', leadingSymbols: ['USD'] }, pass: true, value: '-USD12' },
// 				{ input: '-USD12', options: { minus: 'forbidden', leadingSymbols: ['USD'] }, pass: false, errorKey: 'string/money' },
// 				{ input: 'USD12+', options: { alignment: 'right', plus: 'required', leadingSymbols: ['USD'] }, pass: false, errorKey: 'string/money' }
// 			]);
// 		});

// 		it('money: inherited numeric format options', () => {
// 			runCases(handler.money.bind(handler), [
// 				{ input: 'USD9', options: { leadingSymbols: ['USD'], min: 10 }, pass: false, errorKey: 'string/money' },
// 				{ input: 'USD11', options: { leadingSymbols: ['USD'], max: 10 }, pass: false, errorKey: 'string/money' },
// 				{ input: 'USD12.3', options: { leadingSymbols: ['USD'], decimal: 'required' }, pass: true, value: 'USD12.3' },
// 				{ input: 'USD12', options: { leadingSymbols: ['USD'], decimal: 'required' }, pass: false, errorKey: 'string/money' },
// 				{ input: 'USD12.3', options: { leadingSymbols: ['USD'], decimal: 'forbidden' }, pass: false, errorKey: 'string/money' },
// 				{ input: 'USD1_234', options: { leadingSymbols: ['USD'], thousandsDelim: '_' }, pass: true, value: 'USD1_234' },
// 				{ input: 'USD1,234', options: { leadingSymbols: ['USD'], thousandsDelim: '_' }, pass: false, errorKey: 'string/money' },
// 				{ input: 'USD12,5', options: { leadingSymbols: ['USD'], decimalDelim: ',', decimal: 'required' }, pass: true, value: 'USD12,5' },
// 				{ input: 'USD12.30', options: { leadingSymbols: ['USD'], decimal: 'required', minPrecision: 2, maxPrecision: 2 }, pass: true, value: 'USD12.30' },
// 				{ input: 'USD12.3', options: { leadingSymbols: ['USD'], decimal: 'required', minPrecision: 2, maxPrecision: 2 }, pass: false, errorKey: 'string/money' },
// 				{ input: 'USD12.300', options: { leadingSymbols: ['USD'], decimal: 'required', minPrecision: 2, maxPrecision: 2 }, pass: false, errorKey: 'string/money' },
// 				{ input: 'USD.5', options: { leadingSymbols: ['USD'], decimal: 'required', leadingZero: 'required' }, pass: false, errorKey: 'string/money' },
// 				{ input: 'USD0.5', options: { leadingSymbols: ['USD'], decimal: 'required', leadingZero: 'forbidden' }, pass: false, errorKey: 'string/money' },
// 				{ input: 'USD12.0', options: { leadingSymbols: ['USD'], decimal: 'required', trailingZero: 'required' }, pass: true, value: 'USD12.0' },
// 				{ input: 'USD12', options: { leadingSymbols: ['USD'], decimal: 'required', trailingZero: 'required' }, pass: false, errorKey: 'string/money' },
// 				{ input: 'USD12.0', options: { leadingSymbols: ['USD'], decimal: 'required', trailingZero: 'forbidden' }, pass: false, errorKey: 'string/money' }
// 			]);
// 		});

// 		it('money: trailing symbol and loose spacing options', () => {
// 			runCases(handler.money.bind(handler), [
// 				{ input: '12USD', options: { leadingSymbols: [''], trailingSymbols: ['USD'] }, pass: true, value: '12USD' },
// 				{ input: '+   USD12', options: { leadingSymbols: ['USD'], plus: 'required', looseSpacing: true }, pass: true, value: '+USD12' },
// 				{ input: '+   USD12', options: { leadingSymbols: ['USD'], plus: 'required', looseSpacing: false }, pass: false, errorKey: 'string/money' }
// 			]);
// 		});

// 		it('applies configMatchingDefaults and allows per-call override', () => {
// 			handler.configMatchingDefaults({ plus: 'required', leadingSymbols: ['USD'] });
// 			runCases(handler.money.bind(handler), [{ input: 'USD12', pass: false, errorKey: 'string/money' }]);
// 			runCases(handler.money.bind(handler), [{ input: 'USD12', options: { plus: 'optional' }, pass: true, value: 'USD12' }]);
// 		});
// 	});
// });

// describe('StringHandler mutators', () => {
// 	let handler: StringHandler;

// 	beforeEach(() => {
// 		handler = new StringHandler();
// 	});

// 	it('base64Decode', () => {
// 		runCases(handler.base64Decode.bind(handler), [{ input: 'TWFu', pass: true, value: 'Man' }]);
// 	});

// 	it('base64Encode', () => {
// 		runCases(handler.base64Encode.bind(handler), [{ input: 'Man', pass: true, value: 'TWFu' }]);
// 	});

// 	it('collapseRepeats', () => {
// 		runCases(
// 			(input: string, options?: { char: string }): ValidationResult =>
// 				handler.collapseRepeats(input, options?.char ?? ''),
// 			[
// 				{ input: 'aaabbbcc', options: { char: 'a' }, pass: true, value: 'abbbcc' },
// 				{ input: 'aaabbbcc', options: { char: '' }, pass: true, value: 'abc' }
// 			]
// 		);
// 	});

// 	it('collapseSpacing', () => {
// 		runCases(handler.collapseSpacing.bind(handler), [{ input: 'a\t  b\n\n c', pass: true, value: 'a b c' }]);
// 	});

// 	it('escapeHtml', () => {
// 		runCases(handler.escapeHtml.bind(handler), [{ input: '&<>' + '"' + "'", pass: true, value: '&amp;&lt;&gt;&quot;&#39;' }]);
// 	});

// 	it('hexDecode', () => {
// 		runCases(handler.hexDecode.bind(handler), [{ input: '4869', pass: true, value: 'Hi' }]);
// 	});

// 	it('hexEncode', () => {
// 		runCases(handler.hexEncode.bind(handler), [{ input: 'Hi', pass: true, value: '4869' }]);
// 	});

// 	it('normalizeLineBreaks', () => {
// 		runCases(
// 			(input: string, options?: { lineBreak?: string }): ValidationResult =>
// 				handler.normalizeLineBreaks(input, options?.lineBreak),
// 			[
// 				{ input: 'a\r\nb\rc\nd', pass: true, value: 'a\nb\nc\nd' },
// 				{ input: 'a\r\nb\rc\nd', options: { lineBreak: '|' }, pass: true, value: 'a|b|c|d' }
// 			]
// 		);
// 	});

// 	it('normalizeUnicode', () => {
// 		runCases(
// 			(input: string, options?: { type?: string }): ValidationResult =>
// 				handler.normalizeUnicode(input, options?.type),
// 			[
// 				{ input: '\u0065\u0301', pass: true, value: '\u00E9' },
// 				{ input: '\u00E9', options: { type: 'NFD' }, pass: true, value: '\u0065\u0301' }
// 			]
// 		);
// 	});

// 	it('padLeft', () => {
// 		runCases(
// 			(input: string, options?: { length: number; char: string }): ValidationResult =>
// 				handler.padLeft(input, options?.length ?? 0, options?.char ?? ''),
// 			[{ input: '7', options: { length: 3, char: '0' }, pass: true, value: '007' }]
// 		);
// 	});

// 	it('padRight', () => {
// 		runCases(
// 			(input: string, options?: { length: number; char: string }): ValidationResult =>
// 				handler.padRight(input, options?.length ?? 0, options?.char ?? ''),
// 			[{ input: '7', options: { length: 3, char: '0' }, pass: true, value: '700' }]
// 		);
// 	});

// 	it('slice', () => {
// 		runCases(
// 			(input: string, options?: { startIndex: number; endIndex: number }): ValidationResult =>
// 				handler.slice(input, options?.startIndex ?? 0, options?.endIndex ?? 0),
// 			[{ input: 'abcdef', options: { startIndex: 1, endIndex: 4 }, pass: true, value: 'bcd' }]
// 		);
// 	});

// 	it('sliceFirst', () => {
// 		runCases(
// 			(input: string, options?: { count?: number }): ValidationResult =>
// 				handler.sliceFirst(input, options?.count),
// 			[
// 				{ input: 'abcdef', pass: true, value: 'a' },
// 				{ input: 'abcdef', options: { count: 3 }, pass: true, value: 'abc' }
// 			]
// 		);
// 	});

// 	it('sliceLast', () => {
// 		runCases(
// 			(input: string, options?: { count?: number }): ValidationResult =>
// 				handler.sliceLast(input, options?.count),
// 			[
// 				{ input: 'abcdef', pass: true, value: 'f' },
// 				{ input: 'abcdef', options: { count: 3 }, pass: true, value: 'def' }
// 			]
// 		);
// 	});

// 	it('stripChars', () => {
// 		runCases(
// 			(input: string, options?: { chars: string }): ValidationResult =>
// 				handler.stripChars(input, options?.chars ?? ''),
// 			[{ input: 'a-b_c.d', options: { chars: '-_.' }, pass: true, value: 'abcd' }]
// 		);
// 	});

// 	it('stripHtml', () => {
// 		runCases(handler.stripHtml.bind(handler), [{ input: '<p>Hello <b>World</b></p>', pass: true, value: 'Hello World' }]);
// 	});

// 	it('stripWhitespace', () => {
// 		runCases(handler.stripWhitespace.bind(handler), [{ input: ' a\t b\n c ', pass: true, value: 'abc' }]);
// 	});

// 	it('toDelimited', () => {
// 		runCases(handler.toDelimited.bind(handler), [
// 			{
// 				input: 'one_two-three',
// 				options: {
// 					fromDelims: '_-',
// 					toDelim: '.',
// 					transformer1: (word: string): string => word.toUpperCase()
// 				},
// 				pass: true,
// 				value: 'ONE.TWO.THREE'
// 			},
// 			{
// 				input: 'one_two_three',
// 				options: {
// 					fromDelims: '_',
// 					toDelim: '-',
// 					transformer1: (word: string): string => word.toLowerCase(),
// 					transformer2: (word: string): string => word[0].toUpperCase() + word.slice(1).toLowerCase(),
// 					transformerSwitchIndex: 1
// 				},
// 				pass: true,
// 				value: 'one-Two-Three'
// 			},
// 			{
// 				input: 'MiXeD',
// 				options: {
// 					fromDelims: null,
// 					toDelim: '',
// 					transformer1: (word: string): string => word.toLowerCase(),
// 					transformer2: (word: string): string => word.toUpperCase(),
// 					transformerSwitchIndex: null
// 				},
// 				pass: true,
// 				value: 'mixed'
// 			}
// 		]);
// 	});

// 	it('toCamelCase', () => {
// 		runCases(
// 			(input: string, options?: { delims?: string }): ValidationResult =>
// 				handler.toCamelCase(input, options?.delims),
// 			[
// 				{ input: 'HELLO WORLD', pass: true, value: 'helloWorld' },
// 				{ input: 'hello_world_test', options: { delims: '_' }, pass: true, value: 'helloWorldTest' }
// 			]
// 		);
// 	});

// 	it('toKebabCase', () => {
// 		runCases(
// 			(input: string, options?: { fromDelims?: string }): ValidationResult =>
// 				handler.toKebabCase(input, options?.fromDelims),
// 			[
// 				{ input: 'Hello World', pass: true, value: 'hello-world' },
// 				{ input: 'One_Two_Three', options: { fromDelims: '_' }, pass: true, value: 'one-two-three' }
// 			]
// 		);
// 	});

// 	it('toPascalCase', () => {
// 		runCases(
// 			(input: string, options?: { fromDelims?: string }): ValidationResult =>
// 				handler.toPascalCase(input, options?.fromDelims),
// 			[
// 				{ input: 'hello world', pass: true, value: 'HelloWorld' },
// 				{ input: 'hello_world', options: { fromDelims: '_' }, pass: true, value: 'HelloWorld' }
// 			]
// 		);
// 	});

// 	it('toSentenceCase', () => {
// 		runCases(
// 			(input: string, options?: { fromDelims?: string }): ValidationResult =>
// 				handler.toSentenceCase(input, options?.fromDelims),
// 			[
// 				{ input: 'HELLO WORLD TEST', pass: true, value: 'Hello world test' },
// 				{ input: 'hello_world_test', options: { fromDelims: '_' }, pass: true, value: 'Hello world test' }
// 			]
// 		);
// 	});

// 	it('toSnakeCase', () => {
// 		runCases(
// 			(input: string, options?: { fromDelims?: string }): ValidationResult =>
// 				handler.toSnakeCase(input, options?.fromDelims),
// 			[
// 				{ input: 'Hello World', pass: true, value: 'hello_world' },
// 				{ input: 'One-Two-Three', options: { fromDelims: '-' }, pass: true, value: 'one_two_three' }
// 			]
// 		);
// 	});

// 	it('toTitleCase', () => {
// 		runCases(
// 			(input: string, options?: { fromDelims?: string }): ValidationResult =>
// 				handler.toTitleCase(input, options?.fromDelims),
// 			[
// 				{ input: 'hello world test', pass: true, value: 'Hello World Test' },
// 				{ input: 'hello_world_test', options: { fromDelims: '_' }, pass: true, value: 'Hello World Test' }
// 			]
// 		);
// 	});

// 	it('toLowerCase', () => {
// 		runCases(handler.toLowerCase.bind(handler), [{ input: 'AbC', pass: true, value: 'abc' }]);
// 	});

// 	it('toUpperCase', () => {
// 		runCases(handler.toUpperCase.bind(handler), [{ input: 'AbC', pass: true, value: 'ABC' }]);
// 	});

// 	it('trim', () => {
// 		runCases(
// 			(input: string, options?: { chars?: string }): ValidationResult =>
// 				handler.trim(input, options?.chars),
// 			[
// 				{ input: ' \t abc \n', pass: true, value: 'abc' },
// 				{ input: '..abc..', options: { chars: '.' }, pass: true, value: 'abc' }
// 			]
// 		);
// 	});

// 	it('trimLeft', () => {
// 		runCases(
// 			(input: string, options?: { chars?: string }): ValidationResult =>
// 				handler.trimLeft(input, options?.chars),
// 			[
// 				{ input: ' \t abc ', pass: true, value: 'abc ' },
// 				{ input: '..abc..', options: { chars: '.' }, pass: true, value: 'abc..' }
// 			]
// 		);
// 	});

// 	it('trimRight', () => {
// 		runCases(
// 			(input: string, options?: { chars?: string }): ValidationResult =>
// 				handler.trimRight(input, options?.chars),
// 			[
// 				{ input: ' abc \n\t ', pass: true, value: ' abc' },
// 				{ input: '..abc..', options: { chars: '.' }, pass: true, value: '..abc' }
// 			]
// 		);
// 	});

// 	it('urlEncode', () => {
// 		runCases(handler.urlEncode.bind(handler), [{ input: 'a b/c?d=e&f', pass: true, value: 'a%20b%2Fc%3Fd%3De%26f' }]);
// 	});

// 	it('urlDecode', () => {
// 		runCases(handler.urlDecode.bind(handler), [{ input: 'a%20b%2Fc%3Fd%3De%26f', pass: true, value: 'a b/c?d=e&f' }]);
// 	});
// });
