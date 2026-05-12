'use strict';

import { DateParser, HumanParseOptions, HumanPrecision, IsoOrdinalParseOptions, IsoOrdinalPrecision, IsoParseOptions, IsoPrecision, IsoWeekParseOptions, IsoWeekPrecision } from '../date/DateParser.ts';
import { DatePart, DatePartIso, DatePartPresence } from '../date/DatePart.ts';
import { DateType } from '../date/DateType.ts';
import { DateHandler } from '../handlers/DateHandler.ts';
import { Locale } from '../Locale.ts';
import { Presence } from '../Presence.ts';
import { Chain, ChainProps } from './Chain.ts';

type OutputFormat = DateType | string;
type OutputPrecision = HumanPrecision | IsoPrecision | IsoOrdinalPrecision | IsoWeekPrecision;

type DateOrder = 'MDY' | 'DMY' | 'YMD';

export type DateChainProps = ChainProps<DateHandler> & {
    dateOrder?: DateOrder;
    outputFormatString?: OutputFormat;
    outputPrecision?: OutputPrecision;
    skipPreProcess?: boolean;
    utcOffset?: [number, number];
};

class DateChain extends Chain<DateChainProps> {
    protected _outputFormatString: OutputFormat | null;
    protected _outputPrecision: OutputPrecision | null;
    protected _skipPreProcess: boolean;
    protected _utcOffset: [number, number];

    constructor(props: DateChainProps) {
        super(props);

        const {
            dateOrder = 'MDY',
            outputFormatString = null,
            outputPrecision = null,
            skipPreProcess = false,
            utcOffset = [0, 0]
        } = props;

        this._outputFormatString = outputFormatString;
        this._outputPrecision = outputPrecision;
        this._utcOffset = utcOffset;
        this._skipPreProcess = skipPreProcess;
    }

    public override clone(props: Partial<DateChainProps> = {}): this {
        const clone = super.clone(props);
        const {
            dateOrder = null,
            outputFormatString = this._outputFormatString,
            outputPrecision = this._outputPrecision,
            utcOffset = this._utcOffset,
            skipPreProcess = this._skipPreProcess
        } = props;

        clone._outputFormatString = outputFormatString;
        clone._outputPrecision = outputPrecision;
        clone._skipPreProcess = skipPreProcess;
        clone._utcOffset = utcOffset;
        return clone;
    }

    public assertEmptyPipelineAndSkipPreprocess(dateSubType: string): void {
        if (this._pipeline.length > 0) {
            throw new Error(dateSubType + '() processor must be the first processor in the chain, if used.');
        }
        this._skipPreProcess = true;
    }

    // Configurators

