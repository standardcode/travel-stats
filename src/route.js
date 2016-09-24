import { Observable } from 'rxjs/Rx';
import get from "./get";
import { osrmServer } from "./config";

export const alignPoints = (cities) => Observable.from(cities).map(city => {
    return get(`${osrmServer}/nearest/v1/driving/${city.longitude},${city.latitude}`)
        .map(result => {
            return {
                id: city.id,
                name: city.name,
                area: city.area,
                population: city.population,
                location: result.waypoints[0].location
            }
        })
}).concatAll();

export const calculateRoutes = (alignedPoints) => Observable.from(alignedPoints).map(start => {
    return Observable.from(alignedPoints).filter(destination => destination !== start).map(destination => {
        return get(`${osrmServer}/route/v1/driving/${start.location.join()};${destination.location.join()}?overview=false`)
            .map(({ routes }) => {
                const route = routes[0];
                return {
                    start,
                    destination,
                    distance: route.distance, // meters
                    duration: route.duration // seconds
                }
            })
    }).concatAll();
}).concatAll().scan((acc, v, i) => {
    console.log(`${(100 * (i + 1) / alignedPoints.length / (alignedPoints.length - 1)).toFixed(2)}%`);
    return v;
});
