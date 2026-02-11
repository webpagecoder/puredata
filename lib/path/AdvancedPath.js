// 'use strict';

// const StringUtils = require('../utils/StringUtils.js');
// const RegexCache = require('../cache/RegexCache.js');
// const Path = require('./PathFactory.js');

// class AdvancedPath extends Path{

//     static createPathString({
//         chars,
//         isRoot,
//         isSelf,
//         upCount,
//         pathKeys
//     }) {
//         return (isSelf
//             ? chars.self
//             : (isRoot
//                 ? chars.delim
//                 : chars.up.repeat(upCount)))
//             + pathKeys.join(chars.delim);
//     }

//     static create(pathStr, { delim, up, self }) {
//         if(typeof pathStr !== 'string') {
//             throw new TypeError('Path string must be a string');
//         }
//         pathStr = pathStr.trim();
//         const path = new this();
//         const upEsc = StringUtils.escapeForRegex(up);
//         path.chars = {
//             delim,
//             up,
//             self
//         };

//         const pathRegex = RegexCache(`^(${upEsc}*)([^${upEsc}]*)$`).exec(pathStr);
//         if (!pathRegex) {
//             throw new Error('Invalid path format');
//         }

//         let [, upPortion, pathPortion] = pathRegex;
//         const isRoot = pathPortion[0] === delim;
//         const isSelf = pathStr === self;

//         Object.assign(path, {
//             isRoot,
//             isSelf,
//         });

//         if (isSelf) {
//             path.pathKeys = [];
//             path.upCount = 0;
//         }
//         else {
//             const normalizedPath = StringUtils.trim(StringUtils.collapseRepeats(pathPortion, delim), delim);
//             path.pathKeys = normalizedPath.length ? normalizedPath.split(delim) : [];
//             path.upCount = isRoot ? 0 : upPortion.length;
//         }
//         path.path = path.toString();
//         return path;
//     }

//     isAncestorOf(otherPath) {
//         if (!this.isRoot || !otherPath.isRoot) {
//             throw new Error('Only root paths can be compared as ancestors');
//         }
//         return otherPath.path.indexOf(this.path) === 0;
//     }

//     move(pathMovement) {
//         const {
//             chars,
//             isRoot: originalIsRoot,
//             isSelf: originalIsSelfReference,
//             pathKeys: originalPathComponents,
//             upCount: originalUpCount
//         } = this;

//         const {
//             isRoot: movementIsRoot,
//             isSelf: movementIsSelfReference,
//             pathKeys: movementPathComponents,
//             upCount: movementUpCount
//         } = pathMovement;

//         if (movementIsSelfReference) {
//             return this.clone();
//         }
//         else if (originalIsSelfReference || movementIsRoot) {
//             return pathMovement.clone();
//         }

//         if (originalIsRoot) {
//             if (movementUpCount > originalPathComponents.length) {
//                 throw new Error('Path upward movement exceeds depth of root: ' + this);
//             }
//             return AdvancedPath.create(AdvancedPath.createPathString({
//                 chars,
//                 isRoot: true,
//                 isSelf: false,
//                 upCount: 0,
//                 pathKeys:
//                     movementUpCount > 0
//                         ? originalPathComponents.slice(0, -movementUpCount).concat(movementPathComponents)
//                         : originalPathComponents.concat(movementPathComponents),
//             }), chars);
//         }
//         else {
//             const additionalMovementUp = movementUpCount - originalPathComponents.length;
//             const finalUpCount = originalUpCount + (additionalMovementUp > 0 ? additionalMovementUp : 0);
//             const finalPathComponents =
//                 movementUpCount > 0
//                     ? originalPathComponents.slice(0, -movementUpCount).concat(movementPathComponents)
//                     : originalPathComponents.concat(movementPathComponents)
//             return AdvancedPath.create(AdvancedPath.createPathString({
//                 chars,
//                 isRoot: false,
//                 isSelf: false,
//                 upCount: finalUpCount,
//                 pathKeys: finalPathComponents,
//             }), chars);
//         }

//     }

//     toString() {
//         return AdvancedPath.createPathString(this);
//     }

//     equals(otherPath) {
//         return otherPath instanceof AdvancedPath && this.toString() === otherPath.toString();
//     }

// }

// module.exports = AdvancedPath;