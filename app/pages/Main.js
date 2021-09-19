import React from 'react';
import Header from '../components/Header/Header';
import NavBar from '../components/NavBar/NavBar';
import Profile from '../components/Profile/Profile';
import { Route } from 'react-router-dom';
import Board from '../components/Board/Board';
import Testing from '../components/Testing/Testing';
import ConnectToOrganization from '../components/ConnectToOrganization/ConnectToOrganization';
import UMK from '../components/UMK/UMK';
import Timetable from '../components/Timetable/Timetable';
import Webinar from '../components/Webinar/Webinar';
import VisitsLog from '../components/VisitsLog/VisitsLog';
import ConnectToStudents from '../components/ConnectToStudents/ConnectToStudents';
import EStatement from '../components/EStatement/EStatement';
 
class Main extends React.Component {

  constructor(props) {
    super(props)

    this.state = {showModal: false}
  }

  componentDidMount() {
    Storage2.authorizedCallback.register(() => {
      this.forceUpdate();
    });
  }

  render() {
      return ( 
        <div className='app-wrapper'>
          <Header />
          <NavBar />
          <div className='app-wrapper-content'>
            <Route path='/board' component={Board} />
            <Route path='/connectToStudents' component={ConnectToStudents} />
            <Route path='/testing' component={Testing} />
            <Route path='/connectToOrganization' component={ConnectToOrganization} />
            <Route path='/umk' component={UMK} />
            <Route path='/timetable' component={Timetable} />
            <Route path='/webinar' component={Webinar} />
            <Route path='/visitsLog' component={VisitsLog} />
            <Route path='/eStatement' component={EStatement} />
            <Route path='/profile' component={Profile} />
          </div>
        </div>
      );
  }
}

const App = (props) => {
  return <Main />
}

export default App;
