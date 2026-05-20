'use strict';

import { Field, FieldConstructorParams } from './Field.ts';

type EnumStructure = unknown[] | Record<string, unknown>;

export type EnumFieldProps = FieldConstructorParams & {
    structure?: EnumStructure;
};

class EnumField extends Field {
    protected _structure: EnumStructure;
    protected _isArray: boolean;

    constructor(args: EnumFieldProps = {}) {
        super(args);
        const {
            structure = [],
        } = args;

        this._structure = structure;
        this._isArray = Array.isArray(structure);
    }

    public override clone(args: Partial<EnumFieldProps> = {}): this {
        const clone = super.clone(args);
        const {
            structure = this._structure,
        } = args;

        clone._structure = structure;
        clone._isArray = Array.isArray(structure);
        return clone;
    }

}

export { EnumField };