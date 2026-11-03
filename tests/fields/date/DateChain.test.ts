'use strict';

import { DateChain } from '../../../lib/fields/date/DateChain.ts';
import { DateProcessor } from '../../../lib/fields/date/DateProcessor.ts';

describe('DateChain configurators and date-specific steps', () => {
    it('createProcessor returns a DateProcessor instance', () => {
        expect(new DateChain().createProcessor()).toBeInstanceOf(DateProcessor);
    });

    it('human uses the configured order when parsing ambiguous dates', () => {
        const tracker = new DateChain()
            .order('DMY')
            .human()
            .toFormat('YYYY-MM-DD')
            .process('03/04/2024');

        expect(tracker.pass).toBe(true);
        expect(tracker.value).toBe('2024-04-03');
    });

    it('human options can override the configured order for a parser step', () => {
        const tracker = new DateChain()
            .order('DMY')
            .human({ order: 'MDY' })
            .toFormat('YYYY-MM-DD')
            .process('03/04/2024');

        expect(tracker.pass).toBe(true);
        expect(tracker.value).toBe('2024-03-04');
    });

    it('calendarText returns a cloned chain and keeps date parsing functional', () => {
        const baseChain = new DateChain();
        const configured = baseChain.calendarText({ '/months/full/8': 'Septembre' });
        const baseTracker = baseChain.human({ order: 'MDY' }).process('September 2nd, 2025');
        const configuredTracker = configured.human({ order: 'MDY' }).process('September 2nd, 2025');

        expect(configured).not.toBe(baseChain);
        expect(baseTracker.pass).toBe(true);
        expect(configuredTracker.pass).toBe(true);
    });

    it('utcOffsetMins configures the chain offset value', () => {
        const tracker = new DateChain()
            .utcOffsetMins(120)
            .process('2024-01-02T00:00:00.000Z');

        expect(tracker.pass).toBe(true);
        expect(new DateChain().config.utcOffsetMins).toBe(0);
        expect(new DateChain().utcOffsetMins(120).config.utcOffsetMins).toBe(120);
    });

    it('assertEmptyPipeline passes when the pipeline is empty and throws when not empty', () => {
        expect(() => new DateChain().assertEmptyPipeline('iso')).not.toThrow();
        expect(() => new DateChain().today().assertEmptyPipeline('iso')).toThrow('iso() processor must be the first processor in the chain, if used.');
    });

    it('enforces parser steps as the first chain step', () => {
        const addParserAfterStep = () => new DateChain().today().iso();

        expect(addParserAfterStep).toThrow('iso() processor must be the first processor in the chain, if used.');
    });

    it('iso parses ISO input through the ISO parser step', () => {
        const tracker = new DateChain()
            .iso()
            .toFormat('YYYY-MM-DD')
            .process('2024-01-02');

        expect(tracker.pass).toBe(true);
        expect(tracker.value).toBe('2024-01-02');
    });

    it('isoOrdinal parses ISO ordinal input through the ISO ordinal parser step', () => {
        const tracker = new DateChain()
            .isoOrdinal()
            .toFormat('YYYY-MM-DD')
            .process('2024-123');

        expect(tracker.pass).toBe(true);
        expect(tracker.value).toBe('2024-05-02');
    });

    it('isoWeek parses ISO week input through the ISO week parser step', () => {
        const tracker = new DateChain()
            .isoWeek()
            .toFormat('YYYY-MM-DD')
            .process('2024-W12-3');

        expect(tracker.pass).toBe(true);
        expect(tracker.value).toBe('2024-03-20');
    });

    it('timestamp parses unix timestamps when configured for seconds', () => {
        const tracker = new DateChain()
            .timestamp(false)
            .toFormat('YYYY-MM-DDTHH:mm:ss')
            .process(1704164645);

        expect(tracker.pass).toBe(true);
        expect(tracker.value).toBe('2024-01-02T03:04:05');
    });

    it('toDate exports a Date instance', () => {
        const tracker = new DateChain()
            .toDate()
            .process('2024-01-02T03:04:05.000Z');

        expect(tracker.pass).toBe(true);
        expect(tracker.value).toBeInstanceOf(Date);
        expect((tracker.value as Date).toISOString()).toBe('2024-01-02T03:04:05.000Z');
    });

    it('toTimestamp exports a JavaScript timestamp', () => {
        const tracker = new DateChain()
            .toTimestamp()
            .process('2024-01-02T03:04:05.000Z');

        expect(tracker.pass).toBe(true);
        expect(tracker.value).toBe(1704164645000);
    });

    it('toIso builds the expected ISO output for the selected precision', () => {
        const tracker = new DateChain()
            .toIso('day')
            .process('2024-01-02T03:04:05.000Z');

        expect(tracker.pass).toBe(true);
        expect(tracker.value).toBe('2024-01-02');
    });

    it('toIsoOrdinal builds the expected ordinal output for the selected precision', () => {
        const tracker = new DateChain()
            .toIsoOrdinal('dayOfYear')
            .process('2024-05-02T03:04:05.000Z');

        expect(tracker.pass).toBe(true);
        expect(tracker.value).toBe('2024-123');
    });

    it('toIsoWeek builds the expected week-date output for the selected precision', () => {
        const tracker = new DateChain()
            .toIsoWeek('dayOfWeek')
            .process('2024-01-02T03:04:05.000Z');

        expect(tracker.pass).toBe(true);
        expect(tracker.value).toBe('2024-W01-2');
    });
});
