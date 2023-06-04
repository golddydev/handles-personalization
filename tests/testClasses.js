import * as helios from "@hyperionbt/helios";
import base58 from "bs58";

// STRINGS
const handle = 'xar12345'

// HASHES
const admin_bytes = '#01234567890123456789012345678901234567890123456789000007';
const script_creds_bytes = '#01234567890123456789012345678901234567890123456789000001';
const owner_bytes = '#9876543210012345678901234567890123456789012345678901234567891235';
const script_hash = `ValidatorHash::new(${script_creds_bytes})`;
const treasury_bytes = '#01234567890123456789012345678901234567890123456789000002';
const ada_handles_bytes = '#01234567890123456789012345678901234567890123456789000003';
const pz_provider_bytes = '#01234567890123456789012345678901234567890123456789000004';

// TRANSACTION HASHES
const script_tx_hash = 'TxId::new(#0123456789012345678901234567890123456789012345678901234567891234)';
const owner_tx_hash = 'TxId::new(#0123456789012345678901234567890123456789012345678901234567891235)';
const handles_tx_hash = 'TxId::new(#0123456789012345678901234567890123456789012345678901234567891236)';

// SIGNATURE HASHES
const owner_pubkey_hash = `PubKeyHash::new(${owner_bytes})`;

export class ScriptContext {
    inputs = [];
    referenceInputs = [];
    outputs = [];
    signers;
  
    constructor(designerCid=null) {
      this.inputs = [new TxInput(`${script_tx_hash}`, new TxOutput(`${script_creds_bytes}`))];
  
      const goodBgInput = new TxInput(`${handles_tx_hash}`, new TxOutput(`${owner_bytes}`, '', '"bg"'));
      goodBgInput.output.hashType = 'pubkey';
      const goodPfpInput = new TxInput(`${handles_tx_hash}`, new TxOutput(`${owner_bytes}`, '', '"pfp"'));
      goodPfpInput.output.hashType = 'pubkey';
      const goodBgListInput = new TxInput(`${handles_tx_hash}`, new TxOutput(`${ada_handles_bytes}`, 'LBL_222', '"bg_policy_ids"'));
      goodBgListInput.output.datumType = 'inline';
      goodBgListInput.output.datum = new ApprovedPolicyIds().render();
      const goodPfpListInput = new TxInput(`${handles_tx_hash}`, new TxOutput(`${ada_handles_bytes}`, 'LBL_222', '"pfp_policy_ids"'));
      goodPfpListInput.output.datumType = 'inline';
      const pfpApproverList = new ApprovedPolicyIds(); 
      pfpApproverList.map['#f0ff48bbb7bbe9d59a40f1ce90e9e9d0ff5002ec48f232b49ca0fb9a'] = {'#706670': [0,0,0]}
      goodPfpListInput.output.datum = pfpApproverList.render();
      const goodPzInput = new TxInput(`${handles_tx_hash}`, new TxOutput(`${ada_handles_bytes}`, 'LBL_222', '"pz_settings"'));
      goodPzInput.output.datumType = 'inline';
      goodPzInput.output.datum = new PzSettings().render();
      const goodOwnerInput = new TxInput(`${owner_tx_hash}`, new TxOutput(`${owner_bytes}`, 'LBL_222', `"${handle}"`));
      goodOwnerInput.output.hashType = 'pubkey';
      this.referenceInputs = [goodBgInput, goodPfpInput, goodBgListInput, goodPfpListInput, goodPzInput, goodOwnerInput];
  
      const goodRefTokenOutput = new TxOutput(`${script_creds_bytes}`);
      goodRefTokenOutput.datumType = 'inline';
      goodRefTokenOutput.datum = new Datum(designerCid).render();
      const goodTreasuryOutput = new TxOutput(`${treasury_bytes}`, null, null, '');
      goodTreasuryOutput.datumType = 'inline';
      goodTreasuryOutput.datum = `"${handle}".encode_utf8()`;
      const goodProviderOutput = new TxOutput(`${pz_provider_bytes}`, null, null, '');
      goodProviderOutput.datumType = 'inline';
      goodProviderOutput.datum = `"${handle}".encode_utf8()`;
      this.outputs = [goodRefTokenOutput, goodTreasuryOutput, goodProviderOutput];
      this.signers = [owner_bytes];
    }
  
