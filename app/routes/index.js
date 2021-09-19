import React from 'react'
import {BrowserRouter as Router, Route} from 'react-router-dom'

import MainPage from '../pages/Main'
import FaqPage from '../pages/Faq'

export default () => (
	<Router>
		<section>
			<Route exact path='/' component={MainPage} />
			<Route path='/faq' component={FaqPage} />
		</section>
	</Router>
)