import axios from 'axios';

class OpenAIService {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.isConnected = false;
  }

  async validateApiKey(key) {
    try {
      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: 'gpt-3.5-turbo',
          messages: [{ role: 'user', content: 'test' }],
          max_tokens: 5
        },
        {
          headers: {
            Authorization: `Bearer ${key}`,
            'Content-Type': 'application/json',
          },
        }
      );

      this.isConnected = true;
      return true;
    } catch (err) {
      console.error('Erro na validação da chave OpenAI:', err);
      this.isConnected = false;
      return false;
    }
  }

  getStatus() {
    return {
      isConnected: this.isConnected,
      apiKey: this.apiKey ? 'configured' : null
    };
  }

  async sendMessage(message, options = {}) {
    try {
      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: options.model || 'gpt-3.5-turbo',
          messages: [{ role: 'user', content: message }],
          temperature: options.temperature || 0.7,
          max_tokens: options.max_tokens || 1000,
          top_p: options.top_p || 1,
          frequency_penalty: options.frequency_penalty || 0,
          presence_penalty: options.presence_penalty || 0,
        },
        {
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      return response.data;
    } catch (err) {
      console.error('Erro na OpenAI API:', err);
      throw err;
    }
  }
}

export default OpenAIService; 