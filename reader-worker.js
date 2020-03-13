const {parentPort, workerData} = require('worker_threads');
const readline = require('readline');
const fs = require('fs');
const path = require('path');

const parentMessage = workerData;

const readInterface = readline.createInterface({
    input: fs.createReadStream(path.resolve('trades.json')),
    output: process.stdout,
    console: false
});

readInterface.on('line', function(line) {
    parentPort.postMessage({ line  });
});