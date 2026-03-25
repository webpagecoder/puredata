// AUTO-GENERATED FILE. DO NOT EDIT DIRECTLY.
// Source: lib/handlers/DateHandler.(js|ts) + lib/fields/DateChain.ts
// Run: tsx ./generator/generate-arraychain-definitions.ts

interface DateChainGeneratedMethods {
        after(afterDate: any): DateChain;

        before(beforeDate: any): DateChain;

        between(minDate: any, maxDate: any): DateChain;

        dayOfWeek(dayOfWeek: any): DateChain;

        equals(compareDate: any): DateChain;

        leapYear(): DateChain;

        max(maxDate: any): DateChain;

        min(minDate: any): DateChain;

        weekday(): DateChain;

        weekend(): DateChain;

        addDays(days: any): DateChain;

        addHours(hours: any): DateChain;

        addMinutes(minutes: any): DateChain;

        addMonths(months: any): DateChain;

        addYears(years: any): DateChain;

        toEndOfDay(): DateChain;

        toEndOfMonth(): DateChain;

        toNextDayOfWeek(targetDay: any): DateChain;

        toNextWeekday(): DateChain;

        toPreviousWeekday(): DateChain;

        toStartOfDay(): DateChain;

        toStartOfMonth(): DateChain;

        toStartOfYear(): DateChain;

}

declare module './DateChain.ts' {
    interface DateChain extends DateChainGeneratedMethods {}
}

declare module './DateChain.js' {
    interface DateChain extends DateChainGeneratedMethods {}
}

export { };
