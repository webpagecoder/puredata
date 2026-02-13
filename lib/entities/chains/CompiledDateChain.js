'use strict';

import Entity  from '../Entity.js';
import CompiledMixin  from '../CompiledMixin.js';
import ValueNode  from '../../tracker/ValueNode.js';
import CompiledEntity  from '../CompiledEntity.js';
import CompiledGenericChain  from './CompiledGenericChain.js';
import NumberUtils  from '../../utils/NumberUtils.js';
import DateUtils  from '../../utils/DateUtils.js';

class CompiledDateChain extends CompiledGenericChain {


    ensureEmptyQueue(type) {
        if (this.entity.props.pipeline.length > 0) {
            throw new Error(type + ' processor must be the first processor in the chain, if used.');
        }
    }

    preProcess(tracker, state = {}) {
        const {entity} = this.props;
        const { inputType } = entity.props;
        
        state.originalValue = tracker.getValue();
        if (inputType) {
            state.inputType = inputType;
        }
        else {
            const parsedDate = DateUtils.parse(tracker.getValue());
            if (!parsedDate) {
                return tracker.addError('date/date');
            }
            else {
                state.inputType = parsedDate.type;
                tracker.setValue(parsedDate.date);
            }
        }
    }

    postProcess(tracker, state = {}) {
        const {entity} = this.props;
        const { inputType } = state;
        const outputType = entity.props.outputType || inputType;

        switch (outputType) {
            case DATE_TYPES.ISO:
                tracker.setValue(DateUtils.toIso(tracker.getValue()));
                break;
            case DATE_TYPES.ISO_WEEK:
                tracker.setValue(DateUtils.toIsoWeek(tracker.getValue()));
                break;
            case DATE_TYPES.ISO_ORDINAL:
                tracker.setValue(DateUtils.toIsoOrdinal(tracker.getValue()));
                break;
            case DATE_TYPES.TIMESTAMP:
                tracker.setValue(DateUtils.toTimestamp(tracker.getValue()));
                break;
        }
    }


}

export default  CompiledDateChain;