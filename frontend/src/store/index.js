import { createStore, applyMiddleware, compose } from "redux";
// import { composeWithDevTools } from "redux-devtools-extension";
import ThunkMiddleware from "redux-thunk";

import rootReducer from './reducers';

const composedEnhancer = compose( applyMiddleware( ThunkMiddleware )/*, composeWithDevTools()*/ );
const store = createStore(rootReducer, composedEnhancer );

export default store;