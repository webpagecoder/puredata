// @ts-nocheck
'use strict';

import HtmlFormatter from './HtmlFormatter.ts';

class HtmlDescriptionFormatter extends HtmlFormatter{
    constructor() {
        super();
        this.className = 'description';
    }
}

export default HtmlDescriptionFormatter;