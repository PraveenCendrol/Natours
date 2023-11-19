const dotenv = require('dotenv');
const mongoose = require('mongoose');
const fs = require('fs');
const Tour = require('../../modals/tourModal');

dotenv.config({ path: '/config.env' });

const DB = 'mongodb+srv://Praveenkb777:<PASSWORD>@cluster0.sjuh5qo.mongodb.net/natours?retryWrites=true&w=majority'.replace(
  '<PASSWORD>',
  '6A0e6NiEHUghlzDh'
);

mongoose
  .connect(DB, {})
  .then(() => {
    console.log(`Database connected successfully`);
  })
  .catch(e => console.log(e));

// Read Json file

const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours.json`, 'utf-8'));

// IMPORT Data into database

const importData = async () => {
  try {
    await Tour.create(tours);
    process.exit();
  } catch (error) {
    // console.log(error);
    process.exit();
  }
};

// Delete all data

const deleteMany = async () => {
  try {
    await Tour.deleteMany();
    console.log('dataSuccesfully deleted');
    process.exit();
  } catch (error) {
    console.log(error);
  }
};

if (process.argv[2] === '--import') {
  importData();
}
if (process.argv[2] === '--delete') {
  console.log('deleting');
  deleteMany();
}

console.log(process.argv);
