const OPENROUTER_API_KEY = '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';

// Fallback function for when API is not available
const generateFallbackResponse = (userMessage: string): string => {
  const responses = [
    `I understand you're asking about "${userMessage}". As your HEI Student Portal assistant, I can help you with:
    
    • Event registration and details
    • Goal setting and tracking  
    • Platform navigation
    • Academic resources
    • Course schedules and faculty information
    
    Please let me know what specific information you need!`,
    
    `Thanks for your question about "${userMessage}". I'm here to help you navigate the HEI Student Portal. 
    
    I can assist with:
    - Finding and registering for events
    - Setting up your academic goals
    - Understanding platform features
    - Connecting with faculty and resources
    
    What would you like to know more about?`,
    
    `I see you're interested in "${userMessage}". The HEI Student Portal offers many features to support your academic journey.
    
    Key areas I can help with:
    • Event management and registration
    • Progress tracking and goal setting
    • Platform tutorials and guidance
    • Academic support resources
    
    How can I assist you today?`
  ];
  
  return responses[Math.floor(Math.random() * responses.length)];
};

export interface AssistantResponse { content: string }

export async function sendAssistantMessage(history: Array<{ role: string; content: string }>): Promise<AssistantResponse> {
  try {
    console.log('Attempting to call OpenRouter API with key:', OPENROUTER_API_KEY.substring(0, 10) + '...');
    
    const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'HTTP-Referer': window.location.origin,
        'X-Title': 'HEI Student Portal Assistant'
      },
      body: JSON.stringify({
        model: 'openai/gpt-3.5-turbo',
        messages: history,
        max_tokens: 1000,
        temperature: 0.7,
        stream: false
      }),
    });

    if (!res.ok) {
      const errorBody = await res.text();
      console.error('OpenRouter API error details:', errorBody);
      throw new Error(`OpenRouter API error: ${res.status} ${errorBody}`);
    }

    const data = await res.json();
    return {
      content: data.choices?.[0]?.message?.content || 'Sorry, I could not generate a response.'
    };
  } catch (error) {
    console.error('Assistant API error:', error);
    const last = history[history.length - 1]?.content || '';
    
    // Use fallback response for better user experience
    return {
      content: generateFallbackResponse(last)
    };
  }
}



