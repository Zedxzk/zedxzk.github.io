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
        cnLink.classList.add('active');
        enLink.classList.remove('active');
    } else {
        cnElements.forEach(el => el.style.display = 'none');
        enElements.forEach(el => el.style.display = '');
        document.documentElement.lang = 'en';
        cnLink.classList.remove('active');
        enLink.classList.add('active');
    }
}

// 页面加载时默认显示中文
document.addEventListener('DOMContentLoaded', function() {
    switchLanguage('cn');
});
