import { writeFileSync } from "fs"
import { genAppPolicy, genDataAndPolicy, type DataPolicySet, type OptionsGenDataPolicyReal, type OptionsGenInputSpec, type OptionsGenOutputSpec, reset } from "./generator.js"

export interface ExecOption {
    numData: number
    optionsData: OptionsGenDataPolicyReal
    optionsAppInput: OptionsGenInputSpec
    optionsAppOutput: {
        num: number
        options: OptionsGenOutputSpec
    }
}

// type RunOnceOut = [number, number, number]
type RunOnceOut = [number, number, number, number, number]
// type RunOnceOut = [number, number, number, number, number, number]  // v4
// type RunOnceOut = [number, number, number, number]  // v5

const REPEAT = 10

const DEFAULT_TMP_LOG_FILE = "log/current_incomplete_log.json"

const options = {
    numData: 4,
    optionsData: {
        attribute: {
            num: 100,
        },
        tag: {
            numSecurity: 10,
            numIntegrity: 10,
            numPurpose: 10,
            numBinding: 10,
        },
        obligation: {
            num: 10,
            numArg: 10,
            numBinding: 10,
        },
    } as OptionsGenDataPolicyReal,
    optionsAppInput: {
        numSecurity: 10,
        numIntegrity: 10,
        numPurpose: 10,
    } as OptionsGenInputSpec,
    optionsAppOutput: {
        num: 10,
        options: {
            numInput: 4,
            numDelete: 10,
        } as OptionsGenOutputSpec,
    }
}

function arrayRange(start: number, stop: number, step: number): number[] {
    return Array.from(
    { length: (stop - start) / step + 1 },
    (value, index) => start + index * step
    );
}

