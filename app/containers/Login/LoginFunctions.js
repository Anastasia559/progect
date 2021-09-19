import React from 'react'
import { Storage2 } from '../../storage';
import Messages  from '../../components/Messages/Messages';

export function errorConnection(){
    // alert('errorConnection');

    return (
        <Messages text= {Storage2.message_text} type={Storage2.message_type}/>
    )
}

export function userNotFound(){
     Storage2.setAuthorized(false);  
}

export function LoggedInOK(user){
    Storage2.user = user;
    Storage2.setAuthorized(true);  
}