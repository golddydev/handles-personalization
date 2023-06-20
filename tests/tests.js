import fs from "fs";
import * as tester from './contractTesting.js'
import { BackgroundDefaults, Datum, PzRedeemer, PzSettings, ScriptContext, ApprovedPolicyIds, handle, pz_provider_bytes, pfp_policy, MigrateRedeemer, owner_bytes, bg_policy } from './testClasses.js'

let contract = fs.readFileSync("../contract.helios").toString();
contract = contract.replace(/ctx.get_current_validator_hash\(\)/g, 'ValidatorHash::new(#01234567890123456789012345678901234567890123456789000001)');

tester.init();

const pzRedeemer = new PzRedeemer();
const resetRedeemer = new PzRedeemer('RESET').reset();
const migrateRedeemer = new MigrateRedeemer();

Promise.all([
    // PERSONALIZE ENDPOINT - SHOULD APPROVE
    tester.testCase(true, "PERSONALIZE", "reference inputs, CIP-68, defaults forced", () => {
        const context = new ScriptContext().initPz(pzRedeemer.calculateCid());
        const program = tester.createProgram(contract, new Datum().render(), pzRedeemer.render(), context.render());
        return { contract: program.compile(), params: ["datum", "redeemer", "context"].map((p) => program.evalParam(p)) };
    }),
    tester.testCase(true, "PERSONALIZE", "reference inputs, pfp CIP-25, defaults forced", () => {
        const context = new ScriptContext().initPz(pzRedeemer.calculateCid());
        context.referenceInputs.find(input => input.output.asset == '"pfp"' && input.output.label == 'LBL_222').output.label = '';
        context.referenceInputs.splice(context.referenceInputs.indexOf(context.referenceInputs.find(input => input.output.asset == '"pfp"' && input.output.label == 'LBL_100')), 1);
        const datum = new Datum(pzRedeemer.calculateCid());
        datum.extra.pfp_asset = `OutputDatum::new_inline(${pfp_policy}706670).data`;
        context.outputs.find(output => output.asset == `"${handle}"` && output.label == 'LBL_100').datum = datum.render();
        const pfpApproverList = new ApprovedPolicyIds();
        pfpApproverList.map[`${pfp_policy}`] = {'#706670': [0,0,0]}
        context.referenceInputs.find(input => input.output.asset == '"pfp_policy_ids"' && input.output.label == 'LBL_222').output.datum = pfpApproverList.render();
        const program = tester.createProgram(contract, new Datum().render(), pzRedeemer.render(), context.render());
        return { contract: program.compile(), params: ["datum", "redeemer", "context"].map((p) => program.evalParam(p)) };
    }),
    tester.testCase(true, "PERSONALIZE", "reference inputs, CIP-68, no defaults", () => {
        const context = new ScriptContext().initPz(pzRedeemer.calculateCid());
        const bg_ref = context.referenceInputs.find(input => input.output.asset == '"bg"' && input.output.label == 'LBL_100');
        const defaults = new BackgroundDefaults();
        defaults.extra = {};
        bg_ref.output.datum = defaults.render();
        const program = tester.createProgram(contract, new Datum().render(), pzRedeemer.render(), context.render());
        return { contract: program.compile(), params: ["datum", "redeemer", "context"].map((p) => program.evalParam(p)) };
    }),
    tester.testCase(true, "PERSONALIZE", "reference inputs, CIP-68, defaults forced, provider policies", () => {
        const context = new ScriptContext().initPz(pzRedeemer.calculateCid());
        const bg_policy_input = context.referenceInputs.find(input => input.output.asset == '"bg_policy_ids"');
        bg_policy_input.output.asset = '"partner@bg_policy_ids"';
        bg_policy_input.output.hash = `${pz_provider_bytes}`;
        const program = tester.createProgram(contract, new Datum().render(), pzRedeemer.render(), context.render());
        return { contract: program.compile(), params: ["datum", "redeemer", "context"].map((p) => program.evalParam(p)) };
    }),

    // PERSONALIZE ENDPOINT - SHOULD DENY
    tester.testCase(false, "PERSONALIZE", "reference inputs, CIP-68, defaults forced, wrong handle name", () => {
        const context = new ScriptContext().initPz(pzRedeemer.calculateCid());
        context.referenceInputs.find(input => input.output.asset == `"${handle}"` && input.output.label == 'LBL_222').output.asset = '"xar12346"'
        const program = tester.createProgram(contract, new Datum().render(), pzRedeemer.render(), context.render());
        return { contract: program.compile(), params: ["datum", "redeemer", "context"].map((p) => program.evalParam(p)) };
    }, "Handle input not present"),
    tester.testCase(false, "PERSONALIZE", "reference inputs, CIP-68, defaults forced, wrong handle label", () => {
        const context = new ScriptContext().initPz(pzRedeemer.calculateCid());
        context.referenceInputs.find(input => input.output.asset == `"${handle}"` && input.output.label == 'LBL_222').output.label = '#000653b0'
        const program = tester.createProgram(contract, new Datum().render(), pzRedeemer.render(), context.render());
        return { contract: program.compile(), params: ["datum", "redeemer", "context"].map((p) => program.evalParam(p)) };
    }, "Handle input not present"),
    tester.testCase(false, "PERSONALIZE", "reference inputs, CIP-68, defaults forced, wrong handle policy", () => {
        const context = new ScriptContext().initPz(pzRedeemer.calculateCid());
        context.referenceInputs.find(input => input.output.asset == `"${handle}"` && input.output.label == 'LBL_222').output.policy = 'MintingPolicyHash::new(#f0ff48bbb7bbe9d59a40f1ce90e9e9d0ff5002ec48f232b49ca0fb9b)'
        const program = tester.createProgram(contract, new Datum().render(), pzRedeemer.render(), context.render());
        return { contract: program.compile(), params: ["datum", "redeemer", "context"].map((p) => program.evalParam(p)) };
    }, "Handle input not present"),
    tester.testCase(false, "PERSONALIZE", "reference inputs, CIP-68, defaults forced, bad ref token name", () => {
        const context = new ScriptContext().initPz(pzRedeemer.calculateCid());
        context.outputs.find(output => output.asset == `"${handle}"` && output.label == 'LBL_100').asset = '"xar12346"'
        const program = tester.createProgram(contract, new Datum().render(), pzRedeemer.render(), context.render());
        return { contract: program.compile(), params: ["datum", "redeemer", "context"].map((p) => program.evalParam(p)) };
    }, "Reference Token input not present"),
    tester.testCase(false, "PERSONALIZE", "reference inputs, CIP-68, defaults forced, bad ref token label", () => {
        const context = new ScriptContext().initPz(pzRedeemer.calculateCid());
        context.outputs.find(output => output.asset == `"${handle}"` && output.label == 'LBL_100').label = 'LBL_444'
        const program = tester.createProgram(contract, new Datum().render(), pzRedeemer.render(), context.render());
        return { contract: program.compile(), params: ["datum", "redeemer", "context"].map((p) => program.evalParam(p)) };
    }, "Reference Token input not present"),
    tester.testCase(false, "PERSONALIZE", "reference inputs, CIP-68, defaults forced, bad ref token policy", () => {
        const context = new ScriptContext().initPz(pzRedeemer.calculateCid());
        context.outputs.find(output => output.asset == `"${handle}"` && output.label == 'LBL_100').policy = 'MintingPolicyHash::new(#123456789012345678901234567890123456789012345678901234af)'
        const program = tester.createProgram(contract, new Datum().render(), pzRedeemer.render(), context.render());
        return { contract: program.compile(), params: ["datum", "redeemer", "context"].map((p) => program.evalParam(p)) };
    }, "Reference Token input not present"),
    tester.testCase(false, "PERSONALIZE", "reference inputs, CIP-68, defaults forced, bad ref token output", () => {
        const context = new ScriptContext().initPz(pzRedeemer.calculateCid());
        context.outputs.find(output => output.asset == `"${handle}"` && output.label == 'LBL_100').hash = '#123456789012345678901234567890123456789012345678901234af'
        const program = tester.createProgram(contract, new Datum().render(), pzRedeemer.render(), context.render());
        return { contract: program.compile(), params: ["datum", "redeemer", "context"].map((p) => program.evalParam(p)) };
    }, "Reference Token not returned to contract"),
    tester.testCase(false, "PERSONALIZE", "reference inputs, CIP-68, defaults forced, handle sig mismatch", () => {
        const context = new ScriptContext().initPz(pzRedeemer.calculateCid());
        context.referenceInputs.find(input => input.output.asset == `"${handle}"` && input.output.label == 'LBL_222').output.hash = '#123456789012345678901234567890123456789012345678901234af'
        const program = tester.createProgram(contract, new Datum().render(), pzRedeemer.render(), context.render());
        return { contract: program.compile(), params: ["datum", "redeemer", "context"].map((p) => program.evalParam(p)) };
    }, "Handle input not present"),
    tester.testCase(false, "PERSONALIZE", "reference inputs, CIP-68, defaults forced, handle missing", () => {
        const context = new ScriptContext().initPz(pzRedeemer.calculateCid());
        context.referenceInputs.splice(context.referenceInputs.indexOf(context.referenceInputs.find(input => input.output.asset == `"${handle}"` && input.output.label == 'LBL_222')), 1);
        const program = tester.createProgram(contract, new Datum().render(), pzRedeemer.render(), context.render());
        return { contract: program.compile(), params: ["datum", "redeemer", "context"].map((p) => program.evalParam(p)) };
    }, "Handle input not present"),
    tester.testCase(false, "PERSONALIZE", "reference inputs, CIP-68, defaults forced, bg_policy_ids missing", () => {
        const context = new ScriptContext().initPz(pzRedeemer.calculateCid());
        context.referenceInputs.splice(context.referenceInputs.indexOf(context.referenceInputs.find(input => input.output.asset == '"bg_policy_ids"' && input.output.label == 'LBL_222')), 1);
        const program = tester.createProgram(contract, new Datum().render(), pzRedeemer.render(), context.render());
        return { contract: program.compile(), params: ["datum", "redeemer", "context"].map((p) => program.evalParam(p)) };
    }, "bg_policy_ids reference input not present or not from valid provider"),
    tester.testCase(false, "PERSONALIZE", "reference inputs, CIP-68, defaults forced, bg_policy_ids wrong hash", () => {
        const context = new ScriptContext().initPz(pzRedeemer.calculateCid());
        context.referenceInputs.find(input => input.output.asset == `"bg_policy_ids"` && input.output.label == 'LBL_222').output.hash = '#123456789012345678901234567890123456789012345678901234af'
        const program = tester.createProgram(contract, new Datum().render(), pzRedeemer.render(), context.render());
        return { contract: program.compile(), params: ["datum", "redeemer", "context"].map((p) => program.evalParam(p)) };
    }, "bg_policy_ids reference input not present or not from valid provider"),
    tester.testCase(false, "PERSONALIZE", "reference inputs, CIP-68, defaults forced, pfp_policy_ids missing", () => {
        const context = new ScriptContext().initPz(pzRedeemer.calculateCid());
        context.referenceInputs.splice(context.referenceInputs.indexOf(context.referenceInputs.find(input => input.output.asset == '"pfp_policy_ids"' && input.output.label == 'LBL_222')), 1);
        const program = tester.createProgram(contract, new Datum().render(), pzRedeemer.render(), context.render());
        return { contract: program.compile(), params: ["datum", "redeemer", "context"].map((p) => program.evalParam(p)) };
    }, "pfp_policy_ids reference input not present or not from valid provider"),
    tester.testCase(false, "PERSONALIZE", "reference inputs, CIP-68, defaults forced, pfp_policy_ids wrong hash", () => {
        const context = new ScriptContext().initPz(pzRedeemer.calculateCid());
        context.referenceInputs.find(input => input.output.asset == `"pfp_policy_ids"` && input.output.label == 'LBL_222').output.hash = '#123456789012345678901234567890123456789012345678901234af'
        const program = tester.createProgram(contract, new Datum().render(), pzRedeemer.render(), context.render());
        return { contract: program.compile(), params: ["datum", "redeemer", "context"].map((p) => program.evalParam(p)) };
    }, "pfp_policy_ids reference input not present or not from valid provider"),
    tester.testCase(false, "PERSONALIZE", "reference inputs, CIP-68, defaults forced, pz_settings missing", () => {
        const context = new ScriptContext().initPz(pzRedeemer.calculateCid());
        context.referenceInputs.splice(context.referenceInputs.indexOf(context.referenceInputs.find(input => input.output.asset == '"pz_settings"' && input.output.label == 'LBL_222')), 1);
        const program = tester.createProgram(contract, new Datum().render(), pzRedeemer.render(), context.render());
        return { contract: program.compile(), params: ["datum", "redeemer", "context"].map((p) => program.evalParam(p)) };
    }, "pz_settings reference input not present"),
    tester.testCase(false, "PERSONALIZE", "reference inputs, CIP-68, defaults forced, pz_settings wrong hash", () => {
        const context = new ScriptContext().initPz(pzRedeemer.calculateCid());
        context.referenceInputs.find(input => input.output.asset == `"pz_settings"` && input.output.label == 'LBL_222').output.hash = '#123456789012345678901234567890123456789012345678901234af'
        const program = tester.createProgram(contract, new Datum().render(), pzRedeemer.render(), context.render());
        return { contract: program.compile(), params: ["datum", "redeemer", "context"].map((p) => program.evalParam(p)) };
    }, "pz_settings reference input not from ADA Handle"),
    tester.testCase(false, "PERSONALIZE", "reference inputs, CIP-68, defaults forced, bad script creds", () => {
        const context = new ScriptContext().initPz(pzRedeemer.calculateCid());
        const datum = new PzSettings();
        datum.valid_contracts = '[]ByteArray{#123456789012345678901234567890123456789012345678901234af}';
        context.referenceInputs.find(input => input.output.asset == `"pz_settings"` && input.output.label == 'LBL_222').output.datum = datum.render();
        const program = tester.createProgram(contract, new Datum().render(), pzRedeemer.render(), context.render());
        return { contract: program.compile(), params: ["datum", "redeemer", "context"].map((p) => program.evalParam(p)) };
    }, "Contract not found in valid contracts list"),
    tester.testCase(false, "PERSONALIZE", "reference inputs, CIP-68, defaults forced, treas fee low", () => {
        const context = new ScriptContext().initPz(pzRedeemer.calculateCid());
        context.outputs.find(output => output.lovelace == 1500000).lovelace = 10;
        const program = tester.createProgram(contract, new Datum().render(), pzRedeemer.render(), context.render());
        return { contract: program.compile(), params: ["datum", "redeemer", "context"].map((p) => program.evalParam(p)) };
    }, "Handle treasury fee unpaid"),
    tester.testCase(false, "PERSONALIZE", "reference inputs, CIP-68, defaults forced, treas fee no handle", () => {
        const context = new ScriptContext().initPz(pzRedeemer.calculateCid());
        context.outputs.find(output => output.lovelace == 1500000).datum = `"wrong".encode_utf8()`;
        const program = tester.createProgram(contract, new Datum().render(), pzRedeemer.render(), context.render());
        return { contract: program.compile(), params: ["datum", "redeemer", "context"].map((p) => program.evalParam(p)) };
    }, "Handle treasury fee unpaid"),
    tester.testCase(false, "PERSONALIZE", "reference inputs, CIP-68, defaults forced, treas fee bad address", () => {
        const context = new ScriptContext().initPz(pzRedeemer.calculateCid());
        context.outputs.find(output => output.lovelace == 1500000).hash = '#123456789012345678901234567890123456789012345678901234af';
        const program = tester.createProgram(contract, new Datum().render(), pzRedeemer.render(), context.render());
        return { contract: program.compile(), params: ["datum", "redeemer", "context"].map((p) => program.evalParam(p)) };
    }, "Handle treasury fee unpaid"),
    tester.testCase(false, "PERSONALIZE", "reference inputs, CIP-68, defaults forced, prov fee low", () => {
        const context = new ScriptContext().initPz(pzRedeemer.calculateCid());
        context.outputs.find(output => output.lovelace == 3500000).lovelace = 10;
        const program = tester.createProgram(contract, new Datum().render(), pzRedeemer.render(), context.render());
        return { contract: program.compile(), params: ["datum", "redeemer", "context"].map((p) => program.evalParam(p)) };
    }, "Personalization provider not found or fee unpaid"),
    tester.testCase(false, "PERSONALIZE", "reference inputs, CIP-68, defaults forced, prov fee no handle", () => {
        const context = new ScriptContext().initPz(pzRedeemer.calculateCid());
        context.outputs.find(output => output.lovelace == 3500000).datum = `"wrong".encode_utf8()`;
        const program = tester.createProgram(contract, new Datum().render(), pzRedeemer.render(), context.render());
        return { contract: program.compile(), params: ["datum", "redeemer", "context"].map((p) => program.evalParam(p)) };
    }, "Personalization provider not found or fee unpaid"),
    tester.testCase(false, "PERSONALIZE", "reference inputs, CIP-68, defaults forced, prov fee bad address", () => {
        const context = new ScriptContext().initPz(pzRedeemer.calculateCid());
        context.outputs.find(output => output.lovelace == 3500000).hash = '#123456789012345678901234567890123456789012345678901234af';
        const program = tester.createProgram(contract, new Datum().render(), pzRedeemer.render(), context.render());
        return { contract: program.compile(), params: ["datum", "redeemer", "context"].map((p) => program.evalParam(p)) };
    }, "Personalization provider not found or fee unpaid"),

    // MIGRATE ENDPOINT - SHOULD APPROVE
    tester.testCase(true, "MIGRATE", "admin, no owner", () => {
        const context = new ScriptContext().initMigrate();
        const program = tester.createProgram(contract, new Datum().render(), migrateRedeemer.render(), context.render());
        return { contract: program.compile(), params: ["datum", "redeemer", "context"].map((p) => program.evalParam(p)) };
    }),

    // MIGRATE ENDPOINT - SHOULD DENY
    tester.testCase(false, "MIGRATE", "wrong admin signer", () => {
        const context = new ScriptContext().initMigrate();
        context.signers = [`${owner_bytes}`];
        const program = tester.createProgram(contract, new Datum().render(), migrateRedeemer.render(), context.render());
        return { contract: program.compile(), params: ["datum", "redeemer", "context"].map((p) => program.evalParam(p)) };
    }, "Required admin signer(s) not present"),
    tester.testCase(false, "MIGRATE", "no admin signers", () => {
        const context = new ScriptContext().initMigrate();
        context.signers = [];
        const program = tester.createProgram(contract, new Datum().render(), migrateRedeemer.render(), context.render());
        return { contract: program.compile(), params: ["datum", "redeemer", "context"].map((p) => program.evalParam(p)) };
    }, "Required admin signer(s) not present"),

    // RESET ENDPOINT - SHOULD APPROVE
    tester.testCase(true, "RESET", "no pz signer, pfp mismatch", () => {
        const context = new ScriptContext().initReset(resetRedeemer.calculateCid());
        context.referenceInputs.find(input => input.output.asset == '"pfp"' && input.output.label == 'LBL_222').output.hash = '#123456789012345678901234567890123456789012345678901234af';
        context.signers = [];
        const program = tester.createProgram(contract, new Datum().render(), resetRedeemer.render(), context.render());
        return { contract: program.compile(), params: ["datum", "redeemer", "context"].map((p) => program.evalParam(p)) };
    }),

    // RESET ENDPOINT - SHOULD DENY
    tester.testCase(false, "RESET", "reset not allowed, all checks good", () => {
        const context = new ScriptContext().initReset(resetRedeemer.calculateCid());
        context.signers = [];
        const datum = new Datum(resetRedeemer.calculateCid());
        datum.extra.bg_asset = `OutputDatum::new_inline(${bg_policy}001bc2806267).data`;
        datum.extra.pfp_asset = `OutputDatum::new_inline(${pfp_policy}000de140706670).data`;
        context.outputs.find(output => output.asset == `"${handle}"` && output.label == 'LBL_100').datum = datum.render();
        const program = tester.createProgram(contract, new Datum().render(), resetRedeemer.render(), context.render());
        return { contract: program.compile(), params: ["datum", "redeemer", "context"].map((p) => program.evalParam(p)) };
    }, 'Reset is not allowed or not authorized')
    
]).then(() => {
    tester.displayStats()
})