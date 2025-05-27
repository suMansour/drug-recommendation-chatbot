import { config } from '../config';

export async function getDrugRecommendation(messages: {role: string, content: string}[]) {
  const apiKey = config.OPENROUTER_API_KEY;
  
  if (!apiKey || apiKey === 'YOUR_API_KEY_HERE') {
    console.error('API key is missing or invalid.');
    throw new Error('API key is missing. Please contact the administrator.');
  }

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': window.location.origin,
        'X-Title': 'Drug Recommendation Chatbot'
      },
      body: JSON.stringify({
        model: 'deepseek/deepseek-chat',
        messages: [
          { 
            role: 'system', 
            content: `You are a helpful medical assistant. Recommend drugs based on user symptoms, but always remind users to consult a healthcare professional before taking any medication.

Format your responses using:
1. Headings starting with ### for main sections (e.g., "### **Recommended Medication**", "### **Dosage Instructions**", "### **Warnings**")
2. **bold text** for important information like drug names, dosages, and warnings
3. Clear paragraphs and bullet points for better readability

Always include these sections:
### **Recommended Medication**
[Details about the medication]

### **Dosage Instructions**
[Specific dosage information]

### **Warnings**
[Important warnings and precautions]

### **Additional Information**
[Any other relevant information]` 
          },
          ...messages
        ],
        max_tokens: 512,
        temperature: 0.7,
        stream: false
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      console.error('API Error:', errorData);
      throw new Error(`API request failed with status ${response.status}: ${JSON.stringify(errorData)}`);
    }

    const data = await response.json();
    if (!data.choices || !data.choices[0]?.message?.content) {
      throw new Error('Invalid response format from API');
    }
    
    return data.choices[0].message.content;
  } catch (error) {
    console.error('Error in getDrugRecommendation:', error);
    throw error;
  }
} 