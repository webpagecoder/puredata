'use strict';

import { Field, FieldConstructorProps } from './Field.ts';

type EnumStructure = unknown[] | Record<string, unknown>;

export type EnumFieldProps = FieldConstructorProps & {
    structure?: EnumStructure;
};

class EnumField extends Field {
    protected _structure: EnumStructure;
    protected _isArray: boolean;

    constructor(props: EnumFieldProps = {}) {
        super(props);
        const {
            structure = [],
        } = props;

        this._structure = structure;
        this._isArray = Array.isArray(structure);
    }

    public override clone(props: Partial<EnumFieldProps> = {}): this {
        const clone = super.clone(props);
        const {
            structure = this._structure,
        } = props;

        clone._structure = structure;
        clone._isArray = Array.isArray(structure);
        return clone;
    }

}

export { EnumField };