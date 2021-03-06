import _ from "lodash";
import { numberOfCities, numberOfVillages } from "../../js/config";

const copy = (limit, list) => _(0).range(10).map(i => list.map(v => ({
    ...v,
    id: 10 * v.id + i
}))).flatten().value().slice(0, limit);

export const villages = copy(numberOfVillages, [{
    id: 24020701,
    name: 'Kozy',
    population: 12660,
    latitude: 49.833821,
    longitude: 19.134177,
    point: '0101000020E61000001922222222223340A6AAAAAAAAEA4840'
}, {
    id: 30210408,
    name: 'Koziegłowy',
    population: 11878,
    latitude: 52.433391,
    longitude: 16.984401,
    point: '0101000020E6100000B2BBBBBBBBFB30407377777777374A40'
}, {
    id: 24100404,
    name: 'Pawłowice',
    population: 9771,
    latitude: 49.950177,
    longitude: 18.715783,
    point: '0101000020E61000008177777777B732409A99999999F94840'
}, {
    id: 14080204,
    name: 'Jabłonna',
    population: 8932,
    latitude: 52.366378,
    longitude: 20.89954,
    point: '0101000020E61000006666666666E63440F4EEEEEEEE2E4A40'
}, {
    id: 24100306,
    name: 'Wola',
    population: 8657,
    latitude: 50.01668,
    longitude: 19.116785,
    point: '0101000020E6100000E7DDDDDDDD1D33402722222222024940'
}]);

export const cities = copy(numberOfCities, [{
    id: 146510,
    name: 'Warszawa',
    population: 1744351,
    area: 51724,
    latitude: 52.216677,
    longitude: 21.000101,
    point: '0101000020E610000068B27F9E06003540CF656A12BC1B4A40'
}, {
    id: 126105,
    name: 'Kraków',
    population: 761069,
    area: 32685,
    latitude: 50.049483,
    longitude: 19.933635,
    point: '0101000020E61000007903CC7C07EF3340577A6D3656064940'
}, {
    id: 106105,
    name: 'Łódź',
    population: 700982,
    area: 29325,
    latitude: 51.750005,
    longitude: 19.450086,
    point: '0101000020E610000030630AD638733340126BF12900E04940'
}]);
