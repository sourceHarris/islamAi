"""Anonymous functional smoke checks; generated answers are not human-graded."""
import argparse
import json
import time
import urllib.error
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
parser = argparse.ArgumentParser()
parser.add_argument('--output', default='docs/evidence/runtime-smoke.json',
                    help='Output JSON path relative to the project root')
args = parser.parse_args()
checks = []
for path, payload in [('/', None), ('/openapi.json', None),
                      ('/chat', {'message': '', 'user_id': 'anonymous'}),
                      ('/chat', {'message': 'Assalamu alaikum', 'user_id': 'anonymous'}),
                      ('/chat', {'message': 'What does the Quran say about patience?', 'user_id': 'anonymous'}),
                      ('/chat', {'message': 'I feel anxious and need comfort.', 'user_id': 'anonymous'})]:
    start = time.perf_counter()
    req = urllib.request.Request('http://127.0.0.1:8000' + path,
        data=json.dumps(payload).encode() if payload is not None else None,
        headers={'Content-Type': 'application/json'})
    try:
        with urllib.request.urlopen(req, timeout=120) as response:
            status, body = response.status, json.load(response)
    except urllib.error.HTTPError as exc:
        status, body = exc.code, json.loads(exc.read())
    except Exception as exc:
        status, body = None, {'error_type': type(exc).__name__}
    if path == '/openapi.json' and status == 200:
        body = {'title': body['info']['title'], 'paths': sorted(body['paths'])}
    # Avoid storing provider exception strings that could contain request URLs.
    if status is not None and status >= 500:
        body = {'detail': 'Server/provider failure; inspect local logs without publishing secrets.'}
    checks.append({'path': path, 'request': payload, 'status': status,
                   'latency_ms': (time.perf_counter() - start)*1000, 'body': body})
    print(json.dumps({k:v for k,v in checks[-1].items() if k != 'body'}), flush=True)
out = ROOT / args.output
out.parent.mkdir(parents=True, exist_ok=True)
out.write_text(json.dumps({'purpose': 'Functional smoke check, not accuracy evaluation',
                           'checks': checks}, indent=2), encoding='utf-8')
