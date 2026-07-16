const axios = require('axios');
axios.get('http://localhost:5062/api/app/notifications')
  .then(res => console.log('OK', res.data))
  .catch(err => console.log('ERROR STATUS:', err.response?.status, 'DATA:', err.response?.data));

axios.post('http://localhost:5062/api/booking/hold', {})
  .then(res => console.log('OK', res.data))
  .catch(err => console.log('ERROR STATUS:', err.response?.status, 'DATA:', err.response?.data));
