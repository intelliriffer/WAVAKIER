let fs = require('fs');
let path = require('path');
nameBPM("/home/test 120 base 02.wav");

function nameBPM(fn) {
    let fprops = path.parse(fn);
    let matches = fprops.base.match(/[0-9]{2,}/gi);
    console.log(Math.max(...matches));

}