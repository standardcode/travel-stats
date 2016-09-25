library("RPostgreSQL")

psql <- function() {
  con <- NULL
  list(connect = function() {
    drv <- dbDriver("PostgreSQL")
    con <<- dbConnect(
      drv,
      dbname = "poland",
      host = "localhost",
      port = 5432,
      user = "postgres",
      password = "pswd"
    )
    return(con)
  }, disconnect = function() {
    dbDisconnect(con)
  })
}
