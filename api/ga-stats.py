from http.server import BaseHTTPRequestHandler
import os
import json
from google.analytics.data_v1beta import BetaAnalyticsDataClient
from google.analytics.data_v1beta.types import (
    DateRange,
    Dimension,
    Metric,
    RunReportRequest,
)
from google.oauth2 import service_account
import tempfile
from datetime import datetime, timedelta

class handler(BaseHTTPRequestHandler):
    def do_GET(self):
        """
        Vercel serverless function to get Google Analytics data
        """
        # Set CORS headers
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.send_header('Content-Type', 'application/json')
        self.end_headers()
        
        try:
            # Get GA credentials from environment variable
            ga_credentials = os.environ.get('GA_CREDENTIALS')
            if not ga_credentials:
                error_response = json.dumps({
                    'success': False,
                    'error': 'GA_CREDENTIALS environment variable not set'
                })
                self.wfile.write(error_response.encode())
                return
            
            # Write credentials to temporary file
            with tempfile.NamedTemporaryFile(mode='w', suffix='.json', delete=False) as f:
                f.write(ga_credentials)
                credentials_path = f.name
            
            # Create credentials object
            credentials = service_account.Credentials.from_service_account_file(
                credentials_path,
                scopes=['https://www.googleapis.com/auth/analytics.readonly']
            )
            
            # Initialize the client
            client = BetaAnalyticsDataClient(credentials=credentials)
            
            # Your GA4 Property ID
            property_id = "properties/503780674"
            
            # Calculate date ranges
            today = datetime.now().strftime('%Y-%m-%d')
            thirty_days_ago = (datetime.now() - timedelta(days=30)).strftime('%Y-%m-%d')
            
            # Request for today's data
            today_request = RunReportRequest(
                property=property_id,
                date_ranges=[DateRange(start_date=today, end_date=today)],
                metrics=[Metric(name="activeUsers"), Metric(name="screenPageViews")]
            )
            
            # Request for 30 days data
            month_request = RunReportRequest(
                property=property_id,
                date_ranges=[DateRange(start_date=thirty_days_ago, end_date=today)],
                metrics=[Metric(name="activeUsers"), Metric(name="screenPageViews")]
            )
            
            # Request for total data (since 2020)
            total_request = RunReportRequest(
                property=property_id,
                date_ranges=[DateRange(start_date="2020-01-01", end_date=today)],
                metrics=[Metric(name="activeUsers"), Metric(name="screenPageViews")]
            )
            
            # Execute requests
            today_response = client.run_report(request=today_request)
            month_response = client.run_report(request=month_request)
            total_response = client.run_report(request=total_request)
            
            # Extract data
            today_users = int(today_response.rows[0].metric_values[0].value) if today_response.rows else 0
            today_views = int(today_response.rows[0].metric_values[1].value) if today_response.rows else 0
            
            month_users = int(month_response.rows[0].metric_values[0].value) if month_response.rows else 0
            month_views = int(month_response.rows[0].metric_values[1].value) if month_response.rows else 0
            
            total_users = int(total_response.rows[0].metric_values[0].value) if total_response.rows else 0
            total_views = int(total_response.rows[0].metric_values[1].value) if total_response.rows else 0
            
            # Clean up temporary file
            os.unlink(credentials_path)
            
            # Return data
            result = {
                'success': True,
                'stats': {
                    'todayUsers': today_users,
                    'todayPageViews': today_views,
                    'totalUsers': total_users,
                    'totalPageViews': total_views
                },
                'last_updated': datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
                'metric_type': 'users_and_pageviews'
            }
            
            self.wfile.write(json.dumps(result).encode())
            
        except Exception as e:
            # Clean up temporary file if it exists
            if 'credentials_path' in locals():
                try:
                    os.unlink(credentials_path)
                except:
                    pass
            
            error_response = json.dumps({
                'success': False,
                'error': f'Failed to fetch GA data: {str(e)}'
            })
            self.wfile.write(error_response.encode())
    
    def do_OPTIONS(self):
        # Handle preflight request
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()
