
import * as helios from "@koralabs/helios";
import { Fixtures, convertJsontoCbor, getAddressAtDerivation, getNewFakeUtxoId } from '@koralabs/kora-labs-contract-testing'
import { AssetNameLabel } from '@koralabs/kora-labs-common'
import base58 from "bs58";
helios.config.set({ IS_TESTNET: false, AUTO_SET_VALIDITY_RANGE: true });

const POLICY_ID = 'f0ff48bbb7bbe9d59a40f1ce90e9e9d0ff5002ec48f232b49ca0fb9a';
const BG_POLICY_ID = 'f0ff48bbb7bbe9d59a40f1ce90e9e9d0ff5002ec48f232b49ca0fb9b';
const PFP_POLICY_ID = 'f0ff48bbb7bbe9d59a40f1ce90e9e9d0ff5002ec48f232b49ca0fb9c';
export const adminKeyHash = helios.PubKeyHash.fromHex('01234567890123456789012345678901234567890123456789000007');
export const ownerKeyHash = helios.PubKeyHash.fromHex('12345678901234567890123456789012345678901234567890123456');
const lovelace = 10000000;
const defaultNft = {
    name: '$<handle>',
    image: "ipfs://pfp",
    mediaType: "image/jpeg",
    og: 0,
    og_number: 1,
    rarity: "basic",
    length: 8,
    characters: "characters,numbers",
    numeric_modifiers: "",
    version: 1,
    attr: "rtta", 
};
const defaultPzDatum = {
    pfp_border_color: '0x22d1af',
    qr_inner_eye: "dots,#0a1fd4",
    qr_outer_eye: "dots,#0a1fd5",
    qr_dot: "dots,#0a1fd6",
    qr_bg_color: '0x0a1fd3',
    qr_image: "https://img",
    pfp_zoom: 130,
    pfp_offset: [60, 60],
    font: "the font",
    font_color: '0xffffff',
    font_shadow_size: [12, 10, 8],
    text_ribbon_colors: ['0x0a1fd3', '0x0a1fd4'],
    text_ribbon_gradient: 'linear-45',
    font_shadow_color: '0x22d1af',
    socials_color: '0xffffff',
    bg_border_color: '0x22d1af',
    bg_color: '0x22d1af',
    circuit_color: '0x22d1af',
    qr_link: "",
    socials: [],
    svg_version: 1
}

export class PzFixtures extends Fixtures {
    handleName = 'xar123456';
    handleCbor: string;
    scriptAddress: helios.Address;
    latestScriptAddress: helios.Address;
    validatorHash: helios.ValidatorHash;

    oldCip68Datum = {
        constructor_0: [
            defaultNft,
            0,
            defaultPzDatum
        ]
    };
    oldCip68DatumCbor: string;

    newCip68Datum = {
        constructor_0: [
            defaultNft,
            0,
            defaultPzDatum
        ]
    }
    newCip68DatumCbor: string;

    pzSettings = [
        1500000, //treasury_fee
        '0x01234567890123456789012345678901234567890123456789000002', //treasury_cred
        3500000, //pz_min_fee
        ['0x01234567890123456789012345678901234567890123456789000004'], //pz_providers
        [], //valid_contracts
        '0x01234567890123456789012345678901234567890123456789000007', //admin_creds
        '0x01234567890123456789012345678901234567890123456789000003', //settings_cred
        60 * 60, //grace_period
        50, //subhandle_share_percent
    ]
    pzSettingsCbor: string;

    bgDatum ={ // a.k.a. "Creator Defaults"
        constructor_0: [
            defaultNft,
            0,
            {
                qr_inner_eye: "dots,#0a1fd4",
                qr_outer_eye: "dots,#0a1fd5",
                qr_dot: "dots,#0a1fd6",
                qr_image: "https://img",
                qr_bg_color: '0x0a1fd3',
                pfp_zoom: 130,
                pfp_offset: [60, 60],
                font: "the font",
                font_color: '0xffffff',
                font_shadow_size: [12, 10, 8],
                text_ribbon_colors: ['0x0a1fd3', '0x0a1fd4'],
                text_ribbon_gradient: "linear-45",
                bg_border_colors: ['0x0a1fd3', '0x22d1af', '0x31bc23'],
                bg_colors: ['0x0a1fd3', '0x22d1af', '0x31bc23'],
                circuit_colors: ['0x0a1fd3', '0x22d1af', '0x31bc23'],
                socials_color: '0xffffff',
                pfp_border_colors: ['0x0a1fd3', '0x22d1af', '0x31bc23'],
                font_shadow_colors: ['0x0a1fd3', '0x22d1af', '0x31bc23'],
                require_asset_collections: [ `${PFP_POLICY_ID}000de140706670`, `${PFP_POLICY_ID}706670` ],
                require_asset_attributes: ['attr:rtta'],
                require_asset_displayed: 1,
                price: 125,
                force_creator_settings: 1,
                custom_dollar_symbol: 0,
              }
        ]
    }
    bgDatumCbor: string;

    pfpDatum = {
        constructor_0: [
            defaultNft,
            0,
            defaultPzDatum
        ]
    }
    pfpDatumCbor: string;

