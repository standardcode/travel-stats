import db, { execute, select } from "./db";

export const storeRoutes = (routes) => execute("truncate routes;").flatMap(() => db(
    'insert into routes("from", "to", distance, duration) values($1, $2, $3, $4)',
    routes, r => [r.start.id, r.destination.id, r.distance, r.duration]
));

export const selectCities = (number) => select(
    'select * from cities order by population desc limit $1',
    [number]
);
