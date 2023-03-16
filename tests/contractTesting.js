import {Color} from './colors.js'

let _program;
let _contract;
let _testCount;
let _successCount;
let _failCount;

export function setup(program, contract) {
  _program = program;
  _contract = contract;
  _testCount = 0;
  _successCount = 0;
  _failCount = 0;
}

// evalParam(p) and runWithPrint(p[]). Look for unit "()" response
export async function testApproval(testGroup, testName, paramNames) {
  _testCount++;
  const args = paramNames.map((p) => _program.evalParam(p));
  await _contract.runWithPrint(args).then((res) => {
      const assertion = res[0].toString() == "()";
      if (assertion) {
        _successCount++
        console.log(`${Color.FgGreen}*success* - APPROVE - ${testGroup} '${testName}'${Color.Reset}`);
      } else {
        logFail(testGroup, testName, res, args, 'APPROVE');
      }
    })
    .catch((err) => {
      logFail(testGroup, testName, err, args, 'APPROVE', true);
    });
}

export async function testDenial(testGroup, testName, paramNames, message=null) {
    _testCount++;
    const args = paramNames.map((p) => _program.evalParam(p));
    await _contract.runWithPrint(args).then((res) => {
        const assertion = res[0].toString() != "()";
        if (assertion) {
          if (message) {
            if (res[1][0] == message) {
              _successCount++
              console.log(`${Color.FgGreen}*success* - DENY    - ${testGroup} '${testName}'${Color.Reset}`);
            }
            else {
              logFail(testGroup, testName, res, args, 'DENY', false, message);
            }
          }
          else {
            _successCount++
            console.log(`${Color.FgGreen}*success* - DENY    - ${testGroup} '${testName}'${Color.Reset}`);
          }
        } 
        else {
            logFail(testGroup, testName, res, args, 'DENY');
        }
      })
      .catch((err) => {
        logFail(testGroup, testName, err, args, 'DENY', true);
      })
}

function logFail(testGroup, testName, obj, args, type, isCodeError=false, message=null) {
    _failCount++
    console.log(`${Color.FgRed}*failure* - ${type.padEnd(7)} - ${testGroup} '${testName}'${Color.Reset}`);
    console.log(`${Color.FgRed}------------------------------${Color.Reset}`)
    // console.log(`   ${Color.FgYellow}ARGS:${Color.Reset}`, args.map((v) => v.toString()));
    if (isCodeError) {
      console.log(`   ${Color.FgRed}**RUNTIME ERROR**${Color.Reset}`);
    }
    console.log(`   ${Color.FgYellow}MESSAGE:${Color.Reset}`);
    if (Array.isArray(obj)){
      console.log(obj[0]);
      console.log(`\n`);
      if (message) {
        console.log(`   ${Color.FgYellow}EXPECTED:\n   ${Color.FgBlue}${message}${Color.Reset}`);
        if (obj.length > 1) {
          // Helios error() is always the last in the output/print statements obj[1].length-1]
          console.log(`   ${Color.FgYellow}RECEIVED:\n   ${Color.FgRed}${obj[1][obj[1].length-1]}${Color.Reset}`);
        }
      }
      else {
        if (obj.length > 1) {
          console.log(`   ${Color.FgYellow}PRINT STATEMENTS:${Color.Reset}\n   ${obj[1].join("\n   ")}`);
        }
      }
    }
    else {
      console.log(obj);
    }
    console.log(`${Color.FgRed}------------------------------${Color.Reset}`)
}
export function displayStats() {
  console.log(`${Color.FgBlue}** SUMMARY **${Color.Reset}`)
  console.log(`${Color.FgBlue}${_testCount.toString().padStart(5)} total tests${Color.Reset}`)
  if (_successCount > 0)
    console.log(`${Color.FgGreen}${_successCount.toString().padStart(5)} successful${Color.Reset}`)
  if (_failCount > 0)
    console.log(`${Color.FgRed}${_failCount.toString().padStart(5)} failed${Color.Reset}`)
}