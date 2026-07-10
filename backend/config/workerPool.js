const Piscina = require("piscina");
const path = require("path");


const pool = new Piscina({
    filename: path.resolve(
        __dirname,
        "../workers/parser.worker.js"
    ),

    // number of worker threads
    minThreads: 2,
    maxThreads: 4
});


module.exports = pool;