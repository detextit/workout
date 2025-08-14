import * as XLSX from 'xlsx';
import * as fs from 'fs';
import * as path from 'path';

// Read the Excel file
const excelPath = path.join(__dirname, '../app/data/Pooja Workout.xls');
const workbook = XLSX.readFile(excelPath);

console.log('Sheet Names:', workbook.SheetNames);
console.log('---');

// Process each sheet
workbook.SheetNames.forEach((sheetName, index) => {
  console.log(`\n=== SHEET ${index + 1}: ${sheetName} ===`);
  
  const worksheet = workbook.Sheets[sheetName];
  
  // Convert to JSON to see the data structure
  const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
  
  console.log('Rows:', jsonData.length);
  console.log('First few rows:');
  jsonData.slice(0, 10).forEach((row, rowIndex) => {
    console.log(`Row ${rowIndex + 1}:`, row);
  });
  
  // Also convert to CSV for potential use
  const csvData = XLSX.utils.sheet_to_csv(worksheet);
  const csvPath = path.join(__dirname, `../app/data/${sheetName.replace(/[^a-zA-Z0-9]/g, '_')}.csv`);
  fs.writeFileSync(csvPath, csvData);
  console.log(`CSV saved to: ${csvPath}`);
});

console.log('\n=== ANALYSIS COMPLETE ===');