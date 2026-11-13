// Reproducible, validated snapshots. Never synthesize or rewrite religious text.
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const dir = path.resolve('assets/data');
async function get(url) {
  const response = await fetch(url, { signal: AbortSignal.timeout(90000) });
  if (!response.ok) throw new Error(`${response.status}: ${url}`);
  return response.json();
}
(async () => {
  fs.mkdirSync(dir, { recursive: true });
  const editions = ['quran-uthmani', 'ur.jalandhry', 'en.sahih'];
  const data = await Promise.all(editions.map(edition => get(`https://api.alquran.cloud/v1/quran/${edition}`)));
  for (const result of data) {
    if (result.data?.surahs?.length !== 114 || result.data.surahs.reduce((n, s) => n + s.ayahs.length, 0) !== 6236)
      throw new Error('Incomplete Quran edition');
  }
  const quran = data[0].data.surahs.map((surah, index) => {
    const urdu = data[1].data.surahs[index], english = data[2].data.surahs[index];
    if (surah.number !== urdu.number || surah.number !== english.number || surah.ayahs.length !== urdu.ayahs.length || surah.ayahs.length !== english.ayahs.length)
      throw new Error('Mismatched Quran surahs');
    return {
      number: surah.number, name: surah.name, englishName: surah.englishName,
      englishNameTranslation: surah.englishNameTranslation, revelationType: surah.revelationType,
      numberOfAyahs: surah.ayahs.length,
      ayahs: surah.ayahs.map((ayah, i) => {
        if (ayah.number !== urdu.ayahs[i].number || ayah.number !== english.ayahs[i].number) throw new Error('Mismatched ayah numbering');
        return { number: ayah.number, numberInSurah: ayah.numberInSurah, text: ayah.text,
          translation: urdu.ayahs[i].text, english: english.ayahs[i].text, juz: ayah.juz, page: ayah.page };
      }),
    };
  });
  const info = await get('https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1/info.min.json');
  const editionsInfo = await get('https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1/editions.min.json');
  const books = await Promise.all(Object.entries(info).map(async ([id, value]) => {
    const arabic = await get('https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1/editions/ara-' + id + '.min.json');
    const supplied = new Set(arabic.hadiths.filter(h => h.text?.trim()).map(h => h.hadithnumber));
    const entries = value.hadiths.filter(h => supplied.has(h.hadithnumber));
    return ({
    id, name: value.metadata.name, available: entries.length,
    missingArabic: value.hadiths.filter(h => !supplied.has(h.hadithnumber)).map(h => h.hadithnumber),
    languages: editionsInfo[id].collection.filter(e => ['Arabic', 'English', 'Urdu'].includes(e.language) && !e.name.endsWith('1')).map(e => ({ language: e.language, edition: e.name })),
    sections: value.metadata.sections,
    // Keep fractional numbers and variants, in the publisher's order.
    index: entries.map(h => [h.hadithnumber, h.reference.book]),
  }); }));
  for (const [filename, value] of [['quran.json', quran], ['hadith-catalogue.json', books]]) {
    const content = JSON.stringify(value);
    fs.writeFileSync(path.join(dir, filename), content, 'utf8');
    console.log(filename, Buffer.byteLength(content), 'bytes');
  }
  const manifest = {
    retrievedAt: new Date().toISOString(), quran: { surahs: 114, verses: 6236, editions,
      sources: editions.map(e => `https://api.alquran.cloud/v1/quran/${e}`) },
    hadith: { collections: books.length, source: 'https://github.com/fawazahmed0/hadith-api' },
    sha256: Object.fromEntries(['quran.json', 'hadith-catalogue.json'].map(f => [f, crypto.createHash('sha256').update(fs.readFileSync(path.join(dir, f))).digest('hex')])),
  };
  fs.writeFileSync(path.join(dir, 'manifest.json'), JSON.stringify(manifest, null, 2));
})().catch(e => { console.error(e.message); process.exitCode = 1; });
