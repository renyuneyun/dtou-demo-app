import { runBenchmark } from "./dtou/benchmark.js";

const solidServer = 'http://localhost:3000'

async function main() {
    await runBenchmark(solidServer);
}

main();