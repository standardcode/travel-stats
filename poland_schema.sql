--
-- PostgreSQL database dump
--

-- Dumped from database version 9.5.4
-- Dumped by pg_dump version 9.5.4

SET statement_timeout = 0;
SET lock_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SET check_function_bodies = false;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: plpgsql; Type: EXTENSION; Schema: -; Owner: 
--

CREATE EXTENSION IF NOT EXISTS plpgsql WITH SCHEMA pg_catalog;


--
-- Name: EXTENSION plpgsql; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION plpgsql IS 'PL/pgSQL procedural language';


--
-- Name: postgis; Type: EXTENSION; Schema: -; Owner: 
--

CREATE EXTENSION IF NOT EXISTS postgis WITH SCHEMA public;


--
-- Name: EXTENSION postgis; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION postgis IS 'PostGIS geometry, geography, and raster spatial types and functions';


SET search_path = public, pg_catalog;

SET default_tablespace = '';

SET default_with_oids = false;

--
-- Name: cities; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE cities (
    id integer NOT NULL,
    name character varying NOT NULL,
    population integer NOT NULL,
    area integer NOT NULL,
    latitude double precision NOT NULL,
    longitude double precision NOT NULL,
    point geometry(Point,4326)
);


ALTER TABLE cities OWNER TO postgres;

--
-- Name: cities_routes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE cities_routes (
    duration double precision NOT NULL,
    distance double precision NOT NULL,
    "from" integer NOT NULL,
    "to" integer NOT NULL,
    circle double precision
);


ALTER TABLE cities_routes OWNER TO postgres;

--
-- Name: villages; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE villages (
    id integer NOT NULL,
    name character varying NOT NULL,
    population integer NOT NULL,
    latitude double precision NOT NULL,
    longitude double precision NOT NULL,
    point geometry(Point,4326)
);


ALTER TABLE villages OWNER TO postgres;

--
-- Name: villages_routes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE villages_routes (
    duration double precision NOT NULL,
    distance double precision NOT NULL,
    "from" integer NOT NULL,
    "to" integer NOT NULL,
    circle double precision
);


ALTER TABLE villages_routes OWNER TO postgres;

--
-- Name: hinterland; Type: MATERIALIZED VIEW; Schema: public; Owner: postgres
--

CREATE MATERIALIZED VIEW hinterland AS
 SELECT r."to" AS id,
    sum(v.population) AS population,
    (sum((r.duration * (v.population)::double precision)) / (sum(v.population))::double precision) AS duration,
    (sum((r.distance * (v.population)::double precision)) / (sum(v.population))::double precision) AS distance
   FROM (villages_routes r
     JOIN villages v ON ((r."from" = v.id)))
  GROUP BY r."to"
  ORDER BY (sum(v.population)) DESC
  WITH NO DATA;


ALTER TABLE hinterland OWNER TO postgres;

--
-- Name: cities_stats; Type: MATERIALIZED VIEW; Schema: public; Owner: postgres
--

CREATE MATERIALIZED VIEW cities_stats AS
 SELECT c1.id,
    ((sum((r.duration * (c2.population)::double precision)) + sum(((r.duration + h.duration) * (h.population)::double precision))) / (total.total)::double precision) AS duration,
    ((sum((r.distance * (c2.population)::double precision)) + sum(((r.distance + h.distance) * (h.population)::double precision))) / (total.total)::double precision) AS distance
   FROM ( SELECT ((( SELECT sum(c.population) AS total
                   FROM (cities c
                     JOIN cities_routes r_1 ON ((r_1."to" = c.id)))
                  GROUP BY r_1."from"
                 LIMIT 1))::numeric + ( SELECT sum(hinterland.population) AS total
                   FROM hinterland
                 LIMIT 1)) AS total) total,
    (((cities_routes r
     JOIN cities c1 ON ((r."from" = c1.id)))
     JOIN cities c2 ON ((r."to" = c2.id)))
     JOIN hinterland h ON ((c2.id = h.id)))
  GROUP BY c1.id, total.total
  WITH NO DATA;


ALTER TABLE cities_stats OWNER TO postgres;

--
-- Name: cities_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY cities
    ADD CONSTRAINT cities_pkey PRIMARY KEY (id);


--
-- Name: villages_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY villages
    ADD CONSTRAINT villages_pkey PRIMARY KEY (id);


--
-- Name: cities_from_key; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY cities_routes
    ADD CONSTRAINT cities_from_key FOREIGN KEY ("from") REFERENCES cities(id);


--
-- Name: cities_to_key; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY cities_routes
    ADD CONSTRAINT cities_to_key FOREIGN KEY ("to") REFERENCES cities(id);


--
-- Name: villages_from_key; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY villages_routes
    ADD CONSTRAINT villages_from_key FOREIGN KEY ("from") REFERENCES villages(id);


--
-- Name: villages_to_key; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY villages_routes
    ADD CONSTRAINT villages_to_key FOREIGN KEY ("to") REFERENCES cities(id);


--
-- Name: public; Type: ACL; Schema: -; Owner: postgres
--

REVOKE ALL ON SCHEMA public FROM PUBLIC;
REVOKE ALL ON SCHEMA public FROM postgres;
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO PUBLIC;


--
-- PostgreSQL database dump complete
--
