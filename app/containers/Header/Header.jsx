import React from 'react';
import { Storage2 } from './../../storage';

import View from '../../components/Header/Header'

class Header extends React.Component {

    logout() {
        Storage2.setAuthorized(false);
    }

    loginAction() {
        Storage2.setAuthorized(true);
    }

    render() {
        return (
            <View onLogIn={this.loginAction} onLogOut={this.logout} />
        )
    }
}

export default Header;