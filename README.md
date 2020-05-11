# Data Sources

### American Communities Census:

pulled [here](https://data.census.gov/cedsci/table?d=ACS%205-Year%20Estimates%20Data%20Profiles&table=DP03&tid=ACSDP5Y2018.DP03&g=0400000US36&hidePreview=true&moe=false) selecting all census tracts in the 5 buroughs.

### Stations CSV (with Lat/Long)

http://web.mta.info/developers/data/nyct/subway/Stations.csv

### 2010 Census Tract Shapefile

https://data.cityofnewyork.us/City-Government/2010-Census-Tracts/fxpq-c8ku

### MTA Turnstile Data 2020

https://data.ny.gov/Transportation/Turnstile-Usage-Data-2020/py8k-a8wg

### Station ID Linking

crowdsourced from here:
https://groups.google.com/d/msg/mtadeveloperresources/VYReLOiV5Jg/QDbrYlG_AgAJ

partially hand-linked in this doc:
https://docs.google.com/spreadsheets/d/1yLIF85YHxMLt-aUuPjY3Cn0TlWEUXQz7E4xm8du-LZE/edit#gid=0

### Lines GIS Data

https://data.cityofnewyork.us/Transportation/Subway-Lines/3qz8-muuu

### Hospitals

Pulled from [nyc PLUTO](https://www1.nyc.gov/site/planning/data-maps/open-data/dwn-pluto-mappluto.page) dataset. Filtered out hospitals and clinics using building class code of `I*`, informed by the [data dictionary](https://www1.nyc.gov/assets/planning/download/pdf/data-maps/open-data/pluto_datadictionary.pdf?v=20v3).

```sh
# filter for hospitals and clinics based on building code
# remember to re-project it to the standard projection
ogr2ogr -where "BldgClass LIKE 'I%'" -t_srs WGS84 ../output/hospitals.geojson  ./MapPLUTO.shp MapPLUTO
```

## Process

## Notes

### Shapefile to GeoJSON using [GDAL](https://gdal.org/download.html)

Just to be safe I first created a virtual environment for the gis dependencies

#### `conda create gis`

for [reference](https://docs.conda.io/projects/conda/en/latest/user-guide/tasks/manage-environments.html): can list them all using `conda env list`

#### `conda activate gis`

#### `conda install gdal`

use [Ogr2ogr](https://gdal.org/programs/ogr2ogr.html) to convert from `shapefile` to `geojson`

### `ogr2ogr output/censusTracts.geojson [pathTo.shp]`
