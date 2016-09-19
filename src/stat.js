import _ from "lodash";

function totalPopulation(routes, by, other) {
    return routes[0][by].population + _.sumBy(routes, other+".population");
}

export default (routes, by, other) => {
    const grouped = _.groupBy(routes, by + ".teryt");
    const total = totalPopulation(_.sample(grouped), by, other);

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
                sum: _.sumBy(far, city => city.population * city[key]) / total
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