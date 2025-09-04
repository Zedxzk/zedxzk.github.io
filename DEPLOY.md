# 🎓 学术主页使用指南

如果您想使用这个学术主页模板制作自己的个人网站，可以按照以下步骤进行。

## 📋 使用步骤

### 1️⃣ 获取模板
```bash
# Fork 这个仓库到您的 GitHub 账户
# 或者直接下载代码
```

### 2️⃣ 修改个人信息

编辑以下文件，替换为您的信息：
- `components/about.html` - 个人简介
- `components/research.html` - 研究方向  
- `components/publications.html` - 论文列表
- `components/education_work_exps.html` - 教育经历
- `components/teaching.html` - 教学工作

### 3️⃣ 启用网站托管

1. **启用 GitHub Pages**
   - 仓库 Settings → Pages
   - Source: Deploy from a branch
   - Branch: main

2. **访问网站**
   - https://YOUR_USERNAME.github.io

### 4️⃣ 配置访问统计（可选）

如果您想要显示真实的访问统计：

1. **设置 Google Analytics**
   - 创建 GA4 属性
   - 添加网站跟踪代码

2. **配置自动统计**
   - 创建 Google Cloud 服务账户
   - 在 GitHub 添加认证信息
   - 修改 `test.py` 中的 Property ID

## 🎯 完成！

✅ 您的学术主页现在已经上线  
✅ 可以通过 GitHub Pages 访问  
✅ 支持中英文界面切换  
✅ 在手机和电脑上都有良好体验  

## 💡 提示

- 定期更新您的研究成果和论文
- 可以添加更多个人照片到 `figs/` 文件夹
- 根据需要调整网站样式和颜色

---
⭐ 如果这个模板对您有帮助，欢迎给个星标！
