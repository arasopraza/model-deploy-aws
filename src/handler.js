class PredictHandler {
  constructor(modelService, llmService) {
    this._modelService = modelService;
    this._llmService = llmService;
    
    this.getPredictResult = this.getPredictResult.bind(this);
    this.getChatbotResponse = this.getChatbotResponse.bind(this);
  }

  async getPredictResult(request, h) {
    const photo = request.payload;
    const predict = await this._modelService.predictImage(photo.file);
    const { diseaseLabel, confidenceScore } = predict;

    return h.response({
      status: 'success',
      message: 'Predict success',
      data: {
        disease: diseaseLabel,
        confidenceScore
      }
    });
  }

  async getChatbotResponse(request, h) {
    const { question } = request.payload;
    const response = await this._llmService.generateResponse(question);

    return h.response({
      status: 'success',
      message: 'Chatbot response retrieved successfully',
      data: {
        response
      }
    });
  }
}

module.exports = PredictHandler;