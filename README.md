# Visualizing MTA Ridership Changes During COVID-19

## Repository Structure

This repository holds all aspects of [MTA ridership project](http://projects.two-n.com/mta/).

- `/data` - contains partial datasets that were used for research and analysis in this project. Note: due to the size of files, not all were commited to git, but the sources for all data sources (past and present) can be found in the [data folder README](./data/README.md).

- `/processingScripts` - contains python processing scripts used to pull and restructure the data for the visualization. There are some older jupyter notebook files in there that were used for data exploration, but the final scripts that contributed to the data in the application are all `.py` files.

  The primary scripts used were:
  - [`mtaSwipes.py`](./processingScripts/mtaSwipes.py): scrapes MetroCard swipes data from [MTA developer's page](http://web.mta.info/developers/fare.html) and compiles all into a single dataset.
  - [`acsByNTA.py`](./processingScripts/acsByNTA.py): filters [pre-downloaded census data](https://www1.nyc.gov/site/planning/data-maps/open-data/dwn-acs-nta.page) for relevant metrics. Spatially joins [MTA station locations](http://web.mta.info/developers/data/nyct/subway/Stations.csv) into their surrounding Neighborhood Tabulation Areas. Saves `stations_with_ntas.csv` and `acs_nta.geojson` into `data/output` folder.

- `/app` - contains all the font-end application code.

## App Structure

This app was built with TypeScript, leveraging Webpack for code bundling.
In order to run, first navigate into the `/app` folder (`cd app`). From there you will have the following scripts available:

#### `yarn start`
starts a hot-reloading webpack development server

#### `yarn build`
creates a production level code build, saved to `app/dist` folder

#### `yarn deploy`
deploys `dist` folder to `project.two-n.com`

#### `yarn archie`
starts up an [aml-gdoc-server](https://github.com/Quartz/aml-gdoc-server) to pull structured JSON from the [google doc](https://docs.google.com/document/d/1Dc9L6cVkBEpUPbp2vSby0Mpx40MzCeKqe_4cX5I11oE/edit?usp=sharing) that contains the application's narrative content.

To save an updated version, navigate to [`http://127.0.0.1:6006/1Dc9L6cVkBEpUPbp2vSby0Mpx40MzCeKqe_4cX5I11oE`](http://127.0.0.1:6006/1Dc9L6cVkBEpUPbp2vSby0Mpx40MzCeKqe_4cX5I11oE) and save the resulting `.json` to `app/public/content/narrativeCopy.json`.


## Primary Datasources

- Ridership data comes from [MTA MetroCard Swipe Data](http://web.mta.info/developers/fare.html).
- American Community Survey (ACS) by Neighborhood Tabulation Area (NTA) data comes from [NYC Planning Aggregates](https://www1.nyc.gov/site/planning/data-maps/open-data/dwn-acs-nta.page).
- MTA station locations come from [this MTA dataset](http://web.mta.info/developers/data/nyct/subway/Stations.csv).
- Narrative copy is maintained and edited in [this google doc](https://docs.google.com/document/d/1Dc9L6cVkBEpUPbp2vSby0Mpx40MzCeKqe_4cX5I11oE/edit?usp=sharing).

## Additional Tools/Resources

- [ArchiML](http://archieml.org/) to turn unstructured google doc data into structured JSON. Leveraged [aml-gdoc-server](https://github.com/Quartz/aml-gdoc-server) to be able to connect directly to Google Drive.
- [Scrollama](https://github.com/russellgoldenberg/scrollama) for scroll triggers.
- [GDAL](https://gdal.org/) for geographic transformations.
