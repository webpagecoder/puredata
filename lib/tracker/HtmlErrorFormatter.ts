// @ts-nocheck
'use strict';

import HtmlFormatter from './HtmlFormatter.ts';

class HtmlErrorFormatter extends HtmlFormatter{
    constructor() {
        super();
        this.className = 'errors';
    }
}

export default HtmlErrorFormatter;