
'use strict';

import { Field } from './Field.ts';
import { ValueField } from './ValueField.ts';



class ConditionalField extends Field {

    constructor(props = {}) {
        super(props);

        const {
            comparisonField,
            areEqual = true,
            thenResult = undefined,
            otherwiseResult = undefined,
            stage = 0,
            chain = [],
        } = props;

        Object.assign(this.extendedProps, {
            comparisonField,
            areEqual,
            thenResult,
            otherwiseResult,
            stage,
            chain
        });
    }

    _process(tracker, state) {
        const chosenField = this.getChosenField(tracker, state);
        chosenField.process(tracker, state);
        return tracker;
    }


    getChosenField(tracker, state) {
        const { thenResult, otherwiseResult } = this.extendedProps;
        const booleanResult = this.execute(tracker, state);

        let chosenField;
        if (booleanResult) {
            chosenField = thenResult.isConditionalField
                ? thenResult.execute(tracker, state)
                : thenResult;
        }
        else {
            chosenField = otherwiseResult.isConditionalField
                ? otherwiseResult.execute(tracker, state)
                : otherwiseResult;
        }
        return chosenField;
    }

    execute(tracker, state) {
        const { areEqual, chain, comparisonField } = this.extendedProps;

        comparisonField.process(tracker, state);

        let booleanValue = tracker.isPass();
        if (!areEqual) {
            booleanValue = !booleanValue;
        }

        for (let [type, conditional] of chain) {
            if (type === 'and') {
                booleanValue = booleanValue && this.internalMeta.get(conditional).execute(tracker, state);
            }
            else {
                booleanValue = booleanValue || this.internalMeta.get(conditional).execute(tracker, state);
            }
        }
        return booleanValue;
    }

    or(conditional) {
        if (this.extendedProps.stage !== 0) {
            throw new Error('Illegal placement of "or" in conditional chain');
        }
        return this.clone({
            chain: this.extendedProps.chain.concat([['or', conditional]])
        });
    }

    and(conditional) {
        if (this.extendedProps.stage !== 0) {
            throw new Error('Illegal placement of "and" in conditional chain');
        }
        return this.clone({
            chain: this.extendedProps.chain.concat([['and', conditional]])
        });
    }

    then(thenResult) {
        if (this.extendedProps.stage !== 0) {
            throw new Error('Illegal placement of "then" in conditional chain');
        }
        return this.clone({
            thenResult: thenResult instanceof Field
                ? thenResult
                : new ValueField({ value: thenResult, processorMapper: this.extendedProps.processorMapper }),
            stage: 1
        });
    }

    otherwise(otherwiseResult) {
        if (this.extendedProps.stage !== 1) {
            throw new Error('Illegal placement of "otherwise" in conditional chain');
        }
        return this.clone({
            otherwiseResult: otherwiseResult instanceof Field
                ? otherwiseResult
                : new ValueField({ value: otherwiseResult , processorMapper: this.extendedProps.processorMapper}),
            stage: 2
        });
    }

}

export { ConditionalField };











// get internalEntities() {
//     const { comparisonField, chain, thenResult, otherwiseResult } = this.props;

//     const fields = new Set();
//     fields.add(comparisonField);
//     for (const [, conditionalField] of chain) {
//         fields.add(conditionalField);
//     }
//     if (thenResult) {
//         if (thenResult instanceof ConditionalField) {
//             for (const field of thenResult.internalEntities) {
//                 fields.add(field);
//             }
//         }
//         else {
//             fields.add(thenResult);
//         }
//     }
//     if (otherwiseResult) {
//         if (otherwiseResult instanceof ConditionalField) {
//             for (const field of otherwiseResult.internalEntities) {
//                 fields.add(field);
//             }
//         }
//         else {
//             fields.add(otherwiseResult);
//         }
//     }
//     return fields;
// }

