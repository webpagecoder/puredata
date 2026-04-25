'use strict';

export const Presence = {
    Required: 'required',
    Optional: 'optional',
    Forbidden: 'forbidden',
} as const;

export type Presence = typeof Presence[keyof typeof Presence];

