import { NextRequest, NextResponse } from 'next/server';
import { enqueueOrder } from '@/queues/orderQueue.js';
import { broadcast } from '@/lib/websocket.js';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json() as {
            tokenIn: string;
            tokenOut: string;
            amount: number;
            slippage: number;
        };

        if (!body?.tokenIn || !body?.tokenOut || !body.amount) {
            return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
        }

        // Enqueue the order for processing
        const job = await enqueueOrder(body);

        // Optionally broadcast immediately that job is pending
        broadcast(job.id, { status: 'pending' });

        // Respond immediately with jobId
        return NextResponse.json({ orderId: job.id }, { status: 200 });
    } catch (err) {
        console.error(err);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
