import { Queue, QueueEvents, type JobsOptions } from 'bullmq';
import { connection } from './redis.js';

export const QUEUE_NAME = 'orders';

let queue: Queue | null = null;
let events: QueueEvents | null = null;

/**
 * Lazily create Queue (producer)
 */
export function getOrderQueue(): Queue {
    if (!queue) {
        queue = new Queue(QUEUE_NAME, {
            connection,
            defaultJobOptions: {
                attempts: 3,
                backoff: {
                    type: 'exponential',
                    delay: 1000,
                },
                removeOnComplete: true,
                removeOnFail: false,
            },
        });
    }
    return queue;
}

/**
 * Lazily create QueueEvents (observability)
 */
export function getOrderQueueEvents(): QueueEvents {
    if (!events) {
        events = new QueueEvents(QUEUE_NAME, { connection });

        events.on('waiting', ({ jobId }) => {
            console.log('Job waiting:', jobId);
        });

        events.on('completed', ({ jobId }) => {
            console.log('Job completed:', jobId);
        });

        events.on('failed', ({ jobId, failedReason }) => {
            console.error('Job failed:', jobId, failedReason);
        });
    }
    return events;
}

/**
 * Enqueue an order
 */
export async function enqueueOrder(
    data: unknown,
    opts?: JobsOptions
) {
    const queue = getOrderQueue();
    getOrderQueueEvents(); // ensure events are attached once

    const job = await queue.add('execute', data, opts);
    console.log('Enqueued job:', job.id);

    return job;
}
