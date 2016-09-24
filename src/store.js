import { execute, select, insert } from "./db";

export const clearRoutes = (routes) => execute("truncate routes;");

export const selectCities = (number) => select(
    'select * from cities order by population desc limit $1',
    [number]
);

export const storeRoutes = insert(
    'insert into routes("from", "to", distance, duration) values($1, $2, $3, $4)',
    r => [r.start.id, r.destination.id, r.distance, r.duration]
);

export const updateCities = insert(
    'update cities set longitude = $1, latitude = $2 where id = $3 ',
    c => c.location.concat([c.id])
);
