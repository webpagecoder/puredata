'use strict';

import GenericChain  from './GenericChain.js';
import DateUtils  from '../../utils/DateUtils.js';
import DATE_TYPES  from '../../utils/DateTypes.js';

class DateChain extends GenericChain {

    constructor(props = {}) {
        super(props);
        this.props.inputType = null;
        this.props.now = DateUtils.shiftDateByOffset(new Date(), this.props.utcOffset);
    }

    get languageKey() {
        return 'date';
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
     * Validates that the date is after the specified date.
     * @param {Date|string|number} afterDate - The date to compare against
     * @returns {DateChain} Returns the chain for method chaining
     * @example
     * date.after('2023-01-01') // Must be after January 1, 2023
     */
    after(afterDate) {
        return this.addStep('after', [afterDate]);
    }

    /**
     * Validates that the date is before the specified date.
     * @param {Date|string|number} beforeDate - The date to compare against
     * @returns {DateChain} Returns the chain for method chaining
     * @example
     * date.before('2023-12-31') // Must be before December 31, 2023
     */
    before(beforeDate) {
        return this.addStep('before', [beforeDate]);
    }

    /**
     * Validates that the date falls within a specified range (inclusive).
     * @param {Date|string|number} minDate - The minimum allowed date
     * @param {Date|string|number} maxDate - The maximum allowed date
     * @returns {DateChain} Returns the chain for method chaining
     * @example
     * date.isBetween('2023-01-01', '2023-12-31') // Date must be in 2023
     */
    isBetween(minDate, maxDate) {
        return this.addStep('between', [minDate, maxDate]);
    }

    /**
     * Validates that the date falls on a specific day of the week.
     * @param {number} dayOfWeek - Day of week (0 = Sunday, 1 = Monday, ..., 6 = Saturday)
     * @returns {DateChain} Returns the chain for method chaining
     * @example
     * date.dayOfWeek(1) // Must be a Monday
     */
    dayOfWeek(dayOfWeek) {
        return this.addStep('dayOfWeek', [dayOfWeek]);
    }

    /**
     * Validates that the date equals another specific date.
     * @param {Date|string|number} compareDate - The date to compare against
     * @returns {DateChain} Returns the chain for method chaining
     * @example
     * date.equals('2023-12-25') // Must be Christmas 2023
     */
    equals(compareDate) {
        return this.addStep('equals', [compareDate]);
    }

    /**
     * Validates that the date is in the future relative to a reference date.
     * @param {Date|string|number} [referenceDate] - Reference date (defaults to now)
     * @returns {DateChain} Returns the chain for method chaining
     * @example
     * date.future() // Must be in the future
     * date.future('2023-01-01') // Must be after Jan 1, 2023
     */
    future(referenceDate) {
        return this.addStep('future', [referenceDate]);
    }

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
        return this.setProps({ inputType: DATE_TYPES.ISO }).addStep('iso', [options]);
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
        return this.setProps({ inputType: DATE_TYPES.ISO_ORDINAL }).addStep('isoOrdinal', [options]);
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
        return this.setProps({ inputType: DATE_TYPES.ISO_WEEK }).addStep('isoWeek', [options]);
    }

    /**
     * Validates that the date is in a leap year.
     * @returns {DateChain} Returns the chain for method chaining
     * @example
     * date.leapYear() // Must be in a leap year like 2024
     */
    leapYear() {
        return this.addStep('leapYear');
    }

    /**
     * Validates that the date is not after a maximum date.
     * @param {Date|string|number} compareDate - The maximum allowed date
     * @returns {DateChain} Returns the chain for method chaining
     * @example
     * date.max('2023-12-31') // Must be on or before Dec 31, 2023
     */
    max(compareDate) {
        return this.addStep('max', [compareDate]);
    }

    /**
     * Validates that the date is not before a minimum date.
     * @param {Date|string|number} compareDate - The minimum allowed date
     * @returns {DateChain} Returns the chain for method chaining
     * @example
     * date.min('2023-01-01') // Must be on or after Jan 1, 2023
     */
    min(compareDate) {
        return this.addStep('min', [compareDate]);
    }

    /**
     * Validates that the birth date represents someone of at least minimum age.
     * @param {number} minAge - The minimum age in years
     * @param {Date|string|number} [referenceDate] - Reference date for age calculation
     * @returns {DateChain} Returns the chain for method chaining
     * @example
     * date.minAge(18) // Must be at least 18 years old
     * date.minAge(21, '2023-01-01') // Must be 21+ on Jan 1, 2023
     */
    minAge(minAge, referenceDate) {
        return this.addStep('minAge', [minAge, referenceDate]);
    }

    /**
     * Validates that the date is in the past relative to a reference date.
     * @param {Date|string|number} [referenceDate] - Reference date (defaults to now)
     * @returns {DateChain} Returns the chain for method chaining
     * @example
     * date.past() // Must be in the past
     * date.past('2023-01-01') // Must be before Jan 1, 2023
     */
    past(referenceDate) {
        return this.addStep('past', [referenceDate]);
    }

