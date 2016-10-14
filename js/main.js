import { noop, zip, partition, invokeMap, map } from "lodash";
import { alignPoints, calculateCitiesRoutes, calculateVillagesRoutes } from './route';
import { numberOfCities, numberOfVillages, log } from "./config";
import { citiesQueries, villagesQueries } from "./store";
import self from "./self";
import { accumulator } from "./util";
import { Observable } from 'rxjs/Rx';

console.time("Done");

const prepare = (queries, quantity) => queries.clearRoutes()
    .concat(queries.select(quantity)).flatMap(alignPoints).flatMap(queries.updateCoordinates);

const collect = (observable, queries, quantity) => observable
    .flatMap(queries.storeRoutes)
    .map((v, i) => {
        log(`${(100 * (i + 1) / quantity).toFixed(2)}%`);
        return v;
    }).concat(queries.refresh);

const calcVillages = (queries, quantity) => ({
    alignPoints: () => prepare(queries, quantity),
    save: (villages) => collect(Observable.from(villages).flatMap(calculateVillagesRoutes), queries, quantity)
});

const calcCities = (queries, quantity) => ({
    alignPoints: () => prepare(queries, quantity),
    save: (cities) => collect(calculateCitiesRoutes(cities).merge(self(cities)), queries, quantity * quantity)
});

export const villages = calcVillages(villagesQueries, numberOfVillages);
export const cities = calcCities(citiesQueries, numberOfCities);

export const readyPoints = (tables) => Observable.merge(...invokeMap(tables, "alignPoints"), 5)
    .reduce(accumulator, []);

export const groupSettlements = settlements => partition(settlements, city => city.area);

export const save = (tables, settlements) => Observable.from(zip(
    groupSettlements(settlements),
    map(tables, "save")
)).map(([settlements, calc]) => calc(settlements)).mergeAll();

export const main = (tables) => readyPoints(tables)
    .flatMap(settlements => save(tables, settlements)).mergeAll();

main([villages, cities]).subscribe(noop, log, () => {
    console.timeEnd("Done");
    process.exit();
});
