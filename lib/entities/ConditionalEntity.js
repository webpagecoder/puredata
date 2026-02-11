
'use strict';

const ValueNode = require('../tracker/ValueNode.js');
const Entity = require('./Entity.js');
const StaticValue = require('./values/StaticValue.js');



class ConditionalEntity extends Entity {

    constructor(props = {}) {
        super(props);

        const {
            comparisonEntity,
            areEqual = true,
            thenResult = undefined,
            otherwiseResult = undefined,
            stage = 0,
            chain = [],
        } = props;

        Object.assign(this.props, {
            comparisonEntity,
            areEqual,
            thenResult,
            otherwiseResult,
            stage,
            chain
        });
    }

    _process(tracker, state) {
        const chosenEntity = this.getChosenEntity(tracker, state);
        chosenEntity.process(tracker, state);
        return tracker;
    }


    getChosenEntity(tracker, state) {
        const { thenResult, otherwiseResult } = this.props;
        const booleanResult = this.execute(tracker, state);

        let chosenEntity;
        if (booleanResult) {
            chosenEntity = thenResult.isConditionalEntity
                ? thenResult.execute(tracker, state)
                : thenResult;
        }
        else {
            chosenEntity = otherwiseResult.isConditionalEntity
                ? otherwiseResult.execute(tracker, state)
                : otherwiseResult;
        }
        return chosenEntity;
    }

    execute(tracker, state) {
        const { areEqual, chain, comparisonEntity } = this.props;

        comparisonEntity.process(tracker, state);

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
        if (this.props.stage !== 0) {
            throw new Error('Illegal placement of "or" in conditional chain');
        }
        return this.setProps({
            chain: this.props.chain.concat([['or', conditional]])
        });
    }

    and(conditional) {
        if (this.props.stage !== 0) {
            throw new Error('Illegal placement of "and" in conditional chain');
        }
        return this.setProps({
            chain: this.props.chain.concat([['and', conditional]])
        });
    }

    then(thenResult) {
        if (this.props.stage !== 0) {
            throw new Error('Illegal placement of "then" in conditional chain');
        }
        return this.setProps({
            thenResult: thenResult instanceof Entity
                ? thenResult
                : new StaticValue({ value: thenResult, compilationMapper: this.props.compilationMapper }),
            stage: 1
        });
    }

    otherwise(otherwiseResult) {
        if (this.props.stage !== 1) {
            throw new Error('Illegal placement of "otherwise" in conditional chain');
        }
        return this.setProps({
            otherwiseResult: otherwiseResult instanceof Entity
                ? otherwiseResult
                : new StaticValue({ value: otherwiseResult , compilationMapper: this.props.compilationMapper}),
            stage: 2
        });
    }

}

module.exports = ConditionalEntity;











// get internalEntities() {
//     const { comparisonEntity, chain, thenResult, otherwiseResult } = this.props;

//     const entities = new Set();
//     entities.add(comparisonEntity);
//     for (const [, conditionalEntity] of chain) {
//         entities.add(conditionalEntity);
//     }
//     if (thenResult) {
//         if (thenResult instanceof ConditionalEntity) {
//             for (const entity of thenResult.internalEntities) {
//                 entities.add(entity);
//             }
//         }
//         else {
//             entities.add(thenResult);
//         }
//     }
//     if (otherwiseResult) {
//         if (otherwiseResult instanceof ConditionalEntity) {
//             for (const entity of otherwiseResult.internalEntities) {
//                 entities.add(entity);
//             }
//         }
//         else {
//             entities.add(otherwiseResult);
//         }
//     }
//     return entities;
// }

