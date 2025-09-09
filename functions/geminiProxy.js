const axios = require('axios');

exports.handler = async (event) => {
  if (event.httpMethod!== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: '只支持POST请求' }) };
  }

  try {
    // 解析请求参数并设置默认modelId
    const { prompt, apiKey, modelId = "gemini-pro" } = JSON.parse(event.body);
    
    if (!apiKey ||!prompt) {
      return { statusCode: 400, body: JSON.stringify({ error: '缺少参数' }) };
    }

    // 处理modelId格式
    let formattedModelId;
    if (modelId.startsWith('models/')) {
      formattedModelId = modelId;
    } else {
      formattedModelId = `models/${modelId}`;
    }

    // 构建API地址
    const geminiApiUrl = `https://generativelanguage.googleapis.com/v1beta/${formattedModelId}:generateContent?key=${apiKey}`;
    
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
    // 确保只引用在try块之外或一定会定义的变量
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
    