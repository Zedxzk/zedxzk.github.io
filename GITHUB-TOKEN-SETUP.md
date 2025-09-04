# GitHub Token 配置指南

## 概述
本项目使用GitHub Gist API来实现访问计数器功能。为了安全地管理GitHub Personal Access Token，我们使用服务器端API方案。

## 配置步骤

### 1. 创建GitHub Personal Access Token
1. 访问 [GitHub Settings > Personal access tokens](https://github.com/settings/tokens)
2. 点击 "Generate new token (classic)"
3. 设置token名称，如 "Website Gist Counter"
4. 选择权限：**只需要 `gist` 权限**
5. 点击 "Generate token"
6. **复制token并保存**（只显示一次）

### 2. 配置GitHub Repository Secrets
1. 在你的GitHub仓库中，访问 `Settings > Secrets and variables > Actions`
2. 点击 "New repository secret"
3. 名称：`GIST_TOKEN`  ⚠️ 注意是 GIST_TOKEN 不是 GIST_GITHUB_TOKEN
4. 值：粘贴你刚才创建的token
5. 点击 "Add secret"

### 3. 配置Vercel Environment Variables
1. 在Vercel项目设置中，访问 "Environment Variables"
2. 添加环境变量：
   - 名称：`GIST_TOKEN`
   - 值：你的GitHub Personal Access Token
   - 环境：Production, Preview, Development

### 4. 部署方案
本项目使用以下架构：
- **前端 (GitHub Pages)**: 静态网站托管
- **API (Vercel)**: 服务器端函数处理GitHub API调用
- **数据存储 (GitHub Gist)**: 访问计数数据存储

## API 端点
- `/api/gist-proxy` - Gist计数器API
  - `GET /api/gist-proxy?increment=false` - 获取当前计数（不增加）
  - `GET /api/gist-proxy?increment=true` - 增加计数并返回

## 本地开发
对于本地开发，你需要：

1. **设置环境变量**
   ```bash
   set GIST_TOKEN=your_token_here  # Windows
   export GIST_TOKEN=your_token_here  # Linux/Mac
   ```

2. **运行Vercel开发服务器**
   ```bash
   npm install -g vercel
   vercel dev
   ```

## 安全说明
- ✅ Token存储在服务器端环境变量中
- ✅ 前端代码不包含任何敏感信息
- ✅ 只需要最小权限（gist）
- ✅ API调用通过服务器端代理
- ❌ 绝不要将token直接写在前端代码中
- ❌ 绝不要将token提交到公共仓库

## 故障排除
如果计数器显示 "计数失败"：
1. 检查Vercel环境变量中是否正确设置了 `GIST_TOKEN`
2. 检查GitHub Secrets中是否正确设置了 `GIST_TOKEN`
3. 检查token是否有正确的gist权限
4. 检查Gist ID是否正确：`f43cb9d745fd37f6403fdc480ffcdff8`
5. 查看浏览器网络请求是否成功调用API

## 技术架构
```
用户浏览器 → GitHub Pages (静态文件)
     ↓
JavaScript → Vercel API (/api/gist-proxy)
     ↓
Python函数 → GitHub Gist API (使用GIST_TOKEN)
     ↓
返回数据 → 显示在网页上
```
