export async function getQuote(dex: 'raydium' | 'meteora') {
    await sleep(200);
    const base = 1.0;
    const variance = dex === 'raydium'
        ? 0.98 + Math.random() * 0.04
        : 0.97 + Math.random() * 0.05;

    return {
        dex,
        price: base * variance,
        fee: dex === 'raydium' ? 0.003 : 0.002
    };
}

export async function executeSwap(dex: string) {
    await sleep(2000 + Math.random() * 1000);
    return {
        txHash: `MOCK_TX_${Math.random().toString(36).slice(2)}`
    };
}

function sleep(ms: number) {
    return new Promise(res => setTimeout(res, ms));
}
