import * as helios from "@hyperionbt/helios"
//const val =  new helios.MapData([[helios.ByteArrayData.fromString('pfp_asset'), helios.ByteArrayData.fromCbor([...Buffer.from('5822f0ff48bbb7bbe9d59a40f1ce90e9e9d0ff5002ec48f232b49ca0fb9a000de1406769', 'hex')])]]);
const val = helios.UplcData.fromCbor([...Buffer.from('187b', 'hex')]);
console.log(val.toSchemaJson());
//const map = helios.MapData.fromCbor(val.toCbor());
console.log(Buffer.from(val.toCbor()).toString('hex'));
// #a1497066705f61737365745822f0ff48bbb7bbe9d59a40f1ce90e9e9d0ff5002ec48f232b49ca0fb9a000de1406769