import json
import time
from functools import reduce
import pandas as pd
from urllib.request import urlopen
from bs4 import BeautifulSoup
from progress.bar import IncrementalBar

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

  return list(map((lambda x: [x.text, baseUrl+x["href"]]), aTags))

def pullAndParseWeeklyData(weekArray):
  """
  Recieves parameter `weekArray` of the form [date, link].
  Fetches data from `link` and returns a dataframe.
  """
  date, link = weekArray

  df = pd.read_csv(link, header=2, skipinitialspace=True) # start reading on third line
  df["WEEK"] = date
  df['TOTAL'] = df.drop(['REMOTE','STATION'], axis=1).sum(axis=1)

  return df[["WEEK","STATION", "REMOTE", "TOTAL"]]

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