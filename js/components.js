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
        
        // 初始化Google Analytics计数器显示
        setTimeout(function() {
            initGoogleAnalyticsCounter();
        }, 2000);
        
        // 初始化GitHub计数器
        setTimeout(function() {
            initGitHubCounter();
        }, 2500);
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
    
    if (!todayCountElement || !days30CountElement || !totalCountElement) {
        // 如果元素不存在，说明组件加载失败，直接返回
        console.log('GA计数器元素未找到，可能是本地文件模式');
        return;
    }
    
    // 显示loading状态
    todayCountElement.textContent = '--';
    days30CountElement.textContent = '--';
    totalCountElement.textContent = '--';
    
    // 在本地文件模式下，显示提示信息
    if (window.location.protocol === 'file:') {
        console.log('检测到本地文件模式，API功能不可用');
        if (statusElement) {
            statusElement.innerHTML = `
                <span class="lang-cn">本地文件模式下无法连接API</span>
                <span class="lang-en">API unavailable in local file mode</span>
            `;
        }
        return;
    }
    
    // 在本地开发服务器模式下，显示提示信息并跳过API调用
    if (window.location.hostname === '127.0.0.1' || window.location.hostname === 'localhost' || window.location.port === '5500') {
        console.log('检测到本地开发模式，跳过API调用');
        if (statusElement) {
            statusElement.innerHTML = `
                <span class="lang-cn">本地开发模式 - 数据将在部署后显示</span>
                <span class="lang-en">Local dev mode - Data will show after deployment</span>
            `;
            // 确保应用当前语言设置
            setTimeout(applyCurrentLanguage, 100);
        }
        return; // 在本地开发模式下直接返回，不调用API
    }
    
    // 直接从API获取数据
    fetchGAStatsFromAPI(todayCountElement, days30CountElement, totalCountElement, statusElement);
    
    // 方法2: 确保GA跟踪代码正常工作
    if (typeof gtag !== 'undefined') {
        gtag('event', 'page_view', {
            'page_title': document.title,
            'page_location': window.location.href
        });
    }
}

