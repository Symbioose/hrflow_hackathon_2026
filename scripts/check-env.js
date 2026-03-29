const fs = require('fs');
const path = require('path');
const envPath = path.join(__dirname, '../.env');
if (!fs.existsSync(envPath)) {
  console.log('No .env file found');
} else {
  const content = fs.readFileSync(envPath, 'utf8');
  content.split('\n').forEach(line => {
    const match = line.match(/^([^#=]+)=/);
    if (match) console.log(match[1]);
  });
}
