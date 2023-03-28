import * as helios from "@hyperionbt/helios"
import fs from "fs";

let contractHelios = fs.readFileSync("./contract.helios").toString();
const program = helios.Program.new(contractHelios);
const contract = program.compile(true);
fs.writeFileSync("./contract.json", contract.serialize())

// IN CLI:
// helios compile contract.helios --optimize -o contract.json
// helios address contract.json (add -m for mainnet)