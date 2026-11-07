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

        it('parser methods throw when a parser is not first in pipeline', () => {
            const chain = new DateChain().today();

            expect(() => chain.human()).toThrow('human() processor must be the first processor in the chain, if used.');
            expect(() => chain.iso()).toThrow('iso() processor must be the first processor in the chain, if used.');
            expect(() => chain.isoOrdinal()).toThrow('isoOrdinal() processor must be the first processor in the chain, if used.');
            expect(() => chain.isoWeek()).toThrow('isoWeek() processor must be the first processor in the chain, if used.');
            expect(() => chain.timestamp()).toThrow('timestamp() processor must be the first processor in the chain, if used.');
        });

        it('human appends first parser and sets skipGenericParse', () => {
            const chain = new DateChain({ order: 'YMD' });
            const withHuman = chain.human({
                maxPrecision: 'date'
            });
            
            const step = withHuman.pipeline[0];
            const args = step.argsResolver!();

            expect(withHuman.config.skipGenericParse).toBe(true);
            expect(withHuman.pipeline).toHaveLength(1);
            expect(args[0]).toEqual({ order: 'YMD', maxPrecision: 'date' });
        });

        it('iso/isoOrdinal/isoWeek/timestamp append parser steps and set skipGenericParse', () => {
            const iso = new DateChain().iso({ expanded: 'optional' });
            const isoOrdinal = new DateChain().isoOrdinal({ expanded: 'optional' });
            const isoWeek = new DateChain().isoWeek({ expanded: 'optional' });
            const timestamp = new DateChain().timestamp(false);
            const timestampDefault = new DateChain().timestamp();

            expect(iso.config.skipGenericParse).toBe(true);
            expect(isoOrdinal.config.skipGenericParse).toBe(true);
            expect(isoWeek.config.skipGenericParse).toBe(true);
            expect(timestamp.config.skipGenericParse).toBe(true);
            expect(timestampDefault.config.skipGenericParse).toBe(true);
            expect(iso.pipeline[0].argsResolver!()).toEqual([{ expanded: 'optional' }]);
            expect(isoOrdinal.pipeline[0].argsResolver!()).toEqual([{ expanded: 'optional' }]);
            expect(isoWeek.pipeline[0].argsResolver!()).toEqual([{ expanded: 'optional' }]);
            expect(timestamp.pipeline[0].argsResolver!()).toEqual([false]);
            expect(timestampDefault.pipeline[0].argsResolver!()).toEqual([true]);
        });

        it('parser methods forward precision and expanded parse options', () => {
            const human = new DateChain({ order: 'DMY' }).human({
                minPrecision: 'date',
                maxPrecision: 'time',
            });
            const iso = new DateChain().iso({
                minPrecision: 'month',
                maxPrecision: 'timezone',
                expanded: 'required',
            });
            const isoOrdinal = new DateChain().isoOrdinal({
                minPrecision: 'dayOfYear',
                maxPrecision: 'timezone',
                expanded: 'forbidden',
            });
            const isoWeek = new DateChain().isoWeek({
                minPrecision: 'week',
                maxPrecision: 'timezone',
                expanded: 'optional',
            });

            expect(human.pipeline[0].argsResolver!()).toEqual([{
                order: 'DMY',
                minPrecision: 'date',
                maxPrecision: 'time',
            }]);
            expect(iso.pipeline[0].argsResolver!()).toEqual([{
                minPrecision: 'month',
                maxPrecision: 'timezone',
                expanded: 'required',
            }]);
            expect(isoOrdinal.pipeline[0].argsResolver!()).toEqual([{
                minPrecision: 'dayOfYear',
                maxPrecision: 'timezone',
                expanded: 'forbidden',
            }]);
            expect(isoWeek.pipeline[0].argsResolver!()).toEqual([{
                minPrecision: 'week',
                maxPrecision: 'timezone',
                expanded: 'optional',
            }]);
        });

        it('today appends a step whose resolver returns a Date instance', () => {
            const withToday = new DateChain().today();
            const step = withToday.pipeline[0];
            const args = step.argsResolver!();

            expect(withToday.pipeline).toHaveLength(1);
            expect(args).toHaveLength(1);
            expect(args[0]).toBeInstanceOf(Date);
        });

        it('today resolver respects utcOffsetMins', () => {
            const offsetMins = 90;
            const withToday = new DateChain({ utcOffsetMins: offsetMins }).today();
            const step = withToday.pipeline[0];
            const before = Date.now();
            const [resolvedDate] = step.argsResolver!() as [Date];
            const after = Date.now();

            expect(resolvedDate).toBeInstanceOf(Date);
            expect(resolvedDate.getTime()).toBeGreaterThanOrEqual(before + (offsetMins * 60 * 1000));
            expect(resolvedDate.getTime()).toBeLessThanOrEqual(after + (offsetMins * 60 * 1000));
        });

        it('parser and exporter methods do not mutate source chain', () => {
            const chain = new DateChain();
            const withIso = chain.iso();
            const withIsoFormat = chain.toIso('year');

            expect(chain.pipeline).toHaveLength(0);
            expect(chain.config.skipGenericParse).toBe(false);
            expect(chain.config.outputFormat).toBe('iso');
            expect(withIso.pipeline).toHaveLength(1);
            expect(withIso.config.skipGenericParse).toBe(true);
            expect(withIsoFormat.config.outputFormat).toBe('YYYY');
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
            const formattedDefaultMode = new DateChain().toFormat('YYYY-MM-DD');
            const asDate = new DateChain().toDate();

            expect(formatted.config.outputFormat).toBe('YYYY-MM-DD');
            expect(formatted.config.outputTimeMode).toBe('local');
            expect(formattedDefaultMode.config.outputTimeMode).toBe('utc');
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

        it('calendarText normalizes override paths to internal slash format', () => {
            const slashDelims = new DateChain().calendarText({ '/months/full': 'Slash style month names' });
            const dotDelims = new DateChain({
                pathDelims: { self: '$', separator: '.', up: '^^' },
            }).calendarText({ 'months.full': 'Dot style month names' });

            expect(slashDelims.config.calendarText.getText('months/full')).toBe('Slash style month names');
            expect(dotDelims.config.calendarText.getText('months/full')).toBe('Dot style month names');
        });

        it('toIso/toIsoOrdinal/toIsoWeek support additional precisions and compact output', () => {
            const isoYear = new DateChain().toIso('year');
            const isoDateCompact = new DateChain().toIso('date', false);
            const isoSecondCompact = new DateChain().toIso('second', false);
            const isoTimezoneCompact = new DateChain().toIso('timezone', false);

            const isoOrdinalSecondCompact = new DateChain().toIsoOrdinal('second', false);
            const isoOrdinalTimezoneCompact = new DateChain().toIsoOrdinal('timezone', false);

            const isoWeekDayCompact = new DateChain().toIsoWeek('dayOfWeek', false);
            const isoWeekTimezoneCompact = new DateChain().toIsoWeek('timezone', false);

            expect(isoYear.config.outputFormat).toBe('YYYY');
            expect(isoDateCompact.config.outputFormat).toBe('YYYYMMDD');
            expect(isoSecondCompact.config.outputFormat).toBe('YYYYMMDDTHHmmss');
            expect(isoTimezoneCompact.config.outputFormat).toBe('YYYYMMDDTHHmmss.SSSZ');

            expect(isoOrdinalSecondCompact.config.outputFormat).toBe('YYYYDDDTHHmmss');
            expect(isoOrdinalTimezoneCompact.config.outputFormat).toBe('YYYYDDDTHHmmss.SSSZ');

            expect(isoWeekDayCompact.config.outputFormat).toBe('YYYYWwwE');
            expect(isoWeekTimezoneCompact.config.outputFormat).toBe('YYYYWwwETHHmmss.SSSZ');
        });
    });
});
