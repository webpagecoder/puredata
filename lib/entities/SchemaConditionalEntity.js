'use strict';

const ValueNode = require('../tracker/ValueNode.js');
const ConditionalEntity = require('./ConditionalEntity.js');


class SchemaConditionalEntity extends ConditionalEntity {

    constructor(props = {}) {
        super(props);
        this.props.referencePath = props.referencePath;
    }

    // compile(context = {}) {

    //     const localRootContext = Object.assign({}, context, { isLocalRoot: true });

    //     const { comparisonEntity, chain, thenResult, otherwiseResult } = this.props;

    //     const clone = this.clone();
    //     Object.assign(clone.props, {
    //         comparisonEntity: comparisonEntity.compile(localRootContext) ,
    //         chain: chain.map(
    //             ([operator, entity]) => [operator, entity.compile(localRootContext)]
    //         ),
    //         thenResult: thenResult.compile(localRootContext),
    //         otherwiseResult: otherwiseResult.compile(localRootContext),
    //     });
        
    //     return this.setCompiledSelf(clone)
    // }

}

module.exports = SchemaConditionalEntity;

