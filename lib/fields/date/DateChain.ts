'use strict';

import { Path } from '../../Path.ts';
import { DefaultCalendarText } from '../../text/DefaultCalendarText.ts';
import { Translation, TranslationStringRecord } from '../../Translation.ts';
import { AnyChain, AnyChainCtorParams, AnyChainConfig } from '../any/AnyChain.ts';
import { DateOrder, DateType, HumanParseOptions, HumanPrecision, IsoOrdinalParseOptions, IsoOrdinalPrecision, IsoParseOptions, IsoPrecision, IsoWeekParseOptions, IsoWeekPrecision, TimeMode } from './DateConverter.ts';
import { DateHandler } from './DateHandler.ts';
import { DateProcessor } from './DateProcessor.ts';

type OutputFormat = DateType | string;
type OutputPrecision = HumanPrecision | IsoPrecision | IsoOrdinalPrecision | IsoWeekPrecision;

export type DateChainConfig = AnyChainConfig & {
    calendarText: Translation;
    dateOrder: DateOrder;
    outputStringFormat: OutputFormat | null;
    outputTimeMode: TimeMode;
    skipGenericParse: boolean;
    utcOffsetMinutes: number;
};

export type DateChainCtorParams = AnyChainCtorParams<DateChainConfig, DateHandler>;

class DateChain extends AnyChain<DateChainCtorParams> {

    constructor(args: Partial<DateChainCtorParams> = {}) {
        super(Object.assign({ chainHandlerCtor: DateHandler }, args));

        const {
            calendarText = new Translation(DefaultCalendarText),
            dateOrder = 'MDY',
            outputStringFormat = null,
            outputTimeMode = 'utc',
            skipGenericParse = false,
            utcOffsetMinutes = 0,
        } = args;

        const { _config } = this;
        _config.calendarText = calendarText.override();
        _config.dateOrder = dateOrder;
        _config.outputStringFormat = outputStringFormat;
        _config.outputTimeMode = outputTimeMode;
        _config.utcOffsetMinutes = utcOffsetMinutes;
        _config.skipGenericParse = skipGenericParse;

        this._config.chainHandler.configDateConverter(calendarText, utcOffsetMinutes);
    }

    public override createProcessor(): DateProcessor {
        return new DateProcessor({
            field: this,
        });
    }

    public assertEmptyPipeline(dateSubType: string): void {
        if (this._config.pipeline.length > 0) {
            throw new Error(dateSubType + '() processor must be the first processor in the chain, if used.');
        }
    }

    // Configurators

    public calendarText(overrides: Record<string, string>): this {
        const clone = this.clone();
        const calendarOverrides: TranslationStringRecord = {};
        for (const pathStr of Object.keys(overrides)) {
            const internalPathStyle = new Path(pathStr, this._config.pathDelims)
                .toRelative()
                .toString({ self: '.', separator: '/', up: '..' });
            calendarOverrides[internalPathStyle] = overrides[pathStr];
        }
        clone._config.calendarText.setText(calendarOverrides);
        return clone;
    }

    public dateOrder(dateOrder: DateOrder): this {
        return this.clone({ dateOrder });
    }

    public utcOffsetMinutes(utcOffsetMinutes: number): this {
        return this.clone({ utcOffsetMinutes });
    }

    // Validators

    /**
     * Validates and parses human-readable date formats.
     * Must be the first processor in the chain if used.
     * @param {Object} [options={}] - Parsing options
     * @param {string[]} [options.required] - Required date components
     * @param {string[]} [options.forbidden] - Forbidden date components
     * @param {'MDY' | 'DMY' | 'YMD'} [options.dateOrder] - The order of date components
     * @returns {DateChain} Returns the chain for method chaining
     * @example
     * date.human() // Accepts "Jan 1, 2023", "1/1/2023", etc.
     */
    public human(options: HumanParseOptions = {}): this {
        this.assertEmptyPipeline('human');
        return this
            .clone({ skipGenericParse: true })
            .addStepToChain('human', () => {
                return [Object.assign({ dateOrder: this._config.dateOrder }, options)];
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
            now.setUTCMinutes(now.getUTCMinutes() + this._config.utcOffsetMinutes);
            return [now];
        });
    }

    // Transformers


    // Exporters

