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
    longitude double precision NOT NULL
);


ALTER TABLE cities OWNER TO postgres;

--
-- Name: routes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE cities_routes (
    duration double precision NOT NULL,
    distance double precision NOT NULL,
    "from" integer NOT NULL,
    "to" integer NOT NULL
);


ALTER TABLE cities_routes OWNER TO postgres;

--
-- Name: cities_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY cities
    ADD CONSTRAINT cities_pkey PRIMARY KEY (id);


--
-- Name: from_key; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY cities_routes
    ADD CONSTRAINT cities_from_key FOREIGN KEY ("from") REFERENCES cities(id);


--
-- Name: to_key; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY cities_routes
    ADD CONSTRAINT cities_to_key FOREIGN KEY ("to") REFERENCES cities(id);


-- Optional table for villages

CREATE TABLE villages (
    id integer NOT NULL,
    name character varying NOT NULL,
    population integer NOT NULL,
    latitude double precision NOT NULL,
    longitude double precision NOT NULL
);

ALTER TABLE villages OWNER TO postgres;

ALTER TABLE ONLY villages
    ADD CONSTRAINT villages_pkey PRIMARY KEY (id);


CREATE TABLE villages_routes (
    duration double precision NOT NULL,
    distance double precision NOT NULL,
    "from" integer NOT NULL,
    "to" integer NOT NULL
);

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

CREATE MATERIALIZED VIEW hinterland AS
    SELECT r.to AS id, sum(v.population) AS population, sum(r.duration*v.population)/sum(v.population) AS duration
    FROM villages_routes r INNER JOIN villages v ON r.from = v.id
    GROUP BY r.to;

CREATE MATERIALIZED VIEW cities_stats AS
    SELECT c1.id,
    (sum(r.duration*c2.population)+sum((r.duration+h.duration)*h.population))/total AS duration
    FROM
    (SELECT (SELECT sum(population) AS total FROM cities c INNER JOIN routes r ON r.to = c.id GROUP BY r.from LIMIT 1) +
            (SELECT sum(population) AS total FROM hinterland LIMIT 1) AS total) AS total,
    cities_routes r INNER JOIN cities c1 ON r.from = c1.id INNER JOIN cities c2 ON r.to = c2.id
    INNER JOIN hinterland h ON c2.id = h.id
    GROUP BY c1.id, total;
