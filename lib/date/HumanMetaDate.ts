'use strict';

import { MetaDate, MetaDateConstructorParams } from "./MetaDate.ts";

export type HumanMetaDateType = 'MDY' | 'DMY' | 'YMD';

export type HumanMetaDateConstructorParams = MetaDateConstructorParams & {
    isBasic?: boolean;
    dateOrder?: HumanMetaDateType;
};

class HumanMetaDate extends MetaDate {

    private _isBasic: boolean;
    private _dateOrder: HumanMetaDateType;

    constructor(props: HumanMetaDateConstructorParams) {
        super(props);
        this._isBasic = props.isBasic || false;
        this._dateOrder = props.dateOrder || 'MDY';
    }

}
export { HumanMetaDate };