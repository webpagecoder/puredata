'use strict';

class BaseCommand {
    execute() {
        throw new Error('Command execute method must be defined');
    }
}

export default  BaseCommand;
