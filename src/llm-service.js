const { BedrockRuntimeClient, ConversationRole, ConverseStreamCommand } = require('@aws-sdk/client-bedrock-runtime');

class LLMService {
  constructor(region = 'us-east-1', modelId = 'amazon.nova-lite-v1:0') {
     /*
     * Initializes a new instance of the LLMService.
     * - region: AWS region where Bedrock is hosted
     * - modelId: identifier of the foundation model to be used
     */
    this.client = new BedrockRuntimeClient({ region });
    this.modelId = modelId;
  }

  async generateResponse(inputText, config = {}) {
     /*
     * Constructs a user message in the format expected by Bedrock.
     * Role must be set to 'USER', and content is an array of message parts.
     */
    const message = {
      content: [{ text: inputText }],
      role: ConversationRole.USER,
    };


    /*
     * Prepares the full request object for the ConverseStreamCommand.
     * Includes model ID, user messages, and inference configuration.
     */
    const request = {
      modelId: this.modelId,
      messages: [message],
      inferenceConfig: {
        maxTokens: config.maxTokens || 500,
        temperature: config.temperature || 0.5,
      },
    };

    try {
      /*
       * Sends the request to Bedrock using the ConverseStreamCommand.
       * This returns a response object with an async stream of tokens.
       */
      const response = await this.client.send(new ConverseStreamCommand(request));
      
      const result = [];

      /*
       * Iterates over the streamed response chunks as they arrive.
       * Useful for handling long or real-time model outputs.
       */
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