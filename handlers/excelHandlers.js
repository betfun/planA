
const XLSX = require("xlsx");
const fs = require('fs');
const path = require('path');

exports.parseCSV_AccountList = (filepath) => {

  let ret = false;

  try {
    const workbook = XLSX.readFile(filepath, { type: 'binary'});

    let name = workbook.SheetNames[0];
    let sheet = workbook.Sheets[name];
    let data = XLSX.utils.sheet_to_json(sheet, {defval: "", header: ['name', 'account', 'referral', 'regat']});
    data.shift();
    ret = data;

    fs.unlink(path.join(__dirname, '..', filepath), (err) => {
      if (err) console.log(err);
    });

  } catch (err) {
    console.log(err.message);
    ret = false;
  }

  return ret;
}

exports.parseCSV_CommissionList = (filepath) => {

  let ret = false;

  try {
    const workbook = XLSX.readFile(filepath, { type: 'binary'});

    let name = workbook.SheetNames[0];
    let sheet = workbook.Sheets[name];
    let data = XLSX.utils.sheet_to_json(sheet, {defval: "", header: ['account', 'amount', 'regat']});
    data.shift();
    ret = data;

    fs.unlink(path.join(__dirname, '..', filepath), (err) => {
      if (err) console.log(err);
    });

  } catch (err) {
    console.log(err.message);
    ret = false;
  }

  return ret;
}