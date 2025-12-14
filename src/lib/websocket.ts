import { WebSocketServer } from 'ws';

export const wss = new WebSocketServer({ noServer: true });

// Broadcast update to all clients (or you can filter by orderId if needed)
export function broadcast(orderId: string, data: any) {
    const message = JSON.stringify({ orderId, ...data });
    wss.clients.forEach(client => {
        if (client.readyState === 1) client.send(message);
    });
}
