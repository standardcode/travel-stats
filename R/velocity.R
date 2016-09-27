#install.packages("ggplot2")
#install.packages("mapproj")
library("ggplot2")
library("mapproj")
library("RColorBrewer")
source("db.R")

db <- psql()
con <- db$connect()

q <- "SELECT c1.name, c1.latitude, c1.longitude, c1.population,
(3600/1000)*sum(c2.population*r.distance/r.duration)/sum(c2.population) AS velocity
FROM routes r INNER JOIN cities c1 ON r.from = c1.id INNER JOIN cities c2 ON r.to = c2.id
GROUP BY c1.id;"

df <- dbGetQuery(con, q)

ggplot(df, aes(x = longitude, y = latitude, label = name)) +
  geom_point(aes(size = population / 1000, color = velocity), alpha = .8) +
  scale_size_area("Population [K]", breaks = c(10, 100, 1000)) +
  scale_color_gradientn("Average velocity\nfrom city [km/h]", colours = brewer.pal(7, "YlGnBu")) +
  coord_map("ortho", orientation = c(52, 19, 0))

db$disconnect()
