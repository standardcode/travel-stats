#install.packages("ggplot2")
#install.packages("mapproj")
library("ggplot2")
library("mapproj")
source("db.R")

db <- psql()
con <- db$connect()
q <- "select c1.name, c1.latitude, c1.longitude, c1.population,
sum(r.duration*c2.population)/total/3600 as duration
from (select sum(population) as total from cities c inner join routes r on r.to = c.id group by r.from limit 1) as total,
routes r inner join cities c1 on r.from = c1.id inner join cities c2 on r.to = c2.id
group by c1.id, total
order by duration;"
df <- dbGetQuery(con, q)

ggplot(df, aes(x = longitude, y = latitude, label = name)) +
  geom_point(aes(size = population / 1000, color = duration), alpha = .8) +
  scale_size_area("Population [K]", breaks = c(10, 100, 1000)) +
  scale_color_gradientn("Driving time [h]", colours = rainbow(4, start = 0, end = .7)) +
  coord_map("ortho", orientation = c(52, 19, 0)) +
  theme_bw()

db$disconnect()
