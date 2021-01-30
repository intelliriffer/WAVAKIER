let fs = require('fs');
let path = require('path');
var childProcess = require('child_process');

let glob = require('glob');
let source = path.resolve("../wavs");
processFolder();
function processFolder() {
    let files = glob.sync("wavs/**/*\.[wW][aA][vV]");
    files = files.map(f => path.resolve(f)).filter(f => f.length > 5);
    const execSync = require('child_process').execSync;

    files.forEach(f => {
        try {
            console.log(execSync(`node ./src/clean.js "${f}"`).toString());
        } catch (e) {
            console.log(e);
        }
    });
}

function runScript(scriptPath, callback, args) {
    console.log(`Processing ${args[0]}`);
    // keep track of whether callback has been invoked to prevent multiple invocations
    var invoked = false;

    var process = childProcess.fork(scriptPath, args);

    // listen for errors as they may prevent the exit event from firing
    process.on('error', function (err) {
        if (invoked) return;
        invoked = true;
        callback(err);
    });

    // execute the callback once the process has finished running
    process.on('exit', function (code) {
        if (invoked) return;
        invoked = true;
        var err = code === 0 ? null : new Error('exit code ' + code);
        callback(err);
    });

}







