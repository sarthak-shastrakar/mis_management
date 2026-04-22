const ExcelJS = require('exceljs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });
const mongoose = require('mongoose');

// Models
const Beneficiary = require('../modules/project/models/beneficiaryModel');
const Project = require('../modules/project/models/projectModel');
const Trainer = require('../modules/trainer/models/trainerModel');

async function importExcel() {
  try {
    const dbUri = process.env.MONGO_URI || 'mongodb://localhost:27017/trainerdb';
    await mongoose.connect(dbUri);
    console.log('✔ Database Connected for Import');

    const workbook = new ExcelJS.Workbook();
    const filePath = path.join(__dirname, '../../../Beneficiary Details.xlsx');
    await workbook.xlsx.readFile(filePath);

    const worksheet = workbook.getWorksheet(1);
    
    // Drop old conflicting index if exists
    try {
        await mongoose.connection.db.collection('beneficiaries').dropIndex('beneficiaryId_1');
        console.log('✔ Dropped old index: beneficiaryId_1');
    } catch (e) {
        // Index might not exist, ignore
    }

    const data = [];

    // Step 1: Verification Run
    console.log('--- Verifying Column Mapping ---');
    const firstRow = worksheet.getRow(2); // Check row 2 (assuming row 1 is header)
    console.log('Row 2 Sample Values:', firstRow.values.slice(0, 15));

    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber < 2) return; // Skip headers

      const rowData = {
        district: row.getCell(2).value,
        block: row.getCell(3).value,
        village: row.getCell(4).value,
        ownerName: row.getCell(5).value,
        regNo: row.getCell(6).value,
        trainee1: row.getCell(7).value,
        mobile1: row.getCell(8).value,
        aadhar1: row.getCell(9).value,
        bank1: row.getCell(10).value,
        acc1: row.getCell(11).value,
        ifsc1: row.getCell(12).value,
        res1: row.getCell(13).value,
        trainer: row.getCell(14).value,
        isCertified: row.getCell(15).value === 'Y',
      };

      if (rowData.regNo) {
        data.push(rowData);
      }
    });

    console.log(`Found ${data.length} records. Processing...`);

    // Process in batches
    for (const item of data) {
      // Find Trainer if exists
      const trainerDoc = await Trainer.findOne({ fullName: item.trainer });

      // Prepare trainees array (taking at least the first one for now)
      const trainees = [];
      if (item.trainee1) {
          trainees.push({
              name: item.trainee1,
              mobileNumber: String(item.mobile1 || ''),
              aadharNumber: String(item.aadhar1 || ''),
              bankAccountNo: String(item.acc1 || ''),
              ifscCode: String(item.ifsc1 || ''),
              result: item.res1
          });
      }

      await Beneficiary.findOneAndUpdate(
        { registrationNo: String(item.regNo).trim() },
        {
          houseOwnerName: item.ownerName,
          location: {
            district: String(item.district || ''),
            block: String(item.block || ''),
            village: String(item.village || ''),
          },
          trainees: trainees,
          trainerNameFromExcel: item.trainer,
          assignedTrainer: trainerDoc ? trainerDoc._id : null,
          isCertified: item.isCertified,
        },
        { upsert: true, new: true }
      );
    }

    console.log('✔ Import Process Completed');
    process.exit(0);
  } catch (err) {
    console.error('❌ Import Failed:', err);
    process.exit(1);
  }
}

importExcel();
