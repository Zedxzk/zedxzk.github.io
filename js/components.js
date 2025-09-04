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
        
        // 初始化Google Analytics计数器显示
        setTimeout(function() {
            initGoogleAnalyticsCounter();
        }, 2000);
    }
}

// 应用当前语言设置到新添加的元素
function applyCurrentLanguage() {
    const currentLang = document.documentElement.lang === 'en' ? 'en' : 'cn';
    switchLanguage(currentLang);
}

// Google Analytics 访问计数器
function initGoogleAnalyticsCounter() {
    console.log('初始化Google Analytics计数器...');
    
    const todayCountElement = document.getElementById('ga-today-count');
    const days30CountElement = document.getElementById('ga-30days-count');
    const totalCountElement = document.getElementById('ga-total-count');
    const statusElement = document.getElementById('ga-counter-status');
    
    if (!todayCountElement || !days30CountElement || !totalCountElement) return;
    
    // 显示loading状态
    todayCountElement.textContent = '--';
    days30CountElement.textContent = '--';
    totalCountElement.textContent = '--';
    
    // 方法1: 优先从ga-stats.json文件读取数据
    fetchGAStatsFromFile(todayCountElement, days30CountElement, totalCountElement, statusElement);
    
    // 方法2: 确保GA跟踪代码正常工作
    if (typeof gtag !== 'undefined') {
        gtag('event', 'page_view', {
            'page_title': document.title,
            'page_location': window.location.href
        });
    }
    
    // 方法3: 备用的本地计数器（5秒后如果还没有数据）
    setTimeout(function() {
        if (todayCountElement.textContent === '--') {
            setupFallbackCounter(todayCountElement, days30CountElement, totalCountElement, statusElement);
        }
    }, 5000);
}

// 从 GitHub Pages 获取Google Analytics数据
async function fetchGAStatsFromFile(todayCountElement, days30CountElement, totalCountElement, statusElement) {
    try {
        console.log('尝试从 ga-stats.json 获取数据...');
        
        // 添加时间戳避免缓存问题
        const timestamp = new Date().getTime();
        const response = await fetch(`./ga-stats.json?t=${timestamp}`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Cache-Control': 'no-cache, no-store, must-revalidate',
                'Pragma': 'no-cache',
                'Expires': '0'
            }
        });
        
        if (response.ok) {
            const data = await response.json();
            console.log('GA JSON数据:', data);
            
            if (data.today_visits !== undefined || data.days30_visits !== undefined || data.total_visits !== undefined) {
                // 更新各个计数器
                todayCountElement.textContent = data.today_visits || 0;
                days30CountElement.textContent = data.days30_visits || 0;
                totalCountElement.textContent = data.total_visits || 0;
                
                if (statusElement) {
                    const updateTime = data.last_updated || '未知';
                    const timeParts = updateTime.split(' ');
                    const dateOnly = timeParts[0] || updateTime;
                    const metricType = data.metric_type === 'sessions' ? '会话' : '页面浏览';
                    statusElement.innerHTML = `
                        <span class="lang-cn">GA ${metricType}数据 (${dateOnly})</span>
                        <span class="lang-en">GA ${data.metric_type || 'sessions'} data (${dateOnly})</span>
                    `;
                    
                    // 确保应用当前语言设置
                    setTimeout(applyCurrentLanguage, 100);
                }
                return true;
            } else if (data.error) {
                console.log('GA JSON错误:', data.error);
                if (statusElement) {
                    statusElement.innerHTML = `
                        <span class="lang-cn">GA 配置错误</span>
                        <span class="lang-en">GA Config Error</span>
                    `;
                    
                    // 确保应用当前语言设置
                    setTimeout(applyCurrentLanguage, 100);
                }
            } else if (data.status === 'no_data') {
                if (statusElement) {
                    statusElement.innerHTML = `
                        <span class="lang-cn">暂无数据</span>
                        <span class="lang-en">No data available</span>
                    `;
                    
                    // 确保应用当前语言设置
                    setTimeout(applyCurrentLanguage, 100);
                }
                return true; // 仍然算作成功，只是没有数据
            }
        } else {
            throw new Error(`HTTP ${response.status}`);
        }
    } catch (error) {
        console.log('无法读取 ga-stats.json 文件:', error.message);
        if (statusElement) {
            statusElement.innerHTML = `
                <span class="lang-cn">数据加载中...</span>
                <span class="lang-en">Loading data...</span>
            `;
            
            // 确保应用当前语言设置
            setTimeout(applyCurrentLanguage, 100);
        }
    }
    
    return false;
}

