import * as helios from "./helios.js"
import fs from "fs";
const OPTIMIZE = Boolean(process.env.OPTIMIZE || false);
//helios.config.set({IS_TESTNET: false})
let contractHelios = fs.readFileSync("./contract.helios").toString();
let program = helios.Program.new(contractHelios);
console.log(`OPTIMIZE is set to ${OPTIMIZE}`);
const contract = program.compile(OPTIMIZE);
const address = helios.Address.fromValidatorHash(contract.validatorHash);

fs.mkdirSync("./contract", {recursive: true});
fs.writeFileSync("./contract/contract.json", contract.serialize());
fs.writeFileSync("./contract/contract.hex", JSON.parse(contract.serialize()).cborHex);
fs.writeFileSync("./contract/contract.cbor", Buffer.from(JSON.parse(contract.serialize()).cborHex, "hex"));
fs.writeFileSync("./contract/contract.addr", address.toBech32());
fs.writeFileSync("./contract/contract.hash", contract.validatorHash.hex);
fs.writeFileSync("./contract/contract.uplc", contract.toString());

// IN CLI:
// helios compile contract.helios --optimize -o contract.json
// helios address contract.json (add -m for mainnet) > contract_testnets.address
// cat contract_testnets.address | cardano-address address inspect (look for the spending_shared_hash)