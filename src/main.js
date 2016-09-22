import _ from "lodash";
import {openCsv}from "./file";
import route from './route';
import stat from "./stat";
import save from './save';
import {accumulator} from "./util";
import {numberOfCities, osrmDomain}from "./config";
import {storeCities,storeRoutes} from "./store";

const log = console.log;
log("Load cities");
const logger = (data) => () => log(data);
console.time("All");

openCsv("cities").map((data) => {
    data.area = +data.area;
    data.population = +data.population;
    return data;
}).reduce(accumulator, []).flatMap(storeCities).flatMap(cities => {
    cities = _.take(_.orderBy(cities, "population", "desc"), numberOfCities);
    log("Align coordinates to street");
    const server = route(osrmDomain);
    return server.alignPoints(cities).do(logger("Find routes")).flatMap(server.calculateRoutes);
}).flatMap(storeRoutes).map(routes => {
    log("Calculate stats");
    return {
        start: stat(routes, "start", "destination"),
        destination: stat(routes, "destination", "start")
    };
}).do(logger("Save files")).flatMap(save).subscribe((v) => console.log(v), _.noop, () => console.timeEnd("All"));
