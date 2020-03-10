const {parentPort, workerData} = require('worker_threads');

const parentMessage = workerData;
console.log(parentMessage);
parentPort.postMessage({
                            type: "Reader",
                            data: "recieved message from parent to child"
                        });