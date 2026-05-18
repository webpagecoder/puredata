'use strict';

import { DateOrder, DateType, HumanParseOptions, HumanPrecision, IsoOrdinalPrecision, IsoParseOptions, IsoPrecision, IsoWeekPrecision, TimeMode } from '../date/DateConverter.ts';
import { DateHandler } from '../handlers/DateHandler.ts';
import { Chain, ChainProps } from './Chain.ts';

type OutputFormat = DateType | string;
type OutputPrecision = HumanPrecision | IsoPrecision | IsoOrdinalPrecision | IsoWeekPrecision;

export type DateChainProps = ChainProps<DateHandler> & {
    dateOrder?: DateOrder;
    outputStringFormat?: OutputFormat;
    outputPrecision?: OutputPrecision;
    outputTimeMode?: TimeMode;
    skipGenericParse?: boolean;
    utcOffset?: [number, number];
};

class DateChain extends Chain<DateChainProps> {
    protected _outputStringFormat: OutputFormat | null;
    protected _outputPrecision: OutputPrecision | null;
    protected _outputTimeMode: TimeMode;
    protected _skipGenericParse: boolean;
    protected _utcOffset: [number, number];

    constructor(props: DateChainProps) {
        super(props);

        const {
            dateOrder = 'MDY',
            outputStringFormat = null,
            outputPrecision = null,
            outputTimeMode = 'utc',
            skipGenericParse = false,
            utcOffset = [0, 0]
        } = props;

        this._outputStringFormat = outputStringFormat;
        this._outputPrecision = outputPrecision;
        this._outputTimeMode = outputTimeMode;
        this._utcOffset = utcOffset;
        this._skipGenericParse = skipGenericParse;
    }

    public override clone(props: Partial<DateChainProps> = {}): this {
        const clone = super.clone(props);
        const {
            dateOrder = null,
            outputStringFormat = this._outputStringFormat,
            outputPrecision = this._outputPrecision,
            outputTimeMode = this._outputTimeMode,
            utcOffset = this._utcOffset,
            skipGenericParse = this._skipGenericParse
        } = props;

        clone._outputStringFormat = outputStringFormat;
        clone._outputPrecision = outputPrecision;
        clone._outputTimeMode = outputTimeMode;
        clone._skipGenericParse = skipGenericParse;
        clone._utcOffset = utcOffset;
        return clone;
    }

    public assertEmptyPipelineAndSkipPreprocess(dateSubType: string): void {
        if (this._pipeline.length > 0) {
            throw new Error(dateSubType + '() processor must be the first processor in the chain, if used.');
        }
        this._skipGenericParse = true;
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
    public human(options: HumanParseOptions = {}) {
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
    public toFormat(outputStringFormat: string, outputTimeMode: TimeMode = 'utc') {
        return this.clone({ outputStringFormat, outputTimeMode });
    }

    public toDate() {
        return this.clone({ outputStringFormat: 'object' });
    }

    /**
     * Configures the output to be in ISO 8601 format.
     * @returns {DateChain} Returns the chain for method chaining
     * @example
     * date.toIso() // Output: "2023-01-01T12:00:00.000Z"
     */
    public toIso(outputPrecision: IsoPrecision = 'timezone', expanded = true) {
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
    public toIsoOrdinal(outputPrecision: IsoOrdinalPrecision = 'timezone', expanded = true) {
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
    public toIsoWeek(outputPrecision: IsoWeekPrecision = 'timezone', expanded = true) {
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
    public toTimestamp() {
        return this.clone({ outputStringFormat: 'timestamp' });
    }

    public get outputTimeMode() {
        return this._outputTimeMode;
    }

    public get outputStringFormat() {
        return this._outputStringFormat;
    }

    public get outputPrecision() {
        return this._outputPrecision;
    }

    public get skipGenericParse() {
        return this._skipGenericParse;
    }

    public get utcOffset() {
        return this._utcOffset;
    }
}

export { DateChain };

