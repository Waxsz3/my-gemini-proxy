const axios = require('axios');

exports.handler = async (event) => {
  // 提前定义可能用到的变量，避免未定义错误
  let modelId;
  let formattedModelId;

  if (event.httpMethod!== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: '只支持POST请求' }) };
  }

  try {
    // 解析请求参数
    const requestBody = JSON.parse(event.body);
    // 从解析结果中获取参数，确保变量被定义
    modelId = requestBody.modelId || "gemini-pro";
    const { prompt, apiKey } = requestBody;
    
    if (!apiKey ||!prompt) {
      return { statusCode: 400, body: JSON.stringify({ error: '缺少参数' }) };
    }

    // 处理modelId格式
    formattedModelId = modelId.startsWith('models/')? modelId : `models/${modelId}`;

    // 构建API地址（使用v1版本）
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
    // 此时modelId已在函数顶部定义，即使解析失败也不会报错
    const errorDetails = {
      message: error.message,
      status: error.response?.status,
      url: error.config?.url,
      modelId: modelId || '解析请求体时出错，未获取到modelId'
    };
    return {
      statusCode: error.response?.status || 500,
      body: JSON.stringify({ error: '代理请求失败', details: errorDetails })
    };
  }
};
    