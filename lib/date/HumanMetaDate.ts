'use strict';

import { NormalizedDate, NormalizedDateConstructorParams } from "./NormalizedDate.ts";

export type HumanNormalizedDateType = 'MDY' | 'DMY' | 'YMD';

export type HumanNormalizedDateConstructorParams = NormalizedDateConstructorParams & {
    isBasic?: boolean;
    dateOrder?: HumanNormalizedDateType;
};

class HumanNormalizedDate extends NormalizedDate {

    private _isBasic: boolean;
    private _dateOrder: HumanNormalizedDateType;

    constructor(props: HumanNormalizedDateConstructorParams) {
        super(props);
        this._isBasic = props.isBasic || false;
        this._dateOrder = props.dateOrder || 'MDY';
    }

}
export { HumanNormalizedDate };