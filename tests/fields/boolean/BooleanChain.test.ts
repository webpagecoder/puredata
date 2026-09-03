'use strict';

import { BooleanChain, BooleanChainConfig } from '../../../lib/fields/boolean/BooleanChain.ts';

describe('BooleanChain', () => {

    let boolishPairs: [truthy: unknown, falsy: unknown][];

    beforeEach(() => {
        boolishPairs = [['yes', 'no'], [1, 0]];
    });

    it('truthy validates boolean values when autoConvert is disabled', () => {
        const chain = new BooleanChain({ autoConvert:true, boolishPairs, postConvert: false }).truthy();

        // const passTracker = chain.process(true);
        // expect(passTracker.pass).toBe(true);
        // expect(passTracker.value).toBe(true);

        // const failTracker = chain.process(false);
        // expect(failTracker.fail).toBe(true);

        chain.config({
boolishPairs: [['yes', 'no'], [1, 0]],
            autoConvert: false,
            postConvert: false
        });

        const passTracker2 = chain.process('yes');
        expect(passTracker2.value).toBe('yes');
        expect(passTracker2.pass).toBe(true);


        // chain.config({ autoConvert: true });
    });

    // it('falsy honors configured boolish values', () => {
    //     const chain = new BooleanChain({ autoConvert: false })
    //         .configBoolish(true, [['yes', 'no'], [1, 0]])
    //         .falsy();

    //     const passNo = chain.process('no');
    //     expect(passNo.pass).toBe(true);
    //     expect(passNo.value).toBe('no');

    //     const passZero = chain.process(0);
    //     expect(passZero.pass).toBe(true);
    //     expect(passZero.value).toBe(0);

    //     const failYes = chain.process('yes');
    //     expect(failYes.fail).toBe(true);
    //     expect(failYes.errors.errors[0]?.errorKey).toBe('boolean/falsy');
    // });

    // it('invert flips native booleans', () => {
    //     const chain = new BooleanChain({}).invert();

    //     const trueResult = chain.process(true);
    //     expect(trueResult.pass).toBe(true);
    //     expect(trueResult.value).toBe(false);

    //     const falseResult = chain.process(false);
    //     expect(falseResult.pass).toBe(true);
    //     expect(falseResult.value).toBe(true);
    // });

    // it('invert uses configured boolish pairs when autoConvert is disabled', () => {
    //     const chain = new BooleanChain({ autoConvert: false })
    //         .configBoolish(true, [['Y', 'N']])
    //         .invert();

    //     const yResult = chain.process('Y');
    //     expect(yResult.pass).toBe(true);
    //     expect(yResult.value).toBe('N');

    //     const nResult = chain.process('N');
    //     expect(nResult.pass).toBe(true);
    //     expect(nResult.value).toBe('Y');
    // });

    // it('fails with boolean/base before validators when value cannot be converted', () => {
    //     const chain = new BooleanChain({ autoConvert: false }).truthy();

    //     const result = chain.process('true');
    //     expect(result.fail).toBe(true);
    //     expect(result.errors.errors[0]?.errorKey).toBe('boolean/base');
    // });

    // it('uses chain-level errorText overrides for boolean errors', () => {
    //     const chain = new BooleanChain({ autoConvert: false })
    //         .truthy()
    //         .errorText({ 'boolean/truthy': 'Need a truthy boolean-like value' });

    //     const result = chain.process(false);
    //     expect(result.fail).toBe(true);
    //     expect(result.errors.errors[0]?.text).toBe('Need a truthy boolean-like value');
    // });
});
