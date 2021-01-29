let fs = require('fs');
let ANSI = require('./ansi.js');
let FL = require('./float2bin.js');

const WaveFileReader = require('wavefile-reader').WaveFileReader;
let wav = new WaveFileReader();
//console.log(ANSI);
if (process.argv.length != 3) throw ("Error: Too Few Arguments\n Need a Wav File path to Process");
$wFile = process.argv[2];
if (!$wFile.toUpperCase().endsWith('.WAV')) throw (`Error: Not a Wav File`);
if (!fs.existsSync($wFile)) throw (ANSI.wrap('FgRed', `Error File :  ${$wFile} does not exist!`));
fs.readFile($wFile, (err, data) => {

    wav.fromBuffer(data);
    console.log(wav);

});

function isAcidic($data) {

    return $data.indexOf('acid') > 16;

}

function acidize(data, name) {
    wav.fromBuffer(data);
    nsamples = (wav.data.chunkSize / wav.fmt.numChannels) / (wav.fmt.bitsPerSample / 8);
    duration = nsamples / wav.fmt.sampleRate;
    //console.log(wav);
    beats = getBeats(duration);
    $tempo = FL.float2HexArr(beats[0]);
    console.log(FL.float2Hex(12.375));

    console.log(FL.float2Hex(beats[0]));
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
    console.log(Buffer.isBuffer(data));
    return Buffer.concat([data, ua]);

    /* sbeat = duration / 8;
     BPM = (60 / sbeat).toFixed(2);
     console.log(BPM);*/
}

function getBeats(d) {
    min = 80;
    max = 180;
    ds = [4, 8, 16, 32, 64];
    BPMS = ds.map(function (i) {
        return (60 / (d / i)).toFixed(2);
    });
    console.log('doing');
    let ret = [BPMS[0], 4];
    for (let i = 0; i < BPMS.length; i++) {


        if ((max - BPMS[i]) < 0)
            break;
        ret = [BPMS[i], ds[i]];
    }

    return ret;
}