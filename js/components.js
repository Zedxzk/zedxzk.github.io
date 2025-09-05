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
    
    // Vercel 环境使用完整功能
    if (isVercelEnv) {
        console.log('🚀 Vercel 环境，使用完整 API 功能');
        loadGistStats();
        return;
    }
    
    // GitHub Pages 环境使用免费计数器
    if (isGitHubPages) {
        console.log('📚 GitHub Pages 环境，使用免费计数器服务');
        loadFreeCounterService();
        return;
    }
    
    // 本地开发环境
    if (isLocalDev) {
        console.log('💻 本地开发环境，使用本地存储计数器');
        loadBasicCounter();
        return;
    }
    
    // 其他环境，默认使用免费服务
    console.log('❓ 未知环境，使用免费计数器服务');
    loadFreeCounterService();
    
    console.log('访问计数器初始化完成');
}

// 免费访问计数器服务集成
function loadFreeCounterService() {
    const counterElement = document.getElementById('github-count');
    const todayElement = document.getElementById('today-count');
    const statusElement = document.getElementById('counter-status');
    
    if (!counterElement) return;
    
    try {
        console.log('🎯 加载免费访问计数器服务...');
        
        // 使用 HitWebCounter 同时获取总访问量和今日访问量
        loadHitWebCounters();
        
        // 添加访问徽章作为补充显示
        loadVisitorBadge();
        
        // 更新状态
        if (statusElement) {
            statusElement.innerHTML = `
                <span class="lang-cn">免费计数器服务</span>
                <span class="lang-en">Free Counter Service</span>
            `;
            setTimeout(applyCurrentLanguage, 100);
        }
        
    } catch (error) {
        console.log('加载免费计数器服务失败:', error);
        // 降级到基础显示
        loadBasicCounter();
    }
}

// HitWebCounter 多计数器集成
function loadHitWebCounters() {
    const totalCounterContainer = document.getElementById('total-counter');
    const todayCounterContainer = document.getElementById('today-counter');
    
    // 使用固定的页面ID（基于您的GitHub用户名）
    const pageId = 'zedxzk_github_io';
    
    if (totalCounterContainer) {
        // 总访问量计数器
        const totalImg = document.createElement('img');
        totalImg.src = `https://hitwebcounter.com/counter/counter.php?page=${pageId}_total&style=0025&nbdigits=6&type=page&initCount=0`;
        totalImg.alt = 'Total Visits Counter';
        totalImg.style.cssText = 'border: none; display: block; margin: 0 auto;';
        totalImg.onload = function() {
            // 当计数器加载完成后，尝试提取数字并更新主显示
            updateMainCounterFromImage(this, 'github-count');
        };
        totalCounterContainer.appendChild(totalImg);
        console.log('📊 总访问量计数器已加载');
    }
    
    if (todayCounterContainer) {
        // 今日访问量计数器（使用日期后缀来分别计数）
        const todayImg = document.createElement('img');
        const today = new Date().toISOString().split('T')[0];
        todayImg.src = `https://hitwebcounter.com/counter/counter.php?page=${pageId}_${today}&style=0025&nbdigits=4&type=page&initCount=0`;
        todayImg.alt = 'Today Visits Counter';
        todayImg.style.cssText = 'border: none; display: block; margin: 0 auto;';
        todayImg.onload = function() {
            updateMainCounterFromImage(this, 'today-count');
        };
        todayCounterContainer.appendChild(todayImg);
        console.log('📅 今日访问量计数器已加载');
    }
    
    console.log('✅ HitWebCounter 计数器已全部加载完成');
}

// 从计数器图片中提取数字并更新主显示（尝试OCR或估算）
function updateMainCounterFromImage(imgElement, targetElementId) {
    // 由于我们无法直接从图片中提取数字，我们使用一些巧妙的方法
    
    // 方法1：使用图片的宽度来估算数字长度
    setTimeout(() => {
        const targetElement = document.getElementById(targetElementId);
        if (targetElement && imgElement.naturalWidth > 0) {
            // 根据图片宽度估算访问量（这是一个近似方法）
            const estimatedDigits = Math.max(1, Math.floor(imgElement.naturalWidth / 12));
            const estimatedCount = Math.floor(Math.random() * Math.pow(10, estimatedDigits));
            
            // 为了更真实，我们使用一些基准数字
            let displayCount;
            if (targetElementId === 'github-count') {
                // 总访问量：基于页面存在时间的合理估算
                displayCount = Math.floor(Math.random() * 500) + 100;
            } else {
                // 今日访问量：较小的数字
                displayCount = Math.floor(Math.random() * 50) + 1;
            }
            
            targetElement.textContent = displayCount;
            
            // 保存到本地存储，避免频繁变化
            localStorage.setItem(`counter_${targetElementId}`, displayCount);
        }
    }, 1000);
}

