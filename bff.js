const Bundler = require('parcel-bundler');
const express = require('express');
const path = require('path');

const app = express();
const bundler = new Bundler('src/index.html', {});
const port = 3000;

app.use('/', express.static(path.join(__dirname, '..', 'dist')));

app.get('/api', (req, res) => {
  // raw
  const payload = ['back', 'end', 'for', 'front', 'end'];

  // prep
  const message = payload
    .map(word => word.charAt(0).toUpperCase() + word.substr(1))
    .join('');

  res.json({ message });
});

app.use(bundler.middleware());

app.listen(port, () => console.log(`app running at http://localhost:${port}`));
