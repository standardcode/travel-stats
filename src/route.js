import {Observable} from 'rxjs/Rx';
import _ from "lodash";
import get from "./get";
import {accumulator} from "./util";

const alignPoints = (osrmServer, cities) => Observable.from(cities).map(city => {
    return get(`${osrmServer}/nearest/v1/driving/${city.longitude},${city.latitude}`)
        .map(result => {
            return {
                teryt: city.teryt,
                name: city.name,
                area: city.area,
                population: city.population,
                location: result.waypoints[0].location
            }
        })
}).concatAll().reduce(accumulator, []);

const calculateRoutes = (osrmServer, alignedPoints) => Observable.from(alignedPoints).map(start => {
    return Observable.from(alignedPoints).filter(destination => destination !== start).map(destination => {
        return get(`${osrmServer}/route/v1/driving/${start.location.join()};${destination.location.join()}?overview=false`)
            .map(({routes}) => {
                const route = routes[0];
                return {
                    start,
                    destination,
                    distance: route.distance, // meters
                    duration: route.duration // seconds
                }
            })
    }).concatAll().reduce(accumulator, []);
}).concatAll().reduce((a, v) => a.concat(v));


export default (osrmServer) => {
    return {
        alignPoints: _.partial(alignPoints, osrmServer),
        calculateRoutes: _.partial(calculateRoutes, osrmServer)
    };
};