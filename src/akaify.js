// @author - {Amit Talwar}
// @email - {intelliriffer[at]gmail[dot]com}
// @title - Adds An acid Chunk to wav files after trying to detect BPM
// #description - Assumes files are 4/4, Determines the Max Possible BPM. if A Numeric value is found in File Name (largest if multiple) that is used as the Maximum BPM HINT
// @license - MIT

let fs = require('fs');
let path = require('path');
let ANSI = require('./lib/ansi.js');
let FL = require('./lib/float2bin.js');
const MINBPM = 60;
const MAXBPM = 200;
const WaveFileReader = require('wavefile-reader').WaveFileReader;
let wav = new WaveFileReader();
//console.log(ANSI);
if (process.argv.length != 3) throw (ANSI.wrap('FgRed', "Error: Too Few Arguments\n Need a Wav File path to Process"));
$wFile = process.argv[2];
if (!$wFile.toUpperCase().endsWith('.WAV')) throw (`Error: Not a Wav File --  ${$wFile}`);
if (!fs.existsSync($wFile)) throw (ANSI.wrap('FgRed', `Error File :  ${$wFile} does not exist!`));
fs.readFile($wFile, (err, data) => {
    if (isAcidic(data)) {
        console.log(ANSI.wrap('FgRed', `${$wFile} is already acidized! skipping!!`));
    }
    else {
        $acid = acidize(data, $wFile);
        fs.writeFileSync($wFile, $acid);
        //  fs.writeFileSync($wFile.replace(".wav", '') + "-acidized.wav", $acid);
    }
});

function isAcidic($data) { //does the file contain word acid??
    return $data.indexOf('acid') > 16;
}

function acidize(data, name) {
    wav.fromBuffer(data);
    nsamples = (wav.data.chunkSize / wav.fmt.numChannels) / (wav.fmt.bitsPerSample / 8);
    duration = nsamples / wav.fmt.sampleRate;
    //console.log(wav);
    let hint = nameBPM(name);
    beats = getBeats(duration, hint);
    console.log([name].concat(beats));
    $tempo = FL.float2HexArr(beats[0]);
    //test    
    //    console.log(FL.float2Hex(12.375));
    //console.log(FL.float2Hex(beats[0]));
    let acid = [
        0x61, 0x63, 0x69, 0x64,
        0x18, 0x00, 0x00, 0x00,
        0x00, 0x00, 0x00, 0x00,
        0x3C, 0x00,
        0x00, 0x80,
        0x00, 0x00, 0x00, 0x00,
        beats[1], 0x00, 0x00, 0x00,
        0x04, 0x00, 0x04, 0x00,
    ].concat($tempo);
    let ua = Uint8Array.from(acid);
    return Buffer.concat([data, ua]);
}

function getBeats(d, hint = 0) {
    let min = MINBPM;
    let max = MAXBPM;
    if (hint >= min) max = parseFloat(hint + 1); //account for any decimals
    ds = [4, 8, 16, 24, 32, 48, 64, 96, 128];
    BPMS = ds.map(function (i) {
        return (60 / (d / i)).toFixed(2);
    });
    let ret = [BPMS[0], 4];
    for (let i = 0; i < BPMS.length; i++) {


        if ((max - BPMS[i]) < 0)
            break;
        ret = [BPMS[i], ds[i]];
    }

    return ret;
}

function nameBPM(fn) {
    let fprops = path.parse(fn);
    let matches = fprops.base.match(/[0-9]{2,}/gi);
    if (matches)
        return Math.max(...matches);
    return 0;
}