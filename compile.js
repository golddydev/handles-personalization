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

fs.mkdirSync("./contract", {recursive: true});
fs.writeFileSync("./contract/contract.json", contract.serialize());
fs.writeFileSync("./contract/contract.hex", JSON.parse(contract.serialize()).cborHex);
fs.writeFileSync("./contract/contract.cbor", Buffer.from(JSON.parse(contract.serialize()).cborHex, "hex"));
fs.writeFileSync("./contract/contract.addr", address.toBech32());
fs.writeFileSync("./contract/contract.hash", contract.validatorHash.hex);
fs.writeFileSync("./contract/contract.uplc", contract.toString());

// // Treasury
// console.log("Treasury", helios.Address.fromBech32('addr1x92852d60qgsjm9wxsvheerqkrvtshyezcyxula3tgn8h0250g5m57q3p9k2udqe0njxpvxchpwfj9sgdelmzk3x0w7sz9zapd').validatorHash.hex)
// // Provider
// console.log("Provider", helios.Address.fromBech32('addr1xysgj7dndz9ql57jsh5y0ss258d0yl8wqfj4hy00ulyw6ueq39umx6y2plfa9p0gglpq4gw67f7wuqn9twg7le7ga4es4uake8').validatorHash.hex)
// // Settings
// console.log("Settings", helios.Address.fromBech32('addr1x9lr5j907rwl4hkz98gnle8v238l8nz0q3rzn48rr6p4nur78fy2luxalt0vy2w38ljwc4z070xy7pzx982wx85rt8cqc65x5w').validatorHash.hex)

// IN CLI:
// helios compile contract.helios --optimize -o contract.json
// helios address contract.json (add -m for mainnet) > contract_testnets.address
// cat contract_testnets.address | cardano-address address inspect (look for the spending_shared_hash)