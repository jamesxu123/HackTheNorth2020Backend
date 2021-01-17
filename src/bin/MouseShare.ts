import WebSocket from "ws";

const WebSock = require('ws')

function noop() {}

function heartbeat(this: any) {
    this.isAlive = true;
}

const wss = new WebSock.Server({
    port: 8080,
    perMessageDeflate: {
        zlibDeflateOptions: {
            // See zlib defaults.
            chunkSize: 1024,
            memLevel: 7,
            level: 3
        },
        zlibInflateOptions: {
            chunkSize: 10 * 1024
        },
        // Other options settable:
        clientNoContextTakeover: true, // Defaults to negotiated value.
        serverNoContextTakeover: true, // Defaults to negotiated value.
        serverMaxWindowBits: 10, // Defaults to negotiated value.
        // Below options specified as default values.
        concurrencyLimit: 10, // Limits zlib concurrency for perf.
        threshold: 1024 // Size (in bytes) below which messages
        // should not be compressed.
    }
});

let positions: any = {}

interface IWSCom {
    username: string,
    data: object,
    port: number
}

wss.on('connection', (ws: any) => {
    ws.isAlive = true;
    ws.on('pong', heartbeat);
    ws.on('message', (message: any) => {
        // @ts-ignore
        const obj: IWSCom = JSON.parse(message.toString())
        // // @ts-ignore
        // positions[obj.username] = obj.data

        if (positions[obj.port]) {
            positions[obj.port][obj.username] = obj.data
        } else {
            positions[obj.port] = {}
            positions[obj.port][obj.username] = obj.data
        }
        ws.send(JSON.stringify(positions[obj.port]))
    })
})

const interval = setInterval(function ping() {
    wss.clients.forEach(function each(ws: any) {
        if (ws.isAlive === false) {
            console.log('bye')
            positions = {};
            return ws.terminate();
        }

        ws.isAlive = false;
        ws.ping(noop);
    });
}, 10000);

wss.on('close', function close() {
    clearInterval(interval);
});
