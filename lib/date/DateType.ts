'use strict';

export const DateType = ['human', 'iso', 'isoWeek', 'isoOrdinal', 'object', 'timestamp'] as const;
export type DateType = typeof DateType[number];