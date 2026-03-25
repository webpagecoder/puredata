// AUTO-GENERATED FILE. DO NOT EDIT DIRECTLY.
// Source: lib/handlers/ArrayHandler.(js|ts) + lib/fields/ArrayChain.ts
// Run: tsx ./generator/generate-arraychain-definitions.ts

interface ArrayChainGeneratedMethods {
        /**
        * Validates that the array contains every required value.
        * @param {unknown[]} [requiredValues=[]] Values that must all exist in the array.
        * @returns {ArrayChain} Pass result when all values are present, otherwise failure details.
        */
        allOf(requiredValues?: any): ArrayChain;

        /**
        * Validates that a nested array matches the provided dimensions.
        * @param {number[]} dimensions Expected dimensions for each array depth.
        * @param {number} [index=0] Internal recursion index for the current dimension.
        * @returns {ArrayChain} Pass result when dimensions match, otherwise failure details.
        */
        dimensions(dimensions: any, index?: any): ArrayChain;

        /**
        * Validates that the array is empty.
        * @returns {ArrayChain} Pass result when the array has no items.
        */
        empty(): ArrayChain;

        /**
        * Validates that the array contains exactly the required values.
        * @param {unknown[]} [requiredValues=[]] Values the array must contain, disregarding order.
        * @returns {ArrayChain} Pass result when contents match exactly.
        */
        exactly(requiredValues?: any): ArrayChain;

        /**
        * Validates that the array length matches the required length.
        * @param {number} requiredLength Exact required array length.
        * @returns {ArrayChain} Pass result when the length matches.
        */
        length(requiredLength: any): ArrayChain;

        /**
        * Validates that the array length matches the required length.
        * @param {number} requiredLength Exact required array length.
        * @returns {ArrayChain} Pass result when the length matches.
        */
        length(requiredLength: any): ArrayChain;

        /**
        * Validates that the array length falls within the provided inclusive range.
        * @param {number} min Inclusive minimum length.
        * @param {number} max Inclusive maximum length.
        * @returns {ArrayChain} Pass result when the length is within range.
        */
        lengthBetween(min: any, max: any): ArrayChain;

        /**
        * Validates that the array length does not exceed the provided maximum.
        * @param {number} max Maximum allowed length.
        * @returns {ArrayChain} Pass result when the array length is at most the maximum.
        */
        maxLength(max: any): ArrayChain;

        /**
        * Validates that the array length meets the provided minimum.
        * @param {number} min Minimum allowed length.
        * @returns {ArrayChain} Pass result when the array length is at least the minimum.
        */
        minLength(min: any): ArrayChain;

        /**
        * Validates that the array contains none of the forbidden values.
        * @param {unknown[]} [forbiddenValues=[]] Values that must not appear in the array.
        * @returns {ArrayChain} Pass result when no forbidden values are found.
        */
        noneOf(forbiddenValues?: any): ArrayChain;

        /**
        * Validates that the array contains at least one item.
        * @returns {ArrayChain} Pass result when the array is not empty.
        */
        notEmpty(): ArrayChain;

        /**
        * Validates that every array entry belongs to the allowed set.
        * @param {unknown[]} [allowedValues=[]] Values permitted in the array.
        * @returns {ArrayChain} Pass result when every entry is allowed.
        */
        only(allowedValues?: any): ArrayChain;

        /**
        * Validates that the array contains at least one value outside the forbidden set.
        * @param {unknown[]} [forbiddenValues=[]] Values the array must not consist exclusively of.
        * @returns {ArrayChain} Pass result when at least one entry is different.
        */
        otherThan(forbiddenValues?: any): ArrayChain;

        /**
        * Validates that the array contains at least one of the possible values.
        * @param {unknown[]} [possibleValues=[]] Candidate values to look for.
        * @returns {ArrayChain} Pass result when any candidate value is present.
        */
        someOf(possibleValues?: any): ArrayChain;

        /**
        * Validates that the array is sorted in ascending order.
        * @param {Path|Function|null} [pathOrComparator=null] Optional path or comparator to determine ordering.
        * @returns {ArrayChain} Pass result when the array is sorted.
        */
        sorted(pathOrComparator?: any): ArrayChain;

        /**
        * Validates that the array matches the provided tuple values in order.
        * @param {unknown[]} [tupleValues=[]] Expected values at each index.
        * @returns {ArrayChain} Pass result when the tuple matches.
        */
        tuple(tupleValues?: any): ArrayChain;

        /**
        * Alias for only, preserving the same validation behavior.
        * @param {...unknown} args Arguments forwarded to only.
        * @returns {ArrayChain} Result from the only validator.
        */
        type(allowedValues?: any): ArrayChain;

