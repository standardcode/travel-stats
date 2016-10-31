import { alignPoints, calculateCitiesRoutes, calculateVillagesRoutes } from './route';
import self from "./self";
import { log, parallelQueries } from "./config";
import { accumulator } from "./util";
import { Observable } from 'rxjs/Rx';

const Calc = (dao, quantity, complexity) => ({
    align(parallel) {
        return dao.clearRoutes()
            .concat(dao.select(quantity))
            .flatMap(alignPoints)
            .mergeAll(parallel)
            .flatMap(dao.updateCoordinates);
    },

    store() {
        return this.flatMap(dao.storeRoutes);
    },

    refresh() {
        return Observable.defer(dao.refresh);
    },

    get complexity() {
        return complexity;
    }
});

export const Villages = (dao, quantity) => ({
    ...Calc(dao, quantity, quantity),

    routes() {
        return this.flatMap(calculateVillagesRoutes).mergeAll(Math.sqrt(parallelQueries) / 2);
    }
});

export const Cities = (dao, quantity) => ({
    ...Calc(dao, quantity, quantity ** 2),

    routes(cities) {
        return calculateCitiesRoutes(cities).merge(self(cities));
    }
});

export const main = (cities, villages) =>
    cities.align(parallelQueries).reduce(accumulator, []).flatMap(c => Observable.merge(
        villages.align(parallelQueries / 4)::villages.routes()::villages.store(),
        cities.routes(c)::cities.store()
    )).map((v, i) => {
        log(`${(100 * (i + 1) / (villages.complexity + cities.complexity)).toFixed(2)}%`);
        return v;
    }).concat(villages.refresh().concat(cities.refresh()));
