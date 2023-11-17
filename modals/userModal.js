const { default: mongoose } = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'A user must have a Name']
  },
  email: {
    type: String,
    required: [true, 'A user must have a Email'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'A valid email is required']
  },
  photo: {
    type: String
  },
  password: {
    type: String,
    required: [true, 'Provide a Password'],
    minlength: 8,
    select: false
  },
  passwordConfirm: {
    type: String,
    required: [true, 'Provide a Password confirmation'],
    validate: {
      // this only works on create or save
      validator: function(el) {
        return el === this.password;
      },
      message: 'Password and Password confirem should match'
    }
  },
  passwordChangedAt: {
    type: Date
  }
});
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  this.passwordConfirm = undefined;
  next();
});

userSchema.methods.correctPassword = async function(inputPass, dbPass) {
  return await bcrypt.compare(inputPass, dbPass);
};

userSchema.methods.changedPasswordAfter = function(jwtTimeStamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );
    return jwtTimeStamp < changedTimestamp;
  }
  return false;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
