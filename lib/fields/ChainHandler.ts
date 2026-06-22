'use strict';

import { Chain } from "./Chain.ts";

abstract class ChainHandler {
    protected _field: Chain;

    public constructor(field: Chain) {
        this._field = field;
    }

    public get field() {
        return this._field;
    }
 }

export { ChainHandler };
