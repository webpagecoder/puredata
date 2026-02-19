'use strict';

import ValueNode from '../../tracker/ValueNode.js';
import Processor from './Processor.js';

class SchemaConditionalProcessor extends Processor {


    //todo - constructor should save compilationMapper - its not passed thru context anymore it is contsuctored.

    compile(context = {}) {
        super.compile(context);

        const { entity, compilationMapper } = this.props;

        const { comparisonField, chain, thenResult, otherwiseResult } = entity.props;

        const clone = entity.clone();
        Object.assign(clone.props, {
            comparisonField: compilationMapper.createProcessor(comparisonField.clone()),
            chain: chain.map(
                ([operator, entity]) => [operator, compilationMapper.createProcessor(entity.clone())]
            ),
            thenResult: compilationMapper.createProcessor(thenResult.clone()),
            otherwiseResult: compilationMapper.createProcessor(otherwiseResult.clone()),
        });

        this.entity = clone;

        return this;
    }

    process(tracker) {

        const { entity } = this.props;
        const { chain, stage, comparisonField, referencePath: { path } } = entity.props;

        if (stage !== 2) {
            throw new Error('Conditionals must contain a complete then/otherwise pair')
        }
        for (const [, conditionalField] of chain) {
            if (conditionalField.props.stage !== 0) {
                throw new Error('Compound conditionals cannot contain then/otherwise')
            }
        }


        const referencedValueNode = path.isSelf ? tracker : tracker.parent.getNodeByPath(path, this);

        const testValueNode = new ValueNode(referencedValueNode.value, {
            compiledField: this,
            parent: tracker.parent,
            root: tracker.root,
            
        });

        const chosenField = entity.getChosenField(testValueNode);

        chosenField.process(tracker);

        return tracker;
    }

}

export default  SchemaConditionalProcessor;