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
    console.log('初始化访问计数器...');
    
    const counterElement = document.getElementById('github-count');
    const todayElement = document.getElementById('today-count');
    const statusElement = document.getElementById('counter-status');
    
    if (!counterElement) return;
    
    // 在本地开发模式下使用CORS代理
    if (window.location.hostname === '127.0.0.1' || 
        window.location.hostname === 'localhost' || 
        window.location.port === '5500' ||
        window.location.protocol === 'file:') {
        console.log('本地开发模式，使用CORS代理方式');
        counterElement.textContent = '...';
        if (todayElement) todayElement.textContent = '...';
        
        // 使用CORS代理方式
        loadGistStatsWithProxy();
        return;
    }
    
    // 生产环境：尝试Vercel API，失败则fallback到CORS代理
    counterElement.textContent = '...';
    if (todayElement) todayElement.textContent = '...';
    
    // 加载统计数据
    loadGistStats();
    
    console.log('访问计数器初始化完成');
}

// 从Vercel API读取访问统计数据
async function loadGistStats() {
    const counterElement = document.getElementById('github-count');
    const todayElement = document.getElementById('today-count');
    const statusElement = document.getElementById('counter-status');
    
    if (!counterElement) return;
    
    try {
        console.log('📡 尝试使用Vercel API获取访问统计...');
        
        // 检查是否需要计数（防重复访问）
        const shouldCount = checkAndUpdateVisit();
        
        if (shouldCount) {
            // 使用POST请求增加访问计数
            console.log('🆕 新访问，增加计数...');
            const response = await fetch('/api/counter', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            if (!response.ok) {
                throw new Error(`Vercel API不可用: ${response.status}`);
            }
            
            const data = await response.json();
            console.log('✅ 访问计数更新成功:', data);
            
            // 更新显示
            counterElement.textContent = data.total_visits || 0;
            if (todayElement) {
                todayElement.textContent = data.today_visits || 0;
            }
            
            if (statusElement) {
                statusElement.innerHTML = `
                    <span class="lang-cn">Vercel API (${data.last_updated}) - 已计数</span>
                    <span class="lang-en">Vercel API (${data.last_updated}) - Counted</span>
                `;
                setTimeout(applyCurrentLanguage, 100);
            }
            
        } else {
            // 使用GET请求只获取数据，不增加计数
            console.log('� 重复访问，只获取数据...');
            const response = await fetch('/api/counter', {
                method: 'GET'
            });
            
            if (!response.ok) {
                throw new Error(`API响应错误: ${response.status}`);
            }
            
            const data = await response.json();
            console.log('� 获取访问数据成功:', data);
            
            // 更新显示
            counterElement.textContent = data.total_visits || 0;
            if (todayElement) {
                todayElement.textContent = data.today_visits || 0;
            }
            
            if (statusElement) {
                statusElement.innerHTML = `
                    <span class="lang-cn">Vercel API (${data.last_updated}) - 重复访问</span>
                    <span class="lang-en">Vercel API (${data.last_updated}) - Duplicate</span>
                `;
                setTimeout(applyCurrentLanguage, 100);
            }
        }
        
        console.log('✅ Vercel访问统计加载完成');
        
    } catch (error) {
        console.log('❌ Vercel API访问失败:', error.message);
        console.log('🔄 切换到CORS代理方式...');
        
        // Fallback到CORS代理方式
        await loadGistStatsWithProxy();
    }
}

// 触发GitHub Action更新Gist数据  
async function triggerGitHubAction(data) {
    console.log('🚀 触发GitHub Action更新Gist...');
    console.log('📝 预期更新数据:', JSON.stringify(data, null, 2));
    
    try {
        // 首先尝试无需认证的方法 - 通过GitHub Issues记录访问
        await recordVisitViaIssue(data);
        return true;
    } catch (issueError) {
        console.log('📝 尝试备用方案：GitHub Action...');
        
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
            return false;
        }
    }
}

