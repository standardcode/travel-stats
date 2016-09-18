import {Observable} from 'rxjs/Rx';
import csv from "fast-csv";
import request from "request";
import _ from "lodash";

const accumulator = (acc, city) => {
    acc.push(city);
    return acc;
};

const get = (url) => Observable.defer(() => Observable.create((observer) => {
    request(url, function (error, response, body) {
        if (!error) {
            observer.next(JSON.parse(body));
            observer.complete();
        } else {
            observer.error(error);
        }
    })
}));

Observable.create((observer) => {
    csv.fromPath("cities.csv", {
        headers: true
    }).on("data", (data) => {
        data.area = +data.area;
        data.population = +data.population;
        observer.next(data);
    }).on("end", () => {
        observer.complete();
    });
}).reduce(accumulator, []).flatMap(cities => {
    cities = _.take(_.orderBy(cities, "population", "desc"), 30);
    const osrmServer = "http://localhost:5000";
    return Observable.from(cities).map(city => {
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
    }).concatAll().reduce(accumulator, []).flatMap(alignedPoints => {
        return Observable.from(alignedPoints).flatMap(start => {
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
        }).reduce((a, v) => a.concat(v));
    });
}).map(routes => {
    const stat = (by, other) => {
        const grouped = _.groupBy(routes, by + ".teryt");
        return _.map(grouped, (cities) => {
            const byCity = cities[0][by];
            const inCity = {
                distance: Math.sqrt(10000 * byCity.area / (2 * Math.PI)) // assume equal population density in a city
            };
            inCity.duration = inCity.distance / (30 * 1000 / 3600); // assume average 30km/h. See https://traffic.naviexpert.pl/
            const sum = (key) => _.sumBy(cities, city => city[other].population / city[key]) + (byCity.population / inCity[key]);
            return {
                duration: sum("duration"),
                distance: sum("distance"),
                longitude: byCity.location[0],
                latitude: byCity.location[1],
                population: byCity.population,
                teryt: byCity.teryt,
                name: byCity.name
            };
        });
    };
    return {
        start: stat("start", "destination"),
        destination: stat("destination", "start")
    };
}).flatMap(({start, destination}) => {
    return Observable.from([{
        stats: start,
        file: "easy-go"
    }, {
        stats: destination,
        file: "easy-come"
    }]).flatMap(({stats, file}) => Observable.create((observer) => {
            csv.writeToPath(`${file}.csv`, _.orderBy(stats, "duration", "desc"), {headers: true})
                .on("finish", function () {
                    observer.next(file);
                    observer.complete();
                })
        })
    );
}).subscribe((v) => console.log(v));
