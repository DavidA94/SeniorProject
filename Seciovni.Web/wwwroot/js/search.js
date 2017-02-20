/**
 * Created by David on 2017-02-16.
 */

/**
 * Searches the given targets for the given search string, and returns the most likely results
 * @param {string} search - The search term
 * @param {Array<*>} targets - What strings are being searched through -- these will be .toString()'d
 */
function search(search, targets){
    const bestMatches = [];

    for(const target of targets){
        const likeliness = getLikeliness(target.toString(), search);
        console.log(search + "  in  " + target + "  =  " + likeliness);
        if(likeliness > 0){
            target.dlSearchVal = likeliness;
            bestMatches.push(target);
        }
    }

    bestMatches.sort((l, r) => l.dlSearchVal > r.dlSearchVal);

    return bestMatches;
}

/**
 * Checks how likely it is for the targetStr to be what is meant by the searchStr
 * @param {string} targetStr - The data being searched
 * @param {string} searchStr - The data that the user typed
 * @return {number}
 */
function getLikeliness(targetStr, searchStr){
    // If the searchStr is bigger than the targetStr,
    // or there is no searchStr (inverse is caught in the first one),
    // then it's not a match
    if(targetStr.length < searchStr.length || searchStr.length == 0) return 0;
    else if(targetStr === searchStr) return 1;

    // Get the if the search string is in the target string
    const contains = (targetStr.replace(" ", "").indexOf(searchStr.replace(" ", "")) >= 0);

    // If the length <= 3, then it must be in the actual string (sans-spaces)
    if(searchStr.length <= 3 && !contains){
        return 0;
    }

    // Give some weight if the searchStr is found at a word boundary
    let boundaryWeight = 1;

    // If the needed is found at the beginning of the string, then it gets a higher weight
    if(targetStr.replace(" ", "").indexOf(searchStr.replace(" ", "")) === 0){
        boundaryWeight = 1.2;
    }
    else {
        // Search through words
        for (const word of targetStr.split(' ')) {
            // And if the searchStr starts at the beginning of any word
            if(word.indexOf(searchStr) === 0){
                // It gets a weight, but a lesser one
                boundaryWeight = 1.1;
            }
        }
    }

    // If the string is actually contained, then minimum is .5
    const min = contains ? 0.5 : 0;

    // We can't have a greater chance than .99, as an exact match will give 1.
    return Math.clip((targetStr.length - dlDistance(targetStr, searchStr)) / parseFloat(targetStr.length) * boundaryWeight,
                     min, .99);
}

// https://en.wikipedia.org/wiki/Damerau%E2%80%93Levenshtein_distance
// https://gist.github.com/wickedshimmy/449595/cb33c2d0369551d1aa5b6ff5e6a802e21ba4ad5c
// http://stackoverflow.com/questions/1669190/javascript-min-max-array-values
/**
 * Calculates the Damerau-Levenshtein distance
 * @param {string} original
 * @param {string} modified
 * @return {number}
 */
function dlDistance(original, modified){

    const origLen = original.length;
    const modiLen = modified.length;
    original = original.toLowerCase();
    modified = modified.toLowerCase();

    const matrix = new Array(origLen + 1);
    for(let i = 0; i <= origLen; ++i){
        matrix[i] = new Array(modiLen + 1);
        matrix[i][0] = i;
    }
    for(let j = 0; j <= modiLen; ++j){
        matrix[0][j] = j;
    }

    for(let i = 1; i <= origLen; ++i){
        for(let j = 1; j <= modiLen; ++j){
            const cost = modified[j - 1] == original[i - 1] ? 0 : 1;
            const values = [
                matrix[i - 1][j] + 1,
                matrix[i][j - 1] + 1,
                matrix[i - 1][j - 1] + cost,
            ];

            matrix[i][j] = Math.min.apply(Math, values);

            if(i > 1 && j > 1 && original[i - 1] == modified[j - 2] && original[i - 2] == modified[j - 1]) {
                matrix[i][j] = Math.min(matrix[i][j], matrix[i - 2][j - 2] + cost);
            }
        }
    }

    return matrix[origLen][modiLen];
}