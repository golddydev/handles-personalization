import fs from "fs";
import * as tester from './contractTesting.js'
import { BackgroundDefaults, Datum, PzRedeemer, ScriptContext, handle } from './testClasses.js'

let contract = fs.readFileSync("../contract.helios").toString();
contract = contract.replace(/ctx.get_current_validator_hash\(\)/g, 'ValidatorHash::new(#01234567890123456789012345678901234567890123456789000001)');

tester.init('PERSONALIZE');

// Default happy path is all reference inputs, bg/pfp are CIP-68, all defaults are set and forced. Tests begin to vary from that default
Promise.all([
    // PERSONALIZE ENDPOINT - SHOULD APPROVE
    tester.testCase(true, "PERSONALIZE", "happy path", () => {
        const redeemer = new PzRedeemer();
        const program = tester.createProgram(contract, new Datum().render(), redeemer.render(), new ScriptContext(redeemer.calculateCid()).render());
        return {
            contract: program.compile(),
            params: ["datum", "redeemer", "context"].map((p) => program.evalParam(p))
        }
    }),
    tester.testCase(true, "PERSONALIZE", "happy path no defaults", () => {
        const redeemer = new PzRedeemer();
        const context = new ScriptContext(redeemer.calculateCid());
        const bg_ref = context.referenceInputs.find(input => input.output.asset == '"bg"' && input.output.label == 'LBL_100');
        const defaults = new BackgroundDefaults();
        defaults.extra = {};
        bg_ref.output.datum = defaults.render();
        const program = tester.createProgram(contract, new Datum().render(), redeemer.render(), context.render());
        return {
            contract: program.compile(),
            params: ["datum", "redeemer", "context"].map((p) => program.evalParam(p))
        }
    }),
    tester.testCase(true, "PERSONALIZE", "partner pfp/bg lists", () => {
        const redeemer = new PzRedeemer();
        const context = new ScriptContext(redeemer.calculateCid());
        context.outputs[2].asset = '"partner@bg_policy_ids"';
        const program = tester.createProgram(contract, new Datum().render(), redeemer.render(), context.render());
        return {
            contract: program.compile(),
            params: ["datum", "redeemer", "context"].map((p) => program.evalParam(p))
        }
    }),

    // PERSONALIZE ENDPOINT - SHOULD DENY
    // tester.testCase(false, "PERSONALIZE", "bad user token name", ["good_datum", "pz_redeemer_good", "wrong_handle_name"], "Handle reference input not present"),
    // tester.testCase(false, "PERSONALIZE", "bad user token label", ["good_datum", "pz_redeemer_good", "wrong_handle_label"], "Handle reference input not present"),
    // tester.testCase(false, "PERSONALIZE", "bad user token policy", ["good_datum", "pz_redeemer_good", "not_a_real_handle"], "Handle reference input not present"),
    // tester.testCase(false, "PERSONALIZE", "bad reference token name", ["good_datum", "pz_redeemer_good", "bad_ref_token_name"], "Reference Token is not in input list"),
    // tester.testCase(false, "PERSONALIZE", "bad reference token label", ["good_datum", "pz_redeemer_good", "bad_ref_token_label"], "Reference Token is not in input list"),
    // tester.testCase(false, "PERSONALIZE", "bad reference token address", ["good_datum", "pz_redeemer_good", "bad_ref_token_creds"], "Reference Token is not in input list"),
    // tester.testCase(false, "PERSONALIZE", "bad reference token policy", ["good_datum", "pz_redeemer_good", "bad_ref_token_policy"], "Reference Token is not in input list"),
    // tester.testCase(false, "PERSONALIZE", "reference token not output to contract", ["good_datum", "pz_redeemer_good", "bad_ref_token_wrong_output"], "Reference Token not returned to contract"),
    // tester.testCase(false, "PERSONALIZE", "missing handle reference input", ["good_datum", "pz_redeemer_good", "handle_missing_from_inputs"], "Handle reference input not present"),
    // tester.testCase(false, "PERSONALIZE", "missing bg reference input", ["good_datum", "pz_redeemer_good", "missing_bg_ref_input"], "bg_policy_ids reference input not present or not from valid provider"),
    // tester.testCase(false, "PERSONALIZE", "missing pfp reference input", ["good_datum", "pz_redeemer_good", "missing_pfp_ref_input"], "pfp_policy_ids reference input not present or not from valid provider"),
    // tester.testCase(false, "PERSONALIZE", "missing pz reference input", ["good_datum", "pz_redeemer_good", "missing_pz_ref_input"], "pz_settings reference input not present"),
    // tester.testCase(false, "PERSONALIZE", "provider fee wrong", ["good_datum", "pz_redeemer_good", "provider_fee_wrong"], "Personalization provider not found or fee unpaid"),
    // tester.testCase(false, "PERSONALIZE", "provider address wrong", ["good_datum", "pz_redeemer_good", "provider_address_wrong"], "Personalization provider not found or fee unpaid"),
    // tester.testCase(false, "PERSONALIZE", "provider datum wrong", ["good_datum", "pz_redeemer_good", "provider_datum_wrong"], "Personalization provider not found or fee unpaid"),
    // tester.testCase(false, "PERSONALIZE", "treasury fee wrong", ["good_datum", "pz_redeemer_good", "treasury_fee_wrong"], "Handle treasury fee unpaid"),
    // tester.testCase(false, "PERSONALIZE", "treasury address wrong", ["good_datum", "pz_redeemer_good", "treasury_address_wrong"], "Handle treasury fee unpaid"),
    // tester.testCase(false, "PERSONALIZE", "treasury datum wrong", ["good_datum", "pz_redeemer_good", "treasury_datum_wrong"], "Handle treasury fee unpaid"),
    // tester.testCase(false, "PERSONALIZE", "pz settings wrong address", ["good_datum", "pz_redeemer_good", "pz_settings_wrong_address"], "pz_settings reference input not from ADA Handle"),
    // tester.testCase(false, "PERSONALIZE", "wrong contract address", ["good_datum", "pz_redeemer_good", "wrong_contract_address"], "Contract not found in valid contracts list"),
    // tester.testCase(false, "PERSONALIZE", "missing reference token in outputs", ["good_datum", "pz_redeemer_good", "missing_reference_token"], "Reference Token not found in outputs"),

    // tester.testCase(true, "MIGRATE", "happy path", ["good_datum", "good_admin_redeemer", "good_admin_ctx"]),
    // tester.testCase(true, "RESET_IMAGE", "happy path", ["good_datum", "good_admin_redeemer", "good_admin_ctx"]),
    // MULTIPLE HAPPY PATHS NOW - NEED MORE TESTS
    

    // tester.testCase(false, "MIGRATE", "wrong admin signer", ["good_datum", "good_admin_redeemer", "wrong_admin_ctx"], "Required admin signer(s) not present"),
    // tester.testCase(false, "MIGRATE", "no admin signers", ["good_datum", "good_admin_redeemer", "no_admin_signers_ctx"], "Required admin signer(s) not present")

]).then(() => {
    tester.displayStats()
})