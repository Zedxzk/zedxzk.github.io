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
                
                // 尝试将更新后的数据写回Gist（实验性功能）
                try {
                    console.log('🔄 尝试写入Gist...');
                    await updateGistData(data);
                    console.log('✅ Gist写入成功！');
                } catch (writeError) {
                    console.log('❌ Gist写入失败:', writeError.message);
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
                    <span class="lang-cn">Gist数据 (${lastUpdated}) - ${countStatus}</span>
                    <span class="lang-en">Gist data (${lastUpdated}) - ${shouldCount ? 'Counted' : 'Duplicate'}</span>
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

// 尝试更新Gist数据
async function updateGistData(data) {
    const GIST_ID = 'f43cb9d745fd37f6403fdc480ffcdff8';
    
    console.log('🔍 准备写入的数据:', JSON.stringify(data, null, 2));
    
    // 从localStorage获取GitHub token
    const GITHUB_TOKEN = localStorage.getItem('github_gist_token');
    
    if (!GITHUB_TOKEN) {
        console.log('❌ 未找到GitHub token，无法写入Gist');
        console.log('� 请在浏览器控制台运行以下命令设置token:');
        console.log('localStorage.setItem("github_gist_token", "你的GitHub_token");');
        throw new Error('缺少GitHub token认证');
    }
    
    try {
        const response = await fetch(`https://api.github.com/gists/${GIST_ID}`, {
            method: 'PATCH',
            headers: {
                'Accept': 'application/vnd.github.v3+json',
                'Content-Type': 'application/json',
                'Authorization': `token ${GITHUB_TOKEN}`
            },
            body: JSON.stringify({
                files: {
                    'gistfile1.txt': {
                        content: JSON.stringify(data, null, 2)
                    }
                }
            })
        });
        
        console.log('📡 Gist API响应状态:', response.status);
        
        if (response.ok) {
            const result = await response.json();
            console.log('✅ Gist更新成功!', result.updated_at);
            return true;
        } else {
            const errorText = await response.text();
            console.log('❌ Gist API错误响应:', errorText);
            
            if (response.status === 401) {
                console.log('🔐 token无效或过期，请重新设置');
                localStorage.removeItem('github_gist_token');
            }
            
            throw new Error(`API错误: ${response.status} - ${errorText}`);
        }
    } catch (error) {
        console.log('❌ Gist更新失败:', error.message);
        throw error;
    }
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
