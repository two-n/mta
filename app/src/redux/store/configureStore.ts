import { createStore } from 'redux';
import rootReducer from '../reducers';
import A from '../actions';
import { State } from '../../utils/types';


/** sanitizer so that dev tools don't use too much memory */
const dataActions = [A.SET_TURNSTILE_DATA, A.SET_STATION_DATA, A.SET_MAP_DATA, A.SET_ACS_DATA];
const actionSanitizer = (action) => (
  dataActions.includes(action.type) && action.data
    ? { ...action, data: '<<LONG_BLOB>>' } : action
);

/** sanitizer so that dev tools don't use too much memory */
const stateSanitizer = (state: State) => ({
  ...state,
  turnstileData: state.turnstileData && state.turnstileData.slice(0, 10),
  stationData: state.stationData && state.stationData.slice(0, 10),
  acsData: state.acsData && state.acsData.slice(0, 10),
  mapData: 'MAP DATA',
});

export default function configureStore() {
  return createStore(
    rootReducer,
    // @ts-ignore
    window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__({
      actionSanitizer,
      stateSanitizer,
    }),
  );
}
