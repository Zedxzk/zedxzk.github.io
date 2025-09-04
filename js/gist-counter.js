// GitHub Gist 访问计数器 - 直接调用GitHub API
class GistCounter {
    
    constructor(gistId, githubToken) {
        this.gistId = gistId;
        this.token = githubToken;
        this.apiUrl = `https://api.github.com/gists/${gistId}`;
        this.filename = 'visitor-count.json';
        
        // 防重复访问 - 使用sessionStorage
        this.sessionKey = 'gist_visited_today';
    }
    
    // 检查今天是否已经计数
    hasVisitedToday() {
        const today = new Date().toDateString();
        const lastVisit = sessionStorage.getItem(this.sessionKey);
        return lastVisit === today;
    }
    
    // 标记今天已访问
    markVisitedToday() {
        const today = new Date().toDateString();
        sessionStorage.setItem(this.sessionKey, today);
    }
    
    // 获取当前访问计数（不增加计数）
    async getCurrentCount() {
        try {
            const response = await fetch(this.apiUrl, {
                headers: {
                    'Authorization': `token ${this.token}`,
                    'Accept': 'application/vnd.github.v3+json'
                }
            });
            
            if (!response.ok) {
                throw new Error(`GitHub API error: ${response.status}`);
            }
            
            const gist = await response.json();
            const content = gist.files[this.filename]?.content;
            
            if (content) {
                const data = JSON.parse(content);
                return data;
            } else {
                // 如果文件不存在，返回初始数据
                return {
                    total_visits: 0,
                    today_visits: 0,
                    last_updated: new Date().toISOString().split('T')[0],
                    daily_stats: {}
                };
            }
        } catch (error) {
            console.error('获取Gist数据失败:', error);
            return null;
        }
    }
    
    // 更新访问计数
    async incrementCount() {
        try {
            // 如果今天已经访问过，只获取数据不增加计数
            if (this.hasVisitedToday()) {
                console.log('今天已经计数过了，跳过');
                return await this.getCurrentCount();
            }
            
            const currentData = await this.getCurrentCount();
            if (!currentData) return null;
            
            const today = new Date().toISOString().split('T')[0];
            
            // 更新计数
            const updatedData = {
                total_visits: currentData.total_visits + 1,
                today_visits: today === currentData.last_updated ? 
                    (currentData.today_visits + 1) : 1,
                last_updated: today,
                daily_stats: {
                    ...currentData.daily_stats,
                    [today]: (currentData.daily_stats[today] || 0) + 1
                }
            };
            
            // 更新Gist
            const response = await fetch(this.apiUrl, {
                method: 'PATCH',
                headers: {
                    'Authorization': `token ${this.token}`,
                    'Accept': 'application/vnd.github.v3+json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    files: {
                        [this.filename]: {
                            content: JSON.stringify(updatedData, null, 2)
                        }
                    }
                })
            });
            
            if (!response.ok) {
                throw new Error(`GitHub API update error: ${response.status}`);
            }
            
            // 标记今天已访问
            this.markVisitedToday();
            
            console.log('访问计数更新成功:', updatedData);
            return updatedData;
            
        } catch (error) {
            console.error('更新Gist计数失败:', error);
            return null;
        }
    }
    
    // 获取最近30天的访问量
    getMonthlyVisits(data) {
        if (!data.daily_stats) return 0;
        
        const today = new Date();
        let monthlyTotal = 0;
        
        for (let i = 0; i < 30; i++) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];
            
            monthlyTotal += data.daily_stats[dateStr] || 0;
        }
        
        return monthlyTotal;
    }
}

// 初始化Gist计数器
async function initGistCounter() {
    const counterElement = document.getElementById('github-count');
    const statusElement = document.getElementById('counter-status');
    
    if (!counterElement) return;
    
    // 在本地开发模式下跳过
    if (window.location.hostname === '127.0.0.1' || 
        window.location.hostname === 'localhost' || 
        window.location.port === '5500') {
        console.log('本地开发模式，跳过Gist计数器');
        counterElement.textContent = '--';
        if (statusElement) {
            statusElement.innerHTML = '<span class="lang-cn">本地开发模式</span><span class="lang-en">Local dev mode</span>';
        }
        return;
    }
    
    // 简化方案：直接调用GitHub API
    const GIST_ID = 'f43cb9d745fd37f6403fdc480ffcdff8';
    const GITHUB_TOKEN = localStorage.getItem('github_token');
    
    // 如果没有token，使用fallback方案
    if (!GITHUB_TOKEN) {
        console.log('未配置GitHub token，使用CountAPI作为fallback');
        counterElement.textContent = '...';
        
        try {
            // 使用CountAPI作为简单的计数器
            const response = await fetch('https://api.countapi.xyz/hit/zedxzk.github.io/visits');
            const data = await response.json();
            counterElement.textContent = data.value;
            if (statusElement) {
                statusElement.innerHTML = '<span class="lang-cn">访问统计</span><span class="lang-en">Visit Stats</span>';
            }
        } catch (error) {
            counterElement.textContent = '--';
            if (statusElement) {
                statusElement.innerHTML = '<span class="lang-cn">计数失败</span><span class="lang-en">Count failed</span>';
            }
        }
        return;
    }
    
    // 有token时使用Gist
    const gistCounter = new GistCounter(GIST_ID, GITHUB_TOKEN);
    
    try {
        // 显示加载状态
        counterElement.textContent = '...';
        if (statusElement) {
            statusElement.innerHTML = '<span class="lang-cn">正在计数...</span><span class="lang-en">Counting...</span>';
        }
        
        // 增加访问计数
        const data = await gistCounter.incrementCount();
        
        if (data) {
            counterElement.textContent = data.total_visits;
            if (statusElement) {
                statusElement.innerHTML = '<span class="lang-cn">Gist统计</span><span class="lang-en">Gist Stats</span>';
            }
            console.log('Gist计数器工作正常:', data);
        } else {
            throw new Error('无法获取数据');
        }
        
    } catch (error) {
        console.error('Gist计数器失败:', error);
        counterElement.textContent = '--';
        if (statusElement) {
            statusElement.innerHTML = '<span class="lang-cn">计数失败</span><span class="lang-en">Count failed</span>';
        }
    }
}

// 手动获取统计数据（不增加计数）
async function getGistStats() {
    const GIST_ID = 'f43cb9d745fd37f6403fdc480ffcdff8';
    const GITHUB_TOKEN = localStorage.getItem('github_token');
    
    if (!GITHUB_TOKEN) {
        return null;
    }
    
    const gistCounter = new GistCounter(GIST_ID, GITHUB_TOKEN);
    return await gistCounter.getCurrentCount();
}
