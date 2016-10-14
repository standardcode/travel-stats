import { Observable } from 'rxjs/Rx';
import server from "./get";
import { osrmFile } from "./config";
import { grow } from "./util";
import { selectCitiesAround } from "./store";
import OSRM from "osrm";

console.time("Map");
const osrm = new OSRM(osrmFile);
console.timeEnd("Map");

export const alignPoints = (cities) => {
    const nearest = server(osrm.nearest.bind(osrm));
    return Observable.from(cities).map(city => nearest({ coordinates: [[city.longitude, city.latitude]] })
        .map(result => ({
            id: city.id,
            name: city.name,
            area: city.area,
            population: city.population,
            location: result.waypoints[0].location
        }))
    ).mergeAll(64);
};

const route = server(osrm.route.bind(osrm));

const calculateRoutes = (start, destination, location) =>
    route({
        coordinates: [start.location, location(destination)],
        overview: "false"
    }).map(({ routes: [route] }) => ({
        start,
        destination,
        distance: route.distance, // meters
        duration: route.duration // seconds
    }));

export const calculateCitiesRoutes = (cities) => {
    const concurrent = grow(3, 7);
    return Observable.from(cities).map(start =>
        Observable.from(cities.filter(destination => destination !== start)).map(destination =>
            calculateRoutes(start, destination, destination => destination.location)
        ).mergeAll(9)
    ).mergeAll(7);
};

export const calculateVillagesRoutes = (village, i) =>
    selectCitiesAround(village.id).map(cities =>
        Observable.from(cities).map(city =>
            calculateRoutes(village, city, city => [city.longitude, city.latitude])
        ).mergeAll(5).min((a, b) => a.duration - b.duration)
    ).mergeAll(3);