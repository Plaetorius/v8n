import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { messages, workflow_json } = await req.json();
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    return NextResponse.json({ error: 'Claude API key not set' }, { status: 500 });
  }

  // Compose Claude prompt with full chat history
  const systemPrompt = `You are an expert n8n workflow assistant. You help users create, modify, and optimize n8n workflows through natural conversation.

IMPORTANT RULES:
1. Always respond with a valid, complete n8n workflow JSON
2. Consider the full conversation history to avoid repeating yourself
3. When modifying workflows, explain what you changed and suggest next steps
4. Be helpful and proactive in suggesting improvements
5. Format your conversational explanation and suggestions using Markdown (headings, bullet points, bold, etc.) for clarity.
6. Format your response as: [Markdown explanation] [JSON object] [more Markdown if needed]

RESPONSE FORMAT:
- Start with a conversational explanation of what you're doing, using Markdown formatting
- Include the complete updated workflow JSON object
- End with any additional suggestions or follow-up questions, also in Markdown

Current workflow JSON:
${JSON.stringify(workflow_json, null, 2)}

Full conversation history:
${messages.map((msg: { type: string; content: string }) => `${msg.type === 'user' ? 'User' : 'Assistant'}: ${msg.content}`).join('\n')}

Please respond with a conversational explanation (in Markdown) followed by the updated workflow JSON.`;

  const userPrompt = `Based on the conversation history and current workflow, please help with: ${messages[messages.length - 1].content}`;

  // Call Claude API (Anthropic v1)
  try {
    console.log('Calling Claude API with:', {
      apiKey: apiKey ? 'SET' : 'NOT SET',
      userPrompt: userPrompt.substring(0, 100) + '...',
    });

    const anthropicRes = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-3-5-haiku-latest',
        max_tokens: 2048,
        system: systemPrompt,
        messages: [
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.2,
      }),
    });

    console.log('Claude API response status:', anthropicRes.status);
    
    if (!anthropicRes.ok) {
      const errorText = await anthropicRes.text();
      console.error('Claude API error:', errorText);
      return NextResponse.json({ 
        error: `Claude API error: ${anthropicRes.status} ${anthropicRes.statusText}`,
        details: errorText
      }, { status: 500 });
    }

    const data = await anthropicRes.json();
    console.log('Claude API response data:', data);

    if (!data.content || !data.content[0] || !data.content[0].text) {
      console.error('Invalid Claude response structure:', data);
      return NextResponse.json({ 
        error: 'Claude did not return a valid response.',
        details: data
      }, { status: 500 });
    }

    // Try to parse the returned JSON and extract conversation
    let updatedWorkflow = null;
    let conversationMessage = '';
    
    try {
      // First, try to parse as pure JSON
      updatedWorkflow = JSON.parse(data.content[0].text);
      conversationMessage = 'I\'ve updated your workflow as requested.';
    } catch {
      // If not pure JSON, try to extract JSON from the response
      const responseText = data.content[0].text;
      
      // Look for JSON blocks in the response (```json ... ```)
      const jsonMatch = responseText.match(/```json\s*([\s\S]*?)\s*```/);
      if (jsonMatch) {
        try {
          updatedWorkflow = JSON.parse(jsonMatch[1]);
          // Extract the conversation part (everything before and after the JSON block)
          conversationMessage = responseText.replace(/```json\s*[\s\S]*?\s*```/g, '').trim();
        } catch (jsonError) {
          console.error('Failed to parse JSON block:', jsonError);
          return NextResponse.json({ 
            error: 'Could not parse workflow JSON from response.', 
            raw: responseText 
          }, { status: 500 });
        }
      } else {
        // Look for JSON objects in the response (without code blocks)
        const jsonObjectMatch = responseText.match(/\{[\s\S]*"name"[\s\S]*"nodes"[\s\S]*"connections"[\s\S]*\}/);
        if (jsonObjectMatch) {
          try {
            updatedWorkflow = JSON.parse(jsonObjectMatch[0]);
            // Extract everything before the JSON object
            const beforeJson = responseText.substring(0, responseText.indexOf(jsonObjectMatch[0])).trim();
            // Extract everything after the JSON object
            const afterJson = responseText.substring(responseText.indexOf(jsonObjectMatch[0]) + jsonObjectMatch[0].length).trim();
            conversationMessage = (beforeJson + ' ' + afterJson).trim();
          } catch (jsonError) {
            console.error('Failed to parse JSON object:', jsonError);
            return NextResponse.json({ 
              error: 'Could not parse workflow JSON from response.', 
              raw: responseText 
            }, { status: 500 });
          }
        } else {
          // If no JSON found, return the response as conversation only
          conversationMessage = responseText;
          // Keep the current workflow unchanged
          updatedWorkflow = workflow_json;
        }
      }
    }

    return NextResponse.json({
      workflow_json: updatedWorkflow,
      conversation_message: conversationMessage,
      claude_message: data.content[0].text,
    });
  } catch (err) {
    console.error('Claude API call failed:', err);
    return NextResponse.json({ 
      error: 'Claude API call failed', 
      details: String(err) 
    }, { status: 500 });
  }
} 