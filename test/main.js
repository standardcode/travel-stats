import { expect } from 'chai';
import mockery from "mockery";
import { Observable } from 'rxjs/Rx';
import { noop } from "lodash";
import pgp from "./mock/pg-promise.mock";
import osrm from "./mock/osrm.mock";
import { cities, villages } from "./mock/data";
import { numberOfVillages } from "../js/config";

const crash = (err) => {
    throw err
};

describe('main', () => {
    let main;
    before(() => {
        mockery.enable({
            warnOnReplace: false,
            warnOnUnregistered: false
        });
        mockery.registerAllowables(["../js/self", "lodash", "rxjs/Rx"]);
        mockery.registerMock("pg-promise", pgp);
        mockery.registerMock("osrm", osrm);
        main = require("../js/main");
    });
    after(() => {
        mockery.disable();
    });

    it('should align points', (done) => {
        const all = [];
        main.villages.alignPoints().subscribe(all.push.bind(all), crash, () => {
            expect(all.map(s => s.id)).to.eql(villages.map(v => v.id).slice(0, numberOfVillages));
            done();
        });
    });

    it('should return elements after saving', (done) => {
        villages.forEach(v => v.location = [v.longitude, v.latitude]);
        const all = [];
        main.villages.save(villages).subscribe(all.push.bind(all), crash, () => {
            expect(all).to.have.lengthOf(villages.length);
            expectToBeRoute(all[0]);
            done();
        });
    });

    it('should return elements after saving', (done) => {
        cities.forEach(v => v.location = [v.longitude, v.latitude]);
        const all = [];
        main.cities.save(cities).subscribe(all.push.bind(all), crash, () => {
            expect(all).to.have.lengthOf(cities.length * cities.length);
            expectToBeRoute(all[0]);
            done();
        });
    });

    it('should align all points', (done) => {
        const table = (list) => ({
            alignPoints: () => Observable.from(list),
            save: () => Observable.empty()
        });
        main.readyPoints([table(villages), table(cities)]).subscribe(all => {
            expect(all).to.eql(villages.concat(cities));
        }, crash, () => {
            done();
        });
    });

    it('should save points', (done) => {
        const all = [];
        const table = (list) => ({
            alignPoints: () => Observable.from(list),
            save: (settlements) => Observable.of(settlements)
        });
        main.save([table(villages), table(cities)], villages.concat(cities)).subscribe(all.push.bind(all), crash, () => {
            expect(all).to.eql([cities, villages]);
            done();
        });
    });

    it('should group settlements', () => {
        const [c, v] = main.groupSettlements(villages.concat(cities));
        expect(c).to.eql(cities);
        expect(v).to.eql(villages);
    });

    it('should run main function', (done) => {
        const all = [];
        const table = (list) => ({
            alignPoints: () => Observable.from(list),
            save: (settlements) => Observable.of(settlements)
        });
        main.main([table(villages), table(cities)]).subscribe(all.push.bind(all), crash, () => {
            expect(all).to.eql(cities.concat(villages));
            done();
        });
    });

    const expectToBeRoute = route => expect(route).to.have.all.keys("start", "destination", "distance", "duration");
});