const { generateNonce } = require('./proofOfWork');
const sha256 = require('js-sha256');

function generateDeviceFingerprint(req) {
    const deviceInfo = `${req.ip}-${req.headers['user-agent']}`;
    return sha256(deviceInfo);
}

function generateToken(req, user) {
    const tokenPayload = {
        userId: user._id.toString(),
        issuedAt: Date.now(),
        expiresIn: Date.now() + (900 * 1000),
        nonce: 0,
        proofOfWork: "",
        scope: ["read", "write"],
        issuer: "authServer",
        deviceFingerprint: generateDeviceFingerprint(req)
    };

    const { nonce, proofOfWork } = generateNonce(tokenPayload, 3);
    tokenPayload.nonce = nonce;
    tokenPayload.proofOfWork = proofOfWork;

    return tokenPayload;
}

module.exports = { generateToken, generateDeviceFingerprint };
