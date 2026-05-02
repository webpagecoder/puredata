'use strict';

import { DateParser, HumanParseOptions, HumanPrecision, IsoOrdinalParseOptions, IsoOrdinalPrecision, IsoParseOptions, IsoPrecision, IsoWeekParseOptions, IsoWeekPrecision } from '../date/DateParser.ts';
import { DatePart, DatePartIso, DatePartPresence } from '../date/DatePart.ts';
import { DateType } from '../date/DateType.ts';
import { DateHandler } from '../handlers/DateHandler.ts';
import { Locale } from '../Locale.ts';
import { Presence } from '../Presence.ts';
import { Chain, ChainProps } from './Chain.ts';

export type DateChainProps = ChainProps<typeof DateHandler> & {
    dateOrder: 'MDY' | 'DMY' | 'YMD';
    dateParser: DateParser;
    now: Date;
    outputType: DateType | 'custom' | null;
    outputFormat: HumanPrecision | IsoPrecision | IsoOrdinalPrecision | IsoWeekPrecision | string | null;
    skipPreProcess: boolean;
    utcOffset: [number, number];
};

class DateChain extends Chain<DateChainProps> {

    constructor(props: Partial<DateChainProps> & Pick<DateChainProps, 'locale'>) {
        super(props);
        this.props.dateParser = new DateParser(props.locale, props.dateOrder);
        this.props.skipPreProcess = this.props.skipPreProcess || false;

        let [hours, minutes] = this.props.utcOffset || [0, 0];
        hours = +hours;
        minutes = +minutes;
        const now = new Date();
        if (hours || minutes) {
            now.setUTCHours(now.getUTCHours() + hours);
            now.setUTCMinutes(now.getUTCMinutes() + minutes);
        }
        this.props.now = now;
    }

    assertEmptyPipelineAndSkipPreprocess(dateSubType: string): void {
        if (this.props.pipeline.length > 0) {
            throw new Error(dateSubType + '() processor must be the first processor in the chain, if used.');
        }
        this.props.skipPreProcess = true;
    }


    // Configurators

    /**
     * Configure whether to automatically convert string values to numbers
     * @param {boolean} autoConvert - Whether to enable automatic conversion
     * @returns {NumberChain} The chain instance for method chaining
     */
    configDateOrder(dateOrder: 'MDY' | 'DMY' | 'YMD' = 'MDY') {
        return this.clone({ dateOrder });
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
    human(options: HumanParseOptions = {}) {
        this.assertEmptyPipelineAndSkipPreprocess('human');
        return this.addStep('human', [this.props.dateParser, options]);
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
    iso(options: IsoParseOptions = {}) {
        this.assertEmptyPipelineAndSkipPreprocess('iso');
        return this.addStep('iso', [this.props.dateParser, options]);
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
    isoOrdinal(options = {}) {
        this.assertEmptyPipelineAndSkipPreprocess('isoOrdinal');
        return this.addStep('isoOrdinal', [this.props.dateParser, options]);
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
    isoWeek(options = {}) {
        this.assertEmptyPipelineAndSkipPreprocess('isoWeek');
        return this.addStep('isoWeek', [this.props.dateParser, options]);
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
    timestamp(isMilliseconds: boolean = true) {
        this.assertEmptyPipelineAndSkipPreprocess('timestamp');
        return this.addStep('timestamp', [isMilliseconds]);
    }

    /**
     * Validates that the date represents today.
     * @returns {DateChain} Returns the chain for method chaining
     * @example
     * date.today() // Must be today's date
     */
    today() {
        return this.addStep('today', [this.props.now]);
    }

    // Transformers


    // Exporters
    format(formatString: string){
        return this.clone({ 
            outputType: 'custom',
            outputFormat: formatString
        });
    }

    toDateObj() {
        return this.clone({ outputType: 'object' });
    }
    
    /**
     * Configures the output to be in ISO 8601 format.
     * @returns {DateChain} Returns the chain for method chaining
     * @example
     * date.toIso() // Output: "2023-01-01T12:00:00.000Z"
     */
    toIso(precision: IsoPrecision = 'timezone') {
        return this.clone({ 
            outputType: 'iso',
            outputFormat: precision
        });
    }

    /**
     * Configures the output to be in ISO 8601 ordinal date format.
     * @returns {DateChain} Returns the chain for method chaining
     * @example
     * date.toIsoOrdinal() // Output: "2023-001" (first day of year)
     */
    toIsoOrdinal() {
        return this.clone({ outputType: 'isoOrdinal' });
    }

    /**
     * Configures the output to be in ISO 8601 week date format.
     * @returns {DateChain} Returns the chain for method chaining
     * @example
     * date.toIsoWeek() // Output: "2023-W01-1" (first Monday of year)
     */
    toIsoWeek() {
        return this.clone({ outputType: 'isoWeek' });
    }

    /**
     * Configures the output to be a timestamp (milliseconds since epoch).
     * @returns {DateChain} Returns the chain for method chaining
     * @example
     * date.toTimestamp() // Output: 1672531200000 (JavaScript timestamp)
     */
    toTimestamp() {
        return this.clone({ outputType: 'timestamp' });
    }
}

export { DateChain };