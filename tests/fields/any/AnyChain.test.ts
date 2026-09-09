'use strict';

import { AnyChain } from '../../../lib/fields/any/AnyChain.ts';
import { AnyHandler } from '../../../lib/fields/any/AnyHandler.ts';
import { AnyProcessor } from '../../../lib/fields/any/AnyProcessor.ts';
import { HandlerResult } from '../../../lib/fields/HandlerResult.ts';

class CustomAnyHandler extends AnyHandler {
    public append(value: unknown, suffix: string): HandlerResult {
        return HandlerResult.pass(`${String(value)}${suffix}`);
    }
}

describe('AnyChain', () => {
    it('uses default emptyValues and starts with an empty pipeline', () => {
        const chain = new AnyChain();
        chain.config({
            defaultValue: 'default',
            emptyValues: [null, undefined, ''],
        })
        const emptyChain = chain.empty();
        const tracker = emptyChain.process(null);

        expect(tracker.value).toBe(null);
        expect(tracker.pass).toBe(true);
    });

});
