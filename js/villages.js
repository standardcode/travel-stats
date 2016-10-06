import { noop } from "lodash";
import { alignPoints, calculateVillagesRoutes } from './route';
import { numberOfCities, log } from "./config";
import { villages as queries } from "./store";
import { accumulator } from "./util";

console.time("Done");

log("Loading villages");
queries.clearRoutes().skip(1).concat(queries.select(numberOfCities)).flatMap(cities => {
    log("Find routes");
    return alignPoints(cities).flatMap(queries.updateCoordinates)
        .reduce(accumulator, []).flatMap(calculateVillagesRoutes)
}).flatMap(queries.storeRoutes).subscribe(noop, log, () => {
    console.timeEnd("Done");
    process.exit();
});