    render() {
      //console.log(this.inputs, this.referenceInputs, this.outputs)
      let renderedInputs = '';
      for (let i=0; i<this.inputs.length; i++){
        renderedInputs += this.inputs[i].render() + (i+1 == this.inputs.length ? '' : ', ');
      }
      let renderedRefs = '';
      for (let i=0; i<this.referenceInputs.length; i++){
        renderedRefs += this.referenceInputs[i].render() + (i+1 == this.referenceInputs.length ? '' : ', ');
      }
      let renderedOutputs = '';
      for (let i=0; i<this.outputs.length; i++){
        renderedOutputs += this.outputs[i].render() + (i+1 == this.outputs.length ? '' : ', ');
      }
      let renderedSigners = '';
      for (let i=0; i<this.signers.length; i++){
        renderedSigners += `PubKeyHash::new(${this.signers[i]})${i+1 == this.signers.length ? '' : ', '}`;
      }
      return `ScriptContext::new_spending(
          Tx::new(
            []TxInput{${renderedInputs}},
            []TxInput{${renderedRefs}},
            []TxOutput{${renderedOutputs}},
            Value::lovelace(160000),
            Value::ZERO,
            []DCert{},
            Map[StakingCredential]Int{},
            TimeRange::from(Time::new(1001)),
            []PubKeyHash{${renderedSigners}},
            Map[ScriptPurpose]Data{},
            Map[DatumHash]Data{}
          ),
          TxOutputId::new(${script_tx_hash}, 0)
      )`
    }
  }
  
  export class TxInput {
    hash = '';
    output;
  
    constructor(hash=`${pz_provider_bytes}`, output=(new TxOutput())) {
      this.hash = hash;
      this.output = output;
     }
  
    render() {
      return `TxInput::new(TxOutputId::new(${this.hash}, 0), ${this.output.render()})`
    }
  
  }
  
  export class TxOutput {
    hashType = 'validator';
    datumType = 'none';
    hash = '';
    label = '';
    asset = '';
    lovelace = '10000000';
    datum = 'good_datum';
    policy = 'HANDLE_POLICY';
    value = '';
    
    constructor(hash=`${pz_provider_bytes}`, label='LBL_100', asset=`"${handle}"`, value=null) {
      if (hash != null) {
        this.hash = hash;
      }
      if (label != null) {
        this.label = label;
      }
      if (asset != null) {
        this.asset = asset;
      }
      if (value == null) {
        this.value = `+ Value::new(AssetClass::new(${this.policy}, ${this.label}${this.label ? ' + ': ''}(${this.asset}.encode_utf8())), 1)`;
      }
      else {
        this.value = value;
      }
     }
  
    render() {
      let hashString = 'validator(Validator';
      if (this.hashType == 'pubkey') {
        hashString = 'pubkey(PubKey';
      }
      let datumString = `none()`;
      if (this.datumType == 'inline') {
        datumString = `inline(${this.datum})`;
      }
  
      return `TxOutput::new(
                Address::new(Credential::new_${hashString}Hash::new(${this.hash})), Option[StakingCredential]::None)
                , Value::lovelace(${this.lovelace}) ${this.value}
                , OutputDatum::new_${datumString}
              )`
    }
  }
  
  export class PzRedeemer {
    handle = `"${handle}"`;
    designer = {
      bg_asset: 'OutputDatum::new_inline(#f0ff48bbb7bbe9d59a40f1ce90e9e9d0ff5002ec48f232b49ca0fb9a6267).data',
      pfp_asset: 'OutputDatum::new_inline(#f0ff48bbb7bbe9d59a40f1ce90e9e9d0ff5002ec48f232b49ca0fb9a706670).data',
      pfp_border_color: 'OutputDatum::new_inline(#).data',
      qr_inner_eye: 'OutputDatum::new_inline("square,#0a1fd3").data',
      qr_outer_eye: 'OutputDatum::new_inline("square,#0a1fd3").data',
      qr_dot: 'OutputDatum::new_inline("square,#0a1fd3").data',
      qr_bg_color: 'OutputDatum::new_inline(#).data',
      pfp_zoom: 'OutputDatum::new_inline(100).data',
      pfp_offset: 'OutputDatum::new_inline([]Int{0, 0}).data',
      font: 'OutputDatum::new_inline("").data',
      font_color: 'OutputDatum::new_inline(#ffffff).data',
      font_shadow_size: 'OutputDatum::new_inline([]Int{12, 18, 8}).data',
      text_ribbon_colors: 'OutputDatum::new_inline([]ByteArray{}).data',
      text_ribbon_gradient: 'OutputDatum::new_inline("").data',
      font_shadow_color: 'OutputDatum::new_inline(#).data',
      bg_color: 'OutputDatum::new_inline(#).data',
      bg_border_color: 'OutputDatum::new_inline(#).data',
      qr_link: 'OutputDatum::new_inline("").data',
      socials: 'OutputDatum::new_inline([]String{}).data',
      svg_version: 'OutputDatum::new_inline(1).data',
      image_hash: 'OutputDatum::new_inline(#).data',
      standard_image_hash: 'OutputDatum::new_inline(#).data',
    };
  
    constructor() {}
  
    calculateCid() {
        const designer = this.renderDesigner();
        const src = `
            spending get_cid
            
            struct Datum {
                designer: Map[String]Data
            }

            func main(_, _, _) -> Bool {
                true
            }

            const DATUM = Datum { designer: ${designer} }`
        const program = helios.Program.new(src);
        // console.log(src);
        const myDatum = program.evalParam("DATUM");
        const hash = '01701220' + helios.bytesToHex(helios.Crypto.sha2_256(myDatum.data.toCbor()));
        //console.log('CID = ' +  'z' + base58.encode([...Buffer.from(hash, 'hex')]));
        return 'z' + base58.encode([...Buffer.from(hash, 'hex')]);   
    }

    renderDesigner() {
        let designer =  `Map[String]Data {\n`;
        Object.keys(this.designer).forEach((key) => {
            designer += `   "${key}": ${this.designer[key]},\n`
        })
        designer = designer.replace(/,\n$/g, '\n');
        designer += '}';
        return designer;
    }
  
    render() {
        let redeemer = `Redeemer::PERSONALIZE { handle: ${this.handle}, designer: ${this.renderDesigner()}`;
        redeemer += '}\n';
        return redeemer;
    }
  
  }
  
  export class Datum {
    nft = {
      name: `OutputDatum::new_inline("${handle}").data`,
      image: 'OutputDatum::new_inline("ipfs://image_cid").data',
      mediaType: 'OutputDatum::new_inline("image/jpeg").data',
      og: 'OutputDatum::new_inline(0).data',
      og_number: 'OutputDatum::new_inline(1).data',
      rarity: 'OutputDatum::new_inline("basic").data',
      length: 'OutputDatum::new_inline(8).data',
      characters: 'OutputDatum::new_inline("characters,numbers").data',
      numeric_modifiers: 'OutputDatum::new_inline("").data',
      version: 'OutputDatum::new_inline(1).data'
    };
    version = 1;
    extra = {
      standard_image: 'OutputDatum::new_inline("ipfs://cid").data',
      bg_image: 'OutputDatum::new_inline("ipfs://cid").data',
      pfp_image: 'OutputDatum::new_inline("ipfs://cid").data',
      designer: 'OutputDatum::new_inline("ipfs://cid").data',
      bg_asset: 'OutputDatum::new_inline(#f0ff48bbb7bbe9d59a40f1ce90e9e9d0ff5002ec48f232b49ca0fb9a6267).data',
      pfp_asset: 'OutputDatum::new_inline(#f0ff48bbb7bbe9d59a40f1ce90e9e9d0ff5002ec48f232b49ca0fb9a706670).data',
      portal: 'OutputDatum::new_inline("ipfs://cid").data',
      socials: 'OutputDatum::new_inline("ipfs://cid").data',
      vendor: 'OutputDatum::new_inline("ipfs://cid").data',
      default: 'OutputDatum::new_inline(1).data',
      last_update_address: `OutputDatum::new_inline(Address::new(Credential::new_pubkey(PubKeyHash::new(${owner_bytes})), Option[StakingCredential]::None)).data`,
      validated_by: 'OutputDatum::new_inline(#).data',
      agreed_terms: 'OutputDatum::new_inline("https://tou").data',
      trial: 'OutputDatum::new_inline(0).data',
      nsfw: 'OutputDatum::new_inline(0).data',
      migrate_sig_required: 'OutputDatum::new_inline(0).data'
    };
  
    constructor(designerCid=null) {
        if (designerCid) {
            this.extra.designer = `OutputDatum::new_inline("ipfs://${designerCid}").data`;
        }
    }
  
    calculateCid() {
        
    }
  
    render() {
      let datum = `Datum {\n`;
      datum += 'nft: Map[String]Data {\n';
  
      Object.keys(this.nft).forEach((key) => {
        datum += `  "${key}": ${this.nft[key]},\n`
      })
      datum = datum.replace(/,\n$/g, '\n');
      datum += '},\n'
      datum +=  'version: 1,\n'
      datum += 'extra: Map[String]Data {\n';
  
      Object.keys(this.extra).forEach((key) => {
        datum += `  "${key}": ${this.extra[key]},\n`
      })
      datum = datum.replace(/,\n$/g, '\n');
      datum += '}}\n'
      return datum;
    }
  }
  
  export class PzSettings {
    treasury_fee = '1000000'
    treasury_cred = `${treasury_bytes}`
    pz_min_fee = '4000000'
    pz_providers = `Map[ByteArray]ByteArray{${ada_handles_bytes}: ${ada_handles_bytes}, ${pz_provider_bytes}: ${pz_provider_bytes}}`
    valid_contracts = `[]ByteArray{${script_creds_bytes}}`
    admin_creds = `[]ByteArray{${admin_bytes}}`
    settings_cred = `${ada_handles_bytes}`
  
    constructor() {}
    render() {
        return `PzSettings {
            treasury_fee: ${this.treasury_fee},
            treasury_cred: ${this.treasury_cred},
            pz_min_fee: ${this.pz_min_fee},
            pz_providers: ${this.pz_providers},
            valid_contracts: ${this.valid_contracts},
            admin_creds: ${this.admin_creds},
            settings_cred: ${this.settings_cred}
        }`
    }
  
  }
  
  export class ApprovedPolicyIds {
    map = {
      "#f0ff48bbb7bbe9d59a40f1ce90e9e9d0ff5002ec48f232b49ca0fb9a": {
        "#6267": [0,0,0]
      }
    }
    constructor() {}
    render() {
      let ids = 'Map[ByteArray]Map[ByteArray][]Int {\n';
      Object.keys(this.map).forEach((id) => {
        ids += `${id}: Map[ByteArray][]Int {\n`;
        Object.keys(this.map[id]).forEach((pattern) => {
            ids += `${pattern}: []Int{${this.map[id][pattern].join(',')}},\n`;
        })
        ids = ids.replace(/,\n$/g, '\n');
        ids += '},\n'
      });
      ids = ids.replace(/,\n$/g, '\n');
      ids += '}\n'
      return ids;
    }
  
  }