import json
import urllib.request
import urllib.error

data = {
    'model': 'qwen2:0.5b',
    'prompt': 'hello',
    'stream': False
}

try:
    req = urllib.request.Request('http://localhost:11434/api/generate', data=json.dumps(data).encode('utf-8'), headers={'Content-Type': 'application/json'})
    with urllib.request.urlopen(req) as response:
        print("Success:", response.read().decode())
except urllib.error.HTTPError as e:
    print('HTTP Error:', e.code)
    try:
        print(e.read().decode())
    except Exception:
        pass
except Exception as e:
    print('Error:', e)
