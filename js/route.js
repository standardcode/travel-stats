import { Observable } from 'rxjs/Rx';
import server from "./get";
import { osrmFile } from "./config";
import OSRM from "osrm";

console.time("Map");
const osrm = new OSRM(osrmFile);
console.timeEnd("Map");

export const alignPoints = (cities) => {
    const nearest = server(osrm.nearest.bind(osrm));
    return Observable.from(cities).map(city => {
        return nearest({ coordinates: [[city.longitude, city.latitude]] })
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
};

export const calculateRoutes = (alignedPoints) => {
    const route = server(osrm.route.bind(osrm));
    return Observable.from(alignedPoints).map(start => {
        return Observable.from(alignedPoints).filter(destination => destination !== start).map(destination => {
            return route({ coordinates: [start.location, destination.location], overview: "false" })
                .map(({ routes:[route] }) => {
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
};
