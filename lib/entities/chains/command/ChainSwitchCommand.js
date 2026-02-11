'use strict';

const BaseCommand = require('./BaseCommand');

class ChainSwitchCommand extends BaseCommand {
    constructor(chain, parentChain) {
        super();
        this.chain = chain;
        this.parentChain = parentChain;
    }

    execute(chain, tracker) {
       this.chain._process({tracker});
    }
}

module.exports = ChainSwitchCommand;
