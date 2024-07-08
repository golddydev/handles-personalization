import fs from "fs";
import * as helios from "@koralabs/helios";
import { ContractTester, Fixture, Test, getAddressAtDerivation } from '@koralabs/kora-labs-contract-testing';
import { PzFixture, RevokeFixture, UpdateFixture } from "./fixtures";
import { AssetNameLabel } from "@koralabs/kora-labs-common";
helios.config.set({ IS_TESTNET: false, AUTO_SET_VALIDITY_RANGE: true });

const runTests = async (file: string) => {
    const walletAddress = await getAddressAtDerivation(0);
    const tester = new ContractTester(walletAddress, false);
    await tester.init("UPDATE", "private mint");

    let contractFile = fs.readFileSync(file).toString();
    const program = helios.Program.new(contractFile); //new instance
    const setupRevokeTx = (fixture: Fixture) => {          
        const revokeTx = new helios.Tx();
        const fixt = fixture as RevokeFixture;
        revokeTx.attachScript(fixt.nativeScript);
        revokeTx.mintTokens(fixt.handlePolicyHex, [[`${AssetNameLabel.LBL_000}${Buffer.from(fixt.handleName).toString('hex')}`, -1]], null);
        return revokeTx;
    }
    // PERSONALIZE - SHOULD APPROVE
    await tester.test("PERSONALIZE", "main - test most things", new Test(program, async (hash) => {return await (new PzFixture(hash).initialize())})),

    await tester.test("PERSONALIZE", "unenforced defaults", new Test(program, async (hash) => {
        const fixture = new PzFixture(hash);
        (fixture.bgDatum.constructor_0[2] as any) = {};
        (fixture.pzRedeemer.constructor_0[3] as any) = {
            pfp_border_color: '0x22d1af',
            qr_inner_eye: 'square,#0a1fd4',
            qr_outer_eye: 'square,#0a1fd5',
            qr_dot: 'square,#0a1fd6',
            qr_bg_color: '0x0a1fd3',
            pfp_zoom: 130,
            pfp_offset: [60, 60],
            font_shadow_size: [12, 10, 8],
            text_ribbon_colors: ['0x0a1fd3'],
            font_shadow_color: '0x22d1af',
            socials_color: '0xffffff',
            bg_border_color: '0x22d1af',
            bg_color: '0x22d1af',
            circuit_color: '0x22d1af',
            qr_link: '',
            socials: [],
            svg_version: 1
        }
        return await fixture.initialize();
    })),

    // PERSONALIZE - SHOULD DENY
    await tester.test("PERSONALIZE", "exclusives set, no creator", new Test(program, async (hash) => {
        const fixture = new PzFixture(hash);
        (fixture.bgDatum.constructor_0[2] as any) = {};
        return await fixture.initialize();
    }), false, 'qr_inner_eye is not set correctly'),
    // Should deny if pz is disabled
    // should pz if assignee signed virtual
    // Should reset to default styles
    // virtual must have resolved_addresses.ada

    // REVOKE - SHOULD APPROVE
    await tester.test("REVOKE", "private mint", new Test(program, async (hash) => {return await (new RevokeFixture(hash).initialize())}, setupRevokeTx)),
    // should only revoke if private
    // should only revoke if public and expired
    // should only revoke if signed by root or admin

    // UPDATE - SHOULD APPROVE
    await tester.test("UPDATE", "private mint", new Test(program, async (hash) => {return await (new UpdateFixture(hash).initialize())}))
    // should only update if private
    // should only update if assignee signed
    // can update to any address within wallet
    // should extend if assignee signed
    // virtual must have resolved_addresses.ada
    // main payment private/public or admin_signed
    // root payment public

    tester.displayStats();
}

(async()=> {
    await runTests('./contract.helios')
})(); 
