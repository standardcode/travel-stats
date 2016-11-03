#install.packages("ggplot2")
#install.packages("mapproj")
library("ggplot2")
library("mapproj")
source("db.R")

db <- psql()
con <- db$connect()

q <- "SELECT c1.name, c1.latitude, c1.longitude, c1.population, (sum(r.distance/r.circle*c2.population))/total AS ratio
FROM (SELECT sum(population) AS total FROM cities c INNER JOIN cities_routes r ON r.to = c.id GROUP BY r.from LIMIT 1) AS total,
cities_routes r INNER JOIN cities c1 ON r.from = c1.id INNER JOIN cities c2 ON r.to = c2.id
GROUP BY c1.id, total;"

df <- dbGetQuery(con, q)

ggplot(df, aes(x = longitude, y = latitude, label = name)) +
  geom_point(aes(size = population / 1000, color = ratio), alpha = .8) +
  scale_size_area("Population [K]", breaks = c(10, 100, 1000)) +
  scale_color_gradientn("Times longer routes", colours = terrain.colors(7)) +
  coord_map("ortho", orientation = c(52, 19, 0)) +
  theme_dark()

db$disconnect()
