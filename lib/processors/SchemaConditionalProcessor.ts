'use strict';

import { Field } from '../fields/Field.ts';
import { SchemaConditionalField } from '../fields/SchemaConditionalField.ts';
import { ValueField } from '../fields/ValueField.ts';
import { Locale } from '../Locale.ts';
import { ValueTracker } from '../tracker/ValueTracker.ts';
import { CompilationContext, Processor } from './Processor.ts';

class SchemaConditionalProcessor extends Processor<SchemaConditionalField> {

    public override actualProcess(tracker: ValueTracker) {

        const { buildStage, comparisonField, thenField, otherwiseField, conditionalChain, targetPath } = this._field.extendedProps;

        if (buildStage !== 2) {
            throw new Error('Conditionals must contain a complete then/otherwise pair');
        }
        for (const [, conditionalField] of conditionalChain) {
            if (conditionalField.extendedProps.buildStage !== 0) {
                throw new Error('Compound conditionals cannot contain then/otherwise');
            }
        }

        let referencedValueTracker = targetPath.isSelf
            ? tracker
            : tracker.parent.getNodeByPath(targetPath);

        if(!referencedValueTracker) {
            //todo: should fail like this in regular reference processors too.
            throw new Error('Cannot find referenced tracker in conditional: ' + targetPath);
        }

        referencedValueTracker = this.process2(referencedValueTracker.clone());


        const { areEqual, conditionalChain, comparisonField } = this._field.extendedProps;

        const finalTracker = comparisonField.process(tracker);

        let booleanValue = finalTracker.pass
        if (!areEqual) {
            booleanValue = !booleanValue;
        }

        for (let [type, conditional] of conditionalChain) {
            if (type === 'and') {
                booleanValue = booleanValue && this.internalMeta.get(conditional).execute(tracker);
            }
            else {
                booleanValue = booleanValue || this.internalMeta.get(conditional).execute(tracker);
            }
        }








        let chosenField: Field;
        if (booleanResult) {
            chosenField = thenField.isSchemaConditionalField
                ? thenField.execute(tracker)
                : thenField;
        }
        else {
            chosenField = otherwiseField.isSchemaConditionalField
                ? otherwiseField.execute(tracker)
                : otherwiseField;
        }


        // const chosenField = this.getChosenField(tracker);

        chosenField.process(tracker);

        return tracker;
    }


    public override process2(tracker: ValueTracker) {
        const { areEqual, conditionalChain, comparisonField } = this._field.extendedProps;

        const finalTracker = comparisonField.process(tracker);

        let booleanValue = finalTracker.pass
        if (!areEqual) {
            booleanValue = !booleanValue;
        }

        for (let [type, conditional] of conditionalChain) {
            if (type === 'and') {
                booleanValue = booleanValue && this.internalMeta.get(conditional).execute(tracker);
            }
            else {
                booleanValue = booleanValue || this.internalMeta.get(conditional).execute(tracker);
            }
        }
        return finalTracker;
    }

    // protected getChosenField(tracker: ValueTracker): Field {
    //     const { thenField, otherwiseField } = this._field.extendedProps;
    //     const booleanResult = this.execute(tracker);

    //     let chosenField;
    //     if (booleanResult) {
    //         chosenField = thenField.isSchemaConditionalField
    //             ? thenField.execute(tracker)
    //             : thenField;
    //     }
    //     else {
    //         chosenField = otherwiseField.isSchemaConditionalField
    //             ? otherwiseField.execute(tracker)
    //             : otherwiseField;
    //     }
    //     return chosenField;
    // }


}

export { SchemaConditionalProcessor };