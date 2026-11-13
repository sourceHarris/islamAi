const fs = require('node:fs');
const crypto = require('node:crypto');
const bytes = fs.readFileSync('backend/dataset.json');
const data = JSON.parse(bytes);
const countBy = (rows, key) => rows.reduce((a, r) => { const k = key(r); a[k] = (a[k] || 0) + 1; return a; }, {});
const words = data.map(r => r.text.trim().split(/\s+/).length).sort((a,b) => a-b);
const result = {
  records: data.length, bytes: bytes.length,
  sha256: crypto.createHash('sha256').update(bytes).digest('hex'),
  sources: countBy(data, r => r.source),
  duplicateIds: data.length - new Set(data.map(r => r.id)).size,
  duplicateTexts: data.length - new Set(data.map(r => r.text)).size,
  duplicateCitations: data.length - new Set(data.map(r => r.citation)).size,
  missingFields: data.filter(r => ['id','source','citation','text'].some(k => !r[k])).length,
  words: {min: words[0], median: words[Math.floor(data.length/2)], p95: words[Math.floor(data.length*.95)], max: words.at(-1)},
  collections: countBy(data.filter(r => r.source === 'Hadith'), r => r.citation.replace(/\s+\d.*$/, '')),
  quranDistinctVerseCoordinates: new Set(data.filter(r => r.source === 'Quran').map(r => r.citation.match(/Quran\s+(\d+:\d+)/i)?.[1]).filter(Boolean)).size,
  quranCitationsWithoutCoordinates: data.filter(r => r.source === 'Quran' && !/Quran\s+\d+:\d+/i.test(r.citation)).length,
};
fs.mkdirSync('docs/evidence', {recursive: true});
fs.writeFileSync('docs/evidence/dataset-audit.json', JSON.stringify(result, null, 2) + '\n');
console.log(JSON.stringify(result, null, 2));
