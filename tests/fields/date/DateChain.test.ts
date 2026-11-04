'use strict';

import { DateChain } from '../../../lib/fields/date/DateChain.ts';
import { DateProcessor } from '../../../lib/fields/date/DateProcessor.ts';

describe('DateChain', () => {
    describe('constructor and processor wiring', () => {
        it('applies default date config', () => {
            const chain = new DateChain();

            expect(chain.config.order).toBe('MDY');
            expect(chain.config.outputFormat).toBe('iso');
            expect(chain.config.outputTimeMode).toBe('utc');
            expect(chain.config.utcOffsetMins).toBe(0);
            expect(chain.config.skipGenericParse).toBe(false);
        });

        it('applies provided constructor config overrides', () => {
            const chain = new DateChain({
                order: 'DMY',
                outputFormat: 'timestamp',
                outputTimeMode: 'local',
                utcOffsetMins: 120,
                skipGenericParse: true,
            });

            expect(chain.config.order).toBe('DMY');
            expect(chain.config.outputFormat).toBe('timestamp');
            expect(chain.config.outputTimeMode).toBe('local');
            expect(chain.config.utcOffsetMins).toBe(120);
            expect(chain.config.skipGenericParse).toBe(true);
        });

        it('createProcessor returns a DateProcessor instance', () => {
            expect(new DateChain().createProcessor()).toBeInstanceOf(DateProcessor);
        });
    });

    describe('pipeline mechanics and validators', () => {
        it('assertEmptyPipeline throws when a parser is not first', () => {
            const chain = new DateChain().today();
            expect(() => chain.assertEmptyPipeline('iso')).toThrow('iso() processor must be the first processor in the chain, if used.');
        });

        it('human appends first parser and sets skipGenericParse', () => {
            const chain = new DateChain({ order: 'YMD' });
            const withHuman = chain.human({ required: ['month'] });
            const step = withHuman.pipeline[0];
            const args = step.argsResolver!();

            expect(withHuman.config.skipGenericParse).toBe(true);
            expect(withHuman.pipeline).toHaveLength(1);
            expect(args[0]).toEqual({ order: 'YMD', required: ['month'] });
        });

        it('iso/isoOrdinal/isoWeek/timestamp append parser steps and set skipGenericParse', () => {
            const iso = new DateChain().iso({ allowBasic: true });
            const isoOrdinal = new DateChain().isoOrdinal({ allowBasic: true });
            const isoWeek = new DateChain().isoWeek({ allowBasic: true });
            const timestamp = new DateChain().timestamp(false);

            expect(iso.config.skipGenericParse).toBe(true);
            expect(isoOrdinal.config.skipGenericParse).toBe(true);
            expect(isoWeek.config.skipGenericParse).toBe(true);
            expect(timestamp.config.skipGenericParse).toBe(true);
            expect(iso.pipeline[0].argsResolver!()).toEqual([{ allowBasic: true }]);
            expect(isoOrdinal.pipeline[0].argsResolver!()).toEqual([{ allowBasic: true }]);
            expect(isoWeek.pipeline[0].argsResolver!()).toEqual([{ allowBasic: true }]);
            expect(timestamp.pipeline[0].argsResolver!()).toEqual([false]);
        });

        it('today appends a step whose resolver returns a Date instance', () => {
            const withToday = new DateChain().today();
            const step = withToday.pipeline[0];
            const args = step.argsResolver!();

            expect(withToday.pipeline).toHaveLength(1);
            expect(args).toHaveLength(1);
            expect(args[0]).toBeInstanceOf(Date);
        });
    });

    describe('configurators and exporters', () => {
        it('calendarText/order/utcOffsetMins clone safely', () => {
            const chain = new DateChain();
            const configured = chain
                .calendarText({ '/months/full': 'Custom months' })
                .order('YMD')
                .utcOffsetMins(90);

            expect(chain.config.order).toBe('MDY');
            expect(chain.config.utcOffsetMins).toBe(0);
            expect(configured.config.order).toBe('YMD');
            expect(configured.config.utcOffsetMins).toBe(90);
        });

        it('toFormat and toDate configure output settings', () => {
            const formatted = new DateChain().toFormat('YYYY-MM-DD', 'local');
            const asDate = new DateChain().toDate();

            expect(formatted.config.outputFormat).toBe('YYYY-MM-DD');
            expect(formatted.config.outputTimeMode).toBe('local');
            expect(asDate.config.outputFormat).toBe('instance');
        });

        it('toIso/toIsoOrdinal/toIsoWeek/toTimestamp configure expected output formats', () => {
            const iso = new DateChain().toIso('minute', true);
            const isoOrdinal = new DateChain().toIsoOrdinal('dayOfYear', true);
            const isoWeek = new DateChain().toIsoWeek('week', true);
            const timestamp = new DateChain().toTimestamp();

            expect(iso.config.outputFormat).toBe('YYYY-MM-DDTHH:mm');
            expect(isoOrdinal.config.outputFormat).toBe('YYYY-DDD');
            expect(isoWeek.config.outputFormat).toBe('YYYY-Www');
            expect(timestamp.config.outputFormat).toBe('timestamp');
        });
    });
});
