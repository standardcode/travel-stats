import {Observable} from 'rxjs/Rx';
import _ from "lodash";
import{saveCsv}from "./file";

export default ({start, destination}) => {
    return Observable.from([{
        stats: start,
        file: "easy-go"
    }, {
        stats: destination,
        file: "easy-come"
    }]).flatMap(({stats, file}) => {
        return saveCsv(file, _(stats).map(city => {
            return {
                ...city,
                duration: city.duration.sum / 3600, // hours
                distance: city.distance.sum / 1000 // km
            }
        }).sortBy("duration").value()).concat(Observable.from(stats).flatMap(city =>
            saveCsv("cities/" + city.name + "-" + file, city.duration.all)
        ))
    });
};
