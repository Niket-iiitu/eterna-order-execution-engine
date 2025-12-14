import { enqueueOrder } from '../queues/orderQueue.js';

export async function processOrder_enqueueOnly(orderPayload: unknown) {
    // do validations / fetch quotes, then enqueue for asynchronous execution
    await enqueueOrder({ orderPayload, createdAt: Date.now() });
    return { queued: true };
}