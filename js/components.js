// 组件加载器
class ComponentLoader {
    static async loadComponent(elementId, componentPath) {
        try {
            const response = await fetch(componentPath);
            const html = await response.text();
            document.getElementById(elementId).innerHTML = html;
        } catch (error) {
            console.error(`Failed to load component ${componentPath}:`, error);
            // 在本地文件模式下，显示一个简化的错误提示
            const element = document.getElementById(elementId);
            if (element && window.location.protocol === 'file:') {
                element.innerHTML = `<div style="padding: 10px; color: #666; font-style: italic;">组件 ${componentPath} 无法在本地文件模式下加载</div>`;
            }
        }
    }
    
    static async loadAllComponents() {
        const components = [
            { id: 'header-container', path: 'components/header.html' },
            { id: 'sidebar-container', path: 'components/sidebar.html' },
            { id: 'about-container', path: 'components/about.html' },
            { id: 'research-container', path: 'components/research.html' },
            { id: 'publications-container', path: 'components/publications.html' },
            { id: 'teaching-container', path: 'components/teaching.html' },
            { id: 'footer-container', path: 'components/footer.html' },
            { id: "education-work-container", path: "components/education_work_exps.html" }
        ];

        // 加载所有组件
        await Promise.all(
            components.map(component => 
                this.loadComponent(component.id, component.path)
            )
        );
        
        // 所有组件加载完成后初始化语言设置
        switchLanguage('cn');
        
        // 添加平滑滚动效果
        document.querySelectorAll('.main-nav a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });
        
        // 重新处理MathJax内容
        if (window.MathJax) {
            setTimeout(function() {
                if (MathJax.typesetPromise) {
                    MathJax.typesetPromise();
                } else if (MathJax.Hub) {
                    MathJax.Hub.Queue(["Typeset", MathJax.Hub]);
                }
            }, 100);
        }
        
        // 初始化GitHub计数器
        setTimeout(function() {
            initGitHubCounter();
        }, 1000);
    }
}

// 应用当前语言设置到新添加的元素
function applyCurrentLanguage() {
    const currentLang = document.documentElement.lang === 'en' ? 'en' : 'cn';
    switchLanguage(currentLang);
}

// GitHub Pages 访问计数器
function initGitHubCounter() {
    console.log('初始化Gist访问计数器...');
    
    const counterElement = document.getElementById('github-count');
    const todayElement = document.getElementById('today-count');
    const statusElement = document.getElementById('counter-status');
    
    if (!counterElement) return;
    
    // 在本地开发模式下跳过计数器API
    if (window.location.hostname === '127.0.0.1' || window.location.hostname === 'localhost' || window.location.port === '5500') {
        console.log('本地开发模式，跳过Gist计数器');
        counterElement.textContent = '--';
        if (todayElement) todayElement.textContent = '--';
        if (statusElement) {
            statusElement.innerHTML = '<span class="lang-cn">本地开发模式</span><span class="lang-en">Local dev mode</span>';
            setTimeout(applyCurrentLanguage, 100);
        }
        return;
    }
    
    // 显示加载状态
    counterElement.textContent = '...';
    if (todayElement) todayElement.textContent = '...';
    
    // 加载Gist统计数据
    loadGistStats();
    
    console.log('Gist访问计数器初始化完成');
}

// 从GitHub Gist读取访问统计数据
async function loadGistStats() {
    const counterElement = document.getElementById('github-count');
    const todayElement = document.getElementById('today-count');
    const statusElement = document.getElementById('counter-status');
    
    if (!counterElement) return;
    
    try {
        // 使用CORS代理访问Gist原始内容
        const GIST_ID = 'f43cb9d745fd37f6403fdc480ffcdff8';
        const RAW_URL = `https://gist.githubusercontent.com/Zedxzk/${GIST_ID}/raw/gistfile1.txt`;
        const PROXY_URL = `https://api.allorigins.win/get?url=${encodeURIComponent(RAW_URL)}`;
        
        const response = await fetch(PROXY_URL, {
            headers: {
                'Accept': 'application/json'
            }
        });
        
        if (response.ok) {
            const result = await response.json();
            const content = result.contents;
            
            if (content && content.trim()) {
                const data = JSON.parse(content);
                
                // 更新显示
                counterElement.textContent = data.total_visits || 0;
                if (todayElement) {
                    todayElement.textContent = data.today_visits || 0;
                }
                
                if (statusElement) {
                    const lastUpdated = data.last_updated || '未知';
                    statusElement.innerHTML = `
                        <span class="lang-cn">Gist数据 (${lastUpdated})</span>
                        <span class="lang-en">Gist data (${lastUpdated})</span>
                    `;
                    setTimeout(applyCurrentLanguage, 100);
                }
                
                console.log('Gist统计加载成功:', data);
            } else {
                throw new Error('Gist文件内容为空');
            }
        } else {
            throw new Error(`代理访问错误: ${response.status}`);
        }
    } catch (error) {
        console.log('Gist统计加载失败:', error.message);
        
        // 显示错误状态
        counterElement.textContent = '--';
        if (todayElement) todayElement.textContent = '--';
        
        if (statusElement) {
            statusElement.innerHTML = `
                <span class="lang-cn">无法加载统计</span>
                <span class="lang-en">Failed to load stats</span>
            `;
            setTimeout(applyCurrentLanguage, 100);
        }
    }
}

// 页面加载完成后加载所有组件
document.addEventListener('DOMContentLoaded', function() {
    ComponentLoader.loadAllComponents();
});
