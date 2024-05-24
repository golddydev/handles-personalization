import fs from "fs";
import * as helios from "@koralabs/helios";
import { ContractTester, Test,  getAddressAtDerivation } from '@koralabs/kora-labs-contract-testing';
import { PzFixtures } from "./fixtures";
helios.config.set({ IS_TESTNET: false, AUTO_SET_VALIDITY_RANGE: true });

const runTests = async (file: string) => {
    let contractFile = fs.readFileSync(file).toString();
    const program = helios.Program.new(contractFile); //new instance
    const contract = program.compile(true);

    let fixtures = await (new PzFixtures(contract.validatorHash).initialize());
    const walletAddress = await getAddressAtDerivation(0);
    const tester = new ContractTester(walletAddress, false);
    await tester.init();
    
    Promise.all([
        // SHOULD APPROVE
        tester.test("PERSONALIZE", "main - test most things", new Test(program, () => fixtures)),
        tester.test("PERSONALIZE", "unenforced defaults", new Test(program, () => {
            const fixtures = new PzFixtures(contract.validatorHash);
            (fixtures.bgDatum.constructor_0[2] as any) = {};
            (fixtures.pzRedeemer.constructor_0[3] as any) = {
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
                svg_version: 1,}
            return fixtures.initialize();
        })),

        // SHOULD DENY
        tester.test("PERSONALIZE", "exclusives set, no creator", new Test(program, () => {
            const fixtures = new PzFixtures(contract.validatorHash);
            (fixtures.bgDatum.constructor_0[2] as any) = {};
            return fixtures.initialize();
        }), false, 'qr_inner_eye is not set correctly'),
        // tester.test("GROUP", "example test 2", new Test(program, () => fixtures, () => {
        //     // custom tx setup
        //     return new helios.Tx();
        // }), false, "expected error message"),
    ]
    ).then(() => {tester.displayStats()});
}

(async()=> {
    await runTests('.//contract.helios')
})(); 