import { startWorker } from '../src/workers/orderWorker.js';

(async () => {
    try {
        await startWorker();
        // keep process alive
        process.stdin.resume();
        console.log('Worker process running (press Ctrl+C to exit)');
    } catch (err) {
        console.error('Failed to start worker:', err);
        process.exit(1);
    }
})();