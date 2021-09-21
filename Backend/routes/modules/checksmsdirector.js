const express = require('express');
const SMS = require('./sms');



const { Pool } = require('pg')
const pool = new Pool({
    host: 'localhost',
    port: 5432,
    database: 'ort',
    user: 'backend',
    password: 'xSJasdarhhusEwG7a4jo',
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
});



module.exports.checksmsdirector = function checksmsdirector(){
    let startid = 0;
    let stop = 90000000;
    let timerId = setInterval(() => getphone(startid),60000);
    setTimeout(() => { clearInterval(timerId)}, stop);
}
  let pass = generatePassword()
 
  function generatePassword() {
    var length = 4,
        charset = "abcdefghijkmnpqrstuxyz23456789",
        cryptVal = "";
    for (var i = 0, n = charset.length; i < length; ++i) {
        cryptVal += charset.charAt(Math.floor(Math.random() * n));
    }
    return cryptVal;
  }



  async function ff(str){
        let fetch = require('node-fetch');
        let url = "http://localhost:8180/api/external/CryptPassword/0625E692-AD94-4E01-91E6-89D6FFEFA207/" + str;
        let settings = { method: "Get" };
        let response = await fetch(url, settings);
        let data = await response.json();
        return await data.cryptPassword
  }

  async function getCryptPassword(str){
  return await ff(str);
  }



    async function getphone(id_school_users) {
          //console.log('dirnews');
          pool.connect((err, client, release) => {
          if (err) {
            return console.error('Error acquiring client', err.stack)
          }
          client.query(`SELECT id_school_users, school_phone, password_school, telefon_ab, login_school
					FROM public."Users_school"
					LEFT JOIN public."Sms_check"
					ON school_phone = telefon_ab
					WHERE LENGTH(school_phone) = 12 AND 
					(telefon_ab IS NULL OR LENGTH(login_school) < 4 OR login_school IS NULL) LIMIT 1`,
            (err, result) => {
              release()
              if (err) {
                return console.error('Error executing query', err.stack)
              }
              if(result.rowCount > 0 && result.rows[0].id_school_users){
                console.log(result.rows[0].id_school_users);
                console.log(result.rows[0].school_phone);
                let id_school_users = result.rows[0].id_school_users;
                let school_phone = result.rows[0].school_phone;
               
                async function tt() {
                  let cryptoLogin = generatePassword();
                  let cryptoPassSMS = generatePassword();
                  let cryptoPass = await getCryptPassword(cryptoPassSMS);
                  pool.connect((err, client, release) => {
                    if (err) {
                      return console.error('Error acquiring client', err.stack)
                    }
                        client.query('UPDATE public."Users_school" SET login_school = $1, password_school = $2 WHERE id_school_users = $3',
                          [cryptoLogin, cryptoPass, result.rows[0].id_school_users],
                          (err, result) => {
                            release()
                            if (err) {
                              return console.error('Error executing query', err.stack)
                            }
                              let shMessage = `Уважаемый директор! Ваш логин: ${cryptoLogin} пароль: ${cryptoPassSMS} на портал https://2020.edu.gov.kg`;
                              SMS.sendSMS(id_school_users, school_phone, shMessage, 6, 4)

                          })
                    })
                } tt()
              
              }
             
            })
        });
   } 


