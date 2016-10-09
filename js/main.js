import { noop } from "lodash";
import { alignPoints, calculateCitiesRoutes, calculateVillagesRoutes } from './route';
import { numberOfCities, numberOfVillages, log, logger } from "./config";
import { cities, villages } from "./store";
import self from "./self";
import { accumulator } from "./util";

console.time("Done");

const prepare = (queries, quantity) => queries.clearRoutes()
    .concat(queries.select(quantity))
    .do(logger("Find routes")).flatMap(alignPoints).flatMap(queries.updateCoordinates);

const collect = (observable, queries, quantity) => observable
    .flatMap(queries.storeRoutes)
    .map((v, i) => log(`${(100 * (i + 1) / quantity).toFixed(2)}%`)).ignoreElements()
    .concat(queries.refresh);

const calcVillages = (queries, quantity) =>
    collect(prepare(queries, quantity).flatMap(calculateVillagesRoutes), queries, quantity);

const calcCities = (queries, quantity) =>
    collect(prepare(queries, quantity).reduce(accumulator, [])
        .flatMap(cities => calculateCitiesRoutes(cities).merge(self(cities))), queries, quantity * quantity);

calcVillages(villages, numberOfVillages)
    .concat(calcCities(cities, numberOfCities))
    .subscribe(noop, log, () => {
        console.timeEnd("Done");
        process.exit();
    });
