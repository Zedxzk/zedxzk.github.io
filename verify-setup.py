#!/usr/bin/env python3
"""
GitHub Actions Secret 验证脚本
这个脚本会在 GitHub Actions 中运行，验证密钥是否正确配置
"""

import os
import json
import sys

def verify_credentials():
    """验证 Google Analytics 凭证配置"""
    print("🔍 验证 Google Analytics 凭证配置...")
    print("=" * 50)
    
    # 检查环境变量
    cred_file = os.environ.get('GOOGLE_APPLICATION_CREDENTIALS')
    print(f"📁 凭证文件路径: {cred_file}")
    
    if not cred_file:
        print("❌ GOOGLE_APPLICATION_CREDENTIALS 环境变量未设置")
        return False
    
    # 检查文件是否存在
    if not os.path.exists(cred_file):
        print(f"❌ 凭证文件不存在: {cred_file}")
        return False
    
    # 检查文件内容
    try:
        with open(cred_file, 'r') as f:
            cred_data = json.load(f)
        
        print("✅ 凭证文件存在且格式正确")
        
        # 验证必要字段
        required_fields = [
            'type', 'project_id', 'private_key', 'client_email'
        ]
        
        missing_fields = []
        for field in required_fields:
            if field not in cred_data:
                missing_fields.append(field)
        
        if missing_fields:
            print(f"❌ 缺少必要字段: {missing_fields}")
            return False
        
        print("✅ 所有必要字段都存在")
        print(f"📧 服务账户邮箱: {cred_data.get('client_email', '未知')}")
        print(f"🎯 项目ID: {cred_data.get('project_id', '未知')}")
        
        return True
        
    except json.JSONDecodeError as e:
        print(f"❌ JSON 格式错误: {e}")
        return False
    except Exception as e:
        print(f"❌ 读取文件失败: {e}")
        return False

def test_ga_connection():
    """测试 Google Analytics API 连接"""
    print("\n🌐 测试 Google Analytics API 连接...")
    print("=" * 50)
    
    try:
        from google.analytics.data_v1beta import BetaAnalyticsDataClient
        from google.auth.exceptions import DefaultCredentialsError
        
        print("✅ Google Analytics 包导入成功")
        
        # 尝试创建客户端
        client = BetaAnalyticsDataClient()
        print("✅ Analytics 客户端创建成功")
        
        return True
        
    except ImportError as e:
        print(f"❌ 包导入失败: {e}")
        print("💡 请确保安装了 google-analytics-data")
        return False
    except DefaultCredentialsError as e:
        print(f"❌ 认证失败: {e}")
        print("💡 请检查凭证文件配置")
        return False
    except Exception as e:
        print(f"❌ 连接失败: {e}")
        return False

def main():
    """主验证函数"""
    print("🧪 GitHub Actions Google Analytics 配置验证")
    print("=" * 60)
    
    # 显示环境信息
    print(f"🐍 Python 版本: {sys.version}")
    print(f"💻 运行环境: {os.environ.get('RUNNER_OS', '本地')}")
    print()
    
    success = True
    
    # 验证凭证文件
    if not verify_credentials():
        success = False
    
    # 测试 API 连接
    if not test_ga_connection():
        success = False
    
    print("\n" + "=" * 60)
    if success:
        print("🎉 所有验证通过！Google Analytics 配置正确")
        print("💡 现在可以运行 test.py 获取实际数据")
    else:
        print("❌ 验证失败，请检查配置")
        print("📚 参考: GITHUB-SECRETS-GUIDE.md")
    
    return success

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
