import { csv } from "d3-fetch";
import { autoType } from "d3-dsv";
import { setTurnstileData } from "./creators";
import { Dispatch } from "redux";


export const loadTurnstileData = (dispatch: Dispatch) => {
  const path = require("../../content/mta_timeseries_daily.csv")
  csv(path, autoType)
    //@ts-ignore
    .then(data => dispatch(setTurnstileData(data)))
    .catch(err => console.error('err in loading turnstile data', err))
}