import fs from "fs";
import * as helios from "@koralabs/helios";
import { ContractTester, Fixture, Test, getAddressAtDerivation } from '@koralabs/kora-labs-contract-testing';
import { defaultAssigneeHash, defaultResolvedAddress, PzFixture, RevokeFixture, UpdateFixture } from "./fixtures";
import { AssetNameLabel } from "@koralabs/kora-labs-common";
helios.config.set({ IS_TESTNET: false, AUTO_SET_VALIDITY_RANGE: true });

const runTests = async (file: string) => {
    const walletAddress = await getAddressAtDerivation(0);
    const tester = new ContractTester(walletAddress, false);
    await tester.init("PERSONALIZE", "resolved_addresses can't contain ada");

    let contractFile = fs.readFileSync(file).toString();
    const program = helios.Program.new(contractFile); //new instance
    const setupRevokeTx = (fixture: Fixture, validFrom?: bigint) => {          
        const revokeTx = new helios.Tx();
        const fixt = fixture as RevokeFixture;
        revokeTx.attachScript(fixt.nativeScript);
        revokeTx.mintTokens(fixt.handlePolicyHex, [[`${AssetNameLabel.LBL_000}${Buffer.from(fixt.handleName).toString('hex')}`, -1]], null);
        if (validFrom != undefined) revokeTx.validFrom(validFrom);
        
        return revokeTx;
    }
    const setupUpdateTx = (fixture: Fixture, validFrom?: bigint) => {
        const tx = new helios.Tx();
        const fixt = fixture as UpdateFixture;
        if (validFrom != undefined) tx.validFrom(validFrom);
        
        return tx;
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

    // Should Deny if resolved_address contain ada for `HANDLE` type
    await tester.test("PERSONALIZE", "resolved_addresses can't contain ada", new Test(program, async (hash) => {
        const fixture = new PzFixture(hash);
        (fixture.oldCip68Datum.constructor_0[2] as any) = {
            ...(fixture.oldCip68Datum.constructor_0[2] as any),
            'resolved_addresses': { ada: `0x${defaultResolvedAddress.toHex()}` },
        };
        return await fixture.initialize();
    }), false, "resolved_addresses can't contain 'ada'");

    // Should deny if pz is disabled
    await tester.test("PERSONALIZE", "pz is disabled", new Test(program, async (hash) => {
        const fixture = new PzFixture(hash);
        fixture.handleName = 'dev@golddy'; /// nft subhandle
        (fixture.rootSettings[0] as any)[1] = 0; /// OwnerSetting NFT pz_enabled to false
        fixture.pzRedeemer.constructor_0[4] = true; /// `resest` set to true
        (fixture.pzRedeemer.constructor_0[0] as any) = [
          { constructor_1: [] },
          fixture.handleName,
        ]; /// update redeemer as `NFT_SUBHANDLE` type
        (fixture.pzRedeemer.constructor_0[1] as any) = 'golddy'; /// root handle name
        return await fixture.initialize();
    }), false, "Root SubHandle settings prohibit Personalization");

    // should pz if assignee signed virtual
    await tester.test("PERSONALIZE", "should pz if assignee signed virtual", new Test(program, async (hash) => {
        const fixture = new PzFixture(hash);
        fixture.handleName = 'dev@golddy'; /// nft subhandle
        (fixture.oldCip68Datum.constructor_0[2] as any) = {
            ...(fixture.oldCip68Datum.constructor_0[2] as any),
            'resolved_addresses': { ada: `0x${defaultResolvedAddress.toHex()}` },
        }; /// resolved address
        fixture.pzRedeemer.constructor_0[4] = true; /// `resest` set to true
        (fixture.pzRedeemer.constructor_0[0] as any) = [
          { constructor_2: [] },
          fixture.handleName,
        ]; /// update redeemer as `VIRTUAL_SUBHANDLE` type
        (fixture.pzRedeemer.constructor_0[1] as any) = 'golddy'; /// root handle name
        return await fixture.initialize();
    }), false, "Tx not signed by virtual SubHandle holder");

    // Should reset to default styles
    // virtual must have resolved_addresses.ada

    // REVOKE - SHOULD APPROVE
    await tester.test("REVOKE", "private mint", new Test(program, async (hash) => {return await (new RevokeFixture(hash).initialize())}, setupRevokeTx)),
    await tester.test("REVOKE", "public mint not expired", new Test(program, async (hash) => {
        const fixture = new RevokeFixture(hash);
        (fixture.oldCip68Datum.constructor_0[2] as any)['virtual']['public_mint'] = 1;
        (fixture.oldCip68Datum.constructor_0[2] as any)['virtual']['expires_time'] = Date.now();
        return await fixture.initialize()
    }, setupRevokeTx), false, 'Publicly minted Virtual SubHandle hasn\'t expired'),
    // should only revoke if private
    // should only revoke if public and expired
    // should only revoke if signed by root or admin

    // UPDATE - SHOULD APPROVE
    await tester.test("UPDATE", "private mint", new Test(program, async (hash) => {return await (new UpdateFixture(hash).initialize())})),
    await tester.test("UPDATE", "public assignee extend", new Test(program, async (hash) => {
        const fixture = new UpdateFixture(hash);
        (fixture.oldCip68Datum.constructor_0[2] as any)['virtual']['public_mint'] = 1;
        (fixture.oldCip68Datum.constructor_0[2] as any)['virtual']['expires_time'] = Date.now() + 365 * 24 * 60 * 60 * 1000;
        fixture.inputs?.splice(1, 1); /// remove 222 root_handle in inputs (remove root_signed)
        fixture.outputs?.splice(0, 1); /// remove 222 root_handle in outputs (remove root_signed)
        const initialized =  await fixture.initialize();
        initialized.signatories?.push(helios.PubKeyHash.fromHex(defaultAssigneeHash)); /// sign with assignee's pub key hash
        return await (fixture.initialize())
    }))
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
