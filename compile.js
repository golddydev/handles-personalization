import * as helios from "@hyperionbt/helios"
import fs from "fs";

let contractHelios = fs.readFileSync("./contract.helios").toString();
let program = helios.Program.new(contractHelios);
const contract = program.compile(false);
fs.writeFileSync("./contract.json", contract.serialize())

// Quick temp program to test datum encoding
program = helios.Program.new(`spending datum_types

struct PzSettings {
    admin_creds: ByteArray
}

func main(_, _, _) -> Bool {
    true
}`);
const { PzSettings } = program.types;
const datum = new PzSettings( new helios.ByteArray([...Buffer.from('151a82d0669a20bd77de1296eee5ef1259ce98ecd81bd7121825f9eb', 'hex')]) );
console.log(Buffer.from(datum._toUplcData().toCbor()).toString('hex')); //581c151a82d0669a20bd77de1296eee5ef1259ce98ecd81bd7121825f9eb
const constrData = new helios.ConstrData(0, [datum._toUplcData()]);
console.log(Buffer.from(constrData.toCbor()).toString('hex')); // d8799f581c151a82d0669a20bd77de1296eee5ef1259ce98ecd81bd7121825f9ebff


// IN CLI:
// helios compile contract.helios --optimize -o contract.json
// helios address contract.json (add -m for mainnet) > contract_testnets.address
// cat contract_testnets.address | cardano-address address inspect (look for the spending_shared_hash)