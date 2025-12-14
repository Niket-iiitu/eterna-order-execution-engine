import { WebSocketServer } from 'ws';

export const wss = new WebSocketServer({ noServer: true });

export function broadcast(orderId: string, data: any) {
    wss.clients.forEach(client => {
        client.send(JSON.stringify({ orderId, ...data }));
    });
}
