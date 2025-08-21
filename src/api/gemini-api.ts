const GEMINI_API_KEY = "AIzaSyAIH7ktg4bqCuDINfGhk1N9E4Tmx3wkQ84";
const API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

interface GeminiMessage {
  role?: string;
  parts: Array<{
    text: string;
  }>;
}

export async function askGemini(prompt: string): Promise<string> {
  try {
    const response = await fetch(`${API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt
              }
            ]
          }
        ]
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Gemini API error: ${error.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || 'No response from AI';
  } catch (error) {
    console.error('Error calling Gemini API:', error);
    throw error;
  }
}
