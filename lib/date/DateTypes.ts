'use strict';

export type DateType = 'human' | 'iso' | 'isoWeek' | 'isoOrdinal' | 'object' | 'timestamp';
export type DateOrder = 'MDY' | 'DMY' | 'YMD';
export type GenericDateInput = Date | string | number;
export type DayOfWeek = 0 | 1 | 2 | 3 | 4 | 5 | 6;