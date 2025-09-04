# Vercel访问计数器API

这是一个基于Vercel Serverless Functions的访问计数器解决方案，无需暴露任何token。

## 🚀 部署步骤

### 1. 创建Vercel项目

1. 访问 [Vercel](https://vercel.com)
2. 连接您的GitHub账户
3. 导入这个仓库

### 2. 设置环境变量

在Vercel项目设置中添加以下环境变量：

- `GIST_TOKEN`: 您的GitHub Personal Access Token (只需gist权限)
- `GIST_ID`: 您的Gist ID (`f43cb9d745fd37f6403fdc480ffcdff8`)

### 3. 部署

Vercel会自动部署您的项目。

## 📡 API端点

部署完成后，您的API将可用：

- `GET /api/counter` - 获取访问统计
- `POST /api/counter` - 增加访问计数

## 🔧 前端集成

将以下代码添加到您的网站中：

```javascript
// 获取并更新访问计数
async function updateVisitCounter() {
    try {
        const response = await fetch('/api/counter', { method: 'POST' });
        const data = await response.json();
        
        document.getElementById('visit-count').textContent = data.total_visits;
        document.getElementById('today-count').textContent = data.today_visits;
    } catch (error) {
        console.error('访问计数更新失败:', error);
    }
}
```

## ✅ 优势

- ✅ 无需暴露任何token
- ✅ 自动化部署
- ✅ 全球CDN加速
- ✅ 免费使用
- ✅ 安全可靠
