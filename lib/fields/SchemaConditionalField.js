'use strict';

import ConditionalField from './ConditionalField.js';


class SchemaConditionalField extends ConditionalField {

    constructor(props = {}) {
        super(props);
        this.props.referencePath = props.referencePath;
    }

    // compile(context = {}) {

    //     const localRootContext = Object.assign({}, context, { isLocalRoot: true });

    //     const { comparisonField, chain, thenResult, otherwiseResult } = this.props;

    //     const clone = this.clone();
    //     Object.assign(clone.props, {
    //         comparisonField: comparisonField.compile(localRootContext) ,
    //         chain: chain.map(
    //             ([operator, entity]) => [operator, entity.compile(localRootContext)]
    //         ),
    //         thenResult: thenResult.compile(localRootContext),
    //         otherwiseResult: otherwiseResult.compile(localRootContext),
    //     });
        
    //     return this.setCompiledSelf(clone)
    // }

}

export default SchemaConditionalField;

