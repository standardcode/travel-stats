import { Observable } from 'rxjs/Rx';

export default (cities) => Observable.from(cities).map((city) => {
    const route = {
        start: city,
        destination: city,
        distance: Math.sqrt(10000 * city.area / (2 * Math.PI)) // assume equal population density in a city.
    };
    route.duration = route.distance / (30 * 1000 / 3600); // assume average 30km/h in a city. See https://traffic.naviexpert.pl/
    return route;
});