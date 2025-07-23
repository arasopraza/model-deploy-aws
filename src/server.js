const Hapi = require('@hapi/hapi');
const routes = require('./routes');
const PredictService = require('./service');
const LLMService = require('./llm-service');
const PredictHandler = require('./handler');

const init = async () => {
  const server = Hapi.server({
    port: 3000,
    host: '0.0.0.0',
  });

  const predictService = new PredictService();
  const llmService = new LLMService();
  const handler = new PredictHandler(predictService, llmService);
  server.route(routes(handler));

  await server.start();
  console.log('Server running on', server.info.uri);
};

init();