import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: any, res: any) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'GROQ_API_KEY is not configured on Vercel.' });
    }

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        messages: req.body.messages,
        model: req.body.model || 'llama-3.3-70b-versatile',
        stream: false,
        temperature: 0.7,
        tools: req.body.tools,
        tool_choice: req.body.tool_choice
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Groq API Error:', response.status, errorText);
      try {
        const errorJson = JSON.parse(errorText);
        return res.status(response.status).json({ error: errorJson.error?.message || errorJson.error || 'Failed to fetch response from AI' });
      } catch (e) {
        return res.status(response.status).json({ error: `AI API Error: ${response.status}` });
      }
    }

    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    console.error('Vercel Function Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
