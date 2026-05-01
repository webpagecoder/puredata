// AUTO-GENERATED FILE. DO NOT EDIT DIRECTLY.
// Source: lib/handlers/DateHandler.(js|ts) + lib/fields/DateChain.ts
// Run: tsx ./generator/generate-arraychain-definitions.ts

interface DateChainGeneratedMethods {
        /**
        * Validates that the input date occurs strictly after the provided comparison date.
        * @param compareDate Lower-bound date that the input must be after.
        * @returns
        */
        after(compareDate: any): DateChain;

        /**
        * Validates that the input date occurs strictly before the provided comparison date.
        * @param compareDate Upper-bound date that the input must be before.
        * @returns
        */
        before(compareDate: any): DateChain;

        /**
        * Validates that the input date falls within an inclusive min and max date range.
        * @param minDate Inclusive lower-bound date.
        * @param maxDate Inclusive upper-bound date.
        * @returns
        */
        between(minDate: any, maxDate: any): DateChain;

        /**
        * Validates that the input date resolves to a specific UTC day-of-week index.
        * @param dayOfWeek Target UTC day index where Sunday is 0 and Saturday is 6.
        * @returns
        */
        dayOfWeek(dayOfWeek: any): DateChain;

        /**
        * Validates that the input date has the same exact timestamp as the comparison date.
        * @param compareDate Date value to compare against.
        * @returns
        */
        equals(compareDate: any): DateChain;

        /**
        * Validates that the input date falls within a leap year.
        * @returns
        */
        leapYear(): DateChain;

        /**
        * Validates that the input date is not later than the provided maximum date.
        * @param compareDate Maximum allowed date.
        * @returns
        */
        max(compareDate: any): DateChain;

        /**
        * Validates that the input date is not earlier than the provided minimum date.
        * @param compareDate Minimum allowed date.
        * @returns
        */
        min(compareDate: any): DateChain;

        /**
        * Validates that the input date falls on a weekday (Monday through Friday, UTC).
        * @returns
        */
        weekday(): DateChain;

        /**
        * Validates that the input date falls on a weekend day (Saturday or Sunday, UTC).
        * @returns
        */
        weekend(): DateChain;

        /**
        * Returns a new date shifted forward or backward by a whole number of days.
        * @param numDays Whole number of days to add (or subtract if negative).
        * @returns
        */
        addDays(numDays: any): DateChain;

        /**
        * Returns a new date shifted forward or backward by a whole number of hours.
        * @param numHours Whole number of hours to add (or subtract if negative).
        * @returns
        */
        addHours(numHours: any): DateChain;

        /**
        * Returns a new date shifted forward or backward by a whole number of minutes.
        * @param numMinutes Whole number of minutes to add (or subtract if negative).
        * @returns
        */
        addMinutes(numMinutes: any): DateChain;

        /**
        * Returns a new date shifted forward or backward by a whole number of months.
        * @param numMonths Whole number of months to add (or subtract if negative).
        * @returns
        */
        addMonths(numMonths: any): DateChain;

        /**
        * Returns a new date shifted forward or backward by a whole number of years.
        * @param years Whole number of years to add (or subtract if negative).
        * @returns
        */
        addYears(numYears: any): DateChain;

        /**
        * Normalizes a date to the final millisecond of its UTC day.
        * @returns
        */
        toEndOfDay(): DateChain;

        /**
        * Normalizes a date to the final millisecond of its UTC month.
        * @returns
        */
        toEndOfMonth(): DateChain;

        /**
        * Moves a date forward to the next occurrence of the target UTC day of week.
        * @param targetDay Target UTC day index where Sunday is 0 and Saturday is 6.
        * @returns
        */
        toNextDayOfWeek(targetDay: any): DateChain;

        /**
        * Moves a date forward to the next weekday, skipping Saturday and Sunday.
        * @returns
        */
        toNextWeekday(): DateChain;

        /**
        * Moves a date backward to the previous weekday, skipping Saturday and Sunday.
        * @returns
        */
        toPreviousWeekday(): DateChain;

        /**
        * Normalizes a date to the first millisecond of its UTC day.
        * @returns
        */
        toStartOfDay(): DateChain;

        /**
        * Normalizes a date to the first millisecond of the first day of its UTC month.
        * @returns
        */
        toStartOfMonth(): DateChain;

        /**
        * Normalizes a date to the first millisecond of January 1st in its UTC year.
        * @returns
        */
        toStartOfYear(): DateChain;

        clamp(minDate: any, maxDate: any): DateChain;

}

declare module './DateChain.ts' {
    interface DateChain extends DateChainGeneratedMethods {}
}

declare module './DateChain.js' {
    interface DateChain extends DateChainGeneratedMethods {}
}

export { };
