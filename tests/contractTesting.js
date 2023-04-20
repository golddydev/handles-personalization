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
  
  console.log(`${textColor}*${assertion ? "succcess" : "failure"}* - ${(shouldApprove ? "APPROVE" : "DENY").padEnd(7)} - ${testGroup.padEnd(25)} '${testName}'${Color.Reset}`);
  
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