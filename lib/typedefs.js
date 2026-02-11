
'use strict';

/**
 * @typedef {function} intFn
 * Checks if the string is an integer.
 * EXAMPLE(S): 0, 55, 12938, -132, +0
 * @param {string|number} x - String to test
 * @param {object} options - Optional params
 * @param {SignPresence} options.signs - (STRING ONLY) Presence of a +/- sign
 * @param {Presence} options.zeroDec
 * (STRING ONLY) Presence of a "zero-equivalent" decimal (like 12. or 11.000000)
 * @returns {string|false}
 */

/**
 * @typedef {'o'|'r'|'n'} Presence - 'o' is optional, 'r' is required, 'n' is not allowed
 */

/**
 * @typedef {'p'|'m'|'o'|'n'|'r'} SignPresence
 * p = + only allowed
 * m = - only allowed
 * o = both allowed
 * n = neither allowed
 * r = either required
 */

/**
 * @typedef {'yyyymmdd'|'yyyy-mm-dd'|'yyyy-m-d'|'yy-mm-dd'|'yy-m-d'|'mm-dd-yyyy'|'m-d-yyyy'|'mm-dd-yy'|
* 'm-d-yy'|'dd-mm-yyyy'|'d-m-yyyy'|'dd-mm-yy'|'d-m-yy'|'d-mmm-yyyy'|'dd-mmm-yyyy'|'d-mmm-yy'|'dd-mmm-yy'|
* 'mmm d, yyyy'|'mmm dd, yyyy'|'ddd, mmm d, yyyy'|'ddd, mmm dd, yyyy'|'ddd, d mmm yyyy'|'ddd, dd mmm yyyy'} DatePattern
* String representation of date formats.
*/

/**
* @typedef {DatePattern[]} DatePatterns
* Array of allowable date patterns. NOTE: Use dashes as illustrated to define your patterns.
* To change *actual* allowed delimiters, set the delims option.
*/


/**
* @typedef {object} StringMatching
* String match matchuration options. These type of configurations are used on some, but not most functions.
* To illustrate the match options, we will give example(s) using an International Standard Recording Code (ISRC).
* An ISRC is a code for uniquely identifying sound and music video recordings.
* A properly formatted sample ISRC code is: US-RC1-76-07839
* The options in this match object allow you to tighten or loosen your match to a great degree.
* @property {boolean} plain - Allow plain, no delimiter formatting: USRC17607839
* @property {string} delims
* A string containing allowable delimiters. By default, we allow dashes and empty spaces: ' -'
* These would be allowable formats for the ISRC code with dashes or spaces: US-RC1-76-07839, US RC1 76 07839
* Note: For some functions, we add additional delimiters (such as colons for MAC addresses). You can change delims
* for any functions as needed.
* @property {boolean} consistent
* If true, we only allow consistent delimiters in the string.
* These would not be valid: US-RC1 76-07839 (dashes and spaces), US RC1.76.07839 (spaces and dots).
* Set to false to allow for mixing of delimiters.
* @property {boolean} ignoreCase
* Whether to ignore case or not when checking strings for a match.
* If ignoreCase is true, then any casing is valid: us-rc1-76-07839, uS-Rc1-76-07839
* A normalizer function would normally be used to get these strings into a consistent format after match.
* @property {loose} loose
* Allow a loose match. A loose match allows for delimiters to be in areas where they normally wouldn't be. This is
* useful if there isn't a single agreed-upon format or if a user isn't expected to necessarily know the correct format.
* Delimiters are NOT allowed before or after the string, and multiple delimiters CANNOT be adjacent to each other. A
* normalizer function can clean this up to a proper format.
* EXAMPLE(S): USRC1-76-0783-9, USRC1 76 07 83 9, US-RC1-7607839
* @property {boolean} normalize
* Run a normalizer function for the validation function. Given the vast amount of match possibilities (especially if
* loose is enabled) a normalizer is often needed. A normalizer function *generally* would receive a
* capitalized, non-delimited string of characters to format. Check the existing normalizer function for specifics.
* If the normalizer is called on an ISAN, it would receive the string USRC17607839. (YES! Even if you set the abs
* most loose match type there is (loose: true, ignoreCase: true, consistent: false) an ISAN like the
* following: uS   -Rc------ 1 7607 8 39---- would be transformed automatically into: USRC17607839 before being passed
* to the normalizer function). The normalizer function for an ISAN would then return USRC17607839 into its
* standardized format: US-RC1-76-07839
*/


/**
* @typedef {object} StrMatchResult
* The result from testing a string for a match
* @property {null|'e'|'o'|'p'|'l'} match
* The match type that occurred with the regex pattern
* null = no match type
* 'e' = exact match
* 'o' = match using the other match.delims delimiters
* 'p' = plain match (no delimiters used)
* 'l' = loose match (user input stripped of any delims and then compared to plain regex)
* @property {string} str
* The original user string that was accepted
* @property {string} strippedStr
* The string stripped of any delimiters
*/
