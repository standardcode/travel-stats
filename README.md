# Driving times in Poland

### Goal

Answer questions about driving time and distance between Polish cities and villages.

### Statistics

![Map of cities](./img/driving-time.png)

Each dot is a city or a village and color indicates average driving time from this settlement to a random person in any other settlement in the country.

Longest driving time between 2 cities

       start       | destination |    km   |    h
    Ustrzyki Dolne |  Kołobrzeg  | 1013.51 | 11.318

Shortest way between 2 cities

         start    | destination |   m    |   s
    Podkowa Leśna |   Brwinów   | 2772.8 | 252.8

City with shortest average driving time to other cities

      name  |   h   |    km     
    Stryków | 2.596 | 244.384
 
City with longest average driving time to other cities

         name      |   h   |    km     
    Ustrzyki Dolne | 6.347 | 508.290

`examples.sql` contains queries used to generate this statistics and more. You may download [already calculated routes](https://sutkowski.egnyte.com/dl/lYFJaTduYY/poland-routes-data.sql.zip_) and skip next points.
 
### Getting Started

#### Database

* Install PostgreSQL with PostGIS if you don't have it already.
* Import schema from `poland_schema.sql` to your database.
* Configure connection in `js/config.js` and in `R/db.R`.

#### Data

1. Download and unzip [ready package](https://sutkowski.egnyte.com/dl/frULfLn1zD/poland-population.zip_) then go to point 3
2. Or use raw data: download XLS files from this sites and convert them to CSV:
  * [Cities population](http://stat.gov.pl/obszary-tematyczne/ludnosc/ludnosc/powierzchnia-i-ludnosc-w-przekroju-terytorialnym-w-2016-r-,7,13.html) link _Powierzchnia i ludność w przekroju terytorialnym w 2016 r. - tablice_
  * [Geolocation](http://www.codgik.gov.pl/index.php/darmowe-dane/prng.html) link _PRNG - nazwy miejscowości_
  * [Villages population](http://demografia.lo.pl/) (optional) link _Pobierz_

3. Run `insert-data-in-db.R` with working directory set to the one containing the CSV files.

#### Routing server

* Build [OSRM](https://github.com/Project-OSRM/osrm-backend).
* Download [map of Poland](http://download.geofabrik.de/europe/poland-latest.osm.pbf). Mirrors with [other maps](http://wiki.openstreetmap.org/wiki/Planet.osm).
* Convert map to `.osrm`. 
* Set path to the file in `js/config.js`.

#### Running

Set the numbers of cities and villages you want to calculate in `js/config.js`. There is 919 cities and 37177 villages. Calculations for all of them take about 45min on 2,6 GHz Intel Core i5. The computational complexity is O(n<sup>2</sup>) for cities and O(n) for villages.

Run calculation.
```shell
$ npm install
$ npm run build && npm run serve
```

#### Results

Run `show-country-map.R` to see resulting times as colors on a map.