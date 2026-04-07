const OpenAI = require('openai');

const getOpenAIClient = () => {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OpenAI API key not configured');
  }
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
};

// AI Feature: Auto-generate professional meeting description
exports.generateMeetingDescription = async (req, res) => {
  try {
    const { guestName, hostName, duration, notes, purpose } = req.body;

    const openai = getOpenAIClient();

    const prompt = `Generate a concise, professional meeting description for a ${duration}-minute meeting.
Host: ${hostName}
Guest: ${guestName}
${purpose ? `Purpose: ${purpose}` : ''}
${notes ? `Additional context: ${notes}` : ''}

Write a 2-3 sentence professional meeting description that includes the purpose, what will be covered, and any preparation needed. Keep it friendly yet professional.`;

    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 200,
      temperature: 0.7,
    });

    const description = response.choices[0].message.content.trim();
    res.json({ description });
  } catch (err) {
    console.error('AI description error:', err);
    if (err.message.includes('API key')) {
      return res.status(503).json({ error: 'AI feature not configured' });
    }
    res.status(500).json({ error: 'Failed to generate description' });
  }
};

// AI Feature: Suggest best meeting times based on availability patterns
exports.suggestBestTimes = async (req, res) => {
  try {
    const { availableSlots, guestTimezone, purpose } = req.body;

    if (!availableSlots || availableSlots.length === 0) {
      return res.json({ suggestions: [], reason: 'No available slots found' });
    }

    const openai = getOpenAIClient();

    const slotsText = availableSlots
      .slice(0, 20) // limit for prompt size
      .map((s) => `${new Date(s.start).toLocaleString('en-US', { timeZone: guestTimezone })}`)
      .join('\n');

    const prompt = `Given these available meeting slots (in ${guestTimezone}):
${slotsText}

${purpose ? `Meeting purpose: ${purpose}` : ''}

Suggest the top 3 best meeting times from this list, considering:
- Business hours preference (9am-5pm)
- Mid-week preference (Tue-Thu)
- Not too early (before 9am) or late (after 6pm)
- Morning slots for strategy, afternoon for reviews

Respond with a JSON array of exactly 3 objects: [{"slot": "ISO datetime string from the list", "reason": "brief reason"}]
Only use slots from the provided list. Return ONLY valid JSON, no markdown.`;

    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 300,
      temperature: 0.3,
    });

    let suggestions = [];
    try {
      const content = response.choices[0].message.content.trim();
      suggestions = JSON.parse(content);
    } catch (parseErr) {
      // Fallback: return first 3 available slots
      suggestions = availableSlots.slice(0, 3).map((s) => ({
        slot: s.start,
        reason: 'Available time slot',
      }));
    }

    res.json({ suggestions });
  } catch (err) {
    console.error('AI suggest error:', err);
    if (err.message.includes('API key')) {
      return res.status(503).json({ error: 'AI feature not configured' });
    }
    res.status(500).json({ error: 'Failed to suggest times' });
  }
};
