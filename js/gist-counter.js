// GitHub Gist 公开访问计数器 - 无需token
// 专门用于读取公开Gist数据，不进行写入操作

// 从公开Gist读取访问统计数据
async function loadPublicGistStats() {
    const counterElement = document.getElementById('github-count');
    const todayElement = document.getElementById('today-count');
    const statusElement = document.getElementById('counter-status');
    
    if (!counterElement) return;
    
    try {
        // 公开访问Gist，无需token
        const GIST_ID = 'f43cb9d745fd37f6403fdc480ffcdff8';
        const response = await fetch(`https://api.github.com/gists/${GIST_ID}`, {
            headers: {
                'Accept': 'application/vnd.github.v3+json'
            }
        });
        
        if (response.ok) {
            const gist = await response.json();
            const content = gist.files['gistfile1.txt']?.content;
            
            if (content) {
                const data = JSON.parse(content);
                
                // 更新显示
                counterElement.textContent = data.total_visits || 0;
                if (todayElement) {
                    todayElement.textContent = data.today_visits || 0;
                }
                
                if (statusElement) {
                    const lastUpdated = data.last_updated || '未知';
                    statusElement.innerHTML = `
                        <span class="lang-cn">Gist数据 (${lastUpdated})</span>
                        <span class="lang-en">Gist data (${lastUpdated})</span>
                    `;
                }
                
                console.log('公开Gist统计加载成功:', data);
            } else {
                throw new Error('Gist文件内容为空');
            }
        } else {
            throw new Error(`Gist API错误: ${response.status}`);
        }
    } catch (error) {
        console.log('公开Gist统计加载失败:', error.message);
        
        // 显示错误状态
        counterElement.textContent = '--';
        if (todayElement) todayElement.textContent = '--';
        
        if (statusElement) {
            statusElement.innerHTML = `
                <span class="lang-cn">无法加载统计</span>
                <span class="lang-en">Failed to load stats</span>
            `;
        }
    }
}
