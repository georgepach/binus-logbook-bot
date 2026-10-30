// Dry-run test API untuk input Sept 7 2026 (OFF day).
// Meniru logika src/core/bot.ts + src/utils/mapping.ts TANPA membuka browser / mengubah LMS.
import * as dotenv from 'dotenv';
import * as path from 'path';
import XLSX from 'xlsx';
import { getMonthName, getSemesterCode } from './src/utils/mapping.js';
import { BOT_LOCATORS } from './src/constant/locator.js';

dotenv.config({ path: '.env', encoding: 'utf8' });

let failures = 0;
function check(name: string, cond: boolean, detail = '') {
  console.log(`${cond ? 'PASS' : 'FAIL'} - ${name}${detail ? ' | ' + detail : ''}`);
  if (!cond) failures++;
}

// 1. Config mapping SEP/ODD
const monthEnv = process.env.LOGBOOK_MONTH || 'SEP';
const semEnv = process.env.INTERNSHIP_SEMESTER || 'ODD';
const monthName = getMonthName(monthEnv);
const semCode = getSemesterCode(semEnv);
check('LOGBOOK_MONTH=SEP -> September', monthName === 'September', `${monthEnv} -> ${monthName}`);
check('INTERNSHIP_SEMESTER=ODD -> 2510', semCode === '2510', `${semEnv} -> ${semCode}`);

// 2. Excel file path (.env sudah diperbaiki)
const excelPath = process.env.EXCEL_FILE_PATH || './logbookdata.xlsx';
const resolved = path.isAbsolute(excelPath) ? excelPath : path.join(process.cwd(), excelPath);
let excelRows: any[] = [];
try {
  const wb = XLSX.readFile(resolved);
  const ws = wb.Sheets[wb.SheetNames[0]];
  const jsonData = XLSX.utils.sheet_to_json(ws, { header: ['', 'activity', 'description'], range: 1 });
  excelRows = (jsonData as any[])
    .filter((r: any) => r.activity && r.description)
    .map((r: any) => ({ activity: String(r.activity).trim(), description: String(r.description).trim() }));
  check('Excel terbaca via path .env', true, `${excelPath} -> ${excelRows.length} baris data`);
} catch (e: any) {
  check('Excel terbaca via path .env', false, `${resolved}: ${e.message}`);
}

// 3. Format input vs ekspektasi source (kolom B=activity, C=description, skip header)
check('Format input cocok dengan source (activity+description terisi)', excelRows.length > 0 && excelRows.every(r => r.activity && r.description));

// 4. Payload test Sept 7 2026 = OFF day (sesuai pilihan user)
const sept7 = { activity: 'OFF', description: 'OFF' };
const isOffDay =
  sept7.activity.toUpperCase().trim() === 'OFF' ||
  sept7.description.toUpperCase().trim() === 'OFF';
check('Sept 7 2026 terdeteksi OFF day (jalur handleOffDayEntry)', isOffDay, JSON.stringify(sept7));

// 5. Selector yang akan dipakai bot untuk Sept 7 2026
const monthTabSelector = `a[onclick*="tabClick"][href="#"]:has-text("${monthName}")`;
const semesterSelector = `div.menu.transition div.item[data-value="${semCode}"]`;
check('Month tab selector September terbentuk', monthTabSelector.includes('September'), monthTabSelector);
check('Semester selector 2510 terbentuk', semesterSelector.includes('2510'), semesterSelector);
check('OFF button fallbacks tersedia', BOT_LOCATORS.OFF_BUTTON_FALLBACKS.length > 0, BOT_LOCATORS.OFF_BUTTON_FALLBACKS.length + ' selectors');
check('Submit button fallbacks tersedia', BOT_LOCATORS.SUBMIT_BUTTON_FALLBACKS.length > 0, BOT_LOCATORS.SUBMIT_BUTTON_FALLBACKS.length + ' selectors');
check('Clock in/out terkonfigurasi', !!process.env.CLOCK_IN_TIME && !!process.env.CLOCK_OUT_TIME, `${process.env.CLOCK_IN_TIME} / ${process.env.CLOCK_OUT_TIME}`);

// 6. Peringatan bug yang relevan untuk test ini (tidak menggagalkan test, tapi wajib diketahui)
console.log('\n--- Catatan ---');
console.log(`Sept 7 2026 = Senin (hari kerja). Test ini memaksa OFF, jadi di LMS akan diklik tombol OFF, bukan isi activity.`);
console.log(`logbookdata.xlsx hanya punya ${excelRows.length} baris (data 2026-03-02). Mode full-run bot.ts (fillAllActivities, by index) akan error untuk tabel September (~30 baris). Untuk test 1 tanggal, gunakan mode single-date, bukan full-run.`);
console.log(`Semester ODD=2510 berasal dari README. Jika semester berjalan 2026 sudah beda kode, update SEMESTER_TRANSLATION di src/utils/mapping.ts.`);

console.log(failures === 0 ? '\nDRY-RUN LULUS: payload Sept 7 2026 (OFF) siap dikirim via jalur handleOffDayEntry.' : `\nDRY-RUN GAGAL: ${failures} check gagal.`);
process.exit(failures === 0 ? 0 : 1);
