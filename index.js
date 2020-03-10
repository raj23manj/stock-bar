const {Worker, workerData} = require('worker_threads');
const path = require('path');

const run = () => {
    const readerWorkerPath = path.resolve('reader-worker.js');
    return new Promise((resolve, reject) => {
        const worker = new Worker(readerWorkerPath, {
            workerData: 'parent to worker data'
        });
        worker.on('message', resolve);
        worker.on('error', reject);
        worker.on('exit', (code) => {
            if (code !== 0)
            reject(new Error(`Worker stopped with exit code ${code}`));
        });
    });
};

run();