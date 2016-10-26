import { Observable } from 'rxjs/Rx';
import server from "./get";
import { osrmFile, parallelQueries } from "./config";
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
    ).mergeAll(parallelQueries);
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
    return Observable.from(cities).flatMap(start =>
        Observable.from(cities.filter(destination => destination !== start)).map(destination =>
            calculateRoutes(start, destination, destination => destination.location)
        )
    ).mergeAll(parallelQueries);
};

export const calculateVillagesRoutes = (village) =>
    selectCitiesAround(village.id).map(cities =>
        Observable.from(cities).map(city =>
            calculateRoutes(village, city, city => [city.longitude, city.latitude])
        ).mergeAll().min((a, b) => a.duration - b.duration)
    );