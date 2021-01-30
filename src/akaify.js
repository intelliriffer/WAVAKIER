// @author - {Amit Talwar}
// @email - {intelliriffer[at]gmail[dot]com}
// @title - Adds An acid Chunk to wav files after trying to detect BPM
// #description - Assumes files are 4/4, Determines the Max Possible BPM. if A Numeric value is found in File Name (largest if multiple) that is used as the Maximum BPM HINT
// @license - MIT

let fs = require('fs');
let path = require('path');
let ANSI = require('./lib/ansi.js');
let FL = require('./lib/float2bin.js');
let ATEMP = JSON.parse(`{
    "value0": {
        "defaultSlice": {
            "Start": 0,
            "End": 0,
            "LoopStart": 0,
            "LoopMode": 0,
            "PulsePosition": 0,
            "LoopCrossfadeLength": 0
        },
        "numBars": 2,
        "Num slices": 0
    },
    "value1": {
        "value0": {
            "note": 0,
            "scale": 1
        }
    }
}`);
const MINBPM = 60;
const MAXBPM = 200;
const LIMIT = 300;
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
        //fs.writeFileSync($wFile.replace(".wav", '') + "-acidized.wav", $acid);
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
    ATEMP.value0.defaultSlice.End = nsamples - 1;
    ATEMP.value0.numBars = beats[1] / 4;
    console.log([name].concat(beats));
    if (beats[0] > LIMIT) throw (ANSI.wrap('FgRed', "Error: Tempo detected Beyond Limit (300 BPM) Skipping! "));
    $tempo = FL.float2HexArr(beats[0]);
    $mtempo = toBytes(parseInt(beats[0] * 1000));
    //test    
    //    console.log(FL.float2Hex(12.375));
    //console.log(FL.float2Hex(beats[0]));
    let meta = Uint8Array.from([
        0x6d, 0x65, 0x74, 0x61,
        0x04, 0x00, 0x00, 0x00
    ].concat($mtempo));

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
    let $atem = Uint8Array.from([]);
    /*   if (data.indexOf('atem') > 0) {
           console.log(ANSI.wrap('FgRed', 'Skipping atem chunk as already Existing'));
       } else {
           $atem = Uint8Array.from(bstr(ATEMP));
       } Skipped atem chunk for now as supposedly not needed */
    if (data.indexOf('meta') > 0) {
        console.log(ANSI.wrap('FgRed', 'Skipping Tempo Meta chunk as already Existing'));
        meta = [];
    }
    let ua = Uint8Array.from(acid);
    let slicepoint = data.indexOf('fmt') + 8 + wav.fmt.chunkSize;
    let header = data.slice(0, slicepoint);
    let content = data.slice(slicepoint);
    return Buffer.concat([header, meta, content, ua]);
}

function getBeats(d, hint = 0) {
    let min = MINBPM;
    let max = MAXBPM;
    if (hint > min && hint <= LIMIT) max = parseFloat(hint + 1); //account for any decimals
    let ds = [4, 8, 16, 24, 32, 48, 64, 96, 128];
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
function bstr(obj) {
    str = JSON.stringify(obj, null, 4);
    arr = [...str].map(s => s.charCodeAt(0));
    let ln = toBytes(arr.length);
    arr = [0x61, 0x74, 0x65, 0x6D].concat(ln).concat(arr);
    return arr;

}
function toBytes(v) {
    return v.toString(2).padStart(32, "0").match(/[0|1]{8}/g).reverse().map(b => parseInt(b, 2));
}