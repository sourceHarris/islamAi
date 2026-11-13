const fs = require('node:fs'), path = require('node:path'), Module = require('node:module');
const assert = require('node:assert/strict'), ts = require('typescript');
const data = new Map(); let failRead = false, failWrite = false;
const filename = path.resolve('services/trackingService.ts'), mod = new Module(filename);
mod.require = id => id === '@react-native-async-storage/async-storage' ? {
  getItem: async key => { if (failRead) throw new Error('Simulated storage failure'); return data.get(key) || null; },
  setItem: async (key, value) => { if (failWrite) throw new Error('Simulated storage failure'); data.set(key, value); },
} : Module.createRequire(filename)(id);
mod._compile(ts.transpileModule(fs.readFileSync(filename, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true } }).outputText, filename);
const api = mod.exports;
(async () => {
  const results = [], today = api.getTodayDateString();
  const dateKey = d => [d.getFullYear(), String(d.getMonth()+1).padStart(2,'0'), String(d.getDate()).padStart(2,'0')].join('-');
  const yesterdayDate = new Date(); yesterdayDate.setDate(yesterdayDate.getDate()-1);
  const yesterday = dateKey(yesterdayDate);
  const oldDate = new Date(); oldDate.setDate(oldDate.getDate()-40); const old = dateKey(oldDate);
  const record = date => ({ date, prayers: api.getDefaultPrayers().map(p => ({ ...p, completed: true })), dhikr: api.getDefaultDhikr(), quranTracking: { read: true, listened: false, minutes: 20 }, customPractices: [], reflection: 'Test fixture' });
  await api.saveTodayChecklist(record(old)); await api.saveTodayChecklist(record(yesterday)); await api.saveTodayChecklist(record(today));
  assert.equal(Object.keys(await api.loadAllData()).length,3);
  results.push('Saving retains earlier records');
  const weekly = await api.getWeeklyInsights(); assert.equal(weekly.prayersCompleted,10); assert.equal(weekly.totalPrayers,35); assert.equal(weekly.daysActive,2);
  results.push('Weekly insights use the last seven calendar days');
  assert.equal((await api.loadChecklistForDate(yesterday)).date,yesterday);
  results.push('Editing a selected historical day loads that date');
  const fresh = await api.loadChecklistForDate('2020-01-01'); assert.equal(fresh.date,'2020-01-01'); assert.ok(fresh.prayers.every(p=>!p.completed));
  results.push('A missing historical date starts with empty practice');
  assert.deepEqual(await api.calculateStreaks(),{prayerStreak:2,quranStreak:2});
  results.push('Prayer/Quran streaks read existing saved records');
  failRead=true;
  await assert.rejects(api.loadAllData()); await assert.rejects(api.saveTodayChecklist(record(today)));
  failRead=false;
  assert.equal(Object.keys(await api.loadAllData()).length,3);
  results.push('Read failures cannot overwrite existing history');
  failWrite=true; await assert.rejects(api.saveTodayChecklist(record(today))); failWrite=false;
  results.push('Write failures reach the UI instead of reporting success');
  data.set('@spiritual_tracking_data','corrupt'); await assert.rejects(api.loadAllData());
  results.push('Invalid saved JSON is retained and reported');
  fs.writeFileSync('docs/evidence/tracking-checks.json',JSON.stringify({testedAt:new Date().toISOString(),results},null,2));
  console.log(results.length+' tracking checks passed');
})().catch(e=>{console.error(e);process.exitCode=1;});
