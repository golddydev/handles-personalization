import {Color} from './colors.js'

let _program;
let _contract;
let testCount;
let successCount;
let failCount;

export function setup(program, contract) {
  _program = program;
  _contract = contract;
  testCount = 0;
  successCount = 0;
  failCount = 0;
}

// evalParam(p) and runWithPrint(p[]). Look for unit "()" response
export async function testCase(shouldApprove, testGroup, testName, paramNames, message=null) {
  testCount++;
  const args = arguments;
  const params = paramNames.map((p) => _program.evalParam(p));
  await _contract.runWithPrint(params).then((res) => {
    logTest(args[0], args[1], args[2], args[3], args.length == 5 ? args[4] : null, res);
  })
  .catch((err) => {
    logTest(args[0], args[1], args[2], args[3], args.length == 5 ? args[4] : null, err);
  });
}

function logTest(shouldApprove, testGroup, testName, paramNames, message=null, res) {
  const hasPrintStatements = Array.isArray(res) && res.length > 1 && res[1].length > 1;
  const assertion = Array.isArray(res) && (shouldApprove ? res[0].toString() == "()" : res[0].toString() != "()" && (!message || res[1][0] == message));
  const textColor = assertion ? Color.FgGreen : Color.FgRed
  
  if (!assertion || hasPrintStatements)
    console.log(`${textColor}------------------------------${Color.Reset}`)
  
  console.log(`${textColor}*${assertion ? "success" : "failure"}* - ${(shouldApprove ? "APPROVE" : "DENY").padEnd(7)} - ${testGroup.padEnd(25)} '${testName}'${Color.Reset}`);
  
  if (hasPrintStatements)
    console.log(`   ${Color.FgYellow}PRINT STATEMENTS:${Color.Reset}\n   ${res[1].join("\n   ")}`);
  
  if (assertion) {
    successCount++
  }
  else {
    failCount++
    console.log(`   ${Color.FgYellow}MESSAGE:${Color.Reset}`);
    if (Array.isArray(res))
      console.log(res[0]);
      console.log(`\n`)
      console.log(`   ${Color.FgYellow}EXPECTED:\n   ${Color.FgBlue}${message ? messsage : "success"}${Color.Reset}`);
      if (res.length > 1) {
        // Helios error() is always the last in the output/print statements res[1].length-1]
        console.log(`   ${Color.FgYellow}RECEIVED:\n   ${Color.FgRed}${res[1][res[1].length-1]}${Color.Reset}`);
      }
    else {
      console.log(res);
    }
  }
  
  if (!assertion || hasPrintStatements)
    console.log(`${textColor}------------------------------${Color.Reset}`)
}

export class ScriptContext {
  inputs = [];
  referenceInputs = [];
  outputs = [];
  signers;

  constructor() {
    this.inputs = [new TxInput('script_tx_hash', new TxOutput('script_creds_bytes'))];

    const goodBgInput = new TxInput('handles_tx_hash', new TxOutput('ada_handles_bytes', '', '"bg"'));
    const goodPfpInput = new TxInput('handles_tx_hash', new TxOutput('ada_handles_bytes', '', '"pfp"'));
    const goodBgListInput = new TxInput('handles_tx_hash', new TxOutput('ada_handles_bytes', 'LBL_222', '"bg_policy_ids"'));
    goodBgListInput.output.datumType = 'inline';
    goodBgListInput.output.datum = 'bg_policy_ids';
    const goodPfpListInput = new TxInput('handles_tx_hash', new TxOutput('ada_handles_bytes', 'LBL_222', '"pfp_policy_ids"'));
    goodPfpListInput.output.datumType = 'inline';
    goodPfpListInput.output.datum = 'pfp_policy_ids';
    const goodPzInput = new TxInput('handles_tx_hash', new TxOutput('ada_handles_bytes', 'LBL_222', '"pz_settings"'));
    goodPzInput.output.datumType = 'inline';
    goodPzInput.output.datum = 'pz_settings';
    const goodOwnerInput = new TxInput('owner_tx_hash', new TxOutput('owner_bytes', 'LBL_222', 'handle'));
    goodOwnerInput.output.hashType = 'pubkey';
    this.referenceInputs = [goodBgInput, goodPfpInput, goodBgListInput, goodPfpListInput, goodPzInput, goodOwnerInput];

    const goodRefTokenOutput = new TxOutput('script_creds_bytes');
    goodRefTokenOutput.datumType = 'inline';
    goodRefTokenOutput.datum = 'good_datum';
    const goodTreasuryOutput = new TxOutput('treasury_bytes', null, null, '');
    goodTreasuryOutput.datumType = 'inline';
    goodTreasuryOutput.datum = 'handle.encode_utf8()';
    const goodProviderOutput = new TxOutput('pz_provider_bytes', null, null, '');
    goodProviderOutput.datumType = 'inline';
    goodProviderOutput.datum = 'handle.encode_utf8()';
    this.outputs = [goodRefTokenOutput, goodTreasuryOutput, goodProviderOutput];
    this.signers = ['#9876543210012345678901234567890123456789012345678901234567891235'];
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
        TxOutputId::new(tx_output_id, 0)
    )`
  }
}

export class TxInput {
  hash = '';
  output;

  constructor(hash='pz_provider_bytes', output=(new TxOutput())) {
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
  
  constructor(hash='pz_provider_bytes', label='LBL_100', asset='handle', value=null) {
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

export function displayStats() {
  console.log(`${Color.FgBlue}** SUMMARY **${Color.Reset}`)
  console.log(`${Color.FgBlue}${testCount.toString().padStart(5)} total tests${Color.Reset}`)
  if (successCount > 0)
    console.log(`${Color.FgGreen}${successCount.toString().padStart(5)} successful${Color.Reset}`)
  if (failCount > 0)
    console.log(`${Color.FgRed}${failCount.toString().padStart(5)} failed${Color.Reset}`)
}

export function getTotals() {
  return {testCount, successCount, failCount}
}