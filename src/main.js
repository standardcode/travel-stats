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

const saveCsv = (file, data) => Observable.create((observer) => {
    csv.writeToPath(`${file}.csv`, data, {headers: true})
        .on("finish", function () {
            observer.next(file);
            observer.complete();
        });
});

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
    cities = _.take(_.orderBy(cities, "population", "desc"), 100);
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
        console.time("routes");
        return Observable.from(alignedPoints).map(start => {
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
            const sum = (key) => {
                const far = _(cities).sortBy(key).map(city => {
                    return {
                        [key]: city[key],
                        population: city[other].population
                    };
                }).value();
                far.unshift({
                    [key]: inCity[key],
                    population: byCity.population
                });
                return {
                    all: far,
                    sum: _.sumBy(far, city => city.population * city[key]) / 1000000000
                };
            };
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
    console.timeEnd("routes");
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
                duration: city.duration.sum,
                distance: city.distance.sum
            }
        }).sortBy("duration").value()).concat(Observable.from(stats).flatMap(city =>
            saveCsv("cities/" + city.name + "-" + file, city.duration.all)
        ))
    });
}).subscribe((v) => console.log(v));
