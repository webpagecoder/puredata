'use strict';

const ValueNode = require("../tracker/ValueNode");
const CompiledEntity = require("./CompiledEntity");
const SchemaConditionalEntity = require("./SchemaConditionalEntity");

class CompiledSchemaConditionalEntity extends CompiledEntity {


    //todo - constructor should save compilationMapper - its not passed thru context anymore it is contsuctored.

    compile(context = {}) {
        super.compile(context);

        const { entity, compilationMapper } = this.props;

        const { comparisonEntity, chain, thenResult, otherwiseResult } = entity.props;

        const clone = entity.clone();
        Object.assign(clone.props, {
            comparisonEntity: compilationMapper.createCompiledEntity(comparisonEntity.clone()),
            chain: chain.map(
                ([operator, entity]) => [operator, compilationMapper.createCompiledEntity(entity.clone())]
            ),
            thenResult: compilationMapper.createCompiledEntity(thenResult.clone()),
            otherwiseResult: compilationMapper.createCompiledEntity(otherwiseResult.clone()),
        });

        this.entity = clone;

        return this;
    }

    process(tracker) {

        const { entity } = this.props;
        const { chain, stage, comparisonEntity, referencePath: { path } } = entity.props;

        if (stage !== 2) {
            throw new Error('Conditionals must contain a complete then/otherwise pair')
        }
        for (const [, conditionalEntity] of chain) {
            if (conditionalEntity.props.stage !== 0) {
                throw new Error('Compound conditionals cannot contain then/otherwise')
            }
        }


        const referencedValueNode = path.isSelf ? tracker : tracker.parent.getNodeByPath(path, this);

        const testValueNode = new ValueNode(referencedValueNode.value, {
            compiledEntity: this,
            parent: tracker.parent,
            root: tracker.root,
            
        });

        const chosenEntity = entity.getChosenEntity(testValueNode);

        chosenEntity.process(tracker);

        return tracker;
    }

}

module.exports = CompiledSchemaConditionalEntity;