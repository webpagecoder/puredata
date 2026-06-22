'use strict';

export const Presence = {
    required: 'required',
    optional: 'optional',
    forbidden: 'forbidden',
} as const;

export type Presence = typeof Presence[keyof typeof Presence];

