# 🎓 奚志坤 个人学术主页

这是一个现代化的个人学术主页，展示研究成果、学术经历和教学活动，并自动统计访问量。

## ✨ 主要功能

- 📊 **访问统计**: 自动显示真实的页面访问数据
- 🌐 **双语界面**: 中英文切换，国际化展示
- 📱 **响应式设计**: 在各种设备上都有良好的浏览体验
- 🧮 **数学公式**: 支持 LaTeX 数学公式显示
- 🎨 **现代设计**: 简洁美观的学术风格界面

## 📚 页面内容

- **关于我**: 个人简介和研究兴趣
- **研究方向**: 主要研究领域和方向
- **发表论文**: 学术论文和研究成果
- **教学工作**: 教学经历和课程信息
- **教育背景**: 学习和工作经历

## � 技术特性

- 使用 Google Analytics 自动统计访问量
- GitHub Pages 免费托管
- 组件化的网页结构，便于维护
- 自动化的数据更新（每日更新访问统计）

## 📂 网站结构

```
├── components/                 # 网页各个部分
│   ├── header.html            # 页面顶部
│   ├── about.html             # 关于我
│   ├── research.html          # 研究方向
│   ├── publications.html      # 发表论文
│   ├── teaching.html          # 教学工作
│   └── education_work_exps.html # 教育与工作经历
├── js/                        # 网站功能脚本
├── figs/                      # 图片文件
├── test.py                    # 访问统计获取脚本
└── index.html                # 主页面
```

## 🌐 在线访问

网站地址：https://zedxzk.github.io

## 📊 访问统计

网站底部显示基于 Google Analytics 的真实访问统计，数据每日自动更新。

## 🛠️ 如果您想使用这个模板

1. Fork 这个项目到您的 GitHub 账户
2. 修改 `components/` 文件夹中的内容为您的信息
3. 在 GitHub 仓库设置中启用 GitHub Pages
4. 配置 Google Analytics（可选，用于访问统计）

详细说明请参考：[使用指南](DEPLOY.md)

## � 联系方式

如果您对这个学术主页模板感兴趣，欢迎使用和改进！

## 📄 许可证

MIT License - 详见 [LICENSE](LICENSE) 文件

---

📊 **学术主页**: https://zedxzk.github.io

## 🚀 部署到Vercel

这个项目现在支持Vercel部署，提供安全的访问计数API：

### 快速部署步骤：

1. **Fork项目**: Fork这个项目到您的GitHub账户
2. **连接Vercel**: 在 [Vercel](https://vercel.com) 导入这个仓库
3. **设置环境变量**: 在Vercel项目设置中添加：
   - `GIST_TOKEN`: 您的GitHub Personal Access Token (需要gist权限)
   - `GIST_ID`: 您的Gist ID
4. **部署**: Vercel会自动部署您的项目

### 优势：
- ✅ **安全**: Token保存在Vercel服务器，不会暴露
- ✅ **快速**: 全球CDN加速访问
- ✅ **免费**: Vercel提供免费托管
- ✅ **自动**: 无需手动配置触发器

详细部署说明请查看 [VERCEL_SETUP.md](VERCEL_SETUP.md)

