const axios = require('axios');

exports.handler = async (event) => {
  if (event.httpMethod!== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: '只支持POST请求' }) };
  }

  try {
    const { prompt, apiKey, modelId = "gemini-pro" } = JSON.parse(event.body);
    
    if (!apiKey ||!prompt) {
      return { statusCode: 400, body: JSON.stringify({ error: '缺少参数' }) };
    }

    // 修正API地址：包含正确的模型ID占位符
    const geminiApiUrl = `https://generativelanguage.googleapis.com/v1beta/${modelId}:generateContent?key=${apiKey}`;
    
    const response = await axios.post(
      geminiApiUrl,
      { contents: [{ parts: [{ text: prompt }] }] }
    );

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify(response.data)
    };
  } catch (error) {
    // 增加错误详情，便于排查
    const errorDetails = {
      message: error.message,
      status: error.response?.status,
      url: error.config?.url
    };
    return {
      statusCode: error.response?.status || 500,
      body: JSON.stringify({ error: '代理请求失败', details: errorDetails })
    };
  }
};