function* nextOptions(): Generator<[string, number, ExecOption], any, undefined> {

    // // Seems linear
    // for (const numAttribute of [...arrayRange(10, 100, 10), ...arrayRange(200, 1000, 100)]) {
    //     yield [
    //         'data:numAttribute',
    //         numAttribute,
    //         {
    //             ...options,
    //             optionsData: { ...options.optionsData, attribute: { num: numAttribute } }
    //         }
    //     ]
    // }

    // // Seems higher than linear? Or linear in fact in plot?
    // for (const numSecurity of [...arrayRange(10, 100, 10), ...arrayRange(200, 1000, 100)]) {
    //     yield [
    //         'data:tag:numSecurity',
    //         numSecurity,
    //         {
    //             ...options,
    //             optionsData: {
    //                 ...options.optionsData,
    //                 // attribute: {
    //                 //     num: 1000,
    //                 // },
    //                 tag: {
    //                     ...options.optionsData.tag,
    //                     numSecurity: numSecurity,
    //                 }
    //             }
    //         }
    //     ]
    // }

    // // Seems higher than linear? Or linear in fact in plot?
    // for (const numIntegrity of [...arrayRange(10, 100, 10), ...arrayRange(200, 1000, 100)]) {
    //     yield [
    //         'data:tag:numIntegrity',
    //         numIntegrity,
    //         {
    //             ...options,
    //             optionsData: {
    //                 ...options.optionsData,
    //                 // attribute: {
    //                 //     num: 1000,
    //                 // },
    //                 tag: {
    //                     ...options.optionsData.tag,
    //                     numIntegrity: numIntegrity,
    //                 }
    //             }
    //         }
    //     ]
    // }

    // // Seems higher than linear? Or linear in fact in plot?
    // for (const numPurpose of [...arrayRange(10, 100, 10), ...arrayRange(200, 1000, 100)]) {
    //     yield [
    //         'data:tag:numPurpose',
    //         numPurpose,
    //         {
    //             ...options,
    //             optionsData: {
    //                 ...options.optionsData,
    //                 // attribute: {
    //                 //     num: 1000,
    //                 // },
    //                 tag: {
    //                     ...options.optionsData.tag,
    //                     numPurpose: numPurpose,
    //                 }
    //             }
    //         }
    //     ]
    // }

    // // Higher than linear
    // for (const numBinding of [...arrayRange(10, 100, 10), ...arrayRange(200, 1000, 100)]) {
    //     yield [
    //         'data:tag:numBinding',
    //         numBinding,
    //         {
    //             ...options,
    //             optionsData: {
    //                 ...options.optionsData,
    //                 // attribute: {
    //                 //     num: 1000,
    //                 // },
    //                 tag: {
    //                     ...options.optionsData.tag,
    //                     numSecurity: 10,
    //                     numBinding: numBinding,
    //                 }
    //             }
    //         }
    //     ]
    // }

    // // ??
    // for (const numObligation of [...arrayRange(10, 100, 10), ...arrayRange(200, 1000, 100)]) {
    //     yield [
    //         'data:obligation:num',
    //         numObligation,
    //         {
    //             ...options,
    //             optionsData: {
    //                 ...options.optionsData,
    //                 // attribute: {notange(10, 100, 10), ...arrayRange(200, 1000, 100)]) {
    //     yield [
    //         'data:obligation:numBinding',
    //         numBinding,
    //         {
    //             ...options,
    //             optionsData: {
    //                 ...options.optionsData,
    //                 // attribute: {
    //                 //     num: 1000,
    //                 // },
    //                 obligation: {
    //                     ...options.optionsData.obligation,
    //                     // num: 100,
    //                     numBinding: numBinding,
    //                 }
    //             }
    //         }
    //     ]
    // }

    // // ??
    // for (const numArgs of [...arrayRange(10, 100, 10), ...arrayRange(200, 1000, 100)]) {
    //     yield [
    //         'data:obligation:numArg',
    //         numArgs,
    //         {
    //             ...options,
    //             optionsData: {
    //                 ...options.optionsData,
    //                 // attribute: {
    //                 //     num: 1000,
    //                 // },
    //                 obligation: {
    //                     ...options.optionsData.obligation,
    //                     // num: 100,
    //                     numArg: numArgs,
    //                     numBinding: 10,
    //                 }
    //             }
    //         }
    //     ]
    // }

    // // ??
    // for (const numSecurity of [...arrayRange(10, 100, 10), ...arrayRange(200, 1000, 100)]) {
    //     yield [
    //         'app:numSecurity',
    //         numSecurity,
    //         {
    //             ...options,
    //             optionsAppInput: {
    //                 ...options.optionsAppInput,
    //                 numSecurity: numSecurity,
    //             }
    //         }
    //     ]
    // }

    // // ??
    // for (const numIntegrity of [...arrayRange(10, 100, 10), ...arrayRange(200, 1000, 100)]) {
    //     yield [
    //         'app:numIntegrity',
    //         numIntegrity,
    //         {
    //             ...options,
    //             optionsAppInput: {
    //                 ...options.optionsAppInput,
    //                 numIntegrity: numIntegrity,
    //             }
    //         }
    //     ]
    // }

    // // ??
    // for (const numPurpose of [...arrayRange(10, 100, 10), ...arrayRange(200, 1000, 100)]) {
    //     yield [
    //         'app:numPurpose',
    //         numPurpose,
    //         {
    //             ...options,
    //             optionsAppInput: {
    //                 ...options.optionsAppInput,
    //                 numPurpose: numPurpose,
    //             }
    //         }
    //     ]
    // }

    // ??
    // for (const numDelete of [...arrayRange(10, 100, 10), ...arrayRange(200, 1000, 100)]) {
    for (const numDelete of [...arrayRange(700, 1000, 100)]) {
        yield [
            'app:output:numDelete',
            numDelete,
            {
                ...options,
                // numData: 5,
                optionsAppOutput: {
                    ...options.optionsAppOutput,
                    options: {
                        ...options.optionsAppOutput.options,
                        numDelete: numDelete
                    }
                }
            }
        ]
    }

    // ??
    // for (const numOutput of [...arrayRange(10, 100, 10), ...arrayRange(200, 1000, 100)]) {
    for (const numOutput of [...arrayRange(600, 1000, 100)]) {
        yield [
            'app:output:numOutput',
            numOutput,
            {
                ...options,
                // numData: 5,
                optionsAppOutput: {
                    ...options.optionsAppOutput,
                    num: numOutput,
                }
            }
        ]
    }

    // // ??
    // for (const numInput of [...arrayRange(10, 100, 10), ...arrayRange(200, 1000, 100)]) {
    //     yield [
    //         'app:output:numInput',
    //         numInput,
    //         {
    //             ...options,
    //             // numData: 5,
    //             optionsAppOutput: {
    //                 ...options.optionsAppOutput,
    //                 options: {
    //                     ...options.optionsAppOutput.options,
    //                     numInput: numInput
    //                 }
    //             }
    //         }
    //     ]
    // }

    // // At least polynomial
    // for (let numData = 1; numData < 10; numData++) {
    //     yield ['app:numData', numData, {...options, numData: numData}];
    // }
    // for (const numData of [10, 15, 20]) {  // From 30 will timeout. 20 Already has 138s = 2min. Seems like quadratic growth
    // // for (const numData of [15, 20]) {  // From 30 will timeout. 20 Already has 138s = 2min. Seems like quadratic growth
    //     yield ['app:numData', numData, {...options, numData: numData}]
    // }
    // for (const numData of [...arrayRange(30, 100, 10), ...arrayRange(200, 1000, 100)]) {
    //     yield ['app:numData', numData, {...options, numData: numData}]
    // }
}

const toObject = (map = new Map) => {
    if (!(map instanceof Map)) return map
    return Object.fromEntries(Array.from(map.entries(), ([k, v]) => {
      if (v instanceof Array) {
        return [k, v.map(toObject)]
      } else if (v instanceof Map) {
        return [k, toObject(v)]
      } else {
        return [k, v]
      }
    }))
  }

const timedRun = async (fn) => {
    const time0 = Date.now();
    await fn();
    const time1 = Date.now();
    const timeDiff = time1 - time0;
    return timeDiff;
}

