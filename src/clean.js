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
    let chunk = data.slice(-32);
    if ((chunk.indexOf('acid') < 0)) {
        console.log(ANSI.wrap('FgRed', `${$wFile} is Not acidized! skipping!!`));
    }
    else {
        $noacid = data.slice(0, -32);
        fs.writeFileSync($wFile, $noacid);
        console.log('Cleaned: ' + $wFile);
        //  fs.writeFileSync($wFile.replace(".wav", '') + "-acidized.wav", $acid);
    }
});
