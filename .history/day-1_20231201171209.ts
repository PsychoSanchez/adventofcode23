// --- Day 1: Trebuchet?! ---
// Something is wrong with global snow production, and you've been selected to take a look. The Elves have even given you a map; on it, they've used stars to mark the top fifty locations that are likely to be having problems.

// You've been doing this long enough to know that to restore snow operations, you need to check all fifty stars by December 25th.

// Collect stars by solving puzzles. Two puzzles will be made available on each day in the Advent calendar; the second puzzle is unlocked when you complete the first. Each puzzle grants one star. Good luck!

// You try to ask why they can't just use a weather machine ("not powerful enough") and where they're even sending you ("the sky") and why your map looks mostly blank ("you sure ask a lot of questions") and hang on did you just say the sky ("of course, where do you think snow comes from") when you realize that the Elves are already loading you into a trebuchet ("please hold still, we need to strap you in").

// As they're making the final adjustments, they discover that their calibration document (your puzzle input) has been amended by a very young Elf who was apparently just excited to show off her art skills. Consequently, the Elves are having trouble reading the values on the document.

// The newly-improved calibration document consists of lines of text; each line originally contained a specific calibration value that the Elves now need to recover. On each line, the calibration value can be found by combining the first digit and the last digit (in that order) to form a single two-digit number.

// For example:

// 1abc2
// pqr3stu8vwx
// a1b2c3d4e5f
// treb7uchet
// In this example, the calibration values of these four lines are 12, 38, 15, and 77. Adding these together produces 142.

// Consider your entire calibration document. What is the sum of all of the calibration values?

// Part 1 
function findTwoDigitNumberFromString(line: string): number {
    let left = 0, right = line.length;
    
    while (left <= right) {
        const leftDigit = parseInt(line[left]);
        const rightDigit = parseInt(line[right]);
        
        const isLeftDigitFound = !isNaN(leftDigit);
        const isRightDigitFound = !isNaN(rightDigit);
        if (isLeftDigitFound && isRightDigitFound) {
            return leftDigit * 10 + rightDigit;
        }
        
        if (!isLeftDigitFound) left++;
        if (!isRightDigitFound) right--;
    }
    
    throw new Error(`No two digit number found in string: ${line}`);
}

console.log('PART 1', await main1());


async function main1() {
    const stream = Bun.file('./data/day-1.data').stream();

    let sum = 0;
    for await (const chunk of stream) {
        const lines = new TextDecoder().decode(chunk).split('\n');
        for (const line of lines) {
            sum += findTwoDigitNumberFromString(line);
        }
    }

    return sum;
}

// --- Part Two ---
// Your calculation isn't quite right. It looks like some of the digits are actually spelled out with letters: one, two, three, four, five, six, seven, eight, and nine also count as valid "digits".

// Equipped with this new information, you now need to find the real first and last digit on each line. For example:

// two1nine
// eightwothree
// abcone2threexyz
// xtwone3four
// 4nineeightseven2
// zoneight234
// 7pqrstsixteen
// In this example, the calibration values are 29, 83, 13, 24, 42, 14, and 76. Adding these together produces 281.

// What is the sum of all of the calibration values?

const DIGIT_REGEX = /[0-9]/g;
const DIGITS = [
    '0', 
    '1', 
    '2', 
    '3', 
    '4', 
    '5', 
    '6',
    '7',
    '8',
    '9',
    'zero',
    'one',
    'two',
    'three',
    'four',
    'five',
    'six',
    'seven',
    'eight',
    'nine'
];
const DIGITS_SET = new Set([
    '0', 
    '1', 
    '2', 
    '3', 
    '4', 
    '5', 
    '6',
    '7',
    '8',
    '9'
]);
function findTwoDigitNumberFromStringWithLetters(line: string): number {

    // const number = findTwoDigitNumberFromString(line);
    // if (!isNaN(number)) return number;

    const result = DIGIT_REGEX.exec(line);
    console.log(`🚀 ~ file: day-1.ts:99 ~ findIndexOfTheFirstDigit ~ result:`, result);
    const findIndexOfTheFirstDigit = (line: string): number => {
        // result
        // const match = line.(DIGIT_REGEX);
        
        // if (!match) throw new Error(`No digit found in string: ${line}`);
        
        // return match.index ?? Number.MAX_SAFE_INTEGER;
    }

    
    
    // const numberAsString = line.;
    
        // console.log(`🚀 ~ file: day-1.ts:93 ~ findTwoDigitNumberFromStringWithLetters ~ numberAsString:`, numberAsString);
    
    // return findTwoDigitNumberFromString(numberAsString);
}



async function main2() {
    const stream = Bun.file('./data/day-1.data').stream();

    let sum = 0;
    for await (const chunk of stream) {
        const lines = new TextDecoder().decode(chunk).split('\n');
        for (const line of lines) {
            sum += findTwoDigitNumberFromStringWithLetters(line);
        }
    }

    return sum;
}

console.log('PART 2', await main2());