import {spawn} from "node:child_process";
import fs from "node:fs/promises";
import path from "path";

import { fileURLToPath } from 'url';
import { dirname } from 'path';



type Task = {
    id: string;
    codeContent: string;
    stdin: string[];
}
class Executor {
    __dirname: string;
    constructor() {
        const __filename = fileURLToPath(import.meta.url);
        this.__dirname = dirname(__filename);
    }

     async addTask(task: Task): Promise<string> {

        return await this.run(task);
    }


    private async clear(fileName: string) {
        await fs.rm(fileName);
    }

    private async run(task: Task): Promise<string> {

        const fileName = path.resolve(this.__dirname, `chunk-${task.id}.js`);
        await fs.writeFile(fileName, task.codeContent);

        const output = await new Promise<string>((resolve, reject) => {

            let output: string = '';

            const child = spawn('node', [fileName]);

            for (let line of task.stdin) {
                child.stdin.write(line + '\n');
            }

            child.stdin.end();

            child.stdout.on('data', (data) => output += data.toString());
            child.stderr.on('data', (data) => output += data.toString());
            child.on('close',  (code) => {

                resolve(output);
            })
        })

        await this.clear(fileName);

        return output;

    }
}

export default Executor;

