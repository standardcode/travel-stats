import { noop } from "lodash";
import { Cities, Villages, main } from './calc';
import { numberOfCities, numberOfVillages, log } from "./config";
import { citiesQueries, villagesQueries } from "./store";

console.time("Done");

main(Cities(citiesQueries, numberOfCities), Villages(villagesQueries, numberOfVillages)).subscribe(noop, log, () => {
    console.timeEnd("Done");
    process.exit();
});
