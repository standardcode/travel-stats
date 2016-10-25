import { execute, select, insert } from "./db";

const Queries = (table, cache) => ({
    updateCoordinates: insert(
        `update ${table} set longitude = $1, latitude = $2 where id = $3`,
        c => c.location.concat([c.id])
    ),

    storeRoutes: insert(
        `insert into ${table}_routes("from", "to", distance, duration) values($1, $2, $3, $4)`,
        r => [r.start.id, r.destination.id, r.distance, r.duration]
    ),

    refresh: () => execute(`REFRESH MATERIALIZED VIEW ${cache}`),

    clearRoutes: () => execute(`truncate ${table}_routes;`),

    select: (number) => select(
        `select * from ${table} order by population desc limit $1`,
        [number]
    )
});

export const citiesQueries = Queries("cities", "cities_stats");

export const villagesQueries = Queries("villages", "hinterland");

export const selectCitiesAround = (id) => select(
    `SELECT c.id, c.name, c.latitude, c.longitude, ST_Distance(c.point, v.point) AS distance
FROM villages v, cities c WHERE v.id = $1
ORDER BY c.point <-> v.point LIMIT 10;`,
    [id]
);
