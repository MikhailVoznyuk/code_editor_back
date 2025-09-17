import {WebSocketServer} from 'ws';

import Executor from "./lib/executor/executor.js";

type ServerConfig = {
    port: number,
    host: string,
};
const serverConfig: ServerConfig = {
    port: 8080,
    host: '127.0.0.1'
};

const wss = new WebSocketServer(serverConfig);

const executor = new Executor();

wss.on('connection', (ws) => {
    console.log('Connection connected');
    ws.send('Hello!')
    ws.on('message', data => {
        executor.addTask({
            id: crypto.randomUUID(),
            codeContent: data.toString(),
            stdin: []
        }).then(result => ws.send(result));

    })
})

