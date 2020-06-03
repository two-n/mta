import { Store } from "redux";
import { State } from "../../utils/types";

export const getSectionData = (state: Store<State>) => state.getState().sectionData;