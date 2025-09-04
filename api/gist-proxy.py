import json
import os
import requests
from http.server import BaseHTTPRequestHandler
from datetime import datetime

class handler(BaseHTTPRequestHandler):
    def do_GET(self):
        # 设置CORS头
        self.send_response(200)
        self.send_header('Content-type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()
        
        try:
            # 从环境变量获取GitHub Token和Gist ID
            github_token = os.environ.get('GIST_TOKEN')
            gist_id = os.environ.get('GIST_ID', 'f43cb9d745fd37f6403fdc480ffcdff8')
            
            if not github_token:
                self.wfile.write(json.dumps({
                    'error': 'GitHub token not configured',
                    'code': 'TOKEN_MISSING'
                }).encode())
                return
            
            # 获取当前Gist数据
            gist_url = f"https://api.github.com/gists/{gist_id}"
            headers = {
                'Authorization': f'token {github_token}',
                'Accept': 'application/vnd.github.v3+json'
            }
            
            response = requests.get(gist_url, headers=headers)
            
            if response.status_code != 200:
                self.wfile.write(json.dumps({
                    'error': f'GitHub API error: {response.status_code}',
                    'code': 'API_ERROR'
                }).encode())
                return
            
            gist_data = response.json()
            filename = 'visitor-count.json'
            
            # 获取当前计数数据
            if filename in gist_data['files'] and gist_data['files'][filename]['content']:
                current_data = json.loads(gist_data['files'][filename]['content'])
            else:
                # 初始化数据
                current_data = {
                    'total_visits': 0,
                    'today_visits': 0,
                    'last_updated': datetime.now().strftime('%Y-%m-%d'),
                    'daily_stats': {}
                }
            
            # 检查是否需要增加计数（通过query参数控制）
            query_string = self.path.split('?')[1] if '?' in self.path else ''
            params = {}
            if query_string:
                for param in query_string.split('&'):
                    if '=' in param:
                        key, value = param.split('=', 1)
                        params[key] = value
            
            increment = params.get('increment', 'false').lower() == 'true'
            
            if increment:
                # 更新计数
                today = datetime.now().strftime('%Y-%m-%d')
                
                current_data['total_visits'] += 1
                
                if today == current_data['last_updated']:
                    current_data['today_visits'] += 1
                else:
                    current_data['today_visits'] = 1
                    current_data['last_updated'] = today
                
                # 更新每日统计
                if 'daily_stats' not in current_data:
                    current_data['daily_stats'] = {}
                
                current_data['daily_stats'][today] = current_data['daily_stats'].get(today, 0) + 1
                
                # 更新Gist
                update_data = {
                    'files': {
                        filename: {
                            'content': json.dumps(current_data, indent=2)
                        }
                    }
                }
                
                update_response = requests.patch(gist_url, 
                                               headers=headers, 
                                               data=json.dumps(update_data))
                
                if update_response.status_code != 200:
                    self.wfile.write(json.dumps({
                        'error': f'Failed to update Gist: {update_response.status_code}',
                        'code': 'UPDATE_ERROR'
                    }).encode())
                    return
            
            # 返回当前数据
            response_data = {
                'success': True,
                'data': current_data,
                'updated': increment
            }
            
            self.wfile.write(json.dumps(response_data).encode())
            
        except Exception as e:
            self.wfile.write(json.dumps({
                'error': str(e),
                'code': 'INTERNAL_ERROR'
            }).encode())
    
    def do_OPTIONS(self):
        # 处理CORS预检请求
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()
