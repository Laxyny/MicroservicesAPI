const sha256 = require('js-sha256');

function generateNonce(infos, difficulty = 3) {
    let nonce = 0;
    const targetPrefix = "0".repeat(difficulty);

    while (true) {
        const dataToHash = `${JSON.stringify(infos)}${nonce}`;
        const hash = sha256(dataToHash);

        if (hash.startsWith(targetPrefix)) {
            return { nonce, proofOfWork: hash };
        }

        nonce++;
    }
}

module.exports = { generateNonce };
