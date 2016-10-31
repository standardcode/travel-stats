import test from 'ava';
import { expect } from 'chai';
import mockery from "mockery";
import { noop, flatten } from "lodash";
import { Observable } from 'rxjs/Rx';
import pgp from "../mock/pg-promise.mock";
import osrm, { lastOSRM } from "../mock/osrm.mock";
import { accumulator } from "../../js/util";
import { parallelQueries } from "../../js/config";
import * as data from "../mock/data";
import { spy, assert } from "sinon";

test.beforeEach(t => {
    mockery.enable({
        warnOnReplace: false,
        warnOnUnregistered: false
    });
    mockery.registerMock("pg-promise", pgp);
    mockery.registerMock("osrm", osrm);
    const store = require("../../js/store");
    const calc = require("../../js/calc");
    const numberOfVillages = 3;
    const numberOfCities = 2;
    data.villages.forEach(v => v.location = [v.longitude, v.latitude]);
    data.cities.forEach(v => v.location = [v.longitude, v.latitude]);
    const villagesQueries = { ...store.villagesQueries };
    const citiesQueries = { ...store.citiesQueries };
    t.context = {
        list: {
            villages: data.villages.slice(0, numberOfVillages),
            cities: data.cities.slice(0, numberOfCities)
        },
        villages: calc.Villages(villagesQueries, numberOfVillages),
        cities: calc.Cities(citiesQueries, numberOfCities),
        main: calc.main,
        villagesQueries,
        citiesQueries
    }
});

test.afterEach(() => {
    mockery.disable();
});

test("align points", t => {
    const { villages, list } = t.context;
    t.plan(list.villages.length);
    return villages.align().do(() => t.pass()).reduce(accumulator, [])
        .map(all => expect(all.map(s => s.id)).to.have.members(list.villages.map(v => v.id)));
});

test("calc villages routes", t => {
    const { villages, list } = t.context;
    t.plan(list.villages.length);
    return Observable.from(list.villages)::villages.routes().do(() => t.pass()).reduce(accumulator, [])
        .map(all => expect(all.map(r => r.start.id)).to.have.members(list.villages.map(v => v.id)));
});

test("calc cities routes", t => {
    const { cities, list } = t.context;
    t.plan(list.cities.length ** 2);
    const matrix = (array) => flatten(array.map(s => array.map(d => [s.id, d.id])));
    return cities.routes(list.cities).do(() => t.pass()).reduce(accumulator, [])
        .map(all => expect(all.map(r => [r.start.id, r.destination.id])).to.deep.have.members(matrix(list.cities)));
});

test("store villages routes", t => {
    const { villages, list } = t.context;
    t.plan(list.villages.length);
    return villages.align()::villages.routes()::villages.store().do(() => t.pass()).reduce(accumulator, [])
        .map(all => expect(all.map(r => r.start.id)).to.have.members(list.villages.map(v => v.id)));
});

test("main", t => {
    const { main, list, villages, cities } = t.context;
    t.plan(list.villages.length + list.cities.length ** 2 + 1);
    console.time("Done");
    return main(cities, villages).do(() => t.pass(), noop, () => {
        t.true(lastOSRM().top <= parallelQueries);
        console.timeEnd("Done");
    })
});

test("main spy", t => {
    const { main, list, villages, cities, villagesQueries, citiesQueries } = t.context;
    spy(villagesQueries, "clearRoutes");
    spy(citiesQueries, "clearRoutes");
    spy(villagesQueries, "updateCoordinates");
    spy(citiesQueries, "updateCoordinates");
    spy(villagesQueries, "storeRoutes");
    spy(citiesQueries, "storeRoutes");
    spy(villagesQueries, "refresh");
    spy(citiesQueries, "refresh");
    return main(cities, villages).do(noop, noop, () => {
        assert.callOrder(
            citiesQueries.updateCoordinates,
            villagesQueries.updateCoordinates,
            villagesQueries.refresh,
            citiesQueries.refresh
        );
        t.true(citiesQueries.clearRoutes.calledBefore(citiesQueries.storeRoutes));
        t.true(villagesQueries.clearRoutes.calledBefore(villagesQueries.storeRoutes));
        t.true(citiesQueries.storeRoutes.calledBefore(citiesQueries.refresh));
        t.true(villagesQueries.storeRoutes.calledBefore(villagesQueries.refresh));
        t.true(citiesQueries.updateCoordinates.calledBefore(villagesQueries.storeRoutes));
        assert.calledOnce(citiesQueries.clearRoutes);
        assert.calledOnce(villagesQueries.clearRoutes);
        assert.calledOnce(citiesQueries.refresh);
        assert.calledOnce(villagesQueries.refresh);
        assert.callCount(villagesQueries.updateCoordinates, list.villages.length);
        assert.callCount(citiesQueries.updateCoordinates, list.cities.length);
        assert.callCount(villagesQueries.storeRoutes, list.villages.length);
        assert.callCount(citiesQueries.storeRoutes, list.cities.length ** 2);
        villagesQueries.clearRoutes.restore();
        citiesQueries.clearRoutes.restore();
        villagesQueries.updateCoordinates.restore();
        citiesQueries.updateCoordinates.restore();
        villagesQueries.storeRoutes.restore();
        citiesQueries.storeRoutes.restore();
        villagesQueries.refresh.restore();
        citiesQueries.refresh.restore();
    });
});