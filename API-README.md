# Google Analytics API 架构说明

## 新架构 - API方式

现在网站使用直接的API调用来获取Google Analytics数据，不再依赖JSON文件。

### 工作原理

1. **前端请求**: JavaScript代码调用 `/api/ga-stats` 端点
2. **后端处理**: Python API函数处理请求并调用Google Analytics Data API
3. **实时数据**: 直接返回最新的GA统计数据

### 文件结构

```
api/
├── ga-stats.py          # 主要API端点
└── requirements.txt     # Python依赖

js/
└── components.js        # 前端调用API的代码

vercel.json              # Vercel部署配置
```

### API响应格式

```json
{
  "today_visits": 123,
  "days30_visits": 1234,
  "total_visits": 12345,
  "metric_type": "sessions",
  "last_updated": "2025-09-04 12:00:00",
  "status": "success",
  "data_source": "Google Analytics API"
}
```

### 部署要求

1. 需要在Vercel中设置 `GA_CREDENTIALS` 环境变量
2. 凭证应为Google Cloud Service Account的JSON格式
3. Service Account需要有GA4的读取权限

### 优势

- ✅ 实时数据，无需定时任务
- ✅ 无需JSON文件管理
- ✅ 更好的错误处理
- ✅ 支持CORS跨域请求
- ✅ 自动缓存控制
