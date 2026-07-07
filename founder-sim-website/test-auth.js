const { GoogleAuth } = require('google-auth-library');
console.log(Object.keys(new GoogleAuth().getClient));