export async function runBenchmark(solidServer: string) {
    const records = new Map();
    for (const [key, value, options] of nextOptions()) {
        console.error(`With config: ${key} ${value} --`, JSON.stringify(options))
        const timeDiffList: RunOnceOut[] = [];
        // const timeDiffList: [number, number, number, number, number][] = [];
        // const timeDiffList: [number, number, number][] = [];
        // const timeDiffList: number[] = [];
        for (let i = 0; i < REPEAT; i++) {
            process.stderr.write(`.`)
            // const time0 = Date.now();
            const times = await runOnce(solidServer, options);
            // const time1 = Date.now();
            // const timeDiff = time1 - time0;
            timeDiffList.push(times);
            // console.log(`Took ${timeDiff}ms`)
        }
        process.stderr.write(`\n`)
        const currRecords = records.get(key) ?? new Map()
        // const values = currRecords.get(value) ?? []
        // values.push(timeDiff)
        // const values = timeDiff
        // currRecords.set(value, values)
        // const avg = timeDiffList.reduce((oldValue, item) => oldValue + item, 0) / timeDiffList.length;
        const _lst = [];
        for (let i = 0; i < timeDiffList[0].length; i++)
            _lst.push(i);
        const avg = _lst.map((index => timeDiffList.reduce((oldValue, item) => oldValue + item[index], 0) / timeDiffList.length ));
        // currRecords.set(value, [avg, timeDiffList])
        currRecords.set(value, timeDiffList)
        records.set(key, currRecords)
        console.error(`Took average ${avg}ms`)
        const currLog = toObject(records);
        writeFileSync(DEFAULT_TMP_LOG_FILE, JSON.stringify(currLog))
    }
    // console.log(JSON.stringify(records.keys()))
    // console.table(records)

    // const log: {
    //     [key: string]: {
    //         [key: number]: number[]
    //     }
    // } = toObject(records)
    const log = toObject(records);
    console.log(JSON.stringify(log))
}

async function runOnce(solidServer: string, options: ExecOption): Promise<RunOnceOut> {
    reset()
    const dataPolicy = await genDataAndPolicy(options.numData, options.optionsData)
    const appPolicy = await genAppPolicy(options.numData, options.optionsAppInput, options.optionsAppOutput.num, options.optionsAppOutput.options)

    await doPrepare(solidServer, dataPolicy)
    await registerApp(solidServer, appPolicy)

    const timeBase = await timedRun(async () => await runBase(solidServer))
    const timeBase2 = await timedRun(async () => await runBase2(solidServer))
    // const timeBase3: [number, number, number, number] = [0, 0, 0, 0];
    // for (let i = 0; i < 4; i++) {
    //     timeBase3[i] = await timedRun(async () => await runBase3(solidServer, i))
    // }
    const timeCompliance = await timedRun(async () => await checkCompliance(solidServer))
    const timeActivatedObligation = await timedRun(async () => await checkActivatedObligation(solidServer));
    const timeDerivedPolicy = await timedRun(async () => await getDerivedPolicy(solidServer));

    // return timeCompliance
    // return [ timeCompliance, timeActivatedObligation, timeDerivedPolicy ]
    return [ timeBase, timeBase2, timeCompliance, timeActivatedObligation, timeDerivedPolicy ]
    // return [ timeBase, timeBase2, timeActivatedObligation, timeDerivedPolicy ]
    // return [ timeBase, timeBase2, ...timeBase3 ]
}

async function doPrepare(solidServer: string, dataPolicy: DataPolicySet) {
    const response = await fetch(`${solidServer}/dtou/benchmark/pre`, {
        method: "POST",
        body: JSON.stringify(dataPolicy),
    });

    if (!response.ok) {
        console.error("Data policy failed to write")
    }
}

async function registerApp(solidServer: string, appPolicy: string) {
    const response = await fetch(`${solidServer}/dtou`, {
        method: "POST",
        body: JSON.stringify({
            policy: appPolicy,
        }),
    });
    if (!response.ok) {
        console.error("App failed to register")
    }
}

async function checkCompliance(solidServer: string) {
    const response = await fetch(`${solidServer}/dtou/compliance`);

    const conflict = await response.text();
    return conflict
}

async function checkActivatedObligation(solidServer: string) {
    const response = await fetch(`${solidServer}/dtou/activated-obligations`)

    const activatedObligations = await response.text()
    return activatedObligations
}

async function getDerivedPolicy(solidServer: string) {
    const url0 = `${solidServer}/dtou/derived-policies`;
    const response = await fetch(url0);

    const derivedPolicy = await response.text();
    return derivedPolicy
}

async function runBase(solidServer: string) {
    const url0 = `${solidServer}/dtou/benchmark/base`;
    const response = await fetch(url0);

    const res = await response.text();
    return res
}

async function runBase2(solidServer: string) {
    const url0 = `${solidServer}/dtou/benchmark/base2`;
    const response = await fetch(url0);

    const res = await response.text();
    return res
}

async function runBase3(solidServer: string, index: number) {
    const url0 = `${solidServer}/dtou/benchmark/base${3+index}`;
    const response = await fetch(url0);

    const res = await response.text();
    return res
}