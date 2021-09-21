const smpp = require('smpp')
const https = require('https');
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

// let prefAlfaTelecom = ['9121212'];
// let prefNurTelecom = ['9121212'];
// let prefSkyMobile = ['9121212'];



let prefAlfaTelecom = ['996558','996550','996551','996552','996553','996554','996555','996556','996557','996559','996755','996999','996990','996997'];
let prefNurTelecom = ['996500', '996501', '996502', '996504', '996505', '996507', '996508', '996509', '996700', '996701', '996702', '996703', '996704', '996705', '996706', '996707', '996708', '996709'];
let prefSkyMobile = ['996770','996771','996772','996773','996774','996775','996776','996777','996778','996779','996220', '996221', '996222', '996223', '996224', '996225', '996226', '996227', '996228'];

let id_role; 
let id_sms_type;

module.exports.sendSMS = function sendSMS(sertnumber, number, messege, role, sms_type){
   console.log(messege);

    id_role = role;
    id_sms_type = sms_type;
    
 
			if (prefAlfaTelecom.includes(number.substring(0, 6))){
				sendToAlfaTelecom(sertnumber, number, messege)
			}
			else if (prefNurTelecom.includes(number.substring(0, 6))){
				sendToNurTelecom(sertnumber, number, messege)
			}
			else if (prefSkyMobile.includes(number.substring(0, 6))){
				sendToSkyMobile(sertnumber, number, messege)
			} else {
				smsCheckLog(sertnumber, number, "notPref", 100, 0)
			}
}




function sendToAlfaTelecom(sertnumber, number, messege){
       //console.log('start 2 AlfaTelecom')
       var session =smpp.connect({
            url: 'smpp://10.230.16.10:2885',
            auto_enquire_link_period: 7000
        });
        session.bind_transceiver({
            system_id: 'MONKR',
            password: 'x53m2F62'
        }, function(pdu) {
            if (pdu.command_status == 0) {
                //console.log('Successfully bound')
                smsCheckLog(sertnumber, number, pdu.message_id, pdu.command_status)
                session.submit_sm({
                    destination_addr: number,
                    short_message: messege,
                    source_addr: 'MON KR',
                    source_addr_ton: 0x05,
                    source_addr_npi: 0x01,
                    dest_addr_ton: 0x01,
                    dest_addr_npi: 0x01
                    
                }, function(pdu) {
                    if (pdu.command_status == 0) {
                        var sendTime = new Date();
                        // console.log('Message successfully sent ' + sendTime)
                        // console.log(pdu.message_id);
                        smsCheckLogUpdate(sertnumber, number, pdu.message_id, pdu.command_status)

                        session.close();
                        session.on('close', function () {
                           var closeTime = new Date();
                           //console.log('SMPP connection is closed ' + closeTime);
                        });
                    } else {
                        var sendTime = new Date();
                        // console.log('Message problem not sent ' + sendTime)
                        //console.log(pdu.command_id);
                        //console.log(pdu);
                        smsCheckLogUpdate(sertnumber, number, pdu.command_id, pdu.command_status)

                        session.close();
                        session.on('close', function () {
                            var closeTime = new Date();
                           //console.log('SMPP connection is closed ' + closeTime);
                        });
                    }
                });
            }
        })
}


