import json
import time
from functools import reduce
import pandas as pd
from urllib.request import urlopen
from bs4 import BeautifulSoup
from progress.bar import IncrementalBar
import datetime

# Keys
WEEK="WEEK"
WEEK_END="WEEK_END"
TOTAL="TOTAL"
REMOTE="REMOTE"
STATION="STATION"

def fetchWeeklyLinks():
  """
  Parses http://web.mta.info/developers/fare.html and pulls out all the data links.
  Returns array of the form [Date string, csvLink].
  """
  baseUrl = "http://web.mta.info/developers/"
  htmlPath = "fare.html" # path for site to scrape
  html = urlopen(baseUrl+htmlPath)

  # parse the html into something searchable
  soup = BeautifulSoup(html, 'html.parser')
  aTags = (soup.find(id='contentbox')
  .find(class_="container")
  .find(class_="last")
  .find_all("a"))

  startDate = datetime.datetime(2020,1,1) # 01/01/2019
  def parseDate(str):
    return datetime.datetime.strptime(str, "%A, %B %d, %Y") # ex: Saturday, June 06, 2020

  filteredLinks = list(filter(lambda x: parseDate(x.text)>= startDate, aTags))
  return list(map(lambda x: baseUrl+x["href"], filteredLinks))

def pullAndParseWeeklyData(link):
  """
  Recieves parameter `weekArray` of the form [link].
  Fetches data from `link` and returns a dataframe.
  """

  def parseDate(str):
    return datetime.datetime.strptime(str, "%m/%d/%Y") # ex: 04/07/2020

  # get date range (stored in header)
  row = pd.read_csv(link, nrows=1) # pull out header from first row to get start dates
  dates = row.iloc[0,1].split('-')

  # read body
  df = pd.read_csv(link, header=2, skipinitialspace=True) # start reading on third line
  df[WEEK] = parseDate(dates[0])
  # df[WEEK_END] = parseDate(dates[1]) // UNCOMMENT to include week-end
  df[TOTAL] = df.drop([REMOTE,STATION], axis=1).sum(axis=1)

  return df[[WEEK, STATION, REMOTE, TOTAL]]

def main():
  """
  Pull all weekly links and reduce into single dataset.
  """
  weeklyLinks = fetchWeeklyLinks()

  bar = IncrementalBar('Countdown', max = len(weeklyLinks))

  def handleWeeklyData(x):
    res = pullAndParseWeeklyData(x)
    bar.next() # updates progress bar
    return res

  mapped = list(map(handleWeeklyData,weeklyLinks))
  bar.finish()

  reduced = pd.concat(mapped) # combine all into a single datasource
  reduced.to_csv('data/output/mta_swipes_weekly.csv', index=False)


if __name__ == "__main__":
  main()