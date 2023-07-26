import * as helios from "@hyperionbt/helios"
import fs from "fs";
const OPTIMIZE = Boolean(process.env.OPTIMIZE || false);
const REMOVE_ERRORS = Boolean(process.env.REMOVE_ERRORS || false);
let contractHelios = fs.readFileSync("./contract.helios").toString();
if (REMOVE_ERRORS) {
    contractHelios = contractHelios.replace(/assert\(((?:.|\n)*?), ".*?\);/gm, 'assert($1, "");')
    fs.writeFileSync("./contract/contract_no_asserts.helios", contractHelios);
}
let program = helios.Program.new(contractHelios);
const contract = program.compile(OPTIMIZE);
const address = helios.Address.fromValidatorHash(contract.validatorHash);

fs.writeFileSync("./contract/contract.json", contract.serialize());
fs.writeFileSync("./contract/contract.cbor", Buffer.from(JSON.parse(contract.serialize()).cborHex, "hex"));
fs.writeFileSync("./contract/contract.addr", address.toBech32());
fs.writeFileSync("./contract/contract.hash", contract.validatorHash.hex);

// IN CLI:
// helios compile contract.helios --optimize -o contract.json
// helios address contract.json (add -m for mainnet) > contract_testnets.address
// cat contract_testnets.address | cardano-address address inspect (look for the spending_shared_hash)