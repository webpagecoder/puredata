// AUTO-GENERATED FILE. DO NOT EDIT DIRECTLY.
// Source: lib/handlers/ArrayHandler.(js|ts) + lib/fields/ArrayChain.ts
// Run: tsx ./generator/generate-arraychain-definitions.ts

interface ArrayChainGeneratedMethods {
       

        /**
        * Validates that the array contains every required value.
        * @param requiredValues Values that must all exist in the array.
        * @returns Pass result when all values are present, otherwise failure details.
        */
        allOf(requiredValues?: any): ArrayChain;

        /**
        * Validates that a nested array matches the provided dimensions.
        * @param dimensions Expected dimensions for each array depth.
        * @returns Pass result when dimensions match, otherwise failure details.
        */
        dimensions(dimensions: any): ArrayChain;

        /**
        * Validates that the array is empty.
        * @returns Pass result when the array has no items.
        */
        empty(): ArrayChain;

        /**
        * Validates that the array contains exactly the required values.
        * @param requiredValues Values the array must contain, disregarding order.
        * @returns Pass result when contents match exactly.
        */
        exactly(requiredValues?: any): ArrayChain;

        /**
        * Validates that the array length matches the required length.
        * @param requiredLength Exact required array length.
        * @returns Pass result when the length matches.
        */
        length(requiredLength: any): ArrayChain;

        /**
        * Validates that the array length falls within the provided inclusive range.
        * @param min Inclusive minimum length.
        * @param max Inclusive maximum length.
        * @returns Pass result when the length is within range.
        */
        lengthBetween(min: any, max: any): ArrayChain;

        /**
        * Validates that the array length does not exceed the provided maximum.
        * @param max Maximum allowed length.
        * @returns Pass result when the array length is at most the maximum.
        */
        maxLength(max: any): ArrayChain;

        /**
        * Validates that the array length meets the provided minimum.
        * @param min Minimum allowed length.
        * @returns Pass result when the array length is at least the minimum.
        */
        minLength(min: any): ArrayChain;

        /**
        * Validates that the array contains none of the forbidden values.
        * @param forbiddenValues Values that must not appear in the array.
        * @returns Pass result when no forbidden values are found.
        */
        noneOf(forbiddenValues?: any): ArrayChain;

        /**
        * Validates that the array contains at least one item.
        * @returns Pass result when the array is not empty.
        */
        notEmpty(): ArrayChain;

        /**
        * Validates that every array entry belongs to the allowed set.
        * @param allowedValues Values permitted in the array.
        * @returns Pass result when every entry is allowed.
        */
        only(allowedValues?: any): ArrayChain;

        /**
        * Validates that the array contains at least one value outside the forbidden set.
        * @param forbiddenValues Values the array must not consist exclusively of.
        * @returns Pass result when at least one entry is different.
        */
        otherThan(forbiddenValues?: any): ArrayChain;

        /**
        * Validates that the array contains at least one of the possible values.
        * @param possibleValues Candidate values to look for.
        * @returns Pass result when any candidate value is present.
        */
        someOf(possibleValues?: any): ArrayChain;

        /**
        * Validates that the array is sorted in ascending order.
        * @param pathOrSortComparator Optional path or comparator to determine ordering.
        * If a path is provided, values at that path will be compared. 
        * If a comparator is provided, it will be used directly, ignoring the order parameter. 
        * If neither is provided, natural ordering will be used.
        * @returns Pass result when the array is sorted.
        */
        sorted(pathOrSortComparator?: any): ArrayChain;

        /**
        * Validates that the array matches the provided tuple values in order.
        * @param tupleValues Expected values at each index.
        * @returns Pass result when the tuple matches.
        */
        tuple(tupleValues?: any): ArrayChain;

        /**
        * Alias for only, preserving the same validation behavior.
        * @param allowedValues Values the array must only contain.
        * @returns Result from the only validator.
        */
        type(allowedValues?: any): ArrayChain;

        /**
        * Appends values to the end of the array.
        * @param values Values to append.
        * @returns Pass result containing the extended array.
        */
        add(values?: any): ArrayChain;

