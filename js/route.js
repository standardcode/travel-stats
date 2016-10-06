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

export const calculateRoutes = (alignedPoints) => {
    const route = server(osrm.route.bind(osrm));
    const concurrent = grow(3, 7);
    return Observable.from(alignedPoints).map(start =>
        Observable.from(alignedPoints).filter(destination => destination !== start).map(destination =>
            route({ coordinates: [start.location, destination.location], overview: "false" })
                .map(({ routes:[route] }) => ({
                    start,
                    destination,
                    distance: route.distance, // meters
                    duration: route.duration // seconds
                }))
        ).mergeAll(concurrent())
    ).mergeAll(5).scan((acc, v, i) => {
        console.log(`${(100 * (i + 1) / alignedPoints.length / (alignedPoints.length - 1)).toFixed(2)}%`);
        return v;
    });
};

const duration = ({ duration, destination }) => duration + destination.duration;

export const calculateVillagesRoutes = (villages) => {
    const route = server(osrm.route.bind(osrm));
    return Observable.from(villages).map(start =>
        selectCitiesAround(start.id).flatMap(destinations =>
            Observable.from(destinations).flatMap(destination =>
                route({
                    coordinates: [start.location, [destination.longitude, destination.latitude]],
                    overview: "false"
                }).map(({ routes: [route] }) => ({
                    start,
                    destination,
                    distance: route.distance, // meters
                    duration: route.duration // seconds
                }))
            ).min((a, b) => duration(a) - duration(b) )
        )).mergeAll(8).scan((acc, v, i) => {
            console.log(`${(100 * (i + 1) / villages.length).toFixed(2)}%`);
            return v;
        });
};