    bgApprovers = { [`0x${BG_POLICY_ID}`]: {'0x001bc2806267': [0,0,0]} }
    bgApproversCbor: string;

    pfpApprovers = { [`0x${PFP_POLICY_ID}`]: {'0x000de140706670': [0,0,0],'0x706670706670': [0,0,0]} }
    pfpApproversCbor: string;

    pzRedeemer = {
        constructor_0: [
            [{constructor_0: []}, this.handleName],
            '',
            [
                5, //pfp_approver
                4, //bg_approver
                2, //pfp_datum
                0, //bg_datum
                3, //pz_settings
                1, //required_asset
                0, //owner_settings
                0, //contract_output
                1, //pz_assets
                3, //provider_fee
            ],
            {
                pfp_border_color: '0x22d1af',
                qr_inner_eye: 'dots,#0a1fd4',
                qr_outer_eye: 'dots,#0a1fd5',
                qr_dot: 'dots,#0a1fd6',
                qr_bg_color: '0x0a1fd3',
                qr_image: 'https://img',
                pfp_zoom: '130',
                pfp_offset: [60, 60],
                font: '"the font"',
                font_color: '0xffffff',
                font_shadow_size: [12, 10, 8],
                text_ribbon_colors: ['0x0a1fd3', '0x0a1fd4'],
                text_ribbon_gradient: 'linear-45',
                font_shadow_color: '0x22d1af',
                socials_color: '0xffffff',
                bg_border_color: '0x22d1af',
                bg_color: '0x22d1af',
                circuit_color: '0x22d1af',
                qr_link: '',
                socials: [],
                svg_version: '1',
            },
            false
    ]
    };
    pzRedeemerCbor: string;

    requiredAsset = {
        constructor_0: [
            defaultNft,
            0,
            defaultPzDatum
        ]
    };
    requiredAssetCbor: string;
    
    constructor(validatorHash: helios.ValidatorHash) {
        super();
        (this.oldCip68Datum.constructor_0[0] as any)['name'] = (this.oldCip68Datum.constructor_0[0] as any)['name'].replace('<handle>', this.handleName);
        (this.oldCip68Datum.constructor_0[0] as any)['name'] = (this.newCip68Datum.constructor_0[0] as any)['name'].replace('<handle>', this.handleName);
        this.scriptAddress = helios.Address.fromHash(validatorHash);
        this.latestScriptAddress = this.scriptAddress;
        this.validatorHash = validatorHash;
        this.pzSettings[4] = [`0x${validatorHash.hex}`];
    }
    
