library("data.table")
library("sp")
source("db.R")

convertToId <- function(text) {
  return(as.integer(substr(text, 1, nchar(text) - 1)))
}

extractCommunity <- function(text) {
  elements <- strsplit(as.character(text), "-")
  elements <- unlist(elements)
  return(paste(elements[-length(elements)], collapse = "-"))
}

readPopulation <- function(big) {
  df <-
    read.csv(
      "TABL.27 -Table 1.csv",
      sep = ";",
      header = FALSE,
      skip = 10,
      colClasses = c("population" = "numeric", "area" = "numeric"),
      col.names = c("id", "name", "", "area", "", "population", "", "", "", "")
    )
  cities <-
    df[complete.cases(df$population), c("id", "name", "population", "area")]
  cities$id <-
    as.integer(lapply(strsplit(as.character(cities$id), " "), "[", 1))
  
  for (i in 1:length(big)) {
    cities$id[cities$name == big[[i]]$name] <-
      as.integer(big[[i]]$id)
  }
  
  cities <-
    as.data.frame(lapply(cities, function(X)
      unname(unlist(X))))
  return(cities)
}

dmsAsDouble <- function(value) {
  return(as.double.DMS(char2dms((
    gsub("''", '"', gsub("°", "d", value))
  ))))
}

readGeolocation <- function() {
  df <-
    rbindlist(list(
      read.csv("miejscowosci.csv"),
      read.csv("miejscowosci_1.csv")
    ))
  df$id <-
    lapply(df$identyfikator.jednostki.podziału.terytorialnego.kraju,
           convertToId)
  parse <- function (df) {
    latitude <- dmsAsDouble(df$szerokość.geograficzna)
    longitude <- dmsAsDouble(df$długość.geograficzna)
    res <- data.frame(latitude, longitude, name = df$nazwa.główna)
    res$id <- df$id
    res$gmina <- df$gmina
    
    return(as.data.frame(lapply(res, function(X)
      unname(unlist(
        X
      )))))
  }
  big <- lapply(list("Warszawa", "Łódź", "Kraków"), function(name) {
    return(list(name = name, id = df[df$nazwa.główna == name &
                                       df$rodzaj.obiektu == "miasto"]$id))
  })
  cities <- parse(df[df$rodzaj.obiektu == "miasto", ])
  villages <- parse(df[df$rodzaj.obiektu == "wieś", ])
  return(list(
    cities = cities,
    villages = villages,
    big = big
  ))
}

readVillagesPopulation <- function() {
  demography <-
    read.csv(
      "Demografia_Polski_2015.csv",
      header = FALSE,
      skip = 4547,
      col.names = c("name", "", "", "", "community", "", "", "", "", "population", "")
    )
  demography <- demography[demography$population != "", ]
  demography$population <-
    as.integer(gsub("\\s+", "", demography$population))
  return(demography[, c("name", "community", "population")])
}

prepareVillages <- function(villages) {
  villages$community <- lapply(villages$gmina, extractCommunity)
  return(villages)
}

geo <- readGeolocation()
cities <-
  merge(readPopulation(geo$big),
        geo$cities,
        by.x = "id",
        by.y = "id")
cities <- cities[, c(1, 2, 3, 4, 5, 6)]

villages <-
  merge(prepareVillages(geo$villages), readVillagesPopulation())
villages <- villages[, c(5, 1, 7, 3, 4)]

db <- psql()
con <- db$connect()

dbSendQuery(con, "truncate cities cascade")
dbWriteTable(con, "cities", value = cities, append = TRUE, row.names = FALSE)

dbSendQuery(con, "truncate villages cascade")
dbWriteTable(
  con,
  "villages",
  value = villages,
  append = TRUE,
  row.names = FALSE
)

db$disconnect()