// 通过GitHub Issues记录访问（无需认证的备用方案）
async function recordVisitViaIssue(data) {
    console.log('📝 触发GitHub Action (PAT方法)...');
    
    try {
        // 使用您提供的方法：通过创建图片元素来触发repository_dispatch
        const img = document.createElement('img');
        img.style.display = 'none';
        img.src = 'https://api.github.com/repos/Zedxzk/zedxzk.github.io/dispatches';
        
        // 当图片加载失败时（这是预期的），触发fetch请求
        img.onerror = function() {
            fetch('https://api.github.com/repos/Zedxzk/zedxzk.github.io/dispatches', {
                method: 'POST',
                headers: {
                    'Authorization': 'token ' + getActionTriggerToken(),
                    'Content-Type': 'application/json'
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
                        referrer: document.referrer || 'direct'
                    }
                })
            }).then(response => {
                if (response.status === 204) {
                    console.log('✅ GitHub Action触发成功 (PAT方法)！');
                } else {
                    console.log('❌ GitHub Action触发失败:', response.status);
                }
            }).catch(err => {
                console.log('❌ 网络错误:', err.message);
            });
            
            this.remove(); // 移除图片元素
        };
        
        // 添加到页面以触发加载
        document.body.appendChild(img);
        
        console.log('🚀 GitHub Action触发器已设置');
        return true;
        
    } catch (error) {
        console.log('📝 PAT触发失败，转入备用方案');
        throw error; // 让它转到GitHub Action方式
    }
}

// 获取Action触发器Token
function getActionTriggerToken() {
    // 从localStorage获取Action触发token
    const token = localStorage.getItem('gh_action_trigger_token');
    if (!token) {
        console.log('💡 需要设置GitHub Action触发token:');
        console.log('localStorage.setItem("gh_action_trigger_token", "your_repo_token_here");');
        throw new Error('需要GitHub Action触发token');
    }
    return token;
}

// 获取GitHub Token（需要有repo权限的token才能触发Actions）
function getGitHubToken() {
    // 优先从localStorage获取
    const token = localStorage.getItem('github_gist_token');
    if (!token) {
        console.log('💡 GitHub Action模式需要token来触发自动更新');
        console.log('💡 如需自动保存到Gist，请设置token:');
        console.log('localStorage.setItem("github_gist_token", "your_github_token_with_repo_access");');
        console.log('⚠️ 没有token时，访问计数仍会正常显示，但不会自动保存');
        throw new Error('需要GitHub token才能触发自动保存 (可选功能)');
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

// 备用方法：使用CORS代理（仅用于本地开发）
async function loadGistStatsWithProxy() {
    const counterElement = document.getElementById('github-count');
    const todayElement = document.getElementById('today-count');
    const statusElement = document.getElementById('counter-status');
    
    try {
        console.log('🔄 使用CORS代理方式加载统计...');
        
        const GIST_ID = 'f43cb9d745fd37f6403fdc480ffcdff8';
        const RAW_URL = `https://gist.githubusercontent.com/Zedxzk/${GIST_ID}/raw/gistfile1.txt`;
        
        // 尝试多个CORS代理
        const proxies = [
            `https://corsproxy.io/?${encodeURIComponent(RAW_URL)}`,
            `https://api.allorigins.win/get?url=${encodeURIComponent(RAW_URL)}`
        ];
        
        let data = null;
        
        for (const proxyUrl of proxies) {
            try {
                const response = await fetch(proxyUrl);
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
                        break;
                    }
                }
            } catch (error) {
                continue;
            }
        }
        
        if (data) {
            // 只显示数据，不更新计数（因为无法安全地更新Gist）
            counterElement.textContent = data.total_visits || 0;
            if (todayElement) {
                todayElement.textContent = data.today_visits || 0;
            }
            
            if (statusElement) {
                statusElement.innerHTML = `
                    <span class="lang-cn">只读模式 (${data.last_updated})</span>
                    <span class="lang-en">Read-only mode (${data.last_updated})</span>
                `;
                setTimeout(applyCurrentLanguage, 100);
            }
            
            console.log('✅ CORS代理方式加载成功（只读模式）');
        }
    } catch (error) {
        console.log('❌ CORS代理方式也失败了');
    }
}
