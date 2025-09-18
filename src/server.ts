import {WebSocketServer} from 'ws';

import Executor from "./lib/executor/executor.js";

type ServerConfig = {
    port: number,
    host: string,
};
const serverConfig: ServerConfig = {
    port: 8080,
    host: '0.0.0.0'
};

const wss = new WebSocketServer(serverConfig);

const executor = new Executor();

wss.on('connection', (ws) => {
    ws.on('message', data => {
        executor.addTask({
            id: crypto.randomUUID(),
            codeContent: data.toString(),
            stdin: []
        }).then(result => ws.send(result));

    })
})

