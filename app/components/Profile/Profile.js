import React from 'react';




const Profile = () =>{


var stor= Storage2.profile
console.log(stor);
var user= Storage2.user.username
console.log(user);


    return (
      <div>
        <h1 id="header">Персональные данные</h1>
        <label id='label-name'>Ф.И.О:</label>
        <input type="text" id="name" ng-model="name" onchange="nameFilter()" required/>

        <label id="label-telephone">Пол:</label>
        <input type="tel" name="number" id="telephone" ng-model="telephone" placeholder="{{obj.pol}}" maxlength="15" onchange="telephoneFilter()" required/><br/>

        <label id='label-email'>Национальность:  </label>
        <input type="email" id="email" ng-model="email" placeholder="{{obj.Nationality}}" onchange="emailFilter()" required/><br/>

        <label id="label-street">Гражданство:</label>
        <input type="text" id="street" ng-model="street" placeholder="{{obj.Citizenship}}" onchange="streetFilter()" required/><br/>

        <label id='label-zip'>ИНН:</label>
        <input id="zip" ng-model="zip" placeholder="{{obj.INN}}" onchange="zipFilter()" maxlength="5" required/><br/>

       <label id="label-street">Образование:</label>
        <input type="text" id="street" ng-model="street" placeholder=" {{obj.education}}" onchange="streetFilter()" required/><br/><br/>
        

      </div>
    );


}

export default Profile;