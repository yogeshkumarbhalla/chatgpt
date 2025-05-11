export default async function handler(req, res) {
  if (req.method !== 'POST') {
    console.error('[ERROR_CODE:METHOD_NOT_ALLOWED] Only POST requests are allowed.');
    return res.status(405).end(); // Method Not Allowed
  }

  const { prompt } = req.body;
  const backendUrl = 'https://chatgptnew-cqp3.onrender.com/api/process';

  try {
    const response = await fetch(backendUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prompt }),
    });

    let data;
    try {
      data = await response.json();
    } catch (jsonError) {
      console.error('[ERROR_CODE:INVALID_JSON]', jsonError);
      const text = await response.text();
      console.error('[ERROR_CODE:RAW_RESPONSE]', text);
      return res.status(500).json({ error: 'Backend returned invalid JSON.' });
    }

    if (!response.ok) {
      // Handle different error formats from the backend
      if (data.error) {
        console.error('[ERROR_CODE:BACKEND_ERROR_OBJECT]', data.error);
        return res.status(response.status).json({ error: data.error });
      } else if (data.prompt && typeof data.prompt === 'string') {
        console.error('[ERROR_CODE:BACKEND_ERROR_STRING]', data.prompt);
        return res.status(response.status).json({ error: data.prompt });
      } else {
        console.error('[ERROR_CODE:BACKEND_GENERIC]', data);
        return res.status(response.status).json({ error: `Server error: ${response.status}` });
      }
    }

    // Check if the response has the expected format
    if (!data.response) {
      console.error('[ERROR_CODE:MISSING_RESPONSE]', data);
      return res.status(500).json({ error: 'Invalid response format from server' });
    }

    // Success
    return res.status(200).json({ response: data.response });
  } catch (error) {
    console.error('[ERROR_CODE:API_HANDLER_EXCEPTION]', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
