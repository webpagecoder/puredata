'use strict';

import { Path } from '../../Path.ts';
import { DefaultCalendarText } from '../../text/DefaultCalendarText.ts';
import { Translation, TranslationStringRecord } from '../../Translation.ts';
import { AnyChain, AnyChainConfig, AnyChainCtorParams } from '../any/AnyChain.ts';
import { DateOrder, DateType, HumanParseOptions, IsoOrdinalParseOptions, IsoOrdinalPrecision, IsoParseOptions, IsoPrecision, IsoWeekParseOptions, IsoWeekPrecision, TimeMode } from './DateConverter.ts';
import { DateHandler } from './DateHandler.ts';
import { DateProcessor } from './DateProcessor.ts';

/** Configuration options for date chains. */
export type DateChainConfig = AnyChainConfig & {
    calendarText: Translation;
    order: DateOrder;
    outputFormat: DateType | string;
    outputTimeMode: TimeMode;
    skipGenericParse: boolean;
    utcOffsetMins: number;
};

/** Constructor options for a date chain. */
export type DateChainCtorParams = AnyChainCtorParams<DateChainConfig, DateHandler>;

/** Chain of validators, parsers, and formatters for date values. */
class DateChain extends AnyChain<DateChainCtorParams> {
    
    /**
     * Creates a date chain with the supplied parsing and output settings.
     *
     * @param args Initial configuration overrides for the date chain.
     */
    constructor(args: Partial<DateChainCtorParams> = {}) {
        const {
            calendarText = new Translation(DefaultCalendarText),
            utcOffsetMins = 0,
            chainHandler = new DateHandler(calendarText, utcOffsetMins),
            order = 'MDY',
            outputFormat = 'iso',
            outputTimeMode = 'utc',
            skipGenericParse = false,
        } = args;

        super(Object.assign({ chainHandler }, args));

        const { config } = this;
        config.calendarText = calendarText.override();
        config.order = order;
        config.outputFormat = outputFormat;
        config.outputTimeMode = outputTimeMode;
        config.utcOffsetMins = utcOffsetMins;
        config.skipGenericParse = skipGenericParse;
    }

    // ========================================
    // Processor wiring
    // ========================================

    /**
     * Creates the processor that handles this date chain.
     *
     * @returns Processor configured for this date chain.
     */
    public override createProcessor(): DateProcessor {
        return new DateProcessor({
            field: this,
        });
    }

    // ========================================
    // Pipeline mechanics
    // ========================================

    /**
     * Ensures a date parser is the first processor in the chain.
     *
     * @param dateSubType Name of the date parser being added.
     * @returns Nothing. Throws when pipeline already contains processors.
     * @throws {@link Error} If another processor is already configured.
     */
    public assertEmptyPipeline(dateSubType: string): void {
        if (this.pipeline.length > 0) {
            throw new Error(dateSubType + '() processor must be the first processor in the chain, if used.');
        }
    }

    // ========================================
    // Configurators
    // ========================================

    /**
     * Returns a chain with calendar text overrides.
     *
     * @param overrides Calendar-text entries keyed by external path format.
     * @returns Cloned chain with merged calendar text overrides.
     */
    public calendarText(overrides: Record<string, string>): this {
        const clone = this.clone();
        const calendarOverrides: TranslationStringRecord = {};
        for (const pathStr of Object.keys(overrides)) {
            const internalPathStyle = new Path(pathStr, this.config.pathDelims)
                .toRelative()
                .toString({ self: '.', separator: '/', up: '..' });
            calendarOverrides[internalPathStyle] = overrides[pathStr];
        }
        clone.config.calendarText.setText(calendarOverrides);
        return clone;
    }

    /**
     * Configures the order used to parse ambiguous human-readable dates.
     *
     * @param order Date component order to use while parsing human input.
     * @returns Cloned chain with updated human parse order.
     */
    public order(order: DateOrder): this {
        return this.clone({ order });
    }

    /**
     * Configures the UTC offset used when parsing and formatting dates.
     *
     * @param utcOffsetMins Offset, in minutes, used for local date interpretation.
     * @returns Cloned chain with updated UTC offset.
     */
    public utcOffsetMins(utcOffsetMins: number): this {
        return this.clone({ utcOffsetMins });
    }

    // ========================================
    // Validators
    // ========================================

    /**
     * Validates and parses human-readable date formats.
     * Must be the first processor in the chain if used.
     *
     * @param options Parsing options.
     * @param options.order The order of date components.
     * @param options.minPrecision Required minimum precision.
     * @param options.maxPrecision Allowed maximum precision.
     * @returns Cloned chain with a `human` parser step.
     * @example
     * date.human() // Accepts "Jan 1, 2023", "1/1/2023", etc.
     */
    public human(options: HumanParseOptions = {}): this {
        this.assertEmptyPipeline('human');
        return this
            .clone({ skipGenericParse: true })
            .addToPipeline('human', () => {
                return [Object.assign({ order: this.config.order }, options)];
            });
    }

    /**
     * Validates and parses ISO 8601 date formats.
     * Must be the first processor in the chain if used.
     *
     * @param options Parsing options.
     * @param options.minPrecision Required minimum precision.
     * @param options.maxPrecision Allowed maximum precision.
     * @param options.expanded Expanded ISO delimiter requirement.
     * @returns Cloned chain with an `iso` parser step.
     * @example
     * date.iso() // Accepts "2023-01-01", "2023-01-01T12:00:00Z", etc.
     */
    public iso(options: IsoParseOptions = {}): this {
        this.assertEmptyPipeline('iso');
        return this.clone({ skipGenericParse: true }).addToPipeline('iso', [options]);
    }

    /**
     * Validates and parses ISO 8601 ordinal date formats (YYYY-DDD).
     * Must be the first processor in the chain if used.
     *
     * @param options Parsing options.
     * @param options.minPrecision Required minimum precision.
     * @param options.maxPrecision Allowed maximum precision.
     * @param options.expanded Expanded ISO delimiter requirement.
     * @returns Cloned chain with an `isoOrdinal` parser step.
     * @example
     * date.isoOrdinal() // Accepts "2023-001", "2023-365", etc.
     */
    public isoOrdinal(options: IsoOrdinalParseOptions = {}): this {
        this.assertEmptyPipeline('isoOrdinal');
        return this.clone({ skipGenericParse: true }).addToPipeline('isoOrdinal', [options]);
    }

    /**
     * Validates and parses ISO 8601 week date formats (YYYY-Www-D).
     * Must be the first processor in the chain if used.
     *
     * @param options Parsing options.
     * @param options.minPrecision Required minimum precision.
     * @param options.maxPrecision Allowed maximum precision.
     * @param options.expanded Expanded ISO delimiter requirement.
     * @returns Cloned chain with an `isoWeek` parser step.
     * @example
     * date.isoWeek() // Accepts "2023-W01-1", "2023-W52-7", etc.
     */
    public isoWeek(options: IsoWeekParseOptions = {}): this {
        this.assertEmptyPipeline('isoWeek');
        return this.clone({ skipGenericParse: true }).addToPipeline('isoWeek', [options]);
    }

    /**
     * Validates and parses timestamp formats.
     * Must be the first processor in the chain if used.
     *
     * @param isMilliseconds Whether to expect JavaScript timestamps (milliseconds).
     * @returns Cloned chain with a `timestamp` parser step.
     * @example
     * date.timestamp() // Accepts JavaScript timestamps in milliseconds
     * date.timestamp(false) // Accepts Unix timestamps in seconds
     */
    public timestamp(isMilliseconds: boolean = true): this {
        this.assertEmptyPipeline('timestamp');
        return this.clone({ skipGenericParse: true }).addToPipeline('timestamp', [isMilliseconds]);
    }

    /**
     * Validates that the date represents today.
     *
     * @returns Cloned chain with a `today` validator step.
     * @example
     * date.today() // Must be today's date
     */
    public today(): this {
        return this.addToPipeline('today', () => {
            const now = new Date();
            now.setUTCMinutes(now.getUTCMinutes() + this.config.utcOffsetMins);
            return [now];
        });
    }



    // ========================================
    // Exporters
    // ========================================

    /**
     * Configures the output format for the date.
     *
     * @param outputFormat Format string for the date.
     * @param outputTimeMode UTC or local time mode.
     * @returns Cloned chain with updated output format settings.
     * @example
     * date.toFormat('YYYY-MM-DDTHH:mm:ssZ', 'utc') // Output: "2023-01-01T12:00:00Z" 
     */
    public toFormat(outputFormat: DateType | string, outputTimeMode: TimeMode = 'utc'): this {
        return this.clone({ outputFormat, outputTimeMode });
    }

    /**
     * Configures output as a `Date` object.
     *
     * @returns Cloned chain configured to output `Date` instances.
     */
    public toDate(): this {
        return this.clone({ outputFormat: 'instance' });
    }

    /**
     * Configures the output to be in ISO 8601 format.
     *
     * @param outputPrecision ISO precision to include in the formatted output.
     * @param expanded Whether delimiters are expanded (`-`, `:`) or compact.
     * @returns Cloned chain configured for ISO output.
     * @example
     * date.toIso() // Output: "2023-01-01T12:00:00.000Z"
     */
    public toIso(outputPrecision: IsoPrecision = 'timezone', expanded = true): this {
        let outputFormat = '';
        let dash = expanded ? '-' : '';
        let colon = expanded ? ':' : '';
        switch (outputPrecision) {
            case 'timezone':
                outputFormat = dash ? 'ZZ' : 'Z';
            case 'time':
            case 'millisecond':
                outputFormat = '.SSS' + outputFormat;
            case 'second':
                outputFormat = `${colon}ss` + outputFormat;
            case 'minute':
                outputFormat = `${colon}mm` + outputFormat;
            case 'hour':
                outputFormat = 'THH' + outputFormat;
            case 'date':
            case 'day':
                outputFormat = `${dash}DD` + outputFormat;
            case 'month':
                outputFormat = `${dash}MM` + outputFormat;
            case 'year':
                outputFormat = 'YYYY' + outputFormat;
        }
        return this.clone({ outputFormat });
    }

    /**
     * Configures the output to be in ISO 8601 ordinal date format.
     *
     * @param outputPrecision ISO ordinal precision to include in the formatted output.
     * @param expanded Whether delimiters are expanded (`-`, `:`) or compact.
     * @returns Cloned chain configured for ISO ordinal output.
     * @example
     * date.toIsoOrdinal() // Output: "2023-001" (first day of year)
     */
    public toIsoOrdinal(outputPrecision: IsoOrdinalPrecision = 'timezone', expanded = true): this {
        let outputFormat = '';
        let dash = expanded ? '-' : '';
        let colon = expanded ? ':' : '';
        switch (outputPrecision) {
            case 'timezone':
                outputFormat = dash ? 'ZZ' : 'Z';
            case 'time':
            case 'millisecond':
                outputFormat = '.SSS' + outputFormat;
            case 'second':
                outputFormat = `${colon}ss` + outputFormat;
            case 'minute':
                outputFormat = `${colon}mm` + outputFormat;
            case 'hour':
                outputFormat = 'THH' + outputFormat;
            case 'date':
            case 'dayOfYear':
                outputFormat = `YYYY${dash}DDD` + outputFormat;
        }
        return this.clone({ outputFormat });
    }

    /**
     * Configures the output to be in ISO 8601 week date format.
     *
     * @param outputPrecision ISO week precision to include in the formatted output.
     * @param expanded Whether delimiters are expanded (`-`, `:`) or compact.
     * @returns Cloned chain configured for ISO week output.
     * @example
     * date.toIsoWeek() // Output: "2023-W01-1" (first Monday of year)
     */
    public toIsoWeek(outputPrecision: IsoWeekPrecision = 'timezone', expanded = true): this {
        let outputFormat = '';
        let dash = expanded ? '-' : '';
        let colon = expanded ? ':' : '';
        switch (outputPrecision) {
            case 'timezone':
                outputFormat = dash ? 'ZZ' : 'Z';
            case 'time':
            case 'millisecond':
                outputFormat = '.SSS' + outputFormat;
            case 'second':
                outputFormat = `${colon}ss` + outputFormat;
            case 'minute':
                outputFormat = `${colon}mm` + outputFormat;
            case 'hour':
                outputFormat = 'THH' + outputFormat;
            case 'date':
            case 'dayOfWeek':
                outputFormat = `${dash}E` + outputFormat;
            case 'week':
                outputFormat = `YYYY${dash}Www` + outputFormat;
        }
        return this.clone({ outputFormat });
    }

    /**
     * Configures the output to be a timestamp (milliseconds since epoch).
     *
     * @returns Cloned chain configured for timestamp output.
     * @example
     * date.toTimestamp() // Output: 1672531200000 (JavaScript timestamp)
     */
    public toTimestamp(): this {
        return this.clone({ outputFormat: 'timestamp' });
    }

}

export { DateChain };