    /**
     * Configure whether to automatically convert string values to numbers
     * @param {boolean} autoConvert - Whether to enable automatic conversion
     * @returns {NumberChain} The chain instance for method chaining
     */
    public configDateOrder(dateOrder: DateOrder): this {
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
        return this.addStep('human', [ options]);
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
    public iso(options: IsoParseOptions = {}) {
        this.assertEmptyPipelineAndSkipPreprocess('iso');
        return this.addStep('iso', [ options]);
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
    public isoOrdinal(options = {}) {
        this.assertEmptyPipelineAndSkipPreprocess('isoOrdinal');
        return this.addStep('isoOrdinal', [options]);
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
    public isoWeek(options = {}) {
        this.assertEmptyPipelineAndSkipPreprocess('isoWeek');
        return this.addStep('isoWeek', [options]);
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
    public timestamp(isMilliseconds: boolean = true) {
        this.assertEmptyPipelineAndSkipPreprocess('timestamp');
        return this.addStep('timestamp', [isMilliseconds]);
    }

    /**
     * Validates that the date represents today.
     * @returns {DateChain} Returns the chain for method chaining
     * @example
     * date.today() // Must be today's date
     */
    public today() {
        const now = new Date();
        let [hours, minutes] = this._utcOffset;
        now.setUTCHours(now.getUTCHours() + hours);
        now.setUTCMinutes(now.getUTCMinutes() + minutes);
        return this.addStep('today', [now]);
    }

    // Transformers


    // Exporters
    public toFormat(outputFormatString: string) {
        return this.clone({ outputFormatString });
    }

    public toDate() {
        return this.clone({ outputFormatString: 'object' });
    }

    /**
     * Configures the output to be in ISO 8601 format.
     * @returns {DateChain} Returns the chain for method chaining
     * @example
     * date.toIso() // Output: "2023-01-01T12:00:00.000Z"
     */
    public toIso(outputPrecision: IsoPrecision = 'timezone', expanded = true) {
        let outputFormatString = '';
        let dash = expanded ? '-' : '';
        let colon = expanded ? ':' : '';
        switch (outputPrecision) {
            case 'timezone':
                outputFormatString = dash ? 'ZZ' : 'Z';
            case 'time':
            case 'millisecond':
                outputFormatString = '.SSS' + outputFormatString;
            case 'second':
                outputFormatString = `${colon}ss` + outputFormatString;
            case 'minute':
                outputFormatString = `${colon}mm` + outputFormatString;
            case 'hour':
                outputFormatString = 'THH' + outputFormatString;
            case 'date':
            case 'day':
                outputFormatString = `${dash}DD` + outputFormatString;
            case 'month':
                outputFormatString = `${dash}MM` + outputFormatString;
            case 'year':
                outputFormatString = 'YYYY' + outputFormatString;
        }
        return this.clone({ outputFormatString });
    }

    /**
     * Configures the output to be in ISO 8601 ordinal date format.
     * @returns {DateChain} Returns the chain for method chaining
     * @example
     * date.toIsoOrdinal() // Output: "2023-001" (first day of year)
     */
    public toIsoOrdinal(outputPrecision: IsoOrdinalPrecision = 'timezone', expanded = true) {
        let outputFormatString = '';
        let dash = expanded ? '-' : '';
        let colon = expanded ? ':' : '';
        switch (outputPrecision) {
            case 'timezone':
                outputFormatString = dash ? 'ZZ' : 'Z';
            case 'time':
            case 'millisecond':
                outputFormatString = '.SSS' + outputFormatString;
            case 'second':
                outputFormatString = `${colon}ss` + outputFormatString;
            case 'minute':
                outputFormatString = `${colon}mm` + outputFormatString;
            case 'hour':
                outputFormatString = 'THH' + outputFormatString;
            case 'date':
            case 'dayOfYear':
                outputFormatString = `YYYY${dash}DDD` + outputFormatString;
        }
        return this.clone({ outputFormatString });
    }

    /**
     * Configures the output to be in ISO 8601 week date format.
     * @returns {DateChain} Returns the chain for method chaining
     * @example
     * date.toIsoWeek() // Output: "2023-W01-1" (first Monday of year)
     */
    public toIsoWeek(outputPrecision: IsoWeekPrecision = 'timezone', expanded = true) {
        let outputFormatString = '';
        let dash = expanded ? '-' : '';
        let colon = expanded ? ':' : '';
        switch (outputPrecision) {
            case 'timezone':
                outputFormatString = dash ? 'ZZ' : 'Z';
            case 'time':
            case 'millisecond':
                outputFormatString = '.SSS' + outputFormatString;
            case 'second':
                outputFormatString = `${colon}ss` + outputFormatString;
            case 'minute':
                outputFormatString = `${colon}mm` + outputFormatString;
            case 'hour':
                outputFormatString = 'THH' + outputFormatString;
            case 'date':
            case 'dayOfWeek':
                outputFormatString = `${dash}E` + outputFormatString;
            case 'week':
                outputFormatString = `YYYY${dash}Www` + outputFormatString;
        }
        return this.clone({ outputFormatString });
    }

    /**
     * Configures the output to be a timestamp (milliseconds since epoch).
     * @returns {DateChain} Returns the chain for method chaining
     * @example
     * date.toTimestamp() // Output: 1672531200000 (JavaScript timestamp)
     */
    public toTimestamp() {
        return this.clone({ outputFormatString: 'timestamp' });
    }

    public get outputFormatString() {
        return this._outputFormatString;
    }

    public get skipPreProcess() {
        return this._skipPreProcess;
    }

    public get utcOffset() {
        return this._utcOffset;
    }
}

export { DateChain };