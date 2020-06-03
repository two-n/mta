import { State } from "../../utils/types";
import sectionData from '../../content/sectionData.json';
import A from "../actions";

const initialState: State = {
  sectionData: sectionData,
  turnstileData: null
}

export default function reducer(state = initialState, action): State {
  switch (action.type) {
    case A.SET_TURNSTILE_DATA:
      return { ...state, turnstileData: action.data }
    default:
      return state
  }
}