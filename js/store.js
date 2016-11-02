import { execute, select, insert } from "./db";
import { refreshCities, refreshVillages, selectCitiesAroundVillage } from "./sql";

const Queries = (table, refreshQuery) => ({
    updateCoordinates: insert(
        `update ${table} set longitude = $1, latitude = $2 where id = $3`,
        c => c.location.concat([c.id])
    ),

    storeRoutes: insert(
        `insert into ${table}_routes("from", "to", distance, duration) values($1, $2, $3, $4)`,
        r => [r.start.id, r.destination.id, r.distance, r.duration]
    ),

    refresh: () => execute(refreshQuery),

    clearRoutes: () => execute(`truncate ${table}_routes;`),

    select: (number) => select(
        `select * from ${table} order by population desc limit $1`,
        [number]
    )
});

export const citiesQueries = Queries("cities", refreshCities);

export const villagesQueries = Queries("villages", refreshVillages);

export const selectCitiesAround = (id) => select(selectCitiesAroundVillage, [id]);