        /**
        * Splits the array into equally sized chunks plus any partially remaining chunk.
        * @param length Maximum size of each chunk.
        * @returns Pass result containing the chunked array.
        */
        chunk(length: any): ArrayChain;

        /**
        * Filters the array using the provided predicate.
        * @param filter Predicate function used by Array.prototype.filter.
        * @returns Pass result containing the filtered array.
        */
        filter(filter: any): ArrayChain;

        /**
        * Recursively flattens nested arrays into a single-level array.
        * @returns Pass result containing the flattened array.
        */
        flatten(): ArrayChain;

        /**
        * Keeps only entries that match one of the allowed values.
        * @param allowedValues Values to keep.
        * @returns Pass result containing the filtered array.
        */
        keep(allowedValues?: any): ArrayChain;

        /**
        * Maps array entries using the provided transform function.
        * @param map Mapping function used by Array.prototype.map.
        * @returns Pass result containing the mapped array.
        */
        map(map: any): ArrayChain;

        /**
        * Pads the array to a target length using the provided value.
        * @param targetLength Desired minimum array length.
        * @param padValue Value appended until the target length is reached.
        * @returns Pass result containing the padded array.
        */
        padEnd(targetLength: any, padValue?: any): ArrayChain;

        /**
        * Picks a random subset of values from the array without replacement.
        * @param count Number of items to pick.
        * @returns Pass result containing the randomly selected items.
        */
        pickRandom(count?: any): ArrayChain;

        /**
        * Removes all entries that match one of the forbidden values.
        * @param forbiddenValues Values to remove.
        * @returns Pass result containing the filtered array.
        */
        remove(forbiddenValues?: any): ArrayChain;

        /**
        * Removes undefined values from the array.
        * @returns Pass result containing the filtered array.
        */
        removeUndefined(): ArrayChain;

        /**
        * Reverses the order of the array.
        * @returns Pass result containing the reversed array.
        */
        reverse(): ArrayChain;

        /**
        * Randomly shuffles the array.
        * @returns Pass result containing the shuffled array.
        */
        shuffle(): ArrayChain;

        /**
        * Extracts a slice of the array.
        * @param startIndex Inclusive start index.
        * @param endIndex Exclusive end index.
        * @returns Pass result containing the sliced array.
        */
        slice(startIndex: any, endIndex: any): ArrayChain;

        /**
        * Takes the first count entries from the array.
        * @param count Number of items to take.
        * @returns Pass result containing the leading slice.
        */
        sliceFirst(count?: any): ArrayChain;

        /**
        * Takes the last count entries from the array.
        * @param count Number of items to take.
        * @returns Pass result containing the trailing slice.
        */
        sliceLast(count?: any): ArrayChain;

        /**
        * Splices the array by removing and optionally inserting values.
        * @param startIndex Index at which to begin changes.
        * @param deleteCount Number of items to remove.
        * @param insertValues Values to insert at the start index.
        * @returns Pass result containing the spliced array.
        */
        splice(startIndex: any, deleteCount?: any, insertValues?: any): ArrayChain;

        /**
        * Sorts the array in ascending order.
        * @param pathOrSortComparator Optional path or comparator used for sorting.
        * If a path is provided, values at that path will be compared. 
        * If a comparator is provided, it will be used directly, ignoring the order parameter. 
        * If neither is provided, natural ordering will be used.
        * @returns Pass result containing the sorted array.
        */
        sortAsc(pathOrSortComparator?: any): ArrayChain;

        /**
        * Sorts the array in descending order.
        * @param pathOrSortComparator Optional path or comparator used for sorting.
        * If a path is provided, values at that path will be compared. 
        * If a comparator is provided, it will be used directly, ignoring the order parameter. 
        * If neither is provided, natural ordering will be used.
        * @returns Pass result containing the sorted array.
        */
        sortDesc(pathOrSortComparator?: any): ArrayChain;

}

declare module './ArrayChain.ts' {
    interface ArrayChain extends ArrayChainGeneratedMethods {}
}

declare module './ArrayChain.js' {
    interface ArrayChain extends ArrayChainGeneratedMethods {}
}

export { };
