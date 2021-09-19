import React from 'react'
import { Storage2 } from '../../storage';
import { Api } from '../../api';
import { errorConnection, userNotFound, LoggedInOK } from './LoginFunctions';
import { ERROR_CONNECTION, USER_NOT_FOUND, USER_NOT_LOGGED_IN } from './../../constants/errorCodes';
import View from '../../components/Login/Login';
import Messages from '../../components/Messages/Messages';

class Login extends React.Component {

    constructor(props) {
        super(props)

        this.state = {login: null, password: null, result: null, message:null}

        this.setLogin = this.setLogin.bind(this)
        this.setPassword = this.setPassword.bind(this)
        this.onClickAction = this.onClickAction.bind(this)
    }

    setLogin(e) {
        this.setState({login: e.target.value})
    }

    setPassword(e) {
        this.setState({password: e.target.value})
    }

    async onClickAction() {
        const {login, password} = this.state

        if (!login.trim().length || !password.trim().length) {
            return
        }

        var resultUser = await Api.login(login, password); 

        this.setState({result: resultUser})

         if (this.state.result === ERROR_CONNECTION) {
            this.setState({message: <Messages opened="true" text="connection error" type="error" />})
        }
        if (this.state.result === USER_NOT_FOUND) {
            this.setState({message:  <Messages opened="true" text="user not found" type="warning" />})
        }

        

        if (resultUser === ERROR_CONNECTION || resultUser === USER_NOT_FOUND) {
            Storage2.setAuthorized(false);
         }
        else {
            LoggedInOK(resultUser);
            
            var profile = await Api.getProfile(resultUser.cookie);
            if (profile === ERROR_CONNECTION || profile === USER_NOT_LOGGED_IN){
                Storage2.setAuthorized(false);
            }
            else{
                 Storage2.profile = profile;
                console.log('*/*/*/' + Storage2.profile.t_fio);
            }

            console.log('resultUSER - ' + JSON.stringify( resultUser));
        }
    }

    render() {
        const props = {
            ...this.state,
            onClick: this.onClickAction,
            onLoginChange: this.setLogin,
            onPasswordChange: this.setPassword
        }
        console.log({props})
        return (
            <View {...props} />
        )
    }
}

export default Login;