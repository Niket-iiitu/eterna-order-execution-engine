import { v4 as uuid } from 'uuid';
import { getQuote, executeSwap } from '@/lib/mockDexRouter.js';
import { broadcast } from '@/lib/websocket.js';
import { orders } from '@/lib/orderStore.js';


export async function POST(request: Request) {
    try {
        const body = (await request.json()) as {
            tokenIn: string;
            tokenOut: string;
            amount: number;
            slippage: number;
        };

        if (!body?.tokenIn || !body?.tokenOut || !body.amount) {
            return new Response(JSON.stringify({ error: 'Invalid request body' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        const orderId = uuid();
        orders.set(orderId, { status: 'pending' });

        // process asynchronously so response is fast
        processOrder(orderId);

        return new Response(JSON.stringify({ orderId }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (err) {
        console.error(err);
        return new Response(JSON.stringify({ error: 'Internal server error' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}

async function processOrder(orderId: string) {
    try {
        broadcast(orderId, { status: 'pending' });

        broadcast(orderId, { status: 'routing' });
        const r = await getQuote('raydium');
        const m = await getQuote('meteora');

        const best = r.price > m.price ? r : m;
        broadcast(orderId, {
            status: 'routing',
            selectedDex: best.dex,
            price: best.price
        });

        broadcast(orderId, { status: 'building' });

        broadcast(orderId, { status: 'submitted' });
        const result = await executeSwap(best.dex);

        broadcast(orderId, {
            status: 'confirmed',
            txHash: result.txHash
        });

    } catch (e: any) {
        broadcast(orderId, {
            status: 'failed',
            error: e.message
        });
    }
}
