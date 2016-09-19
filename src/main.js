import _ from "lodash";
import {openCsv}from "./file";
import route from './route';
import stat from "./stat";
import save from './save';
import {accumulator} from "./util";
import {numberOfCities, osrmDomain}from "./config";

openCsv("cities").map((data) => {
    data.area = +data.area;
    data.population = +data.population;
    return data;
}).reduce(accumulator, []).flatMap(cities => {
    cities = _.take(_.orderBy(cities, "population", "desc"), numberOfCities);
    const server = route(osrmDomain);
    return server.alignPoints(cities).flatMap(server.calculateRoutes);
}).map(routes => {
    return {
        start: stat(routes, "start", "destination"),
        destination: stat(routes, "destination", "start")
    };
}).flatMap(save).subscribe((v) => console.log(v));
