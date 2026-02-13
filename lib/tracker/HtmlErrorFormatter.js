'use strict';

import HtmlFormatter from './HtmlFormatter.js';;

class HtmlErrorFormatter extends HtmlFormatter{
    constructor() {
        super();
        this.className = 'errors';
    }
}

export default HtmlErrorFormatter;