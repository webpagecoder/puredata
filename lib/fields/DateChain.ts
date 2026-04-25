'use strict';

import { DateParser } from '../date/DateParser.ts';
import { DatePart } from '../date/DatePart.ts';
import { DateType } from '../date/DateType.ts';
import { DateHandler } from '../handlers/DateHandler.ts';
import { Locale } from '../Locale.ts';
import { Presence } from '../Presence.ts';
import { Chain, ChainProps } from './Chain.ts';

export type DateChainProps = ChainProps<typeof DateHandler> & {
    dateOrder: 'MDY' | 'DMY' | 'YMD';
    inputType: DateType | null;
    locale: Locale;
    now: Date;
    outputType: DateType | null;
    requiredParts: Set<DatePart>;
    forbiddenParts: Set<DatePart>;
    optionalParts: Set<DatePart>;
    utcOffset: [number, number];
};

class DateChain extends Chain<DateChainProps> {

    constructor(props: Partial<DateChainProps> & Pick<DateChainProps, 'locale'>) {
        super(props);
        this.props.dateOrder = props.dateOrder || 'MDY';
        this.props.inputType = props.inputType || null;
        this.props.locale = props.locale;
        this.props.outputType = props.outputType || null;

        this.props.forbiddenParts = new Set(props.forbiddenParts || []);
        this.props.optionalParts = new Set(props.optionalParts || []);
        this.props.requiredParts = new Set(props.requiredParts || [DatePart.year, DatePart.month, DatePart.day]);

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

    assertEmptyPipeline(type: string): void {
        if (this.props.pipeline.length > 0) {
            throw new Error(type + '() processor must be the first processor in the chain, if used.');
        }
    }

    // forbidParts(forbiddenParts: DatePart[]): this {
    //     return this
    //         .setProps({ forbiddenParts });
    // }

    // allowParts(optionalParts: DatePart[]): this {
    //     return this
    //         .setProps({ optionalParts });
    // }

    // requireParts(requiredParts: DatePart[]): this {
    //     return this
    //         .setProps({ requiredParts });
    // }

    year(presence: Presence = Presence.Required): this {
        return this.setProps({
            requiredParts: new Set([...this.props.requiredParts, DatePart.year])
        });
    }

    // Configurators

    /**
     * Configure whether to automatically convert string values to numbers
     * @param {boolean} autoConvert - Whether to enable automatic conversion
     * @returns {NumberChain} The chain instance for method chaining
     */
    configDateOrder(dateOrder: 'MDY' | 'DMY' | 'YMD' = 'MDY') {
        return this.setProps({ dateOrder });
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
    human() {
        this.assertEmptyPipeline('human');

        return this.setProps({ inputType: DateType.HUMAN }).addStep('human', () => {
            return [
                this.props.locale,
                {
                    requiredParts: this.props.requiredParts,
                    forbiddenParts: this.props.forbiddenParts,
                    dateOrder: this.props.dateOrder
                }
            ];
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
    iso(options = {}) {
        this.assertEmptyPipeline('iso');
        return this
            .setProps({ inputType: DateType.ISO })
            .addStep('iso', [options]);
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
        this.assertEmptyPipeline('isoOrdinal');
        return this
            .setProps({ inputType: DateType.ISO_ORDINAL })
            .addStep('isoOrdinal', [options]);
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
        this.assertEmptyPipeline('isoWeek');
        return this
            .setProps({ inputType: DateType.ISO_WEEK })
            .addStep('isoWeek', [options]);
    }

    /**
     * Validates and parses timestamp formats.
     * Must be the first processor in the chain if used.
     * @param {boolean} [jsType=true] - Whether to expect JavaScript timestamps (milliseconds)
     * @returns {DateChain} Returns the chain for method chaining
     * @example
     * date.timestamp() // Accepts JavaScript timestamps in milliseconds
     * date.timestamp(false) // Accepts Unix timestamps in seconds
     */
    timestamp(jsType = true) {
        this.assertEmptyPipeline('timestamp');
        return this
            .setProps({ inputType: DateType.TIMESTAMP })
            .addStep('timestamp', [jsType]);
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

    /**
     * Configures the output to be in ISO 8601 format.
     * @returns {DateChain} Returns the chain for method chaining
     * @example
     * date.toIso() // Output: "2023-01-01T12:00:00.000Z"
     */
    toIso() {
        return this.setProps({ outputType: DateType.ISO });
    }

    /**
     * Configures the output to be in ISO 8601 ordinal date format.
     * @returns {DateChain} Returns the chain for method chaining
     * @example
     * date.toIsoOrdinal() // Output: "2023-001" (first day of year)
     */
    toIsoOrdinal() {
        return this.setProps({ outputType: DateType.ISO_ORDINAL });
    }

    /**
     * Configures the output to be in ISO 8601 week date format.
     * @returns {DateChain} Returns the chain for method chaining
     * @example
     * date.toIsoWeek() // Output: "2023-W01-1" (first Monday of year)
     */
    toIsoWeek() {
        return this.setProps({ outputType: DateType.ISO_WEEK });
    }

    /**
     * Configures the output to be a timestamp (milliseconds since epoch).
     * @returns {DateChain} Returns the chain for method chaining
     * @example
     * date.toTimestamp() // Output: 1672531200000 (JavaScript timestamp)
     */
    toTimestamp() {
        return this.setProps({ outputType: DateType.TIMESTAMP });
    }
}

export { DateChain };