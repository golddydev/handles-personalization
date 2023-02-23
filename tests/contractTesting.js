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

export async function testFailure(testName, paramNames, message=null) {
    const args = paramNames.map((p) => _program.evalParam(p));
    _contract.runWithPrint(args).then((res) => {
        const assertion = res[0].toString() != "()";
        if (assertion) {
          if (message) {
            if (res[1][0] == message) {
              console.log(`${Color.FgGreen}Test ${testName} was successful!${Color.Reset}`);
            }
            else {
              logFail(testName, res, args);
            }
          }
          else {
            console.log(`${Color.FgGreen}Test ${testName} was successful!${Color.Reset}`);
          }
        } 
        else {
            logFail(testName, res, args);
        }
      })
      .catch((err) => {
        logFail(testName, err, args, true);
      })
}

export async function logFail(testName, obj, args, isRuntimeError=false) {
    console.log(`${Color.FgRed}Test ${testName} failed!${Color.Reset}`);
    console.log(`${Color.FgRed}------------------------------${Color.Reset}`)
    let message = obj
    console.log(`   ${Color.FgYellow}ARGS:${Color.Reset}`, args.map((v) => v.toString()));
    if (isRuntimeError) {
      console.log("   **RUNTIME ERROR**");
    }
    else {
      console.log(`   ${Color.FgYellow}MESSAGE:${Color.Reset}`);
      if (Array.isArray(obj)){
        console.log(obj[0]);
        if (obj.length > 1) {
          console.log(`\n\n   ${Color.FgYellow}PRINT STATEMENTS:${Color.Reset}\n   ${obj[1].join("\n   ")}`);
        }
      }
    }
    console.log(`${Color.FgRed}------------------------------${Color.Reset}`)
}