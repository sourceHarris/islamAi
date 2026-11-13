const fs = require('node:fs'), catalogue = require('../assets/data/hadith-catalogue.json');
const jobs = catalogue.flatMap(book => [...new Set(book.index.map(row => row[1]))].map(section => ({
  book, section, numbers: book.index.filter(row => row[1] === section).map(row => row[0]),
})));
let index = 0;
const results = [];
async function worker() {
  while (index < jobs.length) {
    const { book, section, numbers } = jobs[index++];
    let result;
    try {
      const response = await fetch('https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1/editions/ara-' + book.id + '/sections/' + section + '.min.json', { signal: AbortSignal.timeout(30000) });
      if (!response.ok) throw Error('HTTP ' + response.status);
      const data = await response.json(), supplied = new Set(data.hadiths.filter(h => h.text?.trim()).map(h => h.hadithnumber));
      const missing = numbers.filter(number => !supplied.has(number));
      result = { book: book.id, section, count: numbers.length, missing, pass: !missing.length };
    } catch (e) { result = { book: book.id, section, pass: false, error: e.message }; }
    results.push(result);
    if (!result.pass) console.log(JSON.stringify(result));
  }
}
(async () => {
  await Promise.all(Array.from({ length: 4 }, () => worker()));
  const failures = results.filter(r => !r.pass);
  fs.writeFileSync('docs/evidence/hadith-chapter-coverage.json', JSON.stringify({ testedAt: new Date().toISOString(), chapters: jobs.length, narrations: catalogue.reduce((n,b)=>n+b.available,0), results }, null, 2));
  console.log(results.length + ' Arabic chapters checked; ' + failures.length + ' failures.');
  if (failures.length) process.exitCode = 1;
})().catch(e => { console.error(e); process.exitCode = 1; });
