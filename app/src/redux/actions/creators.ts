import { TurnstileData } from "../../utils/types"

export const SET_TURNSTILE_DATA = "SET_TURNSTILE_DATA"
export const setTurnstileData = (data: TurnstileData[]) => ({
  type: SET_TURNSTILE_DATA,
  data
})