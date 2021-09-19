import DaysJS from './utils/DayJSAdvanced'

import 'dayjs/locale/ru'

DaysJS.locale('ru')

import React from 'react'
import ReactDom from 'react-dom'
import {Provider} from 'react-redux'

import createStore from './reducers/index'
import Routes from './routes/index'

const store = createStore()

ReactDom.render(
	<Provider store={store}>
		<Routes />
	</Provider>,
	document.getElementById('app')
)