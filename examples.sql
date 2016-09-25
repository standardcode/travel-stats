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
