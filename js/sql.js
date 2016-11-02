export const refreshCities =
    `UPDATE cities_routes r SET circle = ST_Distance_Spheroid(c1.point,c2.point,'SPHEROID["WGS 84", 6378137,298.257223563]')
        FROM cities c1, cities c2 WHERE r.from = c1.id AND r.to = c2.id;
    UPDATE cities_routes r SET circle = r.distance
        FROM cities c WHERE r.from = r.to AND r.from = c.id;
    REFRESH MATERIALIZED VIEW cities_stats`;

export const refreshVillages =
    `UPDATE villages_routes r SET circle = ST_Distance_Spheroid(v.point,c.point,'SPHEROID["WGS 84", 6378137,298.257223563]')
        FROM villages v, cities c WHERE r.from = v.id AND r.to = c.id;
    REFRESH MATERIALIZED VIEW hinterland`;

export const selectCitiesAroundVillage =
    `SELECT c.id, c.name, c.latitude, c.longitude, ST_Distance(c.point, v.point) AS distance
        FROM villages v, cities c WHERE v.id = $1
        ORDER BY c.point <-> v.point LIMIT 10;`;
