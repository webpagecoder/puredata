'use strict';

const HtmlFormatter = require("./HtmlFormatter");

class HtmlDescriptionFormatter extends HtmlFormatter{
    constructor() {
        super();
        this.className = 'description';
    }
}

module.exports = HtmlDescriptionFormatter;