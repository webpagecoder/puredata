// @ts-nocheck
'use strict';

import { ValueTracker } from '../tracker/ValueTracker.ts';
import { Processor } from './Processor.ts';

class SchemaConditionalProcessor extends Processor {


    //todo - constructor should save compilationMapper - its not passed thru context anymore it is contsuctored.

    compile(context = {}) {
        super.compile(context);

        const { field, compilationMapper } = this.props;

        const { comparisonField, chain, thenResult, otherwiseResult } = field.props;

        const clone = field.clone();
        Object.assign(clone.props, {
            comparisonField: compilationMapper.createProcessor(comparisonField.clone()),
            chain: chain.map(
                ([operator, field]) => [operator, compilationMapper.createProcessor(field.clone())]
            ),
            thenResult: compilationMapper.createProcessor(thenResult.clone()),
            otherwiseResult: compilationMapper.createProcessor(otherwiseResult.clone()),
        });

        this.field = clone;

        return this;
    }

    process(tracker) {

        const { field } = this.props;
        const { chain, stage, comparisonField, referencePath: { path } } = field.props;

        if (stage !== 2) {
            throw new Error('Conditionals must contain a complete then/otherwise pair')
        }
        for (const [, conditionalField] of chain) {
            if (conditionalField.props.stage !== 0) {
                throw new Error('Compound conditionals cannot contain then/otherwise')
            }
        }


        const referencedValueTracker = path.isSelf ? tracker : tracker.parent.getNodeByPath(path, this);

        const testValueTracker = new ValueTracker(referencedValueTracker.value, {
            compiledField: this,
            parent: tracker.parent,
            root: tracker.root,
            
        });

        const chosenField = field.getChosenField(testValueTracker);

        chosenField.process(tracker);

        return tracker;
    }

}

export { SchemaConditionalProcessor };