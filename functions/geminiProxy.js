const axios = require('axios');

exports.handler = async (event) => {
  if (event.httpMethod!== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: '只支持POST请求' }) };
  }

  try {
    // 解析参数并设置默认模型
    const { prompt, apiKey, modelId = "gemini-pro" } = JSON.parse(event.body);
    
    if (!apiKey ||!prompt) {
      return { statusCode: 400, body: JSON.stringify({ error: '缺少参数' }) };
    }

    // 处理modelId格式
    let formattedModelId = modelId.startsWith('models/')? modelId : `models/${modelId}`;

    // 关键修复：使用v1稳定版API
    const geminiApiUrl = `https://generativelanguage.googleapis.com/v1/${formattedModelId}:generateContent?key=${apiKey}`;
    
    const response = await axios.post(
      geminiApiUrl,
      { contents: [{ parts: [{ text: prompt }] }] }
    );

    return {
      statusCode: 200,
      headers: { 
        'Content-Type': 'application/json', 
        'Access-Control-Allow-Origin': '*' 
      },
      body: JSON.stringify(response.data)
    };
  } catch (error) {
    const errorDetails = {
      message: error.message,
      status: error.response?.status,
      url: error.config?.url,
      // 新增模型和API版本信息用于排查
      modelId: modelId || '未提供',
      apiVersion: 'v1'
    };
    return {
      statusCode: error.response?.status || 500,
      body: JSON.stringify({ error: '代理请求失败', details: errorDetails })
    };
  }
};
    