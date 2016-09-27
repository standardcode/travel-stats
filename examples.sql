-- Cities with fastest access to other cities
select c1.name,
 sum(r.duration*c2.population)/total/3600 as duration,
 sum(r.distance*c2.population)/total/1000 as distance
 from (select sum(population) as total from cities c inner join routes r on r.to = c.id group by r.from limit 1) as total,
 routes r inner join cities c1 on r.from = c1.id inner join cities c2 on r.to = c2.id
 group by c1.id, total
 order by duration limit 10;

-- Where you can go from Warsaw in shortest time
select c2.name, r.duration, r.distance
 from routes r inner join cities c1 on r.from = c1.id inner join cities c2 on r.to = c2.id where c1.name = 'Warszawa'
 order by duration limit 10;

-- Farthest cities pairs
select c1.name as start, c2.name as destination, r.distance, r.duration
 from routes r inner join cities c1 on r.from = c1.id inner join cities c2 on r.to = c2.id
 order by r.distance desc limit 10;

-- Like above, but by time and results in km and hours.
select c1.name as start, c2.name as destination, r.distance/1000, r.duration/3600
 from routes r inner join cities c1 on r.from = c1.id inner join cities c2 on r.to = c2.id
 order by r.duration desc limit 10;

-- Closest cities pairs
select c1.name as start, c2.name as destination, r.distance, r.duration
 from routes r inner join cities c1 on r.from = c1.id inner join cities c2 on r.to = c2.id
 where c1.id != c2.id
 order by r.distance asc limit 10;

-- Population of all cities
select sum(population) as total from cities;

-- Population of cities used in calculation
select sum(population) as total from cities c inner join routes r on r.to = c.id group by r.from limit 1;

-- Center of Poland by people density
select sum(latitude*population)/total as latitude, sum(longitude*population)/total as longitude
from cities, (select sum(population) as total from cities) as total group by total;

-- Run postgis.sql before examples below

-- Most waved ways
SELECT c1.name AS start, c2.name AS destination, r.distance/r.circle AS ratio
 FROM routes r INNER JOIN cities c1 ON r.from = c1.id INNER JOIN cities c2 ON r.to = c2.id
 WHERE c1.id != c2.id
 ORDER BY ratio DESC LIMIT 10;

-- How many times a ways from a city are longer than straight line
SELECT c1.name, (sum(r.distance/r.circle*c2.population))/total AS ratio
 FROM (SELECT sum(population) AS total FROM cities c INNER JOIN routes r ON r.to = c.id GROUP BY r.from LIMIT 1) AS total,
 routes r INNER JOIN cities c1 ON r.from = c1.id INNER JOIN cities c2 ON r.to = c2.id
 GROUP BY c1.id, total
 ORDER BY ratio DESC LIMIT 10;
