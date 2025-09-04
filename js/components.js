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
        
        // 初始化StatCounter计数器显示
        setTimeout(function() {
            initStatCounterDisplay();
        }, 2000);
    }
}

// StatCounter 计数器显示和数据提取
function initStatCounterDisplay() {
    console.log('初始化StatCounter显示...');
    
    // 等待StatCounter脚本加载
    setTimeout(function() {
        extractStatCounterData();
    }, 3000);
    
    // 设置定期检查
    setInterval(function() {
        extractStatCounterData();
    }, 10000); // 每10秒检查一次
}

// 从StatCounter提取访问数据
function extractStatCounterData() {
    const visitCountElement = document.getElementById('visit-count');
    if (!visitCountElement) return;
    
    try {
        // 方法1: 尝试从StatCounter的全局变量获取数据
        if (window.sc_counter_data) {
            visitCountElement.textContent = window.sc_counter_data.count || '--';
            console.log('从StatCounter全局变量获取数据:', window.sc_counter_data.count);
            return;
        }
        
        // 方法2: 尝试从StatCounter的img元素获取数据
        const statcounterImg = document.querySelector('.statcounter img');
        if (statcounterImg && statcounterImg.src) {
            // 从图片URL中提取计数信息
            const urlMatch = statcounterImg.src.match(/\/(\d+)\/[^\/]*$/);
            if (urlMatch && urlMatch[1]) {
                visitCountElement.textContent = urlMatch[1];
                console.log('从StatCounter图片URL提取数据:', urlMatch[1]);
                return;
            }
        }
        
        // 方法3: 使用本地存储作为备用方案
        let localCount = parseInt(localStorage.getItem('statcounter_visits') || '0');
        localCount += 1;
        localStorage.setItem('statcounter_visits', localCount);
        visitCountElement.textContent = localCount;
        console.log('使用本地存储计数:', localCount);
        
    } catch (error) {
        console.log('StatCounter数据提取失败:', error);
        visitCountElement.textContent = '--';
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

// 页面加载完成后加载所有组件
document.addEventListener('DOMContentLoaded', function() {
    ComponentLoader.loadAllComponents();
});
