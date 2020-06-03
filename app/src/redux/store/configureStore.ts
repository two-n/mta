import { createStore } from 'redux'
import reducers from '../reducers'

//@ts-ignore
const { devToolsExtension } = window

export default function configureStore() {
  return createStore(
    reducers,
    devToolsExtension && devToolsExtension()
  )
}