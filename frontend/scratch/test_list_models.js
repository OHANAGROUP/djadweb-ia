const fetch = require('node-fetch');
async function list() {
  const res = await fetch('https://generativelanguage.googleapis.com/v1beta/models?key=AIzaSyBlLSyc90F0_ETgnqg4eTJDdXp0RonGNQY');
  const data = await res.json();
  console.log(data.models.map(m => m.name));
}
list();
