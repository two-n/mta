import pandas as pd
import numpy as np
import geopandas

# ref: https://www1.nyc.gov/assets/planning/download/pdf/data-maps/open-data/nta_acs_2014_2018_datadictionary.pdf?r=1
columnsToKeep= [
    "BoroCode",
    "BoroName",
    "NTACode",
    "NTAName",

    # Commuting to work
    "cw_pbtrnsP", # % commuting to work via public transportation (excluding taxicab)
    "mntrvtmE", # mean travel time to work (minutes)

    # Occupation
    "mgbsciartP", # % population employed in Management, business, science and arts
    "srvcP", # % population employed in service occupations
    "salesoffP", # % population employed in sales and office occupations
    "infoP", # % population employed information

    # Industry
    "prfsmgawmP", # % population employed in Professional, scientific, and management, and administrative and waste management services
    "edhlthcsaP", # % population employed in Educational services, and health care and social assistance
    "artenrafsP", # % population employed in Arts, entertainment, and recreation, and accommodation and food services
    "pubadminP", # % population employed in Public administration
    "gvtwrkrP", # % population government workers


    # Income and benefits
    "mdhhincE", # median household income ($)
    "mnhhincE", # mean household income ($)
    "inc_snapE", # % with Food Stamps/SNAP benefits in last 12 months
    "percapincE", # per capita income ($)

    # Health Insurance
    "hinsP", # % with health insurance
    "pvhinsP", # % with health insurance who have private insurance
    "pbhinsP", # % with health insurance who have public insurance
    "nhinsP", # % with no health insurance coverage
    "nhinsE", # population with no health insurance coverage
    "emnhinsP", # % employed in labor force with no health insurance
    "uemnhinsP", # % unemployed in labor force with no health insurance
    "nlfnhinsP", # % not in labor force with no health insurance

    # Poverty
    "fambwpvP", # % families below poverty line
    "geometry"
]

def pullInACSGeoJson():
  """
  Pulls in ACS data by Neighborhood Tabulation Area (NTA).
  Selects subset of columns.
  """
  path = "data/Neighborhood Tabulation Areas (NTA)/ACS/nta_with_acs_economics.geojson"
  df = geopandas.read_file(path)
  return  df[columnsToKeep]

def pullInStationCSV():
  """
  Pulls in station csv.
  Turns into geopandas so that it can be used in a spatial join.
  """
  path = "data/Stations/MTA_Station_Mapping_from_turnstile_data.csv"
  df = pd.read_csv(path)
  stations = df[~(df.lat.isnull() | df.lat.isna())] # remove empty geometries
  return geopandas.GeoDataFrame(
    stations, geometry=geopandas.points_from_xy(stations["long"], stations["lat"]))

def handleSpatialJoin(ntas, stations):
  """
  Merges stations into their enclosing ntas.
  """
  stationsWithNTA = geopandas.sjoin(stations, ntas, how="left", op="intersects")
  stationColsToKeep = ['station_code', 'station',"GTFS_stop_id", "C/A","line_name",
  'BoroCode', 'BoroName', 'NTACode', 'NTAName', "geometry", "lat", "long", "unit"]

  return stationsWithNTA[stationColsToKeep]

def main():
  ntas = pullInACSGeoJson()
  stations = pullInStationCSV()
  joined = handleSpatialJoin(ntas, stations)

  ntas.to_file("data/output/acs_nta.geojson", driver='GeoJSON')
  joined.to_csv("data/output/stations_with_ntas.csv", index=False)

if __name__ == "__main__":
  main()