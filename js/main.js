import { noop } from "lodash";
import { alignPoints, calculateRoutes } from './route';
import { numberOfCities, log } from "./config";
import { selectCities, updateCities, clearRoutes, storeRoutes } from "./store";
import self from "./self";
import { accumulator } from "./util";

console.time("Done");

log("Loading cities");
clearRoutes().skip(1).concat(selectCities(numberOfCities)).flatMap(cities => {
    log("Find routes");
    return alignPoints(cities).flatMap(updateCities).reduce(accumulator, []).flatMap(calculateRoutes).merge(self(cities))
}).flatMap(storeRoutes).subscribe(noop, log, () => {
    console.timeEnd("Done");
    process.exit();
});