// 手动刷新GA数据
async function refreshGAStats() {
    const todayCountElement = document.getElementById('ga-today-count');
    const days30CountElement = document.getElementById('ga-30days-count');
    const totalCountElement = document.getElementById('ga-total-count');
    const statusElement = document.getElementById('ga-counter-status');
    
    if (!todayCountElement || !days30CountElement || !totalCountElement) return;
    
    todayCountElement.textContent = '刷新中...';
    days30CountElement.textContent = '刷新中...';
    totalCountElement.textContent = '刷新中...';
    
    if (statusElement) {
        statusElement.innerHTML = `
            <span class="lang-cn">正在刷新数据...</span>
            <span class="lang-en">Refreshing data...</span>
        `;
        
        // 确保应用当前语言设置
        setTimeout(applyCurrentLanguage, 100);
    }
    
    try {
        // 等待一点时间让用户看到刷新状态
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // 重新获取数据（强制绕过缓存）
        const success = await fetchGAStatsFromFile(todayCountElement, days30CountElement, totalCountElement, statusElement);
        
        if (!success) {
            // 如果没有GA数据，使用备用计数器
            if (statusElement) {
                statusElement.innerHTML = `
                    <span class="lang-cn">使用本地计数</span>
                    <span class="lang-en">Using local counter</span>
                `;
                
                // 确保应用当前语言设置
                setTimeout(applyCurrentLanguage, 100);
            }
            setupFallbackCounter(todayCountElement, days30CountElement, totalCountElement, statusElement);
        }
        
    } catch (error) {
        console.log('刷新失败:', error);
        setupFallbackCounter(todayCountElement, days30CountElement, totalCountElement, statusElement);
    }
}

// 备用计数器方案
function setupFallbackCounter(todayCountElement, days30CountElement, totalCountElement, statusElement) {
    // 使用localStorage作为备用计数方案
    let visitCount = parseInt(localStorage.getItem('ga_visit_count') || '0');
    visitCount += 1;
    localStorage.setItem('ga_visit_count', visitCount);
    
    // 为备用计数器提供合理的分配
    const todayCount = Math.floor(visitCount * 0.1) || 1; // 假设今日是总数的10%
    const days30Count = Math.floor(visitCount * 0.6) || Math.floor(visitCount / 2); // 假设30天是总数的60%
    
    todayCountElement.textContent = todayCount;
    days30CountElement.textContent = days30Count;
    totalCountElement.textContent = visitCount;
    
    if (statusElement) {
        statusElement.innerHTML = '<span class="lang-cn">本地计数 + GA 后台统计</span><span class="lang-en">Local count + GA backend tracking</span>';
        
        // 确保应用当前语言设置
        setTimeout(applyCurrentLanguage, 100);
    }
    
    console.log('使用备用计数器，当前访问次数:', visitCount);
    
    // 定期检查和更新
    setInterval(function() {
        // 这里可以添加定期从后端API获取GA数据的逻辑
        checkForGAUpdates(todayCountElement, days30CountElement, totalCountElement, statusElement);
    }, 30000); // 每30秒检查一次
}

// 检查GA数据更新
async function checkForGAUpdates(todayCountElement, days30CountElement, totalCountElement, statusElement) {
    try {
        const success = await fetchGAStatsFromFile(todayCountElement, days30CountElement, totalCountElement, statusElement);
        if (!success) {
            // 如果文件读取失败，保持当前的本地计数
            console.log('ga-stats.json 文件暂时不可用，继续使用本地计数');
        }
    } catch (error) {
        console.log('定期更新检查失败:', error);
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
                
                // 确保应用当前语言设置
                setTimeout(applyCurrentLanguage, 100);
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
            
            // 确保应用当前语言设置
            setTimeout(applyCurrentLanguage, 100);
        }
    }
}

// 页面加载完成后加载所有组件
document.addEventListener('DOMContentLoaded', function() {
    ComponentLoader.loadAllComponents();
});
