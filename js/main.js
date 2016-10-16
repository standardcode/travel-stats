import { noop, zip, partition, invokeMap, map } from "lodash";
import { alignPoints, calculateCitiesRoutes, calculateVillagesRoutes } from './route';
import { numberOfCities, numberOfVillages, log } from "./config";
import { citiesQueries, villagesQueries } from "./store";
import self from "./self";
import { accumulator } from "./util";
import { Observable } from 'rxjs/Rx';

console.time("Done");

const prepare = function (quantity) {
    return this.clearRoutes()
        .concat(this.select(quantity)).flatMap(alignPoints).flatMap(this.updateCoordinates);
};

const collect = function (queries, quantity) {
    return this
        .flatMap(queries.storeRoutes)
        .map((v, i) => {
            log(`${(100 * (i + 1) / quantity).toFixed(2)}%`);
            return v;
        })
};

const calcVillages = (queries, quantity) => ({
    alignPoints: () => queries::prepare(quantity),
    save: (villages) => Observable.from(villages).flatMap(calculateVillagesRoutes)::collect(queries, quantity)
});

const calcCities = (queries, quantity) => ({
    alignPoints: () => queries::prepare(quantity),
    save: (cities) => calculateCitiesRoutes(cities).merge(self(cities))::collect(queries, quantity * quantity)
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
    .flatMap(settlements => save(tables, settlements)).concat(
        Observable.merge(
            Observable.defer(villagesQueries.refresh),
            Observable.defer(citiesQueries.refresh)
        )
    );


main([cities, villages]).subscribe(noop, log, () => {
    console.timeEnd("Done");
    process.exit();
});
