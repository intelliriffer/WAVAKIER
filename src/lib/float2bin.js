// @author - {N.Md Faizaan}
// @email - {aulisius7[at]gmail[dot]com}
// @title - Converts decimal float to binary 32 format float
// @ref - https://en.wikipedia.org/wiki/Single-precision_floating-point_format
// @license - MIT

/*** 
* float2bin - Convert decimal number to binary32 format
* @param {input} - The number to be converted either in Number or String type
* @return {bin32float} - The binary32 representation 
**/
/**
 * Modified by Amit Talwar @ 2021 for use as ES6 module and added Extra Functions float2HexArr, float2Hex
 * 
 */

module.exports = {
    float2bin, float2HexArr, float2Hex
};
function float2HexArr(input) {
    let bstr = float2bin(input);
    hexes = new Array(4);
    for (let i = 0; i < 32; i += 8) {
        hexes[i / 8] = parseInt(bstr.substr(i, 8), 2);
    }
    return hexes.reverse();
}
function float2Hex(input) {
    return float2HexArr(input).map(e => e.toString(16)).join(' ');
}

function float2bin(input) {
    input = Number(input)
    //Components required
    let normalPart,
        fracPart,
        base2float,
        bin32exp,
        bin32mantissa,
        sign

    // Extract the integer from the real number
    normalPart = parseInt(Math.abs(input))

    // Extract the fractional part from the real number
    fracPart = Math.abs(input) - normalPart

    // Resolve sign of the number for the sign bit
    sign = Math.abs(input) === input ? '0' : '1'

    // Get the base2 representation of the real number
    // Ex. (12.375)_10 = (1100.011)_2
    base2float = convert2bin(normalPart) + '.' + frac2bin(fracPart)

    // Calculate the value of exp for Normalized number (https://en.wikipedia.org/wiki/Normalized_number)
    var exp = base2float.indexOf('.') - base2float.indexOf('1')
    if (exp > 0) exp = exp - 1

    // Get the 8-bit exponent part
    if (exp !== 1) bin32exp = pad(convert2bin(127 + exp), 8, 1)
    else bin32exp = pad('', 8, 1)

    // Get the 23-bit mantissa part
    bin32mantissa = pad(binary32mantissa(base2float, exp), 23, 0)

    // Return the 32-bit binary32 representation
    var bin32float = (bin32exp + bin32mantissa).slice(0, 31)
    return sign + bin32float
}

/** 
* convert2bin()
* @param {input} - The integer to be converted
* @return {bin} - The binary representation
**/
function convert2bin(input) {

    // If input is 0|1 
    if (input === 0 || input === 1) return '' + input

    //Calculate the binary representation
    var bin = ''
    while (input !== 0) {
        bin = bin + input % 2
        input = parseInt(input / 2)
    }

    //Return the string in reverse
    return bin.split('').reverse().join('')
}

/**
* frac2bin - Convert fractional part to binary representation 
* @param {input} - The fractional part
* @return {bin} - The binary representation
**/
function frac2bin(input) {

    //If input is 0
    if (input === 0) return '' + input

    // To limit the while loop in case of recurring decimals e.g. 0.1
    var limit = 0
    var bin = ''

    //Calculate the binary representation
    while (input !== 0 && limit < 32) {
        input = input * 2
        if (input >= 1) {
            bin = bin + '1'
            input -= 1
        }
        else bin = bin + '0'
        limit++
    }

    return bin
}

/**
* binary32mantissa - Returns the mantissa from the normalized number
* @param {input} - The normalized number
* @param {exp} - The 'e' value required to get the normalized number
* @return {result} - The mantissa portion 
**/
function binary32mantissa(input, exp) {

    // Remove the decimal point
    input = input.replace(/\./, '')

    return (exp > 0) ? input.slice(1, input.length) : input.slice(1 - (exp), input.length)
}

/**
* pad - To pad the number to expected length
* @param {input} - The string to be padded
* @param {total} - The max length of the string
* @param {dir} - The direction to add the padded bits
* @return {result} - The padded String
**/
function pad(input, total, dir) {

    var padLen = total - input.length
    var padStr = ''
    while (padLen-- > 0) padStr = padStr.concat('0')

    // If dir == 1 then pad in front else pad in back
    return (dir === 1) ? padStr.concat(input) : input.concat(padStr)
}


// Example test cases
// "123.0"
// 01000010111101100000000000000000 - expected
// 01000010111101100000000000000000 - actual

// -0.006
// 10111011110001001001101110100101 - expected
// 10111011110001001001101110100101 - actual

// Note : 
// 1. Doesn't handle Infinity
// 2. Precision might usually be lost for larger numbers, so comparing 25-27 bits of the result is enough