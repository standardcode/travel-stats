import _ from "lodash";
import {openCsv}from "./file";
import route from './route';
import {accumulator} from "./util";
import {numberOfCities, osrmDomain}from "./config";
import {storeCities,storeRoutes} from "./store";
import self from "./self";

const log = console.log;
const logger = (data) => () => log(data);
console.time("All");

log("Loading cities");

openCsv("cities").map((data) => {
    data.teryt = +data.teryt;
    data.area = +data.area;
    data.population = +data.population;
    return data;
}).reduce(accumulator, [])
    .map(cities => _.take(_.orderBy(cities, "population", "desc"), numberOfCities))
    .flatMap(storeCities).flatMap(cities => {
    log("Align coordinates to streets");
    const server = route(osrmDomain);
    return server.alignPoints(cities).do(logger("Find routes")).flatMap(server.calculateRoutes)
        .map(routes => routes.concat(self(cities)));
}).do(logger("Store results in DB")).flatMap(storeRoutes).subscribe(_.noop, _.noop, () => console.timeEnd("All"));
