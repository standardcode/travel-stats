import _ from "lodash";
import route from './route';
import { numberOfCities, osrmDomain } from "./config";
import { storeRoutes, selectCities } from "./store";
import self from "./self";

const log = console.log;
const logger = (data) => () => log(data);
console.time("All");

log("Loading cities");
selectCities(numberOfCities).flatMap(cities => {
    log("Align coordinates to streets");
    const server = route(osrmDomain);
    return server.alignPoints(cities).do(logger("Find routes")).flatMap(server.calculateRoutes)
        .map(routes => routes.concat(self(cities)));
}).do(logger("Store results in DB")).flatMap(storeRoutes).subscribe(_.noop, _.noop, () => console.timeEnd("All"));
