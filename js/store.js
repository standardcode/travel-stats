import { execute, select, insert } from "./db";

const Queries = (table) => ({
    updateCoordinates: insert(
        `update ${table} set longitude = $1, latitude = $2 where id = $3`,
        c => c.location.concat([c.id])
    ),

    storeRoutes: insert(
        `insert into ${table}_routes("from", "to", distance, duration) values($1, $2, $3, $4)`,
        r => [r.start.id, r.destination.id, r.distance, r.duration]
    ),

    clearRoutes: () => execute(`truncate ${table}_routes;`),

    select: (number) => select(
        `select * from ${table} order by population desc limit $1`,
        [number]
    )
});

const Cities = (table) => ({
    ...Queries(table),

    refresh: () => execute(`
UPDATE cities_routes r SET circle = ST_Distance_Spheroid(c1.point,c2.point,'SPHEROID["WGS 84", 6378137,298.257223563]')
    FROM cities c1, cities c2 WHERE r.from = c1.id AND r.to = c2.id;
UPDATE cities_routes r SET circle = r.distance
    FROM cities c WHERE r.from = r.to AND r.from = c.id;
REFRESH MATERIALIZED VIEW cities_stats`)
});

const Villages = (table) => ({
    ...Queries(table),

    refresh: () => execute(`
UPDATE villages_routes r SET circle = ST_Distance_Spheroid(v.point,c.point,'SPHEROID["WGS 84", 6378137,298.257223563]')
    FROM villages v, cities c WHERE r.from = v.id AND r.to = c.id;
REFRESH MATERIALIZED VIEW hinterland`)
});

export const citiesQueries = Cities("cities");

export const villagesQueries = Villages("villages");

export const selectCitiesAround = (id) => select(
    `SELECT c.id, c.name, c.latitude, c.longitude, ST_Distance(c.point, v.point) AS distance
FROM villages v, cities c WHERE v.id = $1
ORDER BY c.point <-> v.point LIMIT 10;`,
    [id]
);
