'use strict';

const HtmlFormatter = require("./HtmlFormatter");

class HtmlErrorFormatter extends HtmlFormatter{
    constructor() {
        super();
        this.className = 'errors';
    }
}

module.exports = HtmlErrorFormatter;