import { createStore, applyMiddleware } from 'redux';
import { createLogger } from 'redux-logger';
import thunk from 'redux-thunk';
import rootReducer from '../reducers/index';

const logger = createLogger();

const enhancer = applyMiddleware(thunk, logger);

export default function configureStore(initialState) {
  return createStore(rootReducer, initialState, enhancer);
}
