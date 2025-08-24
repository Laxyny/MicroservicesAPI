const crypto = require("crypto");

function generateChallenge() {
  const challenge = crypto.randomBytes(16).toString("hex");
  return challenge;
}

function verifySolution(challenge, solution, difficulty = 3) {
  const hash = crypto
    .createHash("sha256")
    .update(challenge + solution)
    .digest("hex");

  return hash.startsWith("0".repeat(difficulty));
}

module.exports = {
  generateChallenge,
  verifySolution,
};
