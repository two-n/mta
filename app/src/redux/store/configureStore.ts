import { createStore } from 'redux'
import rootReducer from '../reducers'
import A from '../actions/';
import { State } from '../../utils/types';


/** sanitizer so that dev tools don't use too much memory */
const actionSanitizer = (action) => (
  action.type === A.SET_TURNSTILE_DATA && action.data ?
    { ...action, data: '<<LONG_BLOB>>' } : action
);

/** sanitizer so that dev tools don't use too much memory */
const stateSanitizer = (state: State) => state.turnstileData ? { ...state, turnstileData: state.turnstileData.slice(0, 10) } : state


export default function configureStore() {
  return createStore(
    rootReducer,
    //@ts-ignore
    window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__({
      actionSanitizer,
      stateSanitizer
    }),
  )
}