        /**
        * Appends values to the end of the array.
        * @param {unknown[]} [values=[]] Values to append.
        * @returns {ArrayChain} Pass result containing the extended array.
        */
        add(values?: any): ArrayChain;

        /**
        * Splits the array into equally sized chunks.
        * @param {number} length Maximum size of each chunk.
        * @returns {ArrayChain} Pass result containing the chunked array.
        */
        chunk(length: any): ArrayChain;

        /**
        * Filters the array using the provided predicate.
        * @param {Function} filter Predicate function used by Array.prototype.filter.
        * @returns {ArrayChain} Pass result containing the filtered array.
        */
        filter(filter: any): ArrayChain;

        /**
        * Recursively flattens nested arrays into a single-level array.
        * @returns {ArrayChain} Pass result containing the flattened array.
        */
        flatten(): ArrayChain;

        /**
        * Keeps only entries that match one of the allowed values.
        * @param {unknown[]} [allowedValues=[]] Values to keep.
        * @returns {ArrayChain} Pass result containing the filtered array.
        */
        keep(allowedValues?: any): ArrayChain;

        /**
        * Maps array entries using the provided transform function.
        * @param {Function} map Mapping function used by Array.prototype.map.
        * @returns {ArrayChain} Pass result containing the mapped array.
        */
        map(map: any): ArrayChain;

        /**
        * Pads the array to a target length using the provided value.
        * @param {number} targetLength Desired minimum array length.
        * @param {unknown} [padValue=null] Value appended until the target length is reached.
        * @returns {ArrayChain} Pass result containing the padded array.
        */
        padEnd(targetLength: any, padValue?: any): ArrayChain;

        /**
        * Picks a random subset of values from the array without replacement.
        * @param {number} [count=1] Number of items to pick.
        * @returns {ArrayChain} Pass result containing the randomly selected items.
        */
        pickRandom(count?: any): ArrayChain;

        /**
        * Removes all entries that match one of the forbidden values.
        * @param {unknown[]} [forbiddenValues=[]] Values to remove.
        * @returns {ArrayChain} Pass result containing the filtered array.
        */
        remove(forbiddenValues?: any): ArrayChain;

        /**
        * Removes undefined values from the array.
        * @returns {ArrayChain} Pass result containing the filtered array.
        */
        removeUndefined(): ArrayChain;

        /**
        * Reverses the order of the array.
        * @returns {ArrayChain} Pass result containing the reversed array.
        */
        reverse(): ArrayChain;

        /**
        * Randomly shuffles the array.
        * @returns {ArrayChain} Pass result containing the shuffled array.
        */
        shuffle(): ArrayChain;

        /**
        * Extracts a slice of the array.
        * @param {number} startIndex Inclusive start index.
        * @param {number} endIndex Exclusive end index.
        * @returns {ArrayChain} Pass result containing the sliced array.
        */
        slice(startIndex: any, endIndex: any): ArrayChain;

        /**
        * Takes the first count entries from the array.
        * @param {number} [count=1] Number of items to take.
        * @returns {ArrayChain} Pass result containing the leading slice.
        */
        sliceFirst(count?: any): ArrayChain;

        /**
        * Takes the last count entries from the array.
        * @param {number} [count=1] Number of items to take.
        * @returns {ArrayChain} Pass result containing the trailing slice.
        */
        sliceLast(count?: any): ArrayChain;

        /**
        * Splices the array by removing and optionally inserting values.
        * @param {number} startIndex Index at which to begin changes.
        * @param {number} [deleteCount=0] Number of items to remove.
        * @param {unknown[]} [insertValues=[]] Values to insert at the start index.
        * @returns {ArrayChain} Pass result containing the spliced array.
        */
        splice(startIndex: any, deleteCount?: any, insertValues?: any): ArrayChain;

        /**
        * Sorts the array in ascending order.
        * @param {Path|Function|null} [pathOrComparator=null] Optional path or comparator used for sorting.
        * @returns {ArrayChain} Pass result containing the sorted array.
        */
        sortAsc(pathOrComparator?: any): ArrayChain;

        /**
        * Sorts the array in descending order.
        * @param {Path|Function|null} [pathOrComparator=null] Optional path or comparator used for sorting.
        * @returns {ArrayChain} Pass result containing the sorted array.
        */
        sortDesc(pathOrComparator?: any): ArrayChain;

}

declare module './ArrayChain.ts' {
    interface ArrayChain extends ArrayChainGeneratedMethods {}
}

declare module './ArrayChain.js' {
    interface ArrayChain extends ArrayChainGeneratedMethods {}
}

export { };
