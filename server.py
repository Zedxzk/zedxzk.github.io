#!/usr/bin/env python3
"""
简单的HTTP服务器，用于运行模块化版本的个人主页
使用方法：
1. 在命令行中进入PersonalPage文件夹
2. 运行：python server.py
3. 在浏览器中访问：http://localhost:8000/index-modular.html
"""

import http.server
import socketserver
import webbrowser
import os

PORT = 8000

class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=os.getcwd(), **kwargs)

print(f"启动服务器在端口 {PORT}")
print(f"请在浏览器中访问: http://localhost:{PORT}/index-modular.html")
print("按 Ctrl+C 停止服务器")

try:
    with socketserver.TCPServer(("", PORT), Handler) as httpd:
        # 自动打开浏览器
        webbrowser.open(f'http://localhost:{PORT}/index-modular.html')
        httpd.serve_forever()
except KeyboardInterrupt:
    print("\n服务器已停止")
