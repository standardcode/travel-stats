import { noop } from "lodash";
import { alignPoints, calculateRoutes } from './route';
import { numberOfCities, log } from "./config";
import { cities as queries } from "./store";
import self from "./self";
import { accumulator } from "./util";

console.time("Done");

log("Loading cities");
queries.clearRoutes().skip(1).concat(queries.select(numberOfCities)).flatMap(cities => {
    log("Find routes");
    return alignPoints(cities).flatMap(queries.updateCoordinates)
        .reduce(accumulator, []).flatMap(calculateRoutes).merge(self(cities))
}).flatMap(queries.storeRoutes).subscribe(noop, log, () => {
    console.timeEnd("Done");
    process.exit();
});