function sendToSkyMobile(sertnumber, number, messege){
    //console.log('start 2 SkyMobile')
    var session = smpp.connect({
         url: 'smpp://194.176.111.243:2778',
         auto_enquire_link_period: 7000
     });
     session.bind_transceiver({
         system_id: 'monkr',
         password: `FMU8@n3I`
     }, function(pdu) {
         if (pdu.command_status == 0) {
             //console.log('Successfully bound')
             smsCheckLog(sertnumber, number, pdu.message_id, pdu.command_status)
             session.submit_sm({
                 destination_addr: number,
                 short_message: messege,
                 source_addr: 'MON KR',
                 source_addr_ton: 0x05,
                 source_addr_npi: 0x01,
                 dest_addr_ton: 0x01,
                 dest_addr_npi: 0x01
                 
             }, function(pdu) {
                 if (pdu.command_status == 0) {
                     var sendTime = new Date();
                     // console.log('Message successfully sent ' + sendTime)
                     //console.log(pdu.message_id);
                     smsCheckLogUpdate(sertnumber, number, pdu.message_id, pdu.command_status)

                     session.close();
                     session.on('close', function () {
                         var closeTime = new Date();
                        //console.log('SMPP connection is closed ' + closeTime);
                     });
                 } else {
                     var sendTime = new Date();
                     // console.log('Message problem not sent ' + sendTime)
                     // console.log(pdu.command_id);
                     // console.log(pdu);
                     smsCheckLogUpdate(sertnumber, number, pdu.command_id, pdu.command_status)

                     session.close();
                     session.on('close', function () {
                         var closeTime = new Date();
                        //console.log('SMPP connection is closed ' + closeTime);
                     });
                 }
             });
         }
     })
}


function sendToNurTelecom(sertnumber, number, messege){
       //console.log('start 2 nurtelecom')
       var session = smpp.connect({
            url: 'smpp://194.152.36.47:2775',
            auto_enquire_link_period: 7000
        });
        session.bind_transceiver({
            system_id: 'minobr',
            password: 'Zw5xj2yT'
        }, function(pdu) {
            if (pdu.command_status == 0) {
                //console.log('Successfully bound')
                smsCheckLog(sertnumber, number, pdu.message_id, pdu.command_status)
                session.submit_sm({
                    destination_addr: number,
                    short_message: messege,
                    source_addr: 'MON KR',
                    source_addr_ton: 0x05,
                    source_addr_npi: 0x01,
                    dest_addr_ton: 0x01,
                    dest_addr_npi: 0x01
                    
                }, function(pdu) {
                    if (pdu.command_status == 0) {
                        var sendTime = new Date();
                        // console.log('Message successfully sent ' + sendTime)
                        // console.log(pdu.message_id);
                        smsCheckLogUpdate(sertnumber, number, pdu.message_id, pdu.command_status)

                        session.close();
                        session.on('close', function () {
                            var closeTime = new Date();
                           //console.log('SMPP connection is closed ' + closeTime);
                        });
                    } else {
                        var sendTime = new Date();
                        // console.log('Message problem not sent ' + sendTime)
                        //console.log(pdu.command_id);
                        //console.log(pdu);
                        smsCheckLogUpdate(sertnumber, number, pdu.command_id, pdu.command_status)

                        session.close();
                        session.on('close', function () {
                            var closeTime = new Date();
                           //console.log('SMPP connection is closed ' + closeTime);
                        });
                    }
                });
            }
        })
}





function smsCheckLog(sertnumber, telefon_ab, pdumessageid, pdustatus){
    pool.connect((err, client, release) => {
        if (err) {
        return console.error('Error acquiring client', err.stack)
        } 
        client.query('INSERT INTO public."Sms_check"("NumberSert", telefon_ab, pdumessageid, status, count_issue, id_role, id_sms_type) VALUES ( $1, $2, $3, $4, $5, $6, $7)',
                    [sertnumber, telefon_ab, pdumessageid, pdustatus, 1, id_role, id_sms_type],
        (err, result) => {
        release()
        if (err) {
            return console.error('Error executing query', err.stack)
        } 
        if(result.rowCount > 0){
            // console.log('SMS start LOGed!!!')
        }
        })
    });
}


let now = new Date();
function smsCheckLogUpdate(sertnumber, telefon_ab, pdumessageid, pdustatus){
  pool.connect((err, client, release) => {
        if (err) {
          return console.error('Error acquiring client', err.stack)
        }
        client.query('UPDATE public."Sms_check"	SET pdumessageid=$1, createdate=$2, status=$3, count_issue = count_issue + 1 WHERE "NumberSert" = $4 AND "telefon_ab" = $5',
                    [pdumessageid, now, pdustatus, sertnumber, telefon_ab],
        (err, result) => {
          release();
          if (err) {
            return console.error('Error executing query', err.stack);
          }  if(result.rowCount > 0){
                    // console.log('SMS finish LOGed!!!')
             }
        })
      });
}