export const numberOfCities = 15; // number all of cities is 919, but this may take long time to calculate them all.
export const numberOfVillages = 60; // all 37177
export const osrmFile = "poland-latest.osrm";
export const dbServer = "postgres://postgres:pswd@localhost:5432/polandcopy";
export const parallelQueries = 5;

export const log = console.log;
export const logger = (data) => () => log(data);

process.env.UV_THREADPOOL_SIZE = Math.ceil(require("os").cpus().length * 1.5); // https://github.com/Project-OSRM/node-osrm/issues/189#issuecomment-218845413
