import { State } from "../../utils/types";
import sectionData from '../../content/data.json';

const initialState: State = {
  sectionData: sectionData,
}

export default function reducer(state = initialState, action): State {
  switch (action.type) {
    // case SCORE_CURRENT_UPDATE:
    // 	return Object.assign({}, state, {
    // 		current: state.current + action.current
    // 	})
    default:
      return state
  }
}