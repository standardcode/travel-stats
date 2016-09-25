library("data.table")
library("sp")
source("db.R")

convertToId <- function(text) {
  return(as.integer(substr(text, 1, nchar(text) - 1)))
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
  df <- df[df$rodzaj.obiektu == "miasto",]
  latitude <- dmsAsDouble(df$szerokość.geograficzna)
  longitude <- dmsAsDouble(df$długość.geograficzna)
  res <- data.frame(latitude, longitude)
  res$id <- df$id <- lapply(df$identyfikator.jednostki.podziału.terytorialnego.kraju, convertToId)
  
  big <- lapply(list("Warszawa", "Łódź", "Kraków"), function(name) {
    return(list(name = name, id = df[df$nazwa.główna == name &
                                          df$rodzaj.obiektu == "miasto"]$id))
  })
  res <- as.data.frame(lapply(res, function(X)
    unname(unlist(X))))
  return(list(geo = res, big = big))
}

geo <- readGeolocation()
cities <-
  merge(readPopulation(geo$big),
        geo$geo,
        by.x = "id",
        by.y = "id")
cities <- cities[,c(1,2,4,3,5,6)]

db <- psql()
con <- db$connect()

dbSendQuery(con, "truncate cities cascade")
dbWriteTable(con, "cities", value = cities, append = TRUE, row.names = FALSE)

db$disconnect()
