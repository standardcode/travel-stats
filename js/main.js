import { noop } from "lodash";
import { alignPoints, calculateRoutes, calculateVillagesRoutes } from './route';
import { numberOfCities, numberOfVillages, log, logger } from "./config";
import { cities, villages, refreshHinterland } from "./store";
import self from "./self";
import { accumulator } from "./util";

console.time("Done");

const calcVillages = (queries, quantity) => queries.clearRoutes().ignoreElements()
    .concat(queries.select(quantity))
    .do(logger("Find routes")).flatMap(alignPoints).flatMap(queries.updateCoordinates)
    .flatMap(calculateVillagesRoutes)
    .flatMap(queries.storeRoutes)
    .map((v, i) => log(`${(100 * (i + 1) / quantity).toFixed(2)}%`)).ignoreElements()
    .concat(refreshHinterland);

const calcCities = (queries, quantity) => queries.clearRoutes().ignoreElements()
    .concat(queries.select(quantity))
    .do(logger("Find routes")).flatMap(alignPoints).flatMap(queries.updateCoordinates).reduce(accumulator, [])
    .flatMap(cities => calculateRoutes(cities).merge(self(cities)))
    .flatMap(queries.storeRoutes)
    .map((v, i) => log(`${(100 * (i + 1) / quantity / quantity).toFixed(2)}%`)).ignoreElements();

calcVillages(villages, numberOfVillages)
    .concat(calcCities(cities, numberOfCities))
    .subscribe(noop, log, () => {
        console.timeEnd("Done");
        process.exit();
    });
