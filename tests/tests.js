import * as helios from "@hyperionbt/helios"
import fs from "fs";
import * as tester from './contractTesting.js'

const contract = fs.readFileSync("../contract.helios").toString();
// test helpers and fixtures can be loaded from different files and concatenated
const helpers = fs.readFileSync("./test_helpers.helios").toString();
const fixtures = fs.readFileSync("./test_fixtures.helios").toString();
const program = helios.Program.new(contract + helpers + fixtures);
const testContract = program.compile();

tester.setup(program, testContract);

await tester.testSuccess("update_nft_success", ["empty_datum", "update_nft_redeemer_good", "ctx_good_default"]);
await tester.testFailure("update_nft_fail", ["empty_datum", "update_nft_redeemer_good", "ctx_bad_ref_token_output"], "Reference Token not returned to contract");