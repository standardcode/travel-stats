cities <- read.csv("easy-go.csv",
  colClasses = c("duration" = "numeric",
                 "distance" = "numeric",
                 "longitude" = "numeric",
                 "latitude" = "numeric",
                 "population" = "numeric",
                 "teryt" = "numeric")
)

ggplot(cities, aes(x = longitude, y = latitude, label = name)) +
  geom_point(aes(size = sqrt(population), color = duration)) +
  coord_quickmap()