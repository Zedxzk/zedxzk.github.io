// 组件加载器
class ComponentLoader {
    static async loadComponent(elementId, componentPath) {
        try {
            const response = await fetch(componentPath);
            const html = await response.text();
            document.getElementById(elementId).innerHTML = html;
        } catch (error) {
            console.error(`Failed to load component ${componentPath}:`, error);
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
        
        // 本地开发模式检测
        setTimeout(function() {
            checkLocalDevelopmentMode();
        }, 2000);
    }
}

// GitHub Pages 访问计数器
function initGitHubCounter() {
    const counterElement = document.getElementById('github-count');
    const statusElement = document.getElementById('counter-status');
    
    if (!counterElement) return;
    
    // 首先显示本地存储的计数
    let currentCount = parseInt(localStorage.getItem('githubPageViews') || '0');
    counterElement.textContent = currentCount || '--';
    
    // 尝试加载计数器API
    loadCounterAPI();
    
    console.log('GitHub计数器初始化完成');
}

// 可选：集成计数器API（备用方案）
async function loadCounterAPI() {
    const counterElement = document.getElementById('github-count');
    const statusElement = document.getElementById('counter-status');
    
    if (!counterElement) return;
    
    try {
        // 使用免费的计数器API服务
        const response = await fetch('https://api.countapi.xyz/hit/zedxzk.github.io/visits', {
            method: 'GET',
            headers: {
                'Accept': 'application/json'
            }
        });
        
        if (response.ok) {
            const data = await response.json();
            counterElement.textContent = data.value;
            
            if (statusElement) {
                statusElement.innerHTML = '<span class="lang-cn">API统计</span><span class="lang-en">API Stats</span>';
            }
            
            console.log('计数器API加载成功：', data.value);
        } else {
            throw new Error('API响应失败');
        }
    } catch (error) {
        console.log('计数器API不可用，使用本地计数器');
        
        // 回退到本地计数器
        let currentCount = parseInt(localStorage.getItem('githubPageViews') || '0') + 1;
        localStorage.setItem('githubPageViews', currentCount);
        counterElement.textContent = currentCount;
        
        if (statusElement) {
            statusElement.innerHTML = '<span class="lang-cn">本地统计</span><span class="lang-en">Local Stats</span>';
        }
    }
}

// 改进的本地开发模式检测
function checkLocalDevelopmentMode() {
    const isLocal = window.location.protocol === 'file:' || 
                   window.location.hostname === 'localhost' || 
                   window.location.hostname === '127.0.0.1' ||
                   window.location.hostname === '';
    
    const localCounter = document.getElementById('local-counter');
    const githubCounter = document.getElementById('github-counter');
    
    if (isLocal && localCounter) {
        // 本地模式：显示模拟计数器
        localCounter.style.display = 'block';
        if (githubCounter) githubCounter.style.display = 'none';
        
        // 简单的本地计数器逻辑
        let count = parseInt(localStorage.getItem('localVisitCount') || '0') + 1;
        localStorage.setItem('localVisitCount', count);
        document.getElementById('local-count').textContent = count;
        
        console.log('本地开发模式：显示模拟计数器，当前访问次数：', count);
    } else {
        // 云端模式：显示GitHub计数器
        if (githubCounter) githubCounter.style.display = 'block';
        if (localCounter) localCounter.style.display = 'none';
        
        // 初始化GitHub计数器
        initGitHubCounter();
        
        console.log('云端模式：显示GitHub访问计数器');
    }
}

// 计数器状态监控（可选，用于调试）
function monitorCounterStatus() {
    const status = {
        environment: 'unknown',
        storage: 'unknown',
        api: 'unknown',
        counter: 'unknown'
    };
    
    // 检测环境
    if (window.location.protocol === 'file:') {
        status.environment = 'local-file';
    } else if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        status.environment = 'local-server';
    } else {
        status.environment = 'cloud';
    }
    
    // 检测存储
    try {
        localStorage.setItem('test', 'test');
        localStorage.removeItem('test');
        status.storage = 'available';
    } catch (e) {
        status.storage = 'unavailable';
    }
    
    // 检测计数器
    const counterElement = document.getElementById('github-count');
    if (counterElement) {
        status.counter = counterElement.textContent;
    }
    
    console.log('计数器状态监控:', status);
    return status;
}

// 在控制台中可以调用此函数查看状态
window.checkCounterStatus = monitorCounterStatus;

// 页面加载完成后加载所有组件
document.addEventListener('DOMContentLoaded', function() {
    ComponentLoader.loadAllComponents();
});
