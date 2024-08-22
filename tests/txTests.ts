import fs from "fs";
import * as helios from "@koralabs/helios";
import { ContractTester, Fixture, Test, getAddressAtDerivation } from '@koralabs/kora-labs-contract-testing';
import { defaultAssigneeHash, defaultResolvedAddress, PzFixture, RevokeFixture, UpdateFixture } from "./fixtures";
import { AssetNameLabel } from "@koralabs/kora-labs-common";
helios.config.set({ IS_TESTNET: false, AUTO_SET_VALIDITY_RANGE: true });

const runTests = async (file: string) => {
    const walletAddress = await getAddressAtDerivation(0);
    const tester = new ContractTester(walletAddress, false);
    await tester.init();

    let contractFile = fs.readFileSync(file).toString();
    const program = helios.Program.new(contractFile); //new instance
    const setupRevokeTx = (fixture: Fixture, validFrom?: Date) => {          
        const revokeTx = new helios.Tx();
        const fixt = fixture as RevokeFixture;
        revokeTx.attachScript(fixt.nativeScript);
        revokeTx.mintTokens(fixt.handlePolicyHex, [[`${AssetNameLabel.LBL_000}${Buffer.from(fixt.handleName).toString('hex')}`, -1]], null);
        if (validFrom != undefined) revokeTx.validFrom(validFrom);
        
        return revokeTx;
    }
    const setupUpdateTx = (validFrom?: Date) => {
        const tx = new helios.Tx();
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

    // Should Deny if resolved_address contain ada (for `HANDLE` type)
    await tester.test("PERSONALIZE", "resolved_addresses can't contain ada", new Test(program, async (hash) => {
        const fixture = new PzFixture(hash);
        (fixture.newCip68Datum.constructor_0[2] as any) = {
            ...(fixture.newCip68Datum.constructor_0[2] as any),
            resolved_addresses: {ada: `0x${defaultResolvedAddress.toHex()}`},
        };
        return await fixture.initialize();
    }), false, "resolved_addresses can't contain 'ada'");

    // Should deny if root pz is disabled (for `NFT_SUBHANDLE` type)
    // await tester.test("PERSONALIZE", "root pz is disabled", new Test(program, async (hash) => {
    //     const fixture = new PzFixture(hash);
    //     fixture.handleName = 'dev@golddy'; /// nft subhandle
    //     (fixture.rootSettings[0] as any)[1] = 0; /// OwnerSetting NFT pz_enabled to false
    //     (fixture.pzRedeemer.constructor_0[0] as any) = [
    //       { constructor_1: [] },
    //       fixture.handleName,
    //     ]; /// update redeemer as `NFT_SUBHANDLE` type
    //     (fixture.pzRedeemer.constructor_0[1] as any) = 'golddy'; /// root handle name
    //     /// in case `this.handleName` is updated after constructor
    //     (fixture.oldCip68Datum.constructor_0[0] as any)['name'] = `$${fixture.handleName}`;
    //     (fixture.newCip68Datum.constructor_0[0] as any)['name'] = `$${fixture.handleName}`;
    //     return await fixture.initialize();
    // }), false, "Root SubHandle settings prohibit Personalization");

    // await tester.test("PERSONALIZE", "should not pz if virtual assignee didn't sign", new Test(program, async (hash) => {
    //     const fixture = new PzFixture(hash);
    //     fixture.handleName = 'dev@golddy'; /// nft subhandle
    //     (fixture.oldCip68Datum.constructor_0[2] as any) = {
    //         ...(fixture.oldCip68Datum.constructor_0[2] as any),
    //         resolved_addresses: {ada: `0x${defaultResolvedAddress.toHex()}`},
    //     }; /// resolved address
    //     (fixture.pzRedeemer.constructor_0[0] as any) = [
    //       { constructor_2: [] },
    //       fixture.handleName,
    //     ]; /// update redeemer as `VIRTUAL_SUBHANDLE` type
    //     (fixture.pzRedeemer.constructor_0[1] as any) = 'golddy'; /// root handle name
    //     /// in case `this.handleName` is updated after constructor
    //     (fixture.oldCip68Datum.constructor_0[0] as any)['name'] = `$${fixture.handleName}`;
    //     (fixture.newCip68Datum.constructor_0[0] as any)['name'] = `$${fixture.handleName}`;
    //     return await fixture.initialize();
    // }), false, "Tx not signed by virtual SubHandle holder");

    // Should reset to default styles
    // virtual must have resolved_addresses.ada

    // REVOKE - SHOULD APPROVE - private mint and signed by root
    await tester.test("REVOKE", "private mint and signed by root", new Test(program, async (hash) => {
        return await (new RevokeFixture(hash).initialize());
    }, setupRevokeTx)),

    // should Deny revoke if private but NOT signed by root
    await tester.test("REVOKE", "private but not signed by root", new Test(program, async (hash) => {
        const fixture = new RevokeFixture(hash);
        const initialized = await fixture.initialize();
        initialized.inputs?.splice(1, 1); /// remove 222 root_handle in inputs (remove root_signed)
        initialized.outputs?.splice(0, 1); /// remove 222 root_handle in outputs (remove root_signed)
        return initialized;
    }, setupRevokeTx), false, "Publicly minted Virtual SubHandle hasn't expired"),

    // should only revoke if public and expired
    await tester.test("REVOKE", "public and expired", new Test(program, async (hash) => {
        const fixture = new RevokeFixture(hash);
        (fixture.oldCip68Datum.constructor_0[2] as any).virtual = { 
            public_mint: 1, /// public = true
            expires_time: Date.now()
        }
        const initialized = await fixture.initialize();
        initialized.inputs?.splice(1, 1); /// remove 222 root_handle in inputs (remove root_signed)
        initialized.outputs?.splice(0, 1); /// remove 222 root_handle in outputs (remove root_signed)
        return initialized;
    }, (fixture) => setupRevokeTx(fixture, new Date(Date.now() + 1_000_000)))),

    // show Deny if public but NOT expired
    await tester.test("REVOKE", "public mint not expired", new Test(program, async (hash) => {
        const fixture = new RevokeFixture(hash);
        (fixture.oldCip68Datum.constructor_0[2] as any)['virtual'] = {
            public_mint: 1,
            expires_time: Date.now(),
        };
        return await fixture.initialize()
    }, setupRevokeTx), false, 'Publicly minted Virtual SubHandle hasn\'t expired'),


    // UPDATE - change_address - SHOULD APPROVE - private & root_signed & address_changed
    await tester.test("UPDATE", "private mint address changed", new Test(program, async (hash) => {
        const fixture = new UpdateFixture(hash);
        /// update resolved_address
        (fixture.newCip68Datum.constructor_0[2] as any)["resolved_addresses"] 
            = {ada: `0x${helios.Address.fromHash(helios.PubKeyHash.fromHex("4da965a049dfd15ed1ee19fba6e2974a0b79fc416dd1796a1f978888")).hex}`};
        (fixture.newCip68Datum.constructor_0[2] as any)["virtual"]["expires_time"] = Date.now(); /// make not extended
        return await fixture.initialize();
    })),

    // should Update - extend - private & root_signed & good payment
    await tester.test("UPDATE", "private mint extended", new Test(program, async (hash) => {
        const fixture = new UpdateFixture(hash);
        return await fixture.initialize();
    }, () => setupUpdateTx(new Date(Date.now() + (365 * 24 * 60 * 60 * 1000))))), // within window

    // should Update - extend - public & NOT root_signed && assignee signed with payment cred
    await tester.test("UPDATE", "public assignee signed", new Test(program, async (hash) => {
        const fixture = new UpdateFixture(hash);
        (fixture.oldCip68Datum.constructor_0[2] as any)['virtual'] = {
            public_mint: 1,
            expires_time: Date.now(),
        }; /// make public
        (fixture.updateRedeemer.constructor_3[2] as any) = [
            1, //admin_settings
            2, //root_settings
            0, //contract_output - /// update index because we remove one output below
            0  //root_handle
        ];
        const initialized =  await fixture.initialize();
        initialized.inputs?.splice(1, 1); /// remove 222 root_handle in inputs (remove root_signed)
        initialized.outputs?.splice(0, 1); /// remove 222 root_handle in outputs (remove root_signed)
        initialized.signatories?.push(helios.PubKeyHash.fromHex(defaultAssigneeHash)); /// sign with assignee's pub key hash
        return initialized;
    }, () => setupUpdateTx(new Date(Date.now() + (365 * 24 * 60 * 60 * 1000))))); // within window

    /// WARNING!!! Attack vector
    /// within window is attack vector
    /// we can stop this by checking extended and within_window separately
    /// can Update - extend - without paying to main address and root address
    // await tester.test("UPDATE", "public assignee signed attack", new Test(program, async (hash) => {
    //     const fixture = new UpdateFixture(hash);
    //     (fixture.oldCip68Datum.constructor_0[2] as any)['virtual'] = {
    //         public_mint: 1,
    //         expires_time: Date.now(),
    //     }; /// make public
    //     (fixture.updateRedeemer.constructor_3[2] as any) = [
    //         1, //admin_settings
    //         2, //root_settings
    //         0, //contract_output - /// update index because we remove one output below
    //         0  //root_handle
    //     ];
    //     const initialized =  await fixture.initialize();
    //     initialized.inputs?.splice(1, 1); /// remove 222 root_handle in inputs (remove root_signed)
    //     /// only take second one which is 000 Virtual Subhandle (remove 222 root_handle & payment to main & root)
    //     initialized.outputs = initialized.outputs?.[1] ? [initialized.outputs?.[1]] : [];
    //     initialized.signatories?.push(helios.PubKeyHash.fromHex(defaultAssigneeHash)); /// sign with assignee's pub key hash
    //     return initialized;
    // }));

    // should Update - to_private - public & root_signed & expired & extended
    await tester.test("UPDATE", "public to private", new Test(program, async (hash) => {
        const fixture = new UpdateFixture(hash);
        (fixture.oldCip68Datum.constructor_0[2] as any)['virtual'] = {
            public_mint: 1,
            expires_time: Date.now(),
        }; /// make public
        (fixture.newCip68Datum.constructor_0[2] as any)['virtual'] = {
            public_mint: 0,
            expires_time: Date.now() + (365 * 24 * 60 * 60 * 1000),
        }; /// udpate to private and extend
        return await fixture.initialize();
    }, () => setupUpdateTx(new Date(Date.now() + (365 * 24 * 60 * 60 * 1000))))), /// make expired & within window

    // should Deny update if assignee NOT signed when public & NOT root_signed
    await tester.test("UPDATE", "public assignee not signed", new Test(program, async (hash) => {
        const fixture = new UpdateFixture(hash);
        (fixture.oldCip68Datum.constructor_0[2] as any)['virtual'] = {
            public_mint: 1,
            expires_time: Date.now(),
        }; /// make public
        (fixture.updateRedeemer.constructor_3[2] as any) = [
            1, //admin_settings
            2, //root_settings
            0, //contract_output - /// update index because we remove one output below
            0  //root_handle
        ];
        const initialized =  await fixture.initialize();
        initialized.inputs?.splice(1, 1); /// remove 222 root_handle in inputs (remove root_signed)
        /// only take second one which is 000 Virtual Subhandle (remove 222 root_handle & payment to main & root)
        initialized.outputs = initialized.outputs?.[1] ? [initialized.outputs?.[1]] : [];
        return initialized;
    }), false, "No valid signature"),

    // should Deny if we update pz rather than virtual & resolved address
    await tester.test("UPDATE", "update pz rather than virtual & resolved address", new Test(program, async (hash) => {
        const fixture = new UpdateFixture(hash);
        (fixture.newCip68Datum.constructor_0[2] as any).portal = "ipfs://new_cid"; /// update pz
        return await fixture.initialize();
    }), false, "Restricted changes are not allowed"),

    // should Deny if we update nft rather than virtual & resolved address
    await tester.test("UPDATE", "update nft rather than virtual & resolved address", new Test(program, async (hash) => {
        const fixture = new UpdateFixture(hash);
        (fixture.newCip68Datum.constructor_0[0] as any) = {
            ...(fixture.newCip68Datum.constructor_0[0] as any),
            image: "ipfs://new_image"
        }; /// update nft
        return await fixture.initialize();
    }), false, "Restricted changes are not allowed"),
    // can update to any address within wallet
    // virtual must have resolved_addresses.ada
    // main payment private/public or admin_signed
    // root payment public

    tester.displayStats();
}

(async()=> {
    await runTests('./contract.helios')
})(); 
