import {combineReducers} from 'redux'
import {reducer as formReducer} from 'redux-form'
import configureStore from '../redux/store'
import rootSaga from '../sagas'

// import commonReducer from './Common'
// import authReducer from './Auth'

export default () => {
  const rootReducer = combineReducers({
		 form: formReducer,
		// common: commonReducer,
		// auth: authReducer
  })

  return configureStore(rootReducer, rootSaga)
}