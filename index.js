const express = require('express');
const bodyParser = require('body-parser');
const path = require('node:path');
const { Eta } = require('eta');
const urlRoutes = require('./routes/url.routes');

require('dotenv').config({ path: './.env.local' });

const app = express();
const port = process.env.PORT || 3000;
app.locals.port = port;

// Setup eta
const eta = new Eta({ views: path.join(__dirname, 'views') });
app.engine('eta', buildEtaEngine());
app.set('view engine', 'eta');
app.set('views', './views');

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

function buildEtaEngine() {
  return (path, opts, callback) => {
    try {
      const fileContent = eta.readFile(path);
      const renderedTemplate = eta.renderString(fileContent, opts);
      callback(null, renderedTemplate);
    } catch (error) {
      callback(error);
    }
  };
}

// Routes
app.get('/', (req, res) => {
  res.render('index', { shortUrl: null, qrCodeDataUrl: null, error: null });
});
app.use('/', urlRoutes);

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});