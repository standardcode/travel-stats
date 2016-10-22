import test from 'ava';
import { expect } from 'chai';
import mockery from "mockery";
import { flatten } from "lodash";
import { Observable } from 'rxjs/Rx';
import pgp from "./mock/pg-promise.mock";
import osrm from "./mock/osrm.mock";
import { accumulator } from "../js/util";
import * as data from "./mock/data";

test.beforeEach(t => {
    mockery.enable({
        warnOnReplace: false,
        warnOnUnregistered: false
    });
    mockery.registerMock("pg-promise", pgp);
    mockery.registerMock("osrm", osrm);
    const store = require("../js/store");
    const calc = require("../js/calc");
    const numberOfVillages = 3;
    const numberOfCities = 2;
    data.villages.forEach(v => v.location = [v.longitude, v.latitude]);
    data.cities.forEach(v => v.location = [v.longitude, v.latitude]);
    t.context = {
        list: {
            villages: data.villages.slice(0, numberOfVillages),
            cities: data.cities.slice(0, numberOfCities)
        },
        villages: calc.Villages(store.villagesQueries, numberOfVillages),
        cities: calc.Cities(store.citiesQueries, numberOfCities),
        main: calc.main
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
    t.plan(list.villages.length + list.cities.length ** 2);
    return main(cities, villages).do(() => t.pass())
});