    async initialize(): Promise<Fixtures> {
        const handleByteLength = this.handleName.length.toString(16);
        this.handleCbor = `4${handleByteLength}${Buffer.from(this.handleName).toString('hex')}`;
        const designerCid = this.calculateCid(await convertJsontoCbor(this.pzRedeemer.constructor_0[3]));
        (this.oldCip68Datum.constructor_0[2] as any)['designer'] = `ipfs://${designerCid}`;
        (this.newCip68Datum.constructor_0[2] as any)['designer'] = `ipfs://${designerCid}`;
        this.oldCip68DatumCbor = await convertJsontoCbor(this.oldCip68Datum);
        this.newCip68DatumCbor = await convertJsontoCbor(this.newCip68Datum);
        this.pzSettingsCbor = await convertJsontoCbor(this.pzSettings);
        this.pzRedeemerCbor = (await convertJsontoCbor(this.pzRedeemer)).replace('d8799fff', 'd87980');
        this.bgDatumCbor = await convertJsontoCbor(this.bgDatum);
        this.pfpDatumCbor = await convertJsontoCbor(this.pfpDatum);
        this.bgApproversCbor = await convertJsontoCbor(this.bgApprovers);
        this.pfpApproversCbor = await convertJsontoCbor(this.pfpApprovers);
        this.requiredAssetCbor = await convertJsontoCbor(this.requiredAsset);
        this.redeemer = helios.UplcData.fromCbor(this.pzRedeemerCbor);
        this.inputs = [            
            new helios.TxInput( // money & collateral
                new helios.TxOutputId(getNewFakeUtxoId()),
                new helios.TxOutput(await getAddressAtDerivation(0), new helios.Value(BigInt(200000000))
            )),
            new helios.TxInput( // 100 Reference Token, BG 222, PFP 222, Handle
                new helios.TxOutputId(getNewFakeUtxoId()),
                new helios.TxOutput(
                    this.scriptAddress,
                    new helios.Value(BigInt(lovelace), new helios.Assets([[POLICY_ID, [
                        [`${AssetNameLabel.LBL_100}${Buffer.from(this.handleName).toString('hex')}`, 1],
                        [`${AssetNameLabel.LBL_222}${Buffer.from("bg").toString('hex')}`, 1], 
                        [`${AssetNameLabel.LBL_222}${Buffer.from("pfp").toString('hex')}`, 1], 
                        [`${AssetNameLabel.LBL_222}${Buffer.from(this.handleName).toString('hex')}`, 1]
                    ]]])),
                    helios.Datum.inline(helios.UplcData.fromCbor(this.oldCip68DatumCbor))
            ))
        ];
        this.refInputs = [
            new helios.TxInput( // bg_datum
                new helios.TxOutputId(getNewFakeUtxoId()),
                new helios.TxOutput(
                    await getAddressAtDerivation(0),
                    new helios.Value(BigInt(1), new helios.Assets([[BG_POLICY_ID, [[`${AssetNameLabel.LBL_100}${Buffer.from("bg").toString('hex')}`, 1]]]])),
                    helios.Datum.inline(helios.UplcData.fromCbor(this.bgDatumCbor))
            )),
            new helios.TxInput( // required_asset
                new helios.TxOutputId(getNewFakeUtxoId()),
                new helios.TxOutput(
                    await getAddressAtDerivation(0),
                    new helios.Value(BigInt(1), new helios.Assets([[POLICY_ID, [[`${AssetNameLabel.LBL_222}${Buffer.from(this.handleName).toString('hex')}`, 1]]]])),
                    helios.Datum.inline(helios.UplcData.fromCbor(this.requiredAssetCbor))
            )),
            new helios.TxInput( // pfp_datum
                new helios.TxOutputId(getNewFakeUtxoId()),
                new helios.TxOutput(
                    await getAddressAtDerivation(0),
                    new helios.Value(BigInt(1), new helios.Assets([[PFP_POLICY_ID, [[`${AssetNameLabel.LBL_100}${Buffer.from("pfp").toString('hex')}`, 1]]]])),
                    helios.Datum.inline(helios.UplcData.fromCbor(this.pfpDatumCbor))
            )),
            new helios.TxInput( // pz_settings
                new helios.TxOutputId(getNewFakeUtxoId()),
                new helios.TxOutput(
                    await getAddressAtDerivation(0),
                    new helios.Value(BigInt(1), new helios.Assets([[POLICY_ID, [[`${AssetNameLabel.LBL_222}${Buffer.from('pz_settings').toString('hex')}`, 1]]]])),
                    helios.Datum.inline(helios.UplcData.fromCbor(this.pzSettingsCbor))
            )),
            new helios.TxInput( // bg_approver
                new helios.TxOutputId(getNewFakeUtxoId()),
                new helios.TxOutput(
                    await getAddressAtDerivation(0),
                    new helios.Value(BigInt(1), new helios.Assets([[POLICY_ID, [[`${AssetNameLabel.LBL_222}${Buffer.from('bg_policy_ids').toString('hex')}`, 1]]]])),
                    helios.Datum.inline(helios.UplcData.fromCbor(this.bgApproversCbor))
            )),
            new helios.TxInput( // pfp_approver
                new helios.TxOutputId(getNewFakeUtxoId()),
                new helios.TxOutput(
                    await getAddressAtDerivation(0),
                    new helios.Value(BigInt(1), new helios.Assets([[POLICY_ID, [[`${AssetNameLabel.LBL_222}${Buffer.from('pfp_policy_ids').toString('hex')}`, 1]]]])),
                    helios.Datum.inline(helios.UplcData.fromCbor(this.pfpApproversCbor))
            ))
        ];
        this.outputs = [
            new helios.TxOutput( // 100 Reference Token
                this.latestScriptAddress,
                new helios.Value(BigInt(1), new helios.Assets([[POLICY_ID, [[`${AssetNameLabel.LBL_100}${Buffer.from(this.handleName).toString('hex')}`, BigInt(1)]]]])),
                helios.Datum.inline(helios.UplcData.fromCbor(this.newCip68DatumCbor))
            ),
            new helios.TxOutput( // Pz Assets
                this.latestScriptAddress,
                new helios.Value(BigInt(1), new helios.Assets([[POLICY_ID, [
                    [`${AssetNameLabel.LBL_222}${Buffer.from("bg").toString('hex')}`, BigInt(1)],
                    [`${AssetNameLabel.LBL_222}${Buffer.from("pfp").toString('hex')}`, BigInt(1)],
                    [`${AssetNameLabel.LBL_222}${Buffer.from(this.handleName).toString('hex')}`, BigInt(1)]
                ]]]))
            ),
            new helios.TxOutput( // Treasury Fee
                this.latestScriptAddress,
                new helios.Value(BigInt(1500000)),
                helios.Datum.inline(helios.UplcData.fromCbor(this.handleCbor))
            ),
            new helios.TxOutput( // Provider Fee
                this.latestScriptAddress,
                new helios.Value(BigInt(3500000)),
                helios.Datum.inline(helios.UplcData.fromCbor(this.handleCbor))
            )
        ];
        this.signatories = [ adminKeyHash ]; // Provider or admin PubKeyHash
        return this;        
    }
  
    calculateCid(designer: any) {
        const hash = '01701220' + helios.bytesToHex(helios.Crypto.sha2_256([...Buffer.from(designer, 'hex')]));
        //console.log('CID = ' +  'z' + base58.encode([...Buffer.from(hash, 'hex')]));
        return 'z' + base58.encode([...Buffer.from(hash, 'hex')]);   
    }
}