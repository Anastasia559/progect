const md5 = require('md5')

function generatePassword () {
  var length = 5,
    charset = 'abcdefghijkmnpqrstuvxyzABCDEFGHJKLMNPQRSTUVXYZ23456789',
    value = ''
  for (var i = 0, n = charset.length; i < length; ++i) {
    value += charset.charAt(Math.floor(Math.random() * n))
  }
  return { crypto: md5(value), password: value }
}

function getPhoneToBase (phone) {
  return phone.replace('0', '996')
}

module.exports = {
  generatePassword: () => generatePassword(),
  getPhoneToBase: phone => getPhoneToBase(phone)
}
