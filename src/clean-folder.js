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
