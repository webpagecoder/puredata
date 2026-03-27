'use strict';

import { DATE_TYPE } from '../date/DateTypes.ts';
import { Chain } from './Chain.ts';

class DateChain extends Chain {

    constructor(props = {}) {
        super(props);
        this.props.inputType = null;

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

    // Configurators

    /**
     * Configure whether to automatically convert string values to numbers
     * @param {boolean} autoConvert - Whether to enable automatic conversion
     * @returns {NumberChain} The chain instance for method chaining
     */
    configMonthBeforeDay(monthBeforeDay = true) {
        return this.setProps({ monthBeforeDay });
    }

    // Validators

    /**
     * Validates and parses human-readable date formats.
     * Must be the first processor in the chain if used.
     * @param {Object} [options={}] - Parsing options
     * @param {string[]} [options.required] - Required date components
     * @param {string[]} [options.forbidden] - Forbidden date components
     * @param {boolean} [options.monthBeforeDay] - Whether month comes before day
     * @returns {DateChain} Returns the chain for method chaining
     * @example
     * date.human() // Accepts "Jan 1, 2023", "1/1/2023", etc.
     */
    human(options = {}) {
        this.ensureEmptyQueue('human');
        return this.setProps({ inputType: DATE_TYPES.HUMAN }).addStep('human', function () {
            const {
                numberSuffixes,
                months: {
                    full: fullMonths,
                    short: shortMonths
                }
            } = this.language.language.calendar;

            return [
                Object.assign({
                    monthBeforeDay: this.props.monthBeforeDay,
                    numberSuffixes,
                    fullMonths,
                    shortMonths
                }, options)
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
        this.ensureEmptyQueue('iso');
        return this
            .setProps({ inputType: DATE_TYPES.ISO })
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
        this.ensureEmptyQueue('isoOrdinal');
        return this
            .setProps({ inputType: DATE_TYPES.ISO_ORDINAL })
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
        this.ensureEmptyQueue('isoWeek');
        return this
            .setProps({ inputType: DATE_TYPES.ISO_WEEK })
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
        this.ensureEmptyQueue('timestamp');
        return this
            .setProps({ inputType: DATE_TYPES.TIMESTAMP })
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
        return this.setProps({ outputType: DATE_TYPES.ISO });
    }

    /**
     * Configures the output to be in ISO 8601 ordinal date format.
     * @returns {DateChain} Returns the chain for method chaining
     * @example
     * date.toIsoOrdinal() // Output: "2023-001" (first day of year)
     */
    toIsoOrdinal() {
        return this.setProps({ outputType: DATE_TYPES.ISO_ORDINAL });
    }

    /**
     * Configures the output to be in ISO 8601 week date format.
     * @returns {DateChain} Returns the chain for method chaining
     * @example
     * date.toIsoWeek() // Output: "2023-W01-1" (first Monday of year)
     */
    toIsoWeek() {
        return this.setProps({ outputType: DATE_TYPES.ISO_WEEK });
    }

    /**
     * Configures the output to be a timestamp (milliseconds since epoch).
     * @returns {DateChain} Returns the chain for method chaining
     * @example
     * date.toTimestamp() // Output: 1672531200000 (JavaScript timestamp)
     */
    toTimestamp() {
        return this.setProps({ outputType: DATE_TYPES.TIMESTAMP });
    }
}

export { DateChain };