// 从 Google Analytics Reporting API 直接获取数据
async function fetchGAStatsDirectly(todayCountElement, days30CountElement, totalCountElement, statusElement) {
    try {
        console.log('尝试直接从 Google Analytics API 获取数据...');
        
        // 使用 Google Analytics Reporting API v4
        const API_KEY = 'YOUR_API_KEY'; // 需要在 Google Cloud Console 获取
        const VIEW_ID = '503780674'; // 你的 GA View ID
        
        const today = new Date().toISOString().split('T')[0];
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        
        // 构建API请求URL（使用Google Analytics Reporting API）
        const requests = [
            // 今日访问
            {
                viewId: VIEW_ID,
                dateRanges: [{startDate: today, endDate: today}],
                metrics: [{expression: 'ga:sessions'}]
            },
            // 30天访问
            {
                viewId: VIEW_ID,
                dateRanges: [{startDate: thirtyDaysAgo, endDate: today}],
                metrics: [{expression: 'ga:sessions'}]
            },
            // 总访问（从2020年开始）
            {
                viewId: VIEW_ID,
                dateRanges: [{startDate: '2020-01-01', endDate: today}],
                metrics: [{expression: 'ga:sessions'}]
            }
        ];
        
        const batchRequest = {
            reportRequests: requests
        };
        
        const response = await fetch(`https://analyticsreporting.googleapis.com/v4/reports:batchGet?key=${API_KEY}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(batchRequest)
        });
        
        if (response.ok) {
            const data = await response.json();
            console.log('GA API 直接响应:', data);
            
            const reports = data.reports;
            const todayVisits = reports[0]?.data?.totals?.[0]?.values?.[0] || 0;
            const days30Visits = reports[1]?.data?.totals?.[0]?.values?.[0] || 0;
            const totalVisits = reports[2]?.data?.totals?.[0]?.values?.[0] || 0;
            
            // 更新各个计数器
            todayCountElement.textContent = todayVisits;
            days30CountElement.textContent = days30Visits;
            totalCountElement.textContent = totalVisits;
            
            if (statusElement) {
                const now = new Date().toLocaleDateString();
                statusElement.innerHTML = `
                    <span class="lang-cn">实时GA数据 (${now})</span>
                    <span class="lang-en">Real-time GA data (${now})</span>
                `;
                setTimeout(applyCurrentLanguage, 100);
            }
            
            return true;
        } else {
            throw new Error(`GA API 错误: ${response.status}`);
        }
        
    } catch (error) {
        console.log('GA API 直接访问失败:', error.message);
        // 回退到API方式
        return await fetchGAStatsFromAPI(todayCountElement, days30CountElement, totalCountElement, statusElement);
    }
}

// 从API获取GA统计数据
async function fetchGAStatsFromAPI(todayCountElement, days30CountElement, totalCountElement, statusElement) {
    try {
        console.log('从API获取GA统计数据...');
        
        // 添加时间戳避免缓存问题
        const timestamp = new Date().getTime();
        const response = await fetch(`/api/ga-stats?t=${timestamp}`, {
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
            console.log('API返回数据:', data);
            
            if (data.success && data.stats) {
                // 更新访问者数据
                todayCountElement.textContent = data.stats.todayUsers || '--';
                days30CountElement.textContent = data.stats.totalUsers || '--';
                totalCountElement.textContent = data.stats.totalPageViews || '--';
                
                if (statusElement) {
                    const updateTime = data.last_updated || '未知';
                    const timeParts = updateTime.split(' ');
                    const dateOnly = timeParts[0] || updateTime;
                    statusElement.innerHTML = `
                        <span class="lang-cn">GA数据 (${dateOnly})</span>
                        <span class="lang-en">GA data (${dateOnly})</span>
                    `;
                    
                    // 确保应用当前语言设置
                    setTimeout(applyCurrentLanguage, 100);
                }
                return true;
            } else if (data.error) {
                console.log('API错误:', data.error);
                if (statusElement) {
                    statusElement.innerHTML = `
                        <span class="lang-cn">API 配置错误</span>
                        <span class="lang-en">API Config Error</span>
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
            throw new Error(`API HTTP ${response.status}`);
        }
    } catch (error) {
        console.log('无法从API读取数据:', error.message);
        if (statusElement) {
            statusElement.innerHTML = `
                <span class="lang-cn">连接API中...</span>
                <span class="lang-en">Connecting to API...</span>
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
        const success = await fetchGAStatsFromAPI(todayCountElement, days30CountElement, totalCountElement, statusElement);
        
        if (!success) {
            // 如果API获取失败，显示错误信息
            if (statusElement) {
                statusElement.innerHTML = `
                    <span class="lang-cn">API连接失败</span>
                    <span class="lang-en">API connection failed</span>
                `;
                
                // 确保应用当前语言设置
                setTimeout(applyCurrentLanguage, 100);
            }
        }
        
    } catch (error) {
        console.log('刷新失败:', error);
        if (statusElement) {
            statusElement.innerHTML = `
                <span class="lang-cn">刷新失败</span>
                <span class="lang-en">Refresh failed</span>
            `;
            setTimeout(applyCurrentLanguage, 100);
        }
    }
}

// 检查GA数据更新（简化版）
async function checkForGAUpdates(todayCountElement, days30CountElement, totalCountElement, statusElement) {
    try {
        const success = await fetchGAStatsFromAPI(todayCountElement, days30CountElement, totalCountElement, statusElement);
        if (!success) {
            console.log('API暂时不可用');
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
    
    // 在本地开发模式下跳过计数器API
    if (window.location.hostname === '127.0.0.1' || window.location.hostname === 'localhost' || window.location.port === '5500') {
        console.log('本地开发模式，跳过GitHub计数器API');
        counterElement.textContent = '--';
        if (statusElement) {
            statusElement.innerHTML = '<span class="lang-cn">本地开发模式</span><span class="lang-en">Local dev mode</span>';
            setTimeout(applyCurrentLanguage, 100);
        }
        return;
    }
    
    // 显示加载状态
    counterElement.textContent = '--';
    
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
        console.log('计数器API不可用');
        
        if (counterElement) {
            counterElement.textContent = '--';
        }
        
        if (statusElement) {
            statusElement.innerHTML = '<span class="lang-cn">API不可用</span><span class="lang-en">API Unavailable</span>';
            
            // 确保应用当前语言设置
            setTimeout(applyCurrentLanguage, 100);
        }
    }
}

// 触发GitHub Actions更新GA统计数据
async function triggerGAStatsUpdate() {
    try {
        console.log('触发GA统计数据更新...');
        
        // 注意：这需要Personal Access Token和仓库权限
        // 暂时作为可选功能，不影响主要功能
        console.log('GA统计将在下次定时任务中更新');
        
    } catch (error) {
        console.log('触发更新失败:', error);
    }
}

// 手动强制更新GA统计数据
async function forceUpdateGAStats() {
    const statusElements = document.querySelectorAll('#ga-counter-status');
    statusElements.forEach(el => {
        if (el) {
            el.innerHTML = `
                <span class="lang-cn">正在触发后台更新...</span>
                <span class="lang-en">Triggering backend update...</span>
            `;
            setTimeout(applyCurrentLanguage, 100);
        }
    });
    
    // 触发更新
    await triggerGAStatsUpdate();
    
    // 等待一段时间后刷新页面数据
    setTimeout(async () => {
        await refreshGAStats();
    }, 3000);
}

// 页面加载完成后加载所有组件
document.addEventListener('DOMContentLoaded', function() {
    ComponentLoader.loadAllComponents();
});
