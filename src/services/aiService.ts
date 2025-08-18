import { askGemini } from '../api/gemini-api';

export class AIService {
  static async askQuestion(question: string): Promise<string> {
    try {
      const response = await askGemini(question);
      return response;
    } catch (error) {
      console.error('Error in AIService:', error);
      return 'Sorry, I encountered an error while processing your request.';
    }
  }
}

export default AIService;
