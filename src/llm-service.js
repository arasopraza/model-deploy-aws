const { BedrockRuntimeClient, ConversationRole, ConverseStreamCommand } = require('@aws-sdk/client-bedrock-runtime');

class LLMService {
  constructor(region = 'us-east-1', modelId = 'amazon.nova-lite-v1:0') {
    this.client = new BedrockRuntimeClient({ region });
    this.modelId = modelId;
  }

  async generateResponse(inputText, config = {}) {
    const message = {
      content: [{ text: inputText }],
      role: ConversationRole.USER,
    };

    const request = {
      modelId: this.modelId,
      messages: [message],
      inferenceConfig: {
        maxTokens: config.maxTokens || 500,
        temperature: config.temperature || 0.5,
      },
    };

    try {
      const response = await this.client.send(new ConverseStreamCommand(request));
      const result = [];

      for await (const chunk of response.stream) {
        if (chunk.contentBlockDelta) {
          const text = chunk.contentBlockDelta.delta?.text || '';
          result.push(text);
        }
      }

      return result.join('');
    } catch (error) {
      console.error(`ERROR: Can't invoke '${this.modelId}'. Reason: ${error.message}`);
      throw error;
    }
  }
}

module.exports = LLMService;