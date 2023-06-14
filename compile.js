import * as helios from "@hyperionbt/helios"
import fs from "fs";
const NETWORK = 'preview';
let contractHelios = fs.readFileSync("./contract.helios").toString();
let program = helios.Program.new(contractHelios);
const contract = program.compile(true);
//console.log(Buffer.from(contract.toCbor()).toString('hex'));
const address = helios.Address.fromValidatorHash(contract.validatorHash);

fs.writeFileSync("./contract/contract.cbor", contract.serialize());
fs.writeFileSync("./contract/contract.addr", address.toBech32());
fs.writeFileSync("./contract/contract.hash", contract.validatorHash.hex);


(async () => {
    const refScriptAddress = 'addr_test1qr8drf5eur4emcrsanv6ppcf3pywzkzpx3pp2hhr273ddgl34r3hjynmsy2cxpc04a6dkqxcsr29qfl7v9cmrd5mm89q4t0cw0';
    const POLICY_ID = 'f0ff48bbb7bbe9d59a40f1ce90e9e9d0ff5002ec48f232b49ca0fb9a';
    const handle = `000de140${Buffer.from('pzcontract.0001').toString('hex')}`;
    const tx = new helios.Tx();
    tx.addInput(new helios.UTxO(
        helios.TxId.fromHex('1078f6a508bde2344bc3bb369d3a0401035c87eb7cbfbc97a8cb3c1e20e843ea'),
        BigInt(0),
        new helios.TxOutput(
            helios.Address.fromBech32(refScriptAddress),
            new helios.Value(BigInt(10000000000), new helios.Assets([[POLICY_ID, [[handle, 1]]]]))
        ))
    );
    tx.addInput(new helios.UTxO(
        helios.TxId.fromHex('1078f6a508bde2344bc3bb369d3a0401035c87eb7cbfbc97a8cb3c1e20e843ea'),
        BigInt(1),
        new helios.TxOutput(
            helios.Address.fromBech32(refScriptAddress),
            new helios.Value(BigInt(10000000000))
        ))
    );
    tx.addOutput(new helios.TxOutput(
        helios.Address.fromBech32(refScriptAddress),
        new helios.Value(BigInt(50000000), new helios.Assets([[POLICY_ID, [[handle, 1]]]])),
        null,
        contract
    ));  
    const networkParams = new helios.NetworkParams(
        await fetch(`https://d1t0d7c2nekuk0.cloudfront.net/${NETWORK}.json`).then((response) => response.json())
    );
    const txBody = await tx.finalize(networkParams, helios.Address.fromBech32(refScriptAddress));
    fs.writeFileSync("./contract/tx.body", helios.bytesToHex(txBody.toCbor()));
})()



// // Quick temp program to test datum encoding
// program = helios.Program.new(`spending datum_types

// struct PzSettings {
//     admin_creds: ByteArray
// }

// func main(_, _, _) -> Bool {
//     true
// }`);
// const { PzSettings } = program.types;
// const datum = new PzSettings( new helios.ByteArray([...Buffer.from('151a82d0669a20bd77de1296eee5ef1259ce98ecd81bd7121825f9eb', 'hex')]) );
// console.log(Buffer.from(datum._toUplcData().toCbor()).toString('hex')); //581c151a82d0669a20bd77de1296eee5ef1259ce98ecd81bd7121825f9eb
// const constrData = new helios.ConstrData(0, [datum._toUplcData()]);
// console.log(Buffer.from(constrData.toCbor()).toString('hex')); // d8799f581c151a82d0669a20bd77de1296eee5ef1259ce98ecd81bd7121825f9ebff


// IN CLI:
// helios compile contract.helios --optimize -o contract.json
// helios address contract.json (add -m for mainnet) > contract_testnets.address
// cat contract_testnets.address | cardano-address address inspect (look for the spending_shared_hash)