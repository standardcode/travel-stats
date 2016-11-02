import { cities, villages } from "./data";
import { delay } from "./util";

export default () => () => ({
    none: (query, parameters) => new Promise(delay),
    any: (query, parameters) => {
        let result = [];
        switch (query) {
            case 'select * from cities order by population desc limit $1':
                result = cities.slice(0, parameters[0]);
                break;
            case 'select * from villages order by population desc limit $1':
                result = villages.slice(0, parameters[0]);
                break;
            case `SELECT c.id, c.name, c.latitude, c.longitude, ST_Distance(c.point, v.point) AS distance
        FROM villages v, cities c WHERE v.id = $1
        ORDER BY c.point <-> v.point LIMIT 10;`:
                result = cities.slice(0, 2).map(c => ({
                    ...c,
                    distance: c.id
                }));
                break;
        }
        return new Promise(function (resolve) {
            delay(() => resolve(result));
        });
    }
});