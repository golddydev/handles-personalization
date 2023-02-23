import {Color} from './colors.js'

let _program;
let _contract;

export function setup(program, contract) {
  _program = program;
  _contract = contract;

}

// evalParam(p) and runWithPrint(p[]). Look for unit "()" response
export async function testSuccess(testName, paramNames) {
  const args = paramNames.map((p) => _program.evalParam(p));
  _contract.runWithPrint(args).then((res) => {
      const assertion = res[0].toString() == "()";
      if (assertion) {
        console.log(`${Color.FgGreen}Test ${testName} was successful!${Color.Reset}`);
      } else {
          logFail(testName, res, args);
      }
    })
    .catch((err) => {
      logFail(testName, err, args, true);
    });
}

export async function testFailure(testName, paramNames) {
    const args = paramNames.map((p) => _program.evalParam(p));
    _contract.runWithPrint(args).then((res) => {
        const assertion = res[0].toString() != "()";
        if (assertion) {
          console.log(`${Color.FgGreen}Test ${testName} was successful!${Color.Reset}`);
        } 
        else {
            logFail(testName, res, args);
        }
      })
      .catch((err) => {
        logFail(testName, err, args, true);
      })
}

export async function logFail(testName, obj, args, isError=false) {
    console.log(`${Color.FgRed}Test ${testName} failed!${Color.Reset}`);
    console.log(`${Color.FgRed}--------------${Color.Reset}`)
    if (isError) console.log("  *ERROR*");
    console.log(`   ${Color.FgRed}ARGS: ${Color.Reset}`, args.map((v) => v.toString()));
    console.log(`   ${Color.FgRed}${obj}${Color.Reset}`);
    console.log(`${Color.FgRed}--------------${Color.Reset}`)
}