const fs = require('node:fs');
const path = require('node:path');
const Module = require('node:module');
const ts = require('typescript');
const assert = require('node:assert/strict');
const cache = new Map();
function load(file) {
  const filename = path.resolve(file);
  const code = ts.transpileModule(fs.readFileSync(filename, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true } }).outputText;
  const mod = new Module(filename);
  mod.filename = filename;
  const normal = Module.createRequire(filename);
  mod.require = id => {
    if (id === '@react-native-async-storage/async-storage') return {
      getItem: async k => cache.get(k) || null, setItem: async (k,v) => { cache.set(k,v); },
      getAllKeys: async () => [...cache.keys()], multiGet: async keys => keys.map(k => [k, cache.get(k) || null]),
      multiRemove: async keys => keys.forEach(k => cache.delete(k)),
    };
    if (id.startsWith('.') && fs.existsSync(path.resolve(path.dirname(filename), id + '.ts'))) return load(path.resolve(path.dirname(filename), id + '.ts'));
    return normal(id);
  };
  mod._compile(code, filename);
  return mod.exports;
}
(async () => {
  const results = [];
  const quran = load('services/quranApi.ts'), english = load('services/quranTranslations.ts');
  const surahs = await quran.fetchAllSurahs();
  assert.equal(surahs.length, 114);
  let global = 1;
  for (const surah of surahs) {
    const verses = await quran.fetchSurahVerses(surah.number), en = await english.fetchEnglishSurah(surah.number);
    assert.equal(verses.length, surah.numberOfAyahs);
    for (const [i, verse] of verses.entries()) {
      assert.equal(verse.number, global++); assert.equal(verse.numberInSurah, i + 1);
      assert.match(verse.text, /[\u0600-\u06ff]/); assert.match(verse.translation, /[\u0600-\u06ff]/);
      assert.ok(en.verses[i + 1]?.length);
    }
  }
  assert.equal(global - 1, 6236);
  results.push({ check: 'All 114 surahs / 6236 Arabic, Urdu, English verses contiguous and complete', pass: true });
  // Prove the Quran services also work with the network unavailable.
  const network = globalThis.fetch;
  globalThis.fetch = async () => { throw new Error('Offline test'); };
  assert.equal((await quran.fetchSurahVerses(2)).length, 286);
  assert.equal(Object.keys((await english.fetchEnglishSurah(114)).verses).length, 6);
  globalThis.fetch = network;
  results.push({ check: 'Quran works offline', pass: true });
  const hadith = load('services/hadithApi.ts'), books = await hadith.fetchHadithBooks();
  for (const book of books) {
    for (const position of [1, book.available]) {
      const result = await hadith.fetchHadiths(book.id, position, position);
      assert.equal(result.hadiths.length, 1); assert.ok(result.hadiths[0].arab.length > 10);
      assert.ok(result.hadiths[0].english?.length > 10);
      results.push({ check: book.name + (position === 1 ? ' first' : ' last') + ' narration Arabic + English', pass: true, number: result.hadiths[0].number });
      console.log(results.at(-1).check + ': OK');
    }
  }
  const page = await hadith.fetchHadiths('bukhari', 1, 20);
  assert.equal(page.hadiths.length, 20); assert.ok(page.hadiths.every(h => h.urdu));
  results.push({ check: 'Bukhari page across chapter boundary with Urdu', pass: true });
  const numbered = await hadith.fetchHadithByNumber('bukhari', 1);
  assert.equal(numbered.hadiths[0].number, 1);
  results.push({ check: 'Exact numbered lookup', pass: true });
  globalThis.fetch = async () => { throw new Error('Offline test'); };
  assert.equal((await hadith.fetchHadiths('bukhari', 1, 20)).hadiths.length, 20);
  globalThis.fetch = network;
  results.push({ check: 'Previously read Hadith chapters work offline', pass: true });
  await new Promise(resolve => setTimeout(resolve, 20));
  globalThis.fetch = async () => { throw new Error('Offline test'); };
  assert.equal((await load('services/hadithApi.ts').fetchHadiths('bukhari', 1, 20)).hadiths.length, 20);
  globalThis.fetch = network;
  results.push({ check: 'Recent Hadith chapters persist for offline reading after a service reload', pass: true });
  cache.set('@spiritual_tracking_data', 'preserved-personal-data');
  const bounded = load('services/hadithCache.ts');
  await bounded.cacheHadithChapter('hidayah_hadith_v1_test_a', 'a'.repeat(400000));
  await bounded.cacheHadithChapter('hidayah_hadith_v1_test_b', 'b'.repeat(400000));
  assert.ok([...cache].filter(([key]) => key.startsWith('hidayah_hadith_v1_')).reduce((n, [, value]) => n + value.length, 0) <= 700000);
  assert.equal(cache.get('@spiritual_tracking_data'), 'preserved-personal-data');
  results.push({ check: 'Hadith cache stays within budget without removing personal practice data', pass: true });
  await bounded.cacheHadithChapter('@spiritual_tracking_data', 'not-allowed');
  assert.equal(cache.get('@spiritual_tracking_data'), 'preserved-personal-data');
  results.push({ check: 'Hadith cache rejects keys belonging to user data', pass: true });
  fs.mkdirSync('docs/evidence', { recursive: true });
  fs.writeFileSync('docs/evidence/library-checks.json', JSON.stringify({ testedAt: new Date().toISOString(), results }, null, 2));
  console.log(results.length + ' library checks passed');
})().catch(e => { console.error(e); process.exitCode = 1; });
