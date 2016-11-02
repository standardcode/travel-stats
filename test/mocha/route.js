import { expect } from 'chai';
import mockery from "mockery";
import { Observable } from 'rxjs/Rx';
import { noop, sortBy } from "lodash";
import osrm from "../mock/osrm.mock";
import pgp from "../mock/pg-promise.mock";
import { cities, villages } from "../mock/data";
import { numberOfCities } from "../../js/config";

describe('route', () => {
    let route;
    before(() => {
        mockery.enable({
            warnOnReplace: false,
            warnOnUnregistered: false
        });
        mockery.registerAllowables(["../js/self", "lodash", "rxjs/Rx"]);
        mockery.registerMock("osrm", osrm);
        mockery.registerMock("pg-promise", pgp);
        route = require("../../js/route");
    });
    after(() => {
        mockery.disable();
    });

    it('should align points', (done) => {
        const cities = route.alignPoints([{
            id: 1,
            longitude: 1,
            latitude: 2
        }, {
            id: 2,
            longitude: 8,
            latitude: 5
        }]);
        expect(cities).to.be.an.instanceof(Observable);
        const all = [];
        cities.flatMap(p => p).subscribe(all.push.bind(all), noop, () => {
            expect(sortBy(all, "id").map(city => city.location)).to.eql([[1.5, 2.3], [8.5, 5.3]]);
            done();
        })
    });

    it('should calculate villages', (done) => {
        villages.forEach(v => v.location = [v.longitude, v.latitude]);
        const villagesClass = route.calculateVillagesRoutes(villages[0]);
        expect(villagesClass).to.be.an.instanceof(Observable);
        const all = [];
        villagesClass.flatMap(v => v).subscribe(all.push.bind(all), noop, () => {
            expect(all).to.have.lengthOf(1);
            expectToBeRoute(all[0]);
            done();
        })
    });

    it('should calculate cities', (done) => {
        cities.forEach(v => v.location = [v.longitude, v.latitude]);
        const citiesClass = route.calculateCitiesRoutes(cities);
        expect(citiesClass).to.be.an.instanceof(Observable);
        const all = [];
        citiesClass.subscribe(all.push.bind(all), noop, () => {
            expect(all).to.have.lengthOf(numberOfCities * (numberOfCities - 1));
            expectToBeRoute(all[0]);
            done();
        })
    });

    const expectToBeRoute = route => expect(route).to.have.all.keys("start", "destination", "distance", "duration");
});