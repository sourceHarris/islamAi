"""Performance diagnostics only; does not measure semantic relevance or answer accuracy."""
import json
import platform
import statistics
import sys
import time
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / 'backend'))
import main as backend
import torch

queries = [
    'What does the Quran say about patience?',
    'How should I treat my parents?',
    'What is the importance of prayer?',
    'How can I seek forgiveness?',
    'What are the rules of fasting?',
    'What should I say before sleeping?',
    'How do I perform wudu?',
    'What does Islam teach about charity?',
    'I feel anxious and need comfort.',
    'How should I behave toward neighbours?',
    'What should I say before eating?',
    'Why should I be grateful?',
]

started = time.perf_counter()
backend._build_faiss_index()
build_seconds = time.perf_counter() - started
backend._retrieve_context(queries[0], top_k=5)  # warmup excluded
observations = []
for repeat in range(3):
    for query in queries:
        start = time.perf_counter()
        rows = backend._retrieve_context(query, top_k=5)
        observations.append({
            'query': query, 'repeat': repeat + 1,
            'latency_ms': (time.perf_counter() - start) * 1000,
            'accepted_count': len(rows),
            'citations': [r['citation'] for r in rows],
        })
latencies = sorted(r['latency_ms'] for r in observations)
result = {
    'kind': 'local retrieval performance diagnostic, not relevance evaluation',
    'python': platform.python_version(), 'platform': platform.platform(),
    'processor': platform.processor(), 'torch_version': torch.__version__,
    'torch_threads': torch.get_num_threads(),
    'embedding_model': 'sentence-transformers/all-MiniLM-L6-v2',
    'model_max_seq_length': backend._embedding_model.max_seq_length,
    'index_type': 'IndexFlatL2', 'vectors': backend._faiss_index.ntotal,
    'dimensions': backend._faiss_index.d,
    'index_build_seconds_including_model_load': build_seconds,
    'requests': len(observations), 'unique_queries': len(queries),
    'warmup_requests_excluded': 1, 'top_k': 5, 'squared_l2_threshold': 1.0,
    'latency_ms': {
        'mean': statistics.mean(latencies), 'p50': statistics.median(latencies),
        'p95_nearest_rank': latencies[__import__('math').ceil(.95 * len(latencies)) - 1],
        'min': min(latencies), 'max': max(latencies),
    },
    'observations': observations,
    'limitations': ['Single process, serial requests, CPU, warm model.',
                   'Excludes LLM, emotion classification, external APIs and database.',
                   'No human relevance labels; accepted count is not recall.'],
}
out = ROOT / 'docs' / 'evidence'
out.mkdir(parents=True, exist_ok=True)
(out / 'retrieval-benchmark.json').write_text(json.dumps(result, indent=2), encoding='utf-8')
print(json.dumps({k:v for k,v in result.items() if k != 'observations'}, indent=2))
