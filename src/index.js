const { Configuration, OpenAIApi } = require("openai");

const WebGenServer = require('./WebGenServer');
require('dotenv').config();

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

const app = new WebGenServer(openai);
app.on('error', error => console.error(error));
app.listen(process.env.PORT || 3000);

