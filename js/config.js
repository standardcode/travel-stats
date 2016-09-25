export const numberOfCities = 6; // number all of cities is 919, but this may take long time to calculate them all.
export const osrmServer = "http://localhost:5000";
export const dbServer = "postgres://postgres:pswd@localhost:5432/poland";

export const log = console.log;
export const logger = (data) => () => log(data);