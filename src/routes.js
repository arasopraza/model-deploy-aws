const routes = (handler) => [
  {
    method: 'POST',
    path: '/predict',
    handler: handler.getPredictResult,
    options: {
      payload: {
        allow: 'multipart/form-data',
        multipart: true,
      }
    }
  },
  {
    method: 'POST',
    path: '/chatbot',
    handler: handler.getChatbotResponse,
  }
];

module.exports = routes;