    /**
     * Validates that the date is within a recent timeframe.
     * @param {number} [days] - Number of days to consider recent (defaults to 30)
     * @param {Date|string|number} [referenceDate] - Reference date (defaults to now)
     * @returns {DateChain} Returns the chain for method chaining
     * @example
     * date.recent() // Within last 30 days
     * date.recent(7) // Within last 7 days
     */
    recent(days, referenceDate) {
        return this.addStep('recent', [days, referenceDate]);
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
        return this.setProps({ inputType: DATE_TYPES.TIMESTAMP }).addStep('timestamp', [jsType]);
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

    /**
     * Validates that the date falls on a weekday (Monday through Friday).
     * @returns {DateChain} Returns the chain for method chaining
     * @example
     * date.weekday() // Must be Mon, Tue, Wed, Thu, or Fri
     */
    weekday() {
        return this.addStep('weekday');
    }

    /**
     * Validates that the date falls on a weekend (Saturday or Sunday).
     * @returns {DateChain} Returns the chain for method chaining
     * @example
     * date.weekend() // Must be Sat or Sun
     */
    weekend() {
        return this.addStep('weekend');
    }

    // Transformers

    /**
     * Adds the specified number of days to the date.
     * @param {number} days - Number of days to add (can be negative to subtract)
     * @returns {DateChain} Returns the chain for method chaining
     * @example
     * date.addDays(7) // Add 7 days
     * date.addDays(-3) // Subtract 3 days
     */
    addDays(days) {
        return this.addStep('addDays', [days]);
    }

    /**
     * Adds the specified number of hours to the date.
     * @param {number} hours - Number of hours to add (can be negative to subtract)
     * @returns {DateChain} Returns the chain for method chaining
     * @example
     * date.addHours(12) // Add 12 hours
     * date.addHours(-6) // Subtract 6 hours
     */
    addHours(hours) {
        return this.addStep('addHours', [hours]);
    }

    /**
     * Adds the specified number of minutes to the date.
     * @param {number} minutes - Number of minutes to add (can be negative to subtract)
     * @returns {DateChain} Returns the chain for method chaining
     * @example
     * date.addMinutes(30) // Add 30 minutes
     * date.addMinutes(-15) // Subtract 15 minutes
     */
    addMinutes(minutes) {
        return this.addStep('addMinutes', [minutes]);
    }

    /**
     * Adds the specified number of months to the date.
     * @param {number} months - Number of months to add (can be negative to subtract)
     * @returns {DateChain} Returns the chain for method chaining
     * @example
     * date.addMonths(3) // Add 3 months
     * date.addMonths(-1) // Subtract 1 month
     */
    addMonths(months) {
        return this.addStep('addMonths', [months]);
    }

    /**
     * Adds the specified number of years to the date.
     * @param {number} years - Number of years to add (can be negative to subtract)
     * @returns {DateChain} Returns the chain for method chaining
     * @example
     * date.addYears(1) // Add 1 year
     * date.addYears(-5) // Subtract 5 years
     */
    addYears(years) {
        return this.addStep('addYears', [years]);
    }

    /**
     * Transforms the date to the end of the day (23:59:59.999).
     * @returns {DateChain} Returns the chain for method chaining
     * @example
     * date.toEndOfDay() // Sets time to 23:59:59.999
     */
    toEndOfDay() {
        return this.addStep('toEndOfDay');
    }

    /**
     * Transforms the date to the last day of the month at end of day.
     * @returns {DateChain} Returns the chain for method chaining
     * @example
     * date.toEndOfMonth() // Jan 15 -> Jan 31 23:59:59.999
     */
    toEndOfMonth() {
        return this.addStep('toEndOfMonth');
    }

    /**
     * Transforms the date to the next occurrence of the specified day of week.
     * @param {number} targetDay - Target day of week (0 = Sunday, 1 = Monday, ..., 6 = Saturday)
     * @returns {DateChain} Returns the chain for method chaining
     * @example
     * date.toNextDayOfWeek(1) // Move to next Monday
     * date.toNextDayOfWeek(5) // Move to next Friday
     */
    toNextDayOfWeek(targetDay) {
        return this.addStep('toNextDayOfWeek', [targetDay]);
    }

    /**
     * Transforms the date to the next weekday (Monday through Friday).
     * @returns {DateChain} Returns the chain for method chaining
     * @example
     * date.toNextWeekday() // Skip weekends to next business day
     */
    toNextWeekday() {
        return this.addStep('toNextWeekday');
    }

    /**
     * Transforms the date to the previous weekday (Monday through Friday).
     * @returns {DateChain} Returns the chain for method chaining
     * @example
     * date.toPreviousWeekday() // Skip weekends to previous business day
     */
    toPreviousWeekday() {
        return this.addStep('toPreviousWeekday');
    }

    /**
     * Transforms the date to the start of the day (00:00:00.000).
     * @returns {DateChain} Returns the chain for method chaining
     * @example
     * date.toStartOfDay() // Sets time to 00:00:00.000
     */
    toStartOfDay() {
        return this.addStep('toStartOfDay');
    }

    /**
     * Transforms the date to the first day of the month at start of day.
     * @returns {DateChain} Returns the chain for method chaining
     * @example
     * date.toStartOfMonth() // Jan 15 -> Jan 1 00:00:00.000
     */
    toStartOfMonth() {
        return this.addStep('toStartOfMonth');
    }

    /**
     * Transforms the date to the first day of the year at start of day.
     * @returns {DateChain} Returns the chain for method chaining
     * @example
     * date.toStartOfYear() // Any date in 2023 -> Jan 1, 2023 00:00:00.000
     */
    toStartOfYear() {
        return this.addStep('toStartOfYear');
    }

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

export default  DateChain;