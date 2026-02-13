'use strict';

import HtmlFormatter  from './HtmlFormatter.js';

class HtmlDescriptionFormatter extends HtmlFormatter{
    constructor() {
        super();
        this.className = 'description';
    }
}

export default  HtmlDescriptionFormatter;