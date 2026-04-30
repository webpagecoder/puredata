'use strict';

export const Presence = [
    'required',
    'optional',
    'forbidden',
] as const;

export type Presence = typeof Presence[number];

