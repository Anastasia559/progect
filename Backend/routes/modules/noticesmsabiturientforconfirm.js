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



module.exports.noticesmsabiturientforconfirm = function noticesmsabiturientforconfirm(){
    let startid = 0;
    let stop = 90000000;
    let timerId = setInterval(() => noticesms(startid),300);
    setTimeout(() => { clearInterval(timerId)}, stop);
}

    async function noticesms() {


          pool.connect((err, client, release) => {
          if (err) {
            return console.error('Error acquiring client', err.stack)
          }
          client.query(`SELECT "NumberSert", telefon_ab
								FROM public."V_for_SMS_to_confirm"
								WHERE "NumberSert" NOT IN
								(
								SELECT "NumberSert"
								FROM public."Sms_check"
								WHERE id_sms_type = 10
								) LIMIT 1`,
            (err, result) => {
              release()
              if (err) {
                return console.error('Error executing query', err.stack)
              }

              if(result.rowCount > 0 && result.rows[0].NumberSert){
                console.log(result.rows[0].NumberSert);
                console.log(result.rows[0].telefon_ab);
                  let shMessage = `Вы были рекомендованы вузом. Не забудьте подтвердить свое желание обучаться. www.2020.edu.gov.kg`;
                  SMS.sendSMS(result.rows[0].NumberSert, result.rows[0].telefon_ab, shMessage, 5, 10)


            
              
              }

            })
        });
   } 




