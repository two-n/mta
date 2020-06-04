
import configureStore from './redux/store/configureStore';
import App from './sections/App';
import A from './redux/actions';
import './styling/_fonts.scss';

const store = configureStore();
const app = new App(store);
// load in data and then initialize app
Promise.all([
  A.loadTurnstileData(store.dispatch),
  A.loadMapData(store.dispatch),
]).then(() => app.init());
