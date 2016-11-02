#install.packages("ggplot2")
#install.packages("mapproj")
library("ggplot2")
library("mapproj")
library("data.table")
source("R/db.R")

db <- psql()
con <- db$connect()
q <- "SELECT c.id, c.name, c.latitude, c.longitude, c.population, cs.duration/3600 AS duration
FROM cities c INNER JOIN cities_stats cs ON cs.id = c.id
ORDER BY duration;"
cities <- dbGetQuery(con, q)

q <- "SELECT v.name, v.latitude, v.longitude, v.population,
(cs.duration + r.duration)/3600 AS duration
FROM villages_routes r INNER JOIN villages v ON r.from = v.id INNER JOIN cities_stats cs ON r.to = cs.id
ORDER BY duration DESC;"
villages <- dbGetQuery(con, q)

df <- rbindlist(list(cities, villages), use.names = TRUE, fill = TRUE)
clean <- df[!df$duration %in% boxplot.stats(df$duration, coef = 2)$out]

ggplot(clean, aes(x = longitude, y = latitude, label = name)) +
  geom_point(aes(size = population / 1000, color = duration), alpha = .8) +
  scale_size_area("Population [K]", breaks = c(10, 100, 1000)) +
  scale_color_gradientn("Driving time [h]", colours = rainbow(4, start = 0, end = .7)) +
  coord_map("ortho", orientation = c(52, 19, 0)) +
  theme_bw()

db$disconnect()
