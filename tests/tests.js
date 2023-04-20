import * as helios from "@hyperionbt/helios"
import fs from "fs";
import * as tester from './contractTesting.js'

let contract = fs.readFileSync("../contract.helios").toString();
contract = contract.replace('ctx.get_current_validator_hash()', 'ValidatorHash::new(#01234567890123456789012345678901234567890123456789000001)')
// test helpers and fixtures can be loaded from different files and concatenated
const helpers = fs.readFileSync("./test_helpers.helios").toString();
const fixtures = fs.readFileSync("./test_fixtures.helios").toString();
const program = helios.Program.new(contract + helpers + fixtures);
const testContract = program.compile();

tester.setup(program, testContract);
Promise.all([

    // SHOULD APPROVE
    tester.testCase(true, "UPDATE_NFT_HANDLE", "happy path", ["good_datum", "update_nft_redeemer_good", "good_default"]),
    tester.testCase(true, "UPDATE_NFT_HANDLE", "partner pfp/bg lists", ["good_datum", "update_nft_redeemer_good", "good_ref_sub"]),

    tester.testCase(true, "ADMIN_UPDATE", "happy path", ["good_datum", "good_admin_redeemer", "good_admin_ctx"]),
    
    // SHOULD DENY
    tester.testCase(false, "UPDATE_NFT_HANDLE", "bad user token name", ["good_datum", "update_nft_redeemer_good", "wrong_handle_name"], "Handle reference input not present"),
    tester.testCase(false, "UPDATE_NFT_HANDLE", "bad user token label", ["good_datum", "update_nft_redeemer_good", "wrong_handle_label"], "Handle reference input not present"),
    tester.testCase(false, "UPDATE_NFT_HANDLE", "bad user token policy", ["good_datum", "update_nft_redeemer_good", "not_a_real_handle"], "Handle reference input not present"),
    tester.testCase(false, "UPDATE_NFT_HANDLE", "bad reference token name", ["good_datum", "update_nft_redeemer_good", "bad_ref_token_name"], "Reference Token is not in input list"),
    tester.testCase(false, "UPDATE_NFT_HANDLE", "bad reference token label", ["good_datum", "update_nft_redeemer_good", "bad_ref_token_label"], "Reference Token is not in input list"),
    tester.testCase(false, "UPDATE_NFT_HANDLE", "bad reference token address", ["good_datum", "update_nft_redeemer_good", "bad_ref_token_creds"], "Reference Token is not in input list"),
    tester.testCase(false, "UPDATE_NFT_HANDLE", "bad reference token policy", ["good_datum", "update_nft_redeemer_good", "bad_ref_token_policy"], "Reference Token is not in input list"),
    tester.testCase(false, "UPDATE_NFT_HANDLE", "reference token not output to contract", ["good_datum", "update_nft_redeemer_good", "bad_ref_token_wrong_output"], "Reference Token not returned to contract"),
    tester.testCase(false, "UPDATE_NFT_HANDLE", "missing handle reference input", ["good_datum", "update_nft_redeemer_good", "handle_missing_from_inputs"], "Handle reference input not present"),
    tester.testCase(false, "UPDATE_NFT_HANDLE", "missing bg reference input", ["good_datum", "update_nft_redeemer_good", "missing_bg_ref_input"], "bg_policy_ids reference input not present or not from valid provider"),
    tester.testCase(false, "UPDATE_NFT_HANDLE", "missing pfp reference input", ["good_datum", "update_nft_redeemer_good", "missing_pfp_ref_input"], "pfp_policy_ids reference input not present or not from valid provider"),
    tester.testCase(false, "UPDATE_NFT_HANDLE", "missing pz reference input", ["good_datum", "update_nft_redeemer_good", "missing_pz_ref_input"], "pz_settings reference input not present"),
    tester.testCase(false, "UPDATE_NFT_HANDLE", "provider fee wrong", ["good_datum", "update_nft_redeemer_good", "provider_fee_wrong"], "Personalization provider not found or fee unpaid"),
    tester.testCase(false, "UPDATE_NFT_HANDLE", "provider address wrong", ["good_datum", "update_nft_redeemer_good", "provider_address_wrong"], "Personalization provider not found or fee unpaid"),
    tester.testCase(false, "UPDATE_NFT_HANDLE", "provider datum wrong", ["good_datum", "update_nft_redeemer_good", "provider_datum_wrong"], "Personalization provider not found or fee unpaid"),
    tester.testCase(false, "UPDATE_NFT_HANDLE", "treasury fee wrong", ["good_datum", "update_nft_redeemer_good", "treasury_fee_wrong"], "Handle treasury fee unpaid"),
    tester.testCase(false, "UPDATE_NFT_HANDLE", "treasury address wrong", ["good_datum", "update_nft_redeemer_good", "treasury_address_wrong"], "Handle treasury fee unpaid"),
    tester.testCase(false, "UPDATE_NFT_HANDLE", "treasury datum wrong", ["good_datum", "update_nft_redeemer_good", "treasury_datum_wrong"], "Handle treasury fee unpaid"),
    tester.testCase(false, "UPDATE_NFT_HANDLE", "pz settings wrong address", ["good_datum", "update_nft_redeemer_good", "pz_settings_wrong_address"], "pz_settings reference input not from ADA Handle"),
    tester.testCase(false, "UPDATE_NFT_HANDLE", "wrong contract address", ["good_datum", "update_nft_redeemer_good", "wrong_contract_address"], "Contract not found in valid contracts list"),
    //tester.testDenial("UPDATE_NFT_HANDLE", "missing reference token in outputs", ["good_datum", "update_nft_redeemer_good", "missing_reference_token"], "Reference Token not found in outputs"),

    tester.testCase(false, "ADMIN_UPDATE", "wrong admin signer", ["good_datum", "good_admin_redeemer", "wrong_admin_ctx"], "Required admin signer(s) not present"),
    tester.testCase(false, "ADMIN_UPDATE", "no admin signers", ["good_datum", "good_admin_redeemer", "no_admin_signers_ctx"], "Required admin signer(s) not present")

]).then(() => {
    tester.displayStats()
})