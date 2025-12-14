import http from 'http';
import next from 'next';
import { wss } from './lib/websocket.js';

// @ts-ignore
const app = next({ dev: true });
const handler = app.getRequestHandler();

app.prepare().then(() => {
    const server = http.createServer((req, res) => {
        handler(req, res);
    });

    server.on('upgrade', (req, socket, head) => {
        wss.handleUpgrade(req, socket, head, ws => {
            wss.emit('connection', ws, req);
        });
    });

    server.listen(3000, () => {
        console.log('Next.js server running on http://localhost:3000');
    });

});
