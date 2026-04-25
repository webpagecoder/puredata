'use strict';

import { MetaDate, MetaDateConstructorParams } from "./MetaDate.ts";

export type IsoNormalizedDateSubType = 'ISO_WEEK' | 'ISO_ORDINAL';

export type IsoNormalizedDateConstructorParams = MetaDateConstructorParams & {
    isBasic?: boolean;
    subType?: IsoNormalizedDateSubType;
};

class IsoNormalizedDate extends MetaDate {

    private _isBasic: boolean;
    private _subType: IsoNormalizedDateSubType | null;

    constructor(props: IsoNormalizedDateConstructorParams) {
        super(props);
        this._isBasic = props.isBasic || false;
        this._subType = props.subType || null;
    }

}
export { IsoNormalizedDate };