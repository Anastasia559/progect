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
})



module.exports.checksmsabiturient = function checksmsabiturient(){
    let startid = 0;
    let stop = 90000000;
    let timerId = setInterval(() => getphone(startid),5000);
    setTimeout(() => { clearInterval(timerId)}, stop);
}
  


  let pass = generatePassword()
  function generatePassword() {
    var length = 5,
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





   
    async function getphone() {


          pool.connect((err, client, release) => {
          if (err) {
            return console.error('Error acquiring client', err.stack)
          }
          client.query(`SELECT "NumberSert", telefon_ab
                                FROM public."Enrollee_ORT"
                                WHERE password = '-1' AND LENGTH(telefon_ab) = 12 LIMIT 1`,
            (err, result) => {
              release()
              if (err) {
                return console.error('Error executing query', err.stack)
              }

              if(result.rowCount > 0 && result.rows[0].NumberSert){
                console.log(result.rows[0].NumberSert);
                console.log(result.rows[0].telefon_ab);
                let NumberSert = result.rows[0].NumberSert;
                let telefon_ab = result.rows[0].telefon_ab;
               
                async function tt() {
                  
                  let cryptoPassSMS = generatePassword();
                  let cryptoPass = await getCryptPassword(cryptoPassSMS);
                  pool.connect((err, client, release) => {
                    if (err) {
                      return console.error('Error acquiring client', err.stack)
                    }
                        client.query('UPDATE public."Enrollee_ORT" SET password = $1 WHERE "NumberSert" = $2',
                          [cryptoPass, NumberSert],
                          (err, result) => {
                            release()
                            if (err) {
                              return console.error('Error executing query', err.stack)
                            }
                              let shMessage = `Уважаемый Абитуриент! Ваш логин: номер сертификата ОРТ, пароль: ${cryptoPassSMS} https://2020.edu.gov.kg/personalcabinet/#enrollee`;
                              SMS.sendSMS(NumberSert, telefon_ab, shMessage, 5, 9)

                          })
                    })
                } tt()
              
              }

            })
        });
   } 




