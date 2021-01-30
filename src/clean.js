// @author - {Amit Talwar}
// @email - {intelliriffer[at]gmail[dot]com}
// @title - removed An acid Chunk from wav files added by Akaify

// @license - MIT

let fs = require('fs');
let path = require('path');
let ANSI = require('./lib/ansi.js');
const WaveFileReader = require('wavefile-reader').WaveFileReader;
//console.log(ANSI);
if (process.argv.length != 3) throw (ANSI.wrap('FgRed', "Error: Too Few Arguments\n Need a Wav File path to Process"));
$wFile = process.argv[2];
if (!$wFile.toUpperCase().endsWith('.WAV')) throw (`Error: Not a Wav File --  ${$wFile}`);
if (!fs.existsSync($wFile)) throw (ANSI.wrap('FgRed', `Error File :  ${$wFile} does not exist!`));
fs.readFile($wFile, (err, data) => {

    console.log(ANSI.wrap('FgGreen', `
******* Cleaning: ` + $wFile));
    let chunk = data.slice(-32);
    if ((chunk.indexOf('acid') < 0)) {
        console.log(ANSI.wrap('FgRed', `File is Not acidized! skipping Acid Chunk!!`));
        $noacid = data;
    } else {
        $noacid = data.slice(0, -32);
    }

    $noacid = strip('meta', $noacid);
    $noacid = strip('atem', $noacid);
    fs.writeFileSync($wFile, $noacid);
    //  fs.writeFileSync($wFile.replace(".wav", '') + "-acidized.wav", $acid);

});
function strip(ID, data) {
    let p1 = data.indexOf(ID);
    if (p1 < 0) return data;
    let plen = parseInt(Array.from(data.slice(p1 + 4, p1 + 8).reverse()).map(v => v.toString(16)).join(''), 16);
    let p2 = 8 + p1 + plen;
    let ndata = Buffer.concat([data.slice(0, p1), data.slice(p2)]);
    console.log(`Removed Chunk: ${ID}`);
    return ndata;
}