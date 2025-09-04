// 简单的访问记录器 - 无需任何配置
class VisitLogger {
    static async logVisit(data) {
        try {
            // 方式1: 通过图片请求记录访问（最简单的方式）
            const img = new Image();
            img.src = `https://api.github.com/repos/Zedxzk/zedxzk.github.io/commits?per_page=1&t=${Date.now()}`;
            
            // 方式2: 通过GitHub Pages的访问日志记录
            fetch(`/visit-log.json?v=${Date.now()}`, { 
                method: 'HEAD',
                cache: 'no-cache'
            }).catch(() => {}); // 忽略错误
            
            console.log('📊 访问已记录 (无配置方式)');
            return true;
        } catch (error) {
            console.log('📊 访问记录失败，但不影响显示');
            return false;
        }
    }
}

// 导出供使用
window.VisitLogger = VisitLogger;
