// Vercel Serverless Function for Visit Counter
export default async function handler(req, res) {
    // 设置CORS头
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    // 处理OPTIONS请求
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    
    const GIST_TOKEN = process.env.GIST_TOKEN;
    const GIST_ID = process.env.GIST_ID || 'f43cb9d745fd37f6403fdc480ffcdff8';
    
    if (!GIST_TOKEN) {
        return res.status(500).json({ error: '服务器配置错误：缺少GIST_TOKEN' });
    }
    
    try {
        // 获取当前Gist数据
        const gistResponse = await fetch(`https://api.github.com/gists/${GIST_ID}`, {
            headers: {
                'Authorization': `token ${GIST_TOKEN}`,
                'Accept': 'application/vnd.github.v3+json'
            }
        });
        
        if (!gistResponse.ok) {
            throw new Error(`Gist API错误: ${gistResponse.status}`);
        }
        
        const gistData = await gistResponse.json();
        let currentData;
        
        try {
            currentData = JSON.parse(gistData.files['gistfile1.txt'].content);
        } catch (e) {
            // 如果解析失败，使用默认数据
            currentData = {
                total_visits: 0,
                today_visits: 0,
                last_updated: new Date().toISOString().split('T')[0],
                daily_stats: {}
            };
        }
        
        // 检查是否通过iframe访问（带有method=POST参数）
        const isIframePost = req.query.method === 'POST';
        
        // GET请求：只返回数据
        if (req.method === 'GET' && !isIframePost) {
            return res.status(200).json(currentData);
        }
        
        // POST请求或iframe POST：更新访问计数
        if (req.method === 'POST' || isIframePost) {
            const today = new Date().toISOString().split('T')[0];
            const isNewDay = currentData.last_updated !== today;
            
            // 更新访问数据
            const newData = {
                total_visits: (currentData.total_visits || 0) + 1,
                today_visits: isNewDay ? 1 : (currentData.today_visits || 0) + 1,
                last_updated: today,
                daily_stats: currentData.daily_stats || {}
            };
            
            // 更新每日统计
            newData.daily_stats[today] = (newData.daily_stats[today] || 0) + 1;
            
            // 更新Gist
            const updateResponse = await fetch(`https://api.github.com/gists/${GIST_ID}`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `token ${GIST_TOKEN}`,
                    'Accept': 'application/vnd.github.v3+json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    files: {
                        'gistfile1.txt': {
                            content: JSON.stringify(newData, null, 2)
                        }
                    }
                })
            });
            
            if (!updateResponse.ok) {
                throw new Error(`Gist更新失败: ${updateResponse.status}`);
            }
            
            return res.status(200).json({
                success: true,
                ...newData,
                message: '访问计数更新成功'
            });
        }
        
        return res.status(405).json({ error: '不支持的HTTP方法' });
        
    } catch (error) {
        console.error('API错误:', error);
        return res.status(500).json({ 
            error: '服务器错误',
            details: error.message 
        });
    }
}
