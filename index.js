const {Worker, MessageChannel} = require('worker_threads');
const path = require('path');
const { port1, port2 } = new MessageChannel();
const fs = require('fs');

const run = () => {
    const readerWorkerPath = path.resolve('reader-worker.js');
    const computationWorkerPath = path.resolve('computation-worker.js');
    const threads = new Set();

    // 1st thread
    const readerWorker = new Worker(readerWorkerPath, {
        workerData: 'parent to worker data: reader'
    });

    threads.add(readerWorker);

    // 2nd thread
    const computationWorker = new Worker(computationWorkerPath);

    threads.add(computationWorker);

    computationWorker.postMessage({ port: port1 }, [port1]);

    // event listeners
    readerWorker.on('message', (msg) => {
        port2.postMessage(msg)
    });

    computationWorker.on('message', (msg) => {
        fs.appendFile('OutPut.json', JSON.stringify(msg, null, "\t"), (err) => {
            // throws an error, you could also catch it here
            if (err) throw err;
        
            // success case, the file was saved
            console.log('Stock Data saved!');
        });
    });

    readerWorker.on('exit', (code) => {
        console.log("reader thread exiting code: ", code);
        port2.postMessage(-99);

        if (code !== 0) {
            //reject(new Error(`Worker stopped with exit code ${code}`));
            console.log("error :", code);
        }
        
        threads.delete(readerWorker);  
    });

    computationWorker.on('exit', (code) => {
        console.log("Computation thread exiting code: ", code);

        if(code === 23) {
            console.log("Success !");
        }

        if (code !== 0 && code !== 23) {
            console.log("error :", code);
        }
        
        threads.delete(computationWorker);  
    });

    for (let worker of threads) {
        worker.on('error', (err) => {
            console.log(err);
        });
    }
};

run();