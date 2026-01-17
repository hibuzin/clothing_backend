const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String},
    googleId: String,
    avatar: String,
    image: { type: String },
    

    isVerified: {
        type: Boolean,
        default: false
    },
    authProvider: {
    type: String,
    enum: ['local', 'google'],
    default: 'local',
    },

    otp: String,
    otpExpiresAt: Date,

    wishlist: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
    }]

});


UserSchema.pre('save', async function () {
    if (!this.isModified('password')) return;
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

UserSchema.methods.comparePassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);