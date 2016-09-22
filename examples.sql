-- Cities with fastest access to other cities
select c1.name,
 sum(r.duration*c2.population)/(select sum(population) as total from cities)/3600 as duration,
 sum(r.distance*c2.population)/(select sum(population) as total from cities)/1000 as distance
 from routes r inner join cities c1 on r.from = c1.id inner join cities c2 on r.to = c2.id group by c1.id
 order by duration limit 10;

-- Where you can go from Warsaw in shortest time
select c2.name, r.duration, r.distance
 from routes r inner join cities c1 on r.from = c1.id inner join cities c2 on r.to = c2.id where c1.name = 'Warszawa'
 order by duration limit 10;

-- Farthest cities pairs
select c1.name as start, c2.name as destination, r.distance, r.duration
 from routes r inner join cities c1 on r.from = c1.id inner join cities c2 on r.to = c2.id
 order by r.distance desc limit 10;

-- Population of all cities
select sum(population) as total from cities;
