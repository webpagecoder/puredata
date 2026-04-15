'use strict';

import { MetaDate, MetaDateConstructorParams } from "./MetaDate.ts";

export type IsoMetaDateSubType = 'ISO_WEEK' | 'ISO_ORDINAL';

export type IsoMetaDateConstructorParams = MetaDateConstructorParams & {
    isBasic?: boolean;
    type?: IsoMetaDateSubType;
};

class IsoMetaDate extends MetaDate {

    private _isBasic: boolean;
    private _subType: IsoMetaDateSubType | null;

    constructor(props: IsoMetaDateConstructorParams) {
        super(props);
        this._isBasic = props.isBasic || false;
        this._subType = props.type || null;
    }

}
export { IsoMetaDate };