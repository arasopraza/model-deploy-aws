const Hapi = require('@hapi/hapi');
const routes = require('./routes');
const PredictService = require('./predict-service');
const LLMService = require('./llm-service');
const Handler = require('./handler');

const init = async () => {
  const server = Hapi.server({
    port: 3000,
    host: '0.0.0.0',
  });

  const predictService = new PredictService();
  const llmService = new LLMService();

  const handler = new Handler(predictService, llmService);
  server.route(routes(handler));

  await server.start();
  console.log('Server running on', server.info.uri);
};

init();