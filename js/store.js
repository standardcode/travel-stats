import { execute, select, insert } from "./db";

class Queries {
    constructor(table) {
        this.table = table;

        this.updateCoordinates = insert(
            `update ${this.table} set longitude = $1, latitude = $2 where id = $3`,
            c => c.location.concat([c.id])
        );

        this.storeRoutes = insert(
            `insert into ${this.table}_routes("from", "to", distance, duration) values($1, $2, $3, $4)`,
            r => [r.start.id, r.destination.id, r.distance, r.duration]
        );
    }

    clearRoutes() {
        return execute(`truncate ${this.table}_routes;`)
    }

    select(number) {
        return select(
            `select * from ${this.table} order by population desc limit $1`,
            [number]
        );
    }
}

export const cities = new Queries("cities");

export const villages = new Queries("villages");

export const selectCitiesAround = (id) => select(
    `SELECT c.id, c.name, c.latitude, c.longitude, ST_Distance(c.point, v.point) AS distance, cs.duration
FROM villages v, cities c INNER JOIN cities_stats cs ON c.id = cs.id WHERE v.id = $1
ORDER BY c.point <-> v.point LIMIT 10;`,
    [id]
);

export const refreshHinterland = execute('REFRESH MATERIALIZED VIEW hinterland;');
