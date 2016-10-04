-- City coordinates as a POINT
SELECT AddGeometryColumn ('cities','point',4326,'POINT',2);
UPDATE cities SET point = ST_SetSRID(ST_MakePoint(longitude, latitude), 4326);

SELECT AddGeometryColumn ('villages','point',4326,'POINT',2);
UPDATE villages SET point = ST_SetSRID(ST_MakePoint(longitude, latitude), 4326);

-- Great-circle distance for further calculations
ALTER TABLE public.routes
    ADD COLUMN circle double precision;

COMMENT ON COLUMN public.routes.circle
    IS 'Great-circle distance';

UPDATE routes r SET circle = ST_Distance_Spheroid(c1.point,c2.point,'SPHEROID["WGS 84", 6378137,298.257223563]')
 FROM cities c1, cities c2 WHERE r.from = c1.id AND r.to = c2.id;
UPDATE routes r SET circle = r.distance
 FROM cities c WHERE r.from = r.to AND r.from = c.id;
