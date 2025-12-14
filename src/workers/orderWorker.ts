import { Worker, type Job } from 'bullmq';
import { QUEUE_NAME } from '../queues/orderQueue.js';
import { connection } from '../queues/redis.js';
import { broadcast } from '../lib/websocket.js';
import { getQuote, executeSwap } from '../lib/mockDexRouter.js';

/**
 * Start order execution worker
 * (Run this in a separate process)
 */
export function startWorker() {
    console.log('Starting order worker', {
        queue: QUEUE_NAME,
        redis: '127.0.0.1:6379',
    });

    // Redis diagnostics (safe in dev)
    connection.on('connect', () => console.log('Redis: connect'));
    connection.on('ready', () => console.log('Redis: ready'));
    connection.on('error', (err: any) => console.error('Redis: error', err));
    connection.on('close', () => console.log('Redis: close'));

    const worker = new Worker(
        QUEUE_NAME,
        async (job: Job) => {
            const orderId = String(job.id);

            try {
                console.log('Processing job:', job.id, job.data);

                broadcast(orderId, { status: 'routing' });

                const r = await getQuote('raydium');
                const m = await getQuote('meteora');
                const best = r.price > m.price ? r : m;

                broadcast(orderId, {
                    status: 'routing',
                    selectedDex: best.dex,
                    price: best.price,
                });

                broadcast(orderId, { status: 'building' });

                broadcast(orderId, { status: 'submitted' });
                const result = await executeSwap(best.dex);

                broadcast(orderId, {
                    status: 'confirmed',
                    txHash: result.txHash,
                });

                return result;
            } catch (err: any) {
                console.error('Job execution failed:', err);

                broadcast(orderId, {
                    status: 'failed',
                    error: err?.message ?? String(err),
                });

                // IMPORTANT: throw to allow retries
                throw err;
            }
        },
        {
            connection,
            concurrency: 10, // requirement: up to 10 concurrent orders
        }
    );

    // Worker lifecycle logs
    worker.on('active', job =>
        console.log('Job active:', job.id)
    );

    worker.on('completed', job =>
        console.log('Job completed:', job.id)
    );

    worker.on('failed', (job, err) =>
        console.error('Job failed:', job?.id, err)
    );

    worker.on('error', err =>
        console.error('Worker error:', err)
    );

    console.log('Order worker started');
    return worker;
}

export default startWorker;
