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
        // 使用 cors-anywhere 代理访问Gist
        const GIST_ID = 'f43cb9d745fd37f6403fdc480ffcdff8';
        const RAW_URL = `https://gist.githubusercontent.com/Zedxzk/${GIST_ID}/raw/gistfile1.txt`;
        
        // 尝试多个CORS代理
        const proxies = [
            `https://corsproxy.io/?${encodeURIComponent(RAW_URL)}`,
            `https://api.allorigins.win/get?url=${encodeURIComponent(RAW_URL)}`,
            `https://cors-anywhere.herokuapp.com/${RAW_URL}`
        ];
        
        let data = null;
        let lastError = null;
        
        for (const proxyUrl of proxies) {
            try {
                console.log('尝试代理:', proxyUrl);
                const response = await fetch(proxyUrl, {
                    headers: {
                        'Accept': 'application/json'
                    }
                });
                
                if (response.ok) {
                    let content;
                    if (proxyUrl.includes('allorigins.win')) {
                        const result = await response.json();
                        content = result.contents;
                    } else {
                        content = await response.text();
                    }
                    
                    if (content && content.trim()) {
                        data = JSON.parse(content);
                        console.log('成功获取数据:', data);
                        break;
                    }
                }
            } catch (error) {
                lastError = error;
                console.log('代理失败:', error.message);
                continue;
            }
        }
        
        if (data) {
            // 检查是否需要计数（防重复访问）
            const shouldCount = checkAndUpdateVisit();
            
            if (shouldCount) {
                // 增加访问计数
                const today = new Date().toISOString().split('T')[0];
                const isNewDay = data.last_updated !== today;
                
                console.log('📝 开始更新访问计数...');
                console.log('当前数据:', data);
                console.log('是否新的一天:', isNewDay);
                
                data.total_visits = (data.total_visits || 0) + 1;
                data.today_visits = isNewDay ? 1 : (data.today_visits || 0) + 1;
                data.last_updated = today;
                
                // 更新每日统计
                if (!data.daily_stats) data.daily_stats = {};
                data.daily_stats[today] = (data.daily_stats[today] || 0) + 1;
                
                console.log('✅ 本地计数更新成功:', {
                    total_visits: data.total_visits,
                    today_visits: data.today_visits,
                    last_updated: data.last_updated
                });
                
                // 触发GitHub Action更新Gist
                try {
                    console.log('🚀 触发GitHub Action...');
                    await triggerGitHubAction(data);
                    console.log('✅ GitHub Action触发成功！');
                } catch (actionError) {
                    console.log('❌ GitHub Action触发失败:', actionError.message);
                    console.log('⚠️ 无法更新访问统计到Gist，数据未保存');
                }
            } else {
                console.log('🔄 重复访问，跳过计数更新');
            }
            
            // 更新显示
            counterElement.textContent = data.total_visits || 0;
            if (todayElement) {
                todayElement.textContent = data.today_visits || 0;
            }
            
            if (statusElement) {
                const lastUpdated = data.last_updated || '未知';
                const countStatus = shouldCount ? '已计数' : '重复访问';
                statusElement.innerHTML = `
                    <span class="lang-cn">GitHub Action (${lastUpdated}) - ${countStatus}</span>
                    <span class="lang-en">GitHub Action (${lastUpdated}) - ${shouldCount ? 'Counted' : 'Duplicate'}</span>
                `;
                setTimeout(applyCurrentLanguage, 100);
            }
            
            console.log('Gist统计加载成功:', data);
        } else {
            throw lastError || new Error('所有代理都失败了');
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

// 触发GitHub Action更新Gist数据  
async function triggerGitHubAction(data) {
    console.log('🚀 触发GitHub Action更新Gist...');
    console.log('📝 预期更新数据:', JSON.stringify(data, null, 2));
    
    try {
        // 使用repository_dispatch触发GitHub Action workflow
        const response = await fetch('https://api.github.com/repos/Zedxzk/zedxzk.github.io/dispatches', {
            method: 'POST',
            headers: {
                'Accept': 'application/vnd.github.v3+json',
                'Content-Type': 'application/json',
                'Authorization': `token ${getGitHubToken()}`
            },
            body: JSON.stringify({
                event_type: 'update_visitor_count',
                client_payload: {
                    total_visits: data.total_visits,
                    today_visits: data.today_visits,
                    last_updated: data.last_updated,
                    daily_stats: data.daily_stats,
                    trigger_time: new Date().toISOString(),
                    user_agent: navigator.userAgent,
                    referrer: document.referrer || 'direct',
                    timestamp: Date.now()
                }
            })
        });
        
        console.log('📡 GitHub Action触发状态:', response.status);
        
        if (response.status === 204) {
            console.log('✅ GitHub Action触发成功！');
            console.log('⏳ Action将在后台更新Gist数据...');
            console.log('🔄 预计1-2分钟后Gist数据将被更新');
            return true;
        } else {
            const errorText = await response.text();
            console.log('❌ GitHub Action触发失败:', errorText);
            throw new Error(`Action触发错误: ${response.status} - ${errorText}`);
        }
    } catch (error) {
        console.log('❌ GitHub Action触发失败:', error.message);
        console.log('💡 数据将仅在本地显示，无法保存到Gist');
        // 不抛出错误，允许本地显示继续工作
        return false;
    }
}

// 获取GitHub Token（需要有repo权限的token才能触发Actions）
function getGitHubToken() {
    // 优先从localStorage获取
    const token = localStorage.getItem('github_gist_token');
    if (!token) {
        console.log('💡 需要设置GitHub token来触发Action:');
        console.log('localStorage.setItem("github_gist_token", "your_github_token_with_repo_access");');
        console.log('⚠️ Token需要有repo权限才能触发GitHub Actions');
        throw new Error('需要具有repo权限的GitHub token才能触发Action');
    }
    return token;
}

// 检查并更新访问记录（防重复计数）
function checkAndUpdateVisit() {
    const today = new Date().toDateString();
    const visitKey = 'page_visit_' + today;
    const hasVisitedToday = sessionStorage.getItem(visitKey);
    
    if (!hasVisitedToday) {
        sessionStorage.setItem(visitKey, 'true');
        console.log('🆕 新访问，已计数');
        return true;
    } else {
        console.log('🔄 今天已访问过，跳过计数');
        return false;
    }
}

// 页面加载完成后加载所有组件
document.addEventListener('DOMContentLoaded', function() {
    ComponentLoader.loadAllComponents();
});