    /**
     * Configures the output format for the date.
     * @param outputStringFormat Format string for the date
     * @param outputTimeMode UTC or local time mode
     * @returns {DateChain} Returns the chain for method chaining
     * date.toFormat('YYYY-MM-DDTHH:mm:ssZ', 'utc') // Output: "2023-01-01T12:00:00Z" 
     */
    public toFormat(outputStringFormat: string, outputTimeMode: TimeMode = 'utc'): this {
        return this.clone({ outputStringFormat, outputTimeMode });
    }

    public toDate(): this {
        return this.clone({ outputStringFormat: 'object' });
    }

    /**
     * Configures the output to be in ISO 8601 format.
     * @returns {DateChain} Returns the chain for method chaining
     * @example
     * date.toIso() // Output: "2023-01-01T12:00:00.000Z"
     */
    public toIso(outputPrecision: IsoPrecision = 'timezone', expanded = true): this {
        let outputStringFormat = '';
        let dash = expanded ? '-' : '';
        let colon = expanded ? ':' : '';
        switch (outputPrecision) {
            case 'timezone':
                outputStringFormat = dash ? 'ZZ' : 'Z';
            case 'time':
            case 'millisecond':
                outputStringFormat = '.SSS' + outputStringFormat;
            case 'second':
                outputStringFormat = `${colon}ss` + outputStringFormat;
            case 'minute':
                outputStringFormat = `${colon}mm` + outputStringFormat;
            case 'hour':
                outputStringFormat = 'THH' + outputStringFormat;
            case 'date':
            case 'day':
                outputStringFormat = `${dash}DD` + outputStringFormat;
            case 'month':
                outputStringFormat = `${dash}MM` + outputStringFormat;
            case 'year':
                outputStringFormat = 'YYYY' + outputStringFormat;
        }
        return this.clone({ outputStringFormat });
    }

    /**
     * Configures the output to be in ISO 8601 ordinal date format.
     * @returns {DateChain} Returns the chain for method chaining
     * @example
     * date.toIsoOrdinal() // Output: "2023-001" (first day of year)
     */
    public toIsoOrdinal(outputPrecision: IsoOrdinalPrecision = 'timezone', expanded = true): this {
        let outputStringFormat = '';
        let dash = expanded ? '-' : '';
        let colon = expanded ? ':' : '';
        switch (outputPrecision) {
            case 'timezone':
                outputStringFormat = dash ? 'ZZ' : 'Z';
            case 'time':
            case 'millisecond':
                outputStringFormat = '.SSS' + outputStringFormat;
            case 'second':
                outputStringFormat = `${colon}ss` + outputStringFormat;
            case 'minute':
                outputStringFormat = `${colon}mm` + outputStringFormat;
            case 'hour':
                outputStringFormat = 'THH' + outputStringFormat;
            case 'date':
            case 'dayOfYear':
                outputStringFormat = `YYYY${dash}DDD` + outputStringFormat;
        }
        return this.clone({ outputStringFormat });
    }

    /**
     * Configures the output to be in ISO 8601 week date format.
     * @returns {DateChain} Returns the chain for method chaining
     * @example
     * date.toIsoWeek() // Output: "2023-W01-1" (first Monday of year)
     */
    public toIsoWeek(outputPrecision: IsoWeekPrecision = 'timezone', expanded = true): this {
        let outputStringFormat = '';
        let dash = expanded ? '-' : '';
        let colon = expanded ? ':' : '';
        switch (outputPrecision) {
            case 'timezone':
                outputStringFormat = dash ? 'ZZ' : 'Z';
            case 'time':
            case 'millisecond':
                outputStringFormat = '.SSS' + outputStringFormat;
            case 'second':
                outputStringFormat = `${colon}ss` + outputStringFormat;
            case 'minute':
                outputStringFormat = `${colon}mm` + outputStringFormat;
            case 'hour':
                outputStringFormat = 'THH' + outputStringFormat;
            case 'date':
            case 'dayOfWeek':
                outputStringFormat = `${dash}E` + outputStringFormat;
            case 'week':
                outputStringFormat = `YYYY${dash}Www` + outputStringFormat;
        }
        return this.clone({ outputStringFormat });
    }

    /**
     * Configures the output to be a timestamp (milliseconds since epoch).
     * @returns {DateChain} Returns the chain for method chaining
     * @example
     * date.toTimestamp() // Output: 1672531200000 (JavaScript timestamp)
     */
    public toTimestamp(): this {
        return this.clone({ outputStringFormat: 'timestamp' });
    }

}

export { DateChain };