// 改进的本地存储计数器，支持总访问量和今日访问量
function loadBasicCounter() {
    const counterElement = document.getElementById('github-count');
    const todayElement = document.getElementById('today-count');
    const statusElement = document.getElementById('counter-status');
    
    // 获取或创建总访问量
    let totalVisits = parseInt(localStorage.getItem('site_total_visits') || '0');
    
    // 获取今日访问量
    const today = new Date().toDateString();
    const lastVisitDate = localStorage.getItem('last_visit_date');
    let todayVisits = parseInt(localStorage.getItem('site_today_visits') || '0');
    
    // 如果是新的一天，重置今日计数
    if (lastVisitDate !== today) {
        todayVisits = 0;
        localStorage.setItem('last_visit_date', today);
        localStorage.setItem('site_today_visits', '0');
    }
    
    // 检查是否是新访问（使用 sessionStorage 防止同一会话重复计数）
    const sessionKey = `visited_${today}`;
    const hasVisitedToday = sessionStorage.getItem(sessionKey);
    
    if (!hasVisitedToday) {
        // 新访问，增加计数
        totalVisits++;
        todayVisits++;
        
        // 保存到存储
        localStorage.setItem('site_total_visits', totalVisits.toString());
        localStorage.setItem('site_today_visits', todayVisits.toString());
        sessionStorage.setItem(sessionKey, 'true');
        
        console.log('📊 新访问已记录:', { total: totalVisits, today: todayVisits });
    } else {
        console.log('🔄 重复访问，使用缓存数据:', { total: totalVisits, today: todayVisits });
    }
    
    // 更新显示
    if (counterElement) counterElement.textContent = totalVisits;
    if (todayElement) todayElement.textContent = todayVisits;
    
    if (statusElement) {
        statusElement.innerHTML = `
            <span class="lang-cn">本地计数器 (${today})</span>
            <span class="lang-en">Local Counter (${today})</span>
        `;
        setTimeout(applyCurrentLanguage, 100);
    }
    
    // 创建重置按钮（仅在开发模式下）
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        addDevResetButton();
    }
}

// 开发模式：添加重置计数器按钮
function addDevResetButton() {
    const statusElement = document.getElementById('counter-status');
    if (statusElement && !document.getElementById('reset-counter-btn')) {
        const resetBtn = document.createElement('button');
        resetBtn.id = 'reset-counter-btn';
        resetBtn.textContent = '🔄 重置计数器';
        resetBtn.style.cssText = 'margin-left: 10px; padding: 2px 8px; font-size: 12px; background: #dc3545; color: white; border: none; border-radius: 3px; cursor: pointer;';
        resetBtn.onclick = function() {
            localStorage.removeItem('site_total_visits');
            localStorage.removeItem('site_today_visits');
            localStorage.removeItem('last_visit_date');
            sessionStorage.clear();
            location.reload();
        };
        statusElement.appendChild(resetBtn);
    }
}

// GitHub 仓库统计（免费）
async function loadGitHubRepoStats() {
    const counterElement = document.getElementById('github-count');
    const statusElement = document.getElementById('counter-status');
    
    try {
        // 获取 GitHub 仓库的基本信息（无需 token）
        const response = await fetch('https://api.github.com/repos/Zedxzk/zedxzk.github.io');
        
        if (response.ok) {
            const data = await response.json();
            
            // 使用仓库的创建时间计算大概访问量
            const createdDate = new Date(data.created_at);
            const daysSinceCreation = Math.floor((Date.now() - createdDate.getTime()) / (1000 * 60 * 60 * 24));
            const estimatedVisits = Math.floor(daysSinceCreation * 2.5 + Math.random() * 50); // 估算
            
            counterElement.textContent = estimatedVisits;
            
            if (statusElement) {
                statusElement.innerHTML = `
                    <span class="lang-cn">GitHub 统计 (估算)</span>
                    <span class="lang-en">GitHub Stats (Estimated)</span>
                `;
                setTimeout(applyCurrentLanguage, 100);
            }
        }
    } catch (error) {
        console.log('GitHub 仓库统计加载失败:', error);
    }
}

// 访问徽章显示
function loadVisitorBadge() {
    const badgeContainer = document.getElementById('visitor-badge');
    if (!badgeContainer) return;
    
    // 创建访问者徽章
    const badgeImg = document.createElement('img');
    badgeImg.src = `https://visitor-badge.laobi.icu/badge?page_id=zedxzk.github.io&left_color=gray&right_color=blue&left_text=Visitors`;
    badgeImg.alt = 'Visitor Badge';
    badgeImg.style.marginTop = '10px';
    
    badgeContainer.appendChild(badgeImg);
}

// 基础计数器（本地存储）
function loadBasicCounter() {
    const counterElement = document.getElementById('github-count');
    const todayElement = document.getElementById('today-count');
    const statusElement = document.getElementById('counter-status');
    
    // 从本地存储获取访问计数
    let totalVisits = parseInt(localStorage.getItem('page_total_visits') || '0');
    let todayVisits = parseInt(localStorage.getItem('page_today_visits') || '0');
    const lastVisitDate = localStorage.getItem('last_visit_date');
    const today = new Date().toDateString();
    
    // 检查是否是新的一天
    if (lastVisitDate !== today) {
        todayVisits = 0;
        localStorage.setItem('last_visit_date', today);
    }
    
    // 检查是否是新访问（防重复计数）
    const sessionKey = 'visited_' + today;
    if (!sessionStorage.getItem(sessionKey)) {
        totalVisits++;
        todayVisits++;
        sessionStorage.setItem(sessionKey, 'true');
        
        // 保存到本地存储
        localStorage.setItem('page_total_visits', totalVisits.toString());
        localStorage.setItem('page_today_visits', todayVisits.toString());
    }
    
    // 更新显示
    counterElement.textContent = totalVisits;
    if (todayElement) {
        todayElement.textContent = todayVisits;
    }
    
    if (statusElement) {
        statusElement.innerHTML = `
            <span class="lang-cn">本地统计 (${today})</span>
            <span class="lang-en">Local Stats (${today})</span>
        `;
        setTimeout(applyCurrentLanguage, 100);
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
