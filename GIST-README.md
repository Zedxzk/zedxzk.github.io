# GitHub Gist 访问计数器说明

## 简化架构 - 直接调用GitHub API

现在网站使用GitHub Gist作为数据存储，实现访问计数功能，无需服务器。

### 工作原理

1. **用户配置**: 用户在 `gist-config.html` 页面配置GitHub token
2. **本地存储**: Token安全存储在浏览器localStorage中  
3. **直接调用**: JavaScript直接调用GitHub Gist API进行读写操作
4. **实时更新**: 每次访问自动更新计数，支持防重复机制

### 文件结构

```
js/
├── gist-counter.js      # Gist计数器核心代码
└── components.js        # 前端组件加载器

gist-config.html         # Token配置页面
```

### 使用方法

1. 访问 `你的网站/gist-config.html`
2. 按照页面指引创建GitHub Personal Access Token（只需要gist权限）
3. 输入Token并测试连接
4. 返回主页即可看到访问计数

### 数据格式

Gist中存储的数据格式：
```json
{
  "total_visits": 123,
  "today_visits": 5,
  "last_updated": "2025-09-04",
  "daily_stats": {
    "2025-09-04": 5,
    "2025-09-03": 8
  }
}
```

### 特性

- ✅ 完全免费（GitHub Gist + GitHub Pages）
- ✅ 无需服务器或第三方服务
- ✅ 防重复访问（每天每用户只计数一次）
- ✅ 每日统计数据
- ✅ 本地Token存储，安全可靠
- ✅ 自动降级到CountAPI（如果没有配置Token）

### 安全说明

- Token仅存储在用户浏览器本地
- 不会发送到任何第三方服务器
- 只需要最小权限（gist）
- 可随时清除Token
