const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const MONGODB_URI = 'mongodb://localhost:27017/pharmacy';

const AdminSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    name: { type: String, required: true },
  },
  { timestamps: true }
);

const Admin = mongoose.models.Admin || mongoose.model('Admin', AdminSchema);

async function seed() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    const existing = await Admin.findOne({ email: 'pharmacy@admin.com' });
    if (existing) {
      console.log('Admin already exists, skipping seed.');
      process.exit(0);
    }

    const hashedPassword = await bcrypt.hash('Admin@123', 12);

    await Admin.create({
      email: 'pharmacy@admin.com',
      password: hashedPassword,
      name: 'Pharmacy Admin',
    });

    console.log('Admin seeded successfully');
    console.log('Email:    pharmacy@admin.com');
    console.log('Password: Admin@123');
    process.exit(0);
  } catch (error) {
    console.error('Seed failed:', error);
    process.exit(1);
  }
}

seed();
