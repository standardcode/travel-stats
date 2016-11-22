#install.packages("ggplot2")
#install.packages("mapproj")
library("ggplot2")
library("mapproj")
source("R/db.R")

db <- psql()
con <- db$connect()

q <- "SELECT id, name FROM cities WHERE name IN (
'Wrocław','Bydgoszcz','Toruń','Lublin','Gorzów Wielkopolski','Zielona Góra','Łódź',
'Kraków','Warszawa','Opole','Rzeszów','Białystok','Gdańsk','Katowice','Kielce',
'Olsztyn','Poznań','Szczecin')"
capitalCities <- dbGetQuery(con, q)

nearestCities <- paste0("SELECT DISTINCT ON (cr.from) cr.from, cr.duration, max(cr.to) AS to
FROM cities_routes cr
WHERE cr.to IN (", paste(capitalCities[["id"]], collapse=",") ,")
GROUP BY cr.from, cr.duration
HAVING cr.duration = min(cr.duration)")

q <- paste0("
SELECT cr.from, cr.to, cr.duration, name, latitude, longitude, population
FROM cities c INNER JOIN LATERAL (", nearestCities, ") cr ON c.id = cr.from")

cities <- dbGetQuery(con, q)

q <- paste0("
SELECT v.id as from, cr.to, (cr.duration + vr.duration) AS duration, name, latitude, longitude, population
FROM villages v INNER JOIN villages_routes vr ON v.id = vr.from
INNER JOIN LATERAL (", nearestCities, ") cr ON vr.to = cr.from")

villages <- dbGetQuery(con, q)

colorMap <- data.frame(id = capitalCities[["id"]], color = order(substring(capitalCities[["name"]], 2)))
df <- merge(rbind(cities, villages), colorMap, by.x = "to", by.y = "id", all.x = TRUE)

ggplot(df, aes(x = longitude, y = latitude, label = name)) +
  geom_point(aes(size = population / 1000, color = color)) +
  scale_size_area("Population [K]", breaks = c(10, 100, 1000)) +
  scale_color_gradientn(colours = rainbow(18), guide = FALSE) +
  coord_map("ortho", orientation = c(52, 19, 0))

db$disconnect()
