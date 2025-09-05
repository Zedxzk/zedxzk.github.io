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
            { id: 'talks-container', path: 'components/talks.html' },
            { id: 'projects-container', path: 'components/projects.html' },
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

// GitHub Pages 访问计数器 - 使用免费服务
function initGitHubCounter() {
    console.log('初始化访问计数器...');
    
    const counterElement = document.getElementById('github-count');
    const todayElement = document.getElementById('today-count');
    const statusElement = document.getElementById('counter-status');
    
    if (!counterElement) return;
    
    // 检测环境类型
    const isVercelEnv = window.location.hostname.includes('vercel.app') || 
                       window.location.hostname.includes('vercel.dev');
    const isGitHubPages = window.location.hostname.includes('github.io');
    const isLocalDev = window.location.hostname === '127.0.0.1' || 
                      window.location.hostname === 'localhost' || 
                      window.location.port === '5500' ||
                      window.location.protocol === 'file:';
    
    console.log(`🌍 环境检测: Vercel=${isVercelEnv}, GitHub=${isGitHubPages}, Local=${isLocalDev}`);
    
    // 如果是GitHub Pages环境，自动访问Vercel应用来触发计数
    if (isGitHubPages) {
        console.log('📡 GitHub Pages环境，自动访问Vercel应用...');
        console.log('📡 [Vercel访问] 准备触发自动访问');
        triggerVercelVisit();
    }
    
    // Vercel 环境使用完整功能
    if (isVercelEnv) {
        console.log('🚀 Vercel 环境，使用完整 API 功能');
        loadGistStats();
        return;
    }
    
    // 其他环境使用GitHub仓库统计估算
    console.log('📊 使用GitHub仓库统计估算');
    loadGitHubRepoStats();
    
    console.log('访问计数器初始化完成');
}

// GitHub 仓库统计（免费）
async function loadGitHubRepoStats() {
    const counterElement = document.getElementById('github-count');
    const todayElement = document.getElementById('today-count');
    const statusElement = document.getElementById('counter-status');
    
    try {
        console.log('🔄 从GIST获取访问统计数据...');
        
        const GIST_ID = 'f43cb9d745fd37f6403fdc480ffcdff8';
        const RAW_URL = `https://gist.githubusercontent.com/Zedxzk/${GIST_ID}/raw/gistfile1.txt`;
        
        const response = await fetch(RAW_URL);
        
        if (response.ok) {
            const content = await response.text();
            
            if (content && content.trim()) {
                const data = JSON.parse(content);
                
                // 显示数据
                counterElement.textContent = data.total_visits || 0;
                if (todayElement) {
                    todayElement.textContent = data.today_visits || 0;
                }
                
                if (statusElement) {
                    const envInfo = window.location.hostname.includes('github.io') ? 
                                  'GitHub Pages' : '外部访问';
                    statusElement.innerHTML = `
                        <span class="lang-cn">${envInfo} - GIST数据 (${data.last_updated})</span>
                        <span class="lang-en">${envInfo} - GIST Data (${data.last_updated})</span>
                    `;
                    setTimeout(applyCurrentLanguage, 100);
                }
                
                console.log('✅ GIST数据加载成功:', data);
            } else {
                throw new Error('GIST内容为空');
            }
        } else {
            throw new Error(`GIST请求失败: ${response.status}`);
        }
    } catch (error) {
        console.log('❌ GIST数据加载失败:', error.message);
        
        // 显示获取失败状态
        counterElement.textContent = '获取失败';
        if (todayElement) {
            todayElement.textContent = '获取失败';
        }
        
        if (statusElement) {
            statusElement.innerHTML = `
                <span class="lang-cn">数据获取失败</span>
                <span class="lang-en">Data Load Failed</span>
            `;
            setTimeout(applyCurrentLanguage, 100);
        }
        
        console.log('❌ 显示获取失败状态');
    }
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
                const envInfo = window.location.hostname.includes('github.io') ? 
                              'GitHub Pages' : '外部访问';
                statusElement.innerHTML = `
                    <span class="lang-cn">${envInfo} - 只读模式 (${data.last_updated})</span>
                    <span class="lang-en">${envInfo} - Read-only mode (${data.last_updated})</span>
                `;
                setTimeout(applyCurrentLanguage, 100);
            }
            
            console.log('✅ CORS代理方式加载成功（只读模式）');
        }
    } catch (error) {
        console.log('❌ CORS代理方式也失败了');
    }
}

