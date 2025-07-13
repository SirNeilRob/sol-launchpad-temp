const fs = require("fs");
const web3 = require("@solana/web3.js");

const KEYPAIR_PATH = "/home/gc/.config/solana/id.json";
const secret = Uint8Array.from(JSON.parse(fs.readFileSync(KEYPAIR_PATH)));
const payer = web3.Keypair.fromSecretKey(secret);

console.log("Loaded pubkey:", payer.publicKey.toBase58());
console.log("Secret length:", secret.length);
console.log("Secret sample:", secret.slice(0,10));
