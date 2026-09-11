'use strict';

import { AnyChain } from '../../../lib/fields/any/AnyChain.ts';
import { AnyHandler } from '../../../lib/fields/any/AnyHandler.ts';
import { HandlerResult } from '../../../lib/fields/HandlerResult.ts';



describe('AnyChain', () => {
    it('uses default emptyValues and starts with an empty pipeline', () => {
        const chain = new AnyChain();
        const configured = chain.config({
            defaultValue: 'default',
            emptyValues: [null, undefined, ''],
        });
        const emptyChain = configured.empty();
        const tracker = emptyChain.process(null);

        expect(tracker.value).toBe(null);
        expect(tracker.pass).toBe(true);
        expect(chain.pipeline).toHaveLength(0);
        expect(emptyChain.pipeline).toHaveLength(1);
    });

    it('throws when addHandlerStep receives a non-handler method name', () => {
        const chain = new AnyChain();
        const addUnknownStep = (): AnyChain => chain.addHandlerStep('missingMethod' as keyof AnyHandler);

        expect(addUnknownStep).toThrow("Method 'missingMethod'(...) not found in chain handler");
    });

    it('uses configured emptyValues for empty and notEmpty checks', () => {
        const chain = new AnyChain().config({
            emptyValues: [null, undefined, false],
        });

        const emptyTracker = chain.empty().process(false);
        const notEmptyTracker = chain.notEmpty().process(false);

        expect(emptyTracker.pass).toBe(true);
        expect(notEmptyTracker.fail).toBe(true);
    });



});
