'use strict';

import { NormalizedDate, NormalizedDateConstructorParams } from "./NormalizedDate.ts";

export type IsoNormalizedDateSubType = 'ISO_WEEK' | 'ISO_ORDINAL';

export type IsoNormalizedDateConstructorParams = NormalizedDateConstructorParams & {
    isBasic?: boolean;
    subType?: IsoNormalizedDateSubType;
};

class IsoNormalizedDate extends NormalizedDate {

    private _isBasic: boolean;
    private _subType: IsoNormalizedDateSubType | null;

    constructor(props: IsoNormalizedDateConstructorParams) {
        super(props);
        this._isBasic = props.isBasic || false;
        this._subType = props.subType || null;
    }

}
export { IsoNormalizedDate };