'use strict';

import { Path } from '../../Path.ts';
import { DefaultCalendarText } from '../../text/DefaultCalendarText.ts';
import { Translation, TranslationStringRecord } from '../../Translation.ts';
import { AnyChain, AnyChainCtorParams, AnyChainConfig } from '../any/AnyChain.ts';
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

    /** Creates a date chain with the supplied parsing and output settings. */
    constructor(args: Partial<DateChainCtorParams> = {}) {
        super(Object.assign({ chainHandlerCtor: DateHandler }, args));

        const {
            calendarText = new Translation(DefaultCalendarText),
            order = 'MDY',
            outputFormat = 'iso',
            outputTimeMode = 'utc',
            skipGenericParse = false,
            utcOffsetMins = 0,
        } = args;

        const { config } = this;
        config.calendarText = calendarText.override();
        config.order = order;
        config.outputFormat = outputFormat;
        config.outputTimeMode = outputTimeMode;
        config.utcOffsetMins = utcOffsetMins;
        config.skipGenericParse = skipGenericParse;

        this.config.chainHandler.configDateConverter(calendarText, utcOffsetMins);
    }

    /** Creates the processor that handles this date chain. */
    public override createProcessor(): DateProcessor {
        return new DateProcessor({
            field: this,
        });
    }

    /**
     * Ensures a date parser is the first processor in the chain.
     *
     * @param dateSubType Name of the date parser being added.
     * @throws {@link Error} If another processor is already configured.
     */
    public assertEmptyPipeline(dateSubType: string): void {
        if (this.config.pipeline.length > 0) {
            throw new Error(dateSubType + '() processor must be the first processor in the chain, if used.');
        }
    }

    // Configurators

    /** Returns a chain with calendar text overrides. */
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

    /** Configures the order used to parse ambiguous human-readable dates. */
    public order(order: DateOrder): this {
        return this.clone({ order });
    }

    /** Configures the UTC offset used when parsing and formatting dates. */
    public utcOffsetMins(utcOffsetMins: number): this {
        return this.clone({ utcOffsetMins });
    }

    // Validators

    /**
     * Validates and parses human-readable date formats.
     * Must be the first processor in the chain if used.
     * @param {Object} [options={}] - Parsing options
     * @param {string[]} [options.required] - Required date components
     * @param {string[]} [options.forbidden] - Forbidden date components
     * @param {'MDY' | 'DMY' | 'YMD'} [options.order] - The order of date components
     * @returns {DateChain} Returns the chain for method chaining
     * @example
     * date.human() // Accepts "Jan 1, 2023", "1/1/2023", etc.
     */
    public human(options: HumanParseOptions = {}): this {
        this.assertEmptyPipeline('human');
        return this
            .clone({ skipGenericParse: true })
            .addStepToChain('human', () => {
                return [Object.assign({ order: this.config.order }, options)];
            });
    }

    /**
     * Validates and parses ISO 8601 date formats.
     * Must be the first processor in the chain if used.
     * @param {Object} [options={}] - Parsing options
     * @param {string[]} [options.required] - Required date components
     * @param {string[]} [options.forbidden] - Forbidden date components
     * @param {boolean} [options.allowBasic] - Allow basic format (without hyphens)
     * @returns {DateChain} Returns the chain for method chaining
     * @example
     * date.iso() // Accepts "2023-01-01", "2023-01-01T12:00:00Z", etc.
     */
    public iso(options: IsoParseOptions = {}): this {
        this.assertEmptyPipeline('iso');
        return this.clone({ skipGenericParse: true }).addStepToChain('iso', [options]);
    }

    /**
     * Validates and parses ISO 8601 ordinal date formats (YYYY-DDD).
     * Must be the first processor in the chain if used.
     * @param {Object} [options={}] - Parsing options
     * @param {boolean} [options.allowBasic] - Allow basic format (without hyphens)
     * @returns {DateChain} Returns the chain for method chaining
     * @example
     * date.isoOrdinal() // Accepts "2023-001", "2023-365", etc.
     */
    public isoOrdinal(options: IsoOrdinalParseOptions = {}): this {
        this.assertEmptyPipeline('isoOrdinal');
        return this.clone({ skipGenericParse: true }).addStepToChain('isoOrdinal', [options]);
    }

    /**
     * Validates and parses ISO 8601 week date formats (YYYY-Www-D).
     * Must be the first processor in the chain if used.
     * @param {Object} [options={}] - Parsing options
     * @param {boolean} [options.allowBasic] - Allow basic format (without hyphens)
     * @returns {DateChain} Returns the chain for method chaining
     * @example
     * date.isoWeek() // Accepts "2023-W01-1", "2023-W52-7", etc.
     */
    public isoWeek(options: IsoWeekParseOptions = {}): this {
        this.assertEmptyPipeline('isoWeek');
        return this.clone({ skipGenericParse: true }).addStepToChain('isoWeek', [options]);
    }

    /**
     * Validates and parses timestamp formats.
     * Must be the first processor in the chain if used.
     * @param {boolean} [isMilliseconds] - Whether to expect JavaScript timestamps (milliseconds)
     * @returns {DateChain} Returns the chain for method chaining
     * @example
     * date.timestamp() // Accepts JavaScript timestamps in milliseconds
     * date.timestamp(false) // Accepts Unix timestamps in seconds
     */
    public timestamp(isMilliseconds: boolean = true): this {
        this.assertEmptyPipeline('timestamp');
        return this.clone({ skipGenericParse: true }).addStepToChain('timestamp', [isMilliseconds]);
    }

    /**
     * Validates that the date represents today.
     * @returns {DateChain} Returns the chain for method chaining
     * @example
     * date.today() // Must be today's date
     */
    public today(): this {
        return this.addStepToChain('today', () => {
            const now = new Date();
            now.setUTCMinutes(now.getUTCMinutes() + this.config.utcOffsetMins);
            return [now];
        });
    }

    // Transformers


    // Exporters

    /**
     * Configures the output format for the date.
     * @param outputFormat Format string for the date
     * @param outputTimeMode UTC or local time mode
     * @returns {DateChain} Returns the chain for method chaining
     * date.toFormat('YYYY-MM-DDTHH:mm:ssZ', 'utc') // Output: "2023-01-01T12:00:00Z" 
     */
    public toFormat(outputFormat: DateType | string, outputTimeMode: TimeMode = 'utc'): this {
        return this.clone({ outputFormat, outputTimeMode });
    }

    /** Configures output as a `Date` object. */
    public toDate(): this {
        return this.clone({ outputFormat: 'instance' });
    }

    /**
     * Configures the output to be in ISO 8601 format.
     * @returns {DateChain} Returns the chain for method chaining
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
     * @returns {DateChain} Returns the chain for method chaining
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
     * @returns {DateChain} Returns the chain for method chaining
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
     * @returns {DateChain} Returns the chain for method chaining
     * @example
     * date.toTimestamp() // Output: 1672531200000 (JavaScript timestamp)
     */
    public toTimestamp(): this {
        return this.clone({ outputFormat: 'timestamp' });
    }

}

export { DateChain };
