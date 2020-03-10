const {parentPort, workerData} = require('worker_threads');

const parentMessage = workerData;
console.log(parentMessage);
parentPort.postMessage(parentMessage);