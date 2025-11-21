import http.server
import socketserver
import mimetypes
import os
import sys

PORT = 8000

# Ensure we are serving from the current working directory (which should be the workspace root)
# The bat file sets the CWD before calling this script.

# Register custom MIME types
mimetypes.add_type('application/json', '.mat')
mimetypes.add_type('application/json', '.anim')
mimetypes.add_type('application/json', '.prefab')
mimetypes.add_type('application/json', '.scene')
mimetypes.add_type('application/json', '.controller')
# Ensure standard types are correct
mimetypes.add_type('application/javascript', '.js')
mimetypes.add_type('text/css', '.css')

class CustomHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        # Add CORS headers for development convenience
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
        self.send_header('Pragma', 'no-cache')
        self.send_header('Expires', '0')
        super().end_headers()

    # Optional: Override log_message to reduce noise or format logs
    # def log_message(self, format, *args):
    #     pass

print(f"Starting Python HTTP Server at port {PORT}...")
print(f"Serving directory: {os.getcwd()}")
print("Press Ctrl+C to stop.")

try:
    # Use ThreadingHTTPServer if available (Python 3.7+) for better performance
    if hasattr(http.server, 'ThreadingHTTPServer'):
        ServerClass = http.server.ThreadingHTTPServer
    else:
        ServerClass = socketserver.TCPServer

    with ServerClass(("", PORT), CustomHandler) as httpd:
        httpd.serve_forever()
except KeyboardInterrupt:
    print("\nServer stopped.")
except OSError as e:
    print(f"Error: {e}")
    print("Port might be in use. Try closing other server instances.")
