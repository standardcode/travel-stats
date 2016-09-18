library(data.table)
library(sp)

removeLastChar <- function(text) {
  return(substr(text, 1, nchar(text) - 1))
}

readPopulation <- function(big) {
  df <-
    read.csv(
      "TABL.27 -Table 1.csv",
      sep = ";",
      header = FALSE,
      skip = 10,
      colClasses = c("population" = "numeric"),
      col.names = c("teryt", "name", "", "area", "", "population", "", "", "", "")
    )
  cities <-
    df[complete.cases(df$population), c("teryt", "name", "area", "population")]
  cities$teryt <-
    as.integer(lapply(strsplit(as.character(cities$teryt), " "), "[", 1))
  
  for (i in 1:length(big)) {
    cities$teryt[cities$name == big[[i]]$name] <-
      as.integer(big[[i]]$teryt)
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
  latitude <- dmsAsDouble(df$szeroko.....geograficzna)
  longitude <- dmsAsDouble(df$d..ugo.....geograficzna)
  res <- data.frame(latitude, longitude)
  res$teryt <-
    df$teryt <-
    lapply(as.numeric(
      removeLastChar(
        df$identyfikator.jednostki.podzia..u.terytorialnego.kraju
      )
    ), "[", 1)
  
  big <- lapply(list("Warszawa", "Łódź", "Kraków"), function(name) {
    return(list(name = name, teryt = df[df$nazwa.g....wna == name &
                                          df$rodzaj.obiektu == "miasto"]$teryt))
  })
  res <- as.data.frame(lapply(res, function(X)
    unname(unlist(X))))
  return(list(geo = res, big = big))
}

geo <- readGeolocation()
cities <-
  merge(readPopulation(geo$big),
        geo$geo,
        by.x = "teryt",
        by.y = "teryt")
write.csv(cities, file = "cities.csv")
