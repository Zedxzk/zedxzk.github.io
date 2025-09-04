from google.analytics.data_v1beta import BetaAnalyticsDataClient
from google.analytics.data_v1beta.types import DateRange, Metric, RunReportRequest
import json
from datetime import datetime

# 需要先下载 Google Analytics 凭证 JSON 并设置 GOOGLE_APPLICATION_CREDENTIALS 环境变量
# set GOOGLE_APPLICATION_CREDENTIALS="your_service_account.json"

# 这里填你的 GA4 property ID（不是 tracking ID）
PROPERTY_ID = "503780674"

def get_ga_stats():
    """获取 Google Analytics 统计数据"""
    try:
        client = BetaAnalyticsDataClient()

        # 获取所有时间的总访问量（使用 Google Analytics 支持的最大时间范围）
        request_total = RunReportRequest(
            property=f"properties/{PROPERTY_ID}",
            metrics=[Metric(name="screenPageViews")],  # 页面浏览次数
            date_ranges=[DateRange(start_date="2020-01-01", end_date="today")],  # 从GA4开始到现在
        )

        response_total = client.run_report(request_total)
        
        # 获取今日访问量
        request_today = RunReportRequest(
            property=f"properties/{PROPERTY_ID}",
            metrics=[Metric(name="screenPageViews")],  # 页面浏览次数
            date_ranges=[DateRange(start_date="today", end_date="today")],
        )

        response_today = client.run_report(request_today)

        # 处理总访问量数据
        total_views = 0
        if response_total.rows:
            total_views = int(response_total.rows[0].metric_values[0].value)
            print("所有时间总访问次数:", total_views)
        
        # 处理今日访问量数据
        today_views = 0
        if response_today.rows:
            today_views = int(response_today.rows[0].metric_values[0].value)
            print("今天的访问次数:", today_views)

        # 保存到 JSON 文件供前端使用
        stats = {
            "total_users": total_views,  # 显示所有时间总访问量
            "today_views": today_views,  # 今日访问量
            "period": "所有时间",
            "last_updated": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            "status": "success",
            "data_source": "Google Analytics API"
        }
        
        with open('ga-stats.json', 'w', encoding='utf-8') as f:
            json.dump(stats, f, ensure_ascii=False, indent=2)
        
        print(f"数据已保存到 ga-stats.json")
        return stats        # 如果没有数据行，创建空数据文件
        if not response.rows:
            print("今天暂无访问数据")
            stats = {
                "total_users": 0,
                "today_views": 0,
                "last_updated": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
                "status": "no_data",
                "data_source": "Google Analytics API",
                "message": "今天暂无访问数据，可能需要等待数据处理"
            }
            
            with open('ga-stats.json', 'w', encoding='utf-8') as f:
                json.dump(stats, f, ensure_ascii=False, indent=2)
            
            print(f"空数据已保存到 ga-stats.json")
            return stats
            
    except Exception as e:
        print(f"获取数据失败: {e}")
        
        # 即使出错也创建一个错误状态的JSON文件
        error_stats = {
            "total_users": 0,
            "today_views": 0,
            "last_updated": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            "status": "error",
            "error": str(e),
            "data_source": "Google Analytics API",
            "message": "数据获取失败，请检查配置"
        }
        
        try:
            with open('ga-stats.json', 'w', encoding='utf-8') as f:
                json.dump(error_stats, f, ensure_ascii=False, indent=2)
            print(f"错误信息已保存到 ga-stats.json")
        except Exception as file_error:
            print(f"无法保存错误信息到文件: {file_error}")
        
        return error_stats  # 返回错误状态而不是 None

if __name__ == "__main__":
    print("🚀 Google Analytics 数据获取脚本")
    print("=" * 50)
    
    # 检查环境变量
    import os
    cred_file = os.environ.get('GOOGLE_APPLICATION_CREDENTIALS')
    if cred_file:
        print(f"✅ 认证文件: {cred_file}")
    else:
        print("⚠️ 未设置 GOOGLE_APPLICATION_CREDENTIALS 环境变量")
    
    print(f"🎯 Property ID: {PROPERTY_ID}")
    print()
    
    result = get_ga_stats()
    
    if result:
        print("\n📊 结果摘要:")
        print(f"   状态: {result.get('status', 'unknown')}")
        print(f"   总访问量: {result.get('total_users', 0)}")
        print(f"   今日访问: {result.get('today_views', 0)}")
        print(f"   更新时间: {result.get('last_updated', 'N/A')}")
        
        if result.get('status') == 'success':
            print("✅ 数据获取成功！")
        elif result.get('status') == 'no_data':
            print("ℹ️ 暂无访问数据")
        else:
            print("❌ 数据获取失败")
    else:
        print("❌ 脚本执行失败")
