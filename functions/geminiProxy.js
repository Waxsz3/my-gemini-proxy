const axios = require('axios');

exports.handler = async (event) => {
  if (event.httpMethod!== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: '只支持POST请求' }) };
  }

  try {
    // 支持灵活的modelId传入方式
    const { prompt, apiKey, modelId = "gemini-pro" } = JSON.parse(event.body);
    
    if (!apiKey ||!prompt) {
      return { statusCode: 400, body: JSON.stringify({ error: '缺少参数' }) };
    }

    // 核心逻辑：自动检测并处理modelId格式
    let formattedModelId;
    if (modelId.startsWith('models/')) {
      // 如果已包含models/前缀，直接使用
      formattedModelId = modelId;
    } else {
      // 如果是纯模型名，自动添加models/前缀
      formattedModelId = `models/${modelId}`;
    }

    // 构建正确的API地址
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
    const errorDetails = {
      message: error.message,
      status: error.response?.status,
      url: error.config?.url, // 查看最终请求的URL是否正确
      originalModelId: modelId, // 原始传入的modelId
      formattedModelId: formattedModelId // 处理后的modelId
    };
    return {
      statusCode: error.response?.status || 500,
      body: JSON.stringify({ error: '代理请求失败', details: errorDetails })
    };
  }
};
    