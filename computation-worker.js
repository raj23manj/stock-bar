const {parentPort, workerData,isMainThread} = require('worker_threads');

let endResult = [];
let allStockData = {};
let globalStartTime = null;

if(!isMainThread)
{   
    let recievedData = [];
    parentPort.on('message', (data) => {
        data.port.on('message', (msg) => {        
            if( msg != -99) {
                recievedData.push(msg);
            }
            compute();
        })
    });

    const ohlcJson = (cur, prev, barNum, isBarNum, closingBar) => {
        let data = null;

        if(prev === null) {
            data = { 
                "event": "ohlc_notify",
                "symbol": cur.sym,
                "bar_num": (isBarNum ? 1 : barNum),
                "o": cur.P, 
                "h": cur.P, 
                "l": cur.P, 
                "c": cur.P, 
                "volume": cur.Q
            }
        } else {
            data = { 
                "event": "ohlc_notify",
                "symbol": cur.sym,
                "bar_num": barNum,
                "o": prev.o, 
                "h": (cur.P > prev.h ? cur.P : prev.h), 
                "l": cur.P, 
                "c": closingBar, 
                "volume": cur.Q + prev.volume 
            }
        }

        return data;
    }

    const aggregation = () => {
        let barNum = null;
        let isBarNum = false;
        recievedData.forEach(e => {
        obj = JSON.parse(e.line);

        if(Object.keys(allStockData).length === 0) {
                globalStartTime = Math.trunc(obj.TS2/ 1000000);
                barNum = 1;
                isBarNum = true;
            } else {
                curTime = Math.trunc(obj.TS2/ 1000000);
                barNum = Math.ceil((curTime - globalStartTime)/(15 * 1000));
            }
        
            if(!allStockData.hasOwnProperty(obj.sym)) {
                allStockData[obj.sym] = [];
                allStockData[obj.sym].push(ohlcJson(obj, null, barNum, isBarNum, 0));
            } else {
                let stockDataLength = allStockData[obj.sym].length;
                let objects = allStockData[obj.sym];
                let closeBar = null;
                // calculate closing bar
                let prevObj = objects[stockDataLength - 1];

                if(prevObj) {
                    if(prevObj.bar_num !== barNum) {
                        closeBar = 0;
                    } else {
                        closeBar = prevObj.l;
                        prevObj.c = 0.0;
                    }
                }

                let computedData = ohlcJson(obj, objects[stockDataLength - 1], barNum, isBarNum, closeBar);
                allStockData[obj.sym].push(computedData);
            } 
        });

        endResult = allStockData;
        recievedData = [];
        return null;
    };

    const compute = () => {
        if(recievedData.length > 0) {
            aggregation()
        }
        else{
            parentPort.postMessage(endResult);
            process.exit(23);
        }
    };
}
