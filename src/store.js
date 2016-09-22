import db, { execute } from "./db";

export const storeCities = (cities) => execute("truncate cities cascade;").flatMap(() => db(
    "insert into cities(id, name, population, area, latitude, longitude) values($1, $2, $3, $4, $5, $6)",
    cities, c => [c.teryt, c.name, c.population, c.area, c.latitude, c.longitude]
));

export const storeRoutes = (routes) => db(
    'insert into routes("from", "to", distance, duration) values($1, $2, $3, $4)',
    routes, r => [r.start.teryt, r.destination.teryt, r.distance, r.duration]
);