// 演讲折叠/展开功能
function toggleTalks(category) {
    const categoryElement = document.querySelector(`.${category}-talks`) || document.querySelector('.talks-category');
    const hiddenTalks = categoryElement.querySelectorAll('.talks-hidden');
    const button = categoryElement.querySelector('.toggle-talks-btn');
    const buttonTextCn = button.querySelector('.lang-cn');
    const buttonTextEn = button.querySelector('.lang-en');
    const arrow = button.querySelector('.arrow');
    const talksList = categoryElement.querySelector('.talks-list');

    if (hiddenTalks.length > 0 && hiddenTalks[0].style.display === 'none' || hiddenTalks[0].style.display === '') {
        // 展开
        hiddenTalks.forEach(talk => talk.style.display = 'list-item');
        button.classList.add('expanded');
        buttonTextCn.textContent = '收起 BESIII 报告';
        buttonTextEn.textContent = 'Show Fewer BESIII Talks';
        // 展开后滚动到底部查看更多内容
        setTimeout(() => {
            talksList.scrollTop = talksList.scrollHeight;
        }, 100);
    } else {
        // 折叠
        hiddenTalks.forEach(talk => talk.style.display = 'none');
        button.classList.remove('expanded');
        buttonTextCn.textContent = '显示更多 BESIII 报告';
        buttonTextEn.textContent = 'Show More BESIII Talks';
        // 折叠后滚动到顶部
        talksList.scrollTop = 0;
    }
}

// GitHub Pages环境下自动访问Vercel应用
function triggerVercelVisit() {
    try {
        console.log('🔍 [Vercel访问] 开始环境检测...');
        console.log('🔍 [Vercel访问] 当前域名:', window.location.hostname);
        console.log('🔍 [Vercel访问] 当前协议:', window.location.protocol);
        console.log('🔍 [Vercel访问] 是否为GitHub Pages:', window.location.hostname.includes('github.io'));
        
        // 创建一个隐藏的iframe来访问Vercel应用
        const iframe = document.createElement('iframe');
        iframe.style.display = 'none';
        iframe.style.width = '0';
        iframe.style.height = '0';
        iframe.style.border = 'none';
        iframe.src = 'https://zedxzk-github-io.vercel.app';
        
        const startTime = Date.now();
        console.log('🚀 [Vercel访问] 创建iframe，目标URL:', iframe.src);
        console.log('🚀 [Vercel访问] 开始时间:', new Date(startTime).toISOString());
        
        // 设置超时，防止iframe加载过久
        const timeout = setTimeout(() => {
            const elapsed = Date.now() - startTime;
            console.log('⏰ [Vercel访问] 访问超时 (10秒)');
            console.log('⏰ [Vercel访问] 耗时:', elapsed + 'ms');
            console.log('⏰ [Vercel访问] 移除iframe');
            if (document.body.contains(iframe)) {
                document.body.removeChild(iframe);
            }
        }, 10000); // 10秒超时
        
        // 当iframe加载完成后移除它
        iframe.onload = function() {
            const elapsed = Date.now() - startTime;
            console.log('✅ [Vercel访问] 应用访问成功');
            console.log('✅ [Vercel访问] 耗时:', elapsed + 'ms');
            console.log('✅ [Vercel访问] 完成时间:', new Date().toISOString());
            clearTimeout(timeout);
            
            setTimeout(() => {
                console.log('🧹 [Vercel访问] 清理iframe');
                if (document.body.contains(iframe)) {
                    document.body.removeChild(iframe);
                }
            }, 1000); // 1秒后移除
        };
        
        iframe.onerror = function() {
            const elapsed = Date.now() - startTime;
            console.log('❌ [Vercel访问] 应用访问失败');
            console.log('❌ [Vercel访问] 耗时:', elapsed + 'ms');
            console.log('❌ [Vercel访问] 失败时间:', new Date().toISOString());
            clearTimeout(timeout);
            
            console.log('🧹 [Vercel访问] 清理iframe (失败)');
            if (document.body.contains(iframe)) {
                document.body.removeChild(iframe);
            }
        };
        
        // 添加到页面
        document.body.appendChild(iframe);
        console.log('📤 [Vercel访问] iframe已添加到页面');
        console.log('🔄 [Vercel访问] 等待访问结果...');
        
    } catch (error) {
        console.log('❌ [Vercel访问] 触发访问时出错:', error.message);
        console.log('❌ [Vercel访问] 错误详情:', error);
    }
}
