
import configureStore from './redux/store/configureStore';
import { App } from './sections/App';
import "./styling/_fonts.scss";

const store = configureStore()
const app = new App(store)
app.init();