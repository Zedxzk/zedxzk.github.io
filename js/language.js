// 语言切换功能
function switchLanguage(lang) {
    const cnElements = document.querySelectorAll('.lang-cn');
    const enElements = document.querySelectorAll('.lang-en');
    const cnLink = document.querySelector('.language-switcher a[onclick="switchLanguage(\'cn\')"]');
    const enLink = document.querySelector('.language-switcher a[onclick="switchLanguage(\'en\')"]');

    if (lang === 'cn') {
        cnElements.forEach(el => el.style.display = '');
        enElements.forEach(el => el.style.display = 'none');
        document.documentElement.lang = 'zh-CN';
        
        // 安全地添加/移除类，只有在元素存在时才操作
        if (cnLink) cnLink.classList.add('active');
        if (enLink) enLink.classList.remove('active');
    } else {
        cnElements.forEach(el => el.style.display = 'none');
        enElements.forEach(el => el.style.display = '');
        document.documentElement.lang = 'en';
        
        // 安全地添加/移除类，只有在元素存在时才操作
        if (cnLink) cnLink.classList.remove('active');
        if (enLink) enLink.classList.add('active');
    }
}

// 注意：语言初始化现在由 components.js 在组件加载完成后处理
