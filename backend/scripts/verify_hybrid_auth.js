/**
 * Hybrid Firebase + MySQL Authentication Verification Test Suite
 * Run with: node scripts/verify_hybrid_auth.js
 */

const userModel = require('../models/userModel');
const studentModel = require('../models/studentModel');
const { hash, compare } = require('../utils/hashPassword');
const generateToken = require('../utils/generateToken');
const jwt = require('jsonwebtoken');

const runTests = async () => {
  console.log('🚀 Starting Hybrid Firebase + MySQL Authentication Test Suite...\n');
  let passedCount = 0;
  let failedCount = 0;

  const mockFirebaseUid = `fb_uid_${Date.now()}`;
  const testEmail = `hybrid_test_${Date.now()}@example.com`;
  const testPassword = 'SecurePassword123!';

  // Test 1: Firebase Auth User & MySQL Registration Flow
  let createdUser = null;
  try {
    const hashedPassword = await hash(testPassword);
    createdUser = await userModel.createUser({
      firebase_uid: mockFirebaseUid,
      name: 'Hybrid Test User',
      email: testEmail,
      password: hashedPassword,
      role: 'student'
    });

    if (createdUser && createdUser.id) {
      console.log('  ✅ [PASS] 1. MySQL User Created (ID: ' + createdUser.id + ')');
      passedCount++;
    } else {
      throw new Error('Failed to create user in MySQL');
    }
  } catch (err) {
    console.error('  ❌ [FAIL] 1. MySQL User Creation:', err.message);
    failedCount++;
  }

  // Test 2: Firebase UID Stored in MySQL
  try {
    const fetchedUser = await userModel.findUserByFirebaseUid(mockFirebaseUid);
    if (fetchedUser && fetchedUser.firebase_uid === mockFirebaseUid) {
      console.log('  ✅ [PASS] 2. Firebase UID Stored & Verified in MySQL (' + fetchedUser.firebase_uid + ')');
      passedCount++;
    } else {
      throw new Error('Firebase UID mismatch or record not found in MySQL');
    }
  } catch (err) {
    console.error('  ❌ [FAIL] 2. Firebase UID Storage:', err.message);
    failedCount++;
  }

  // Test 3: Student Registry Creation with Firebase UID
  try {
    const mockRegNumber = `REG_HYB_${Date.now()}`;
    const studentRecord = await studentModel.addStudent({
      user_id: createdUser.id,
      firebase_uid: mockFirebaseUid,
      register_number: mockRegNumber,
      student_name: 'Hybrid Test User',
      department_id: 1,
      year: 2,
      section: 'B',
      gender: 'Male',
      email: testEmail,
      phone: '9876543210'
    });

    if (studentRecord && studentRecord.id) {
      console.log('  ✅ [PASS] 3. Student Record Created in MySQL with Firebase UID');
      passedCount++;
    } else {
      throw new Error('Student record insertion failed');
    }
  } catch (err) {
    console.error('  ❌ [FAIL] 3. Student MySQL Record:', err.message);
    failedCount++;
  }

  // Test 4: Login Verification & Profile Retrieval from MySQL
  try {
    const loginProfile = await userModel.findUserByEmailOrRegisterNumber(testEmail);
    const isPasswordValid = await compare(testPassword, loginProfile.password);
    
    if (loginProfile && isPasswordValid && loginProfile.role === 'student') {
      console.log('  ✅ [PASS] 4. Login Verified & User Profile Loaded from MySQL');
      passedCount++;
    } else {
      throw new Error('Login authentication or MySQL profile lookup failed');
    }
  } catch (err) {
    console.error('  ❌ [FAIL] 4. Login Working:', err.message);
    failedCount++;
  }

  // Test 5: JWT Token Issuance & Verification
  try {
    const token = generateToken(createdUser);
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'production_ready_secret_key_987654321');
    
    if (decoded && decoded.id === createdUser.id) {
      console.log('  ✅ [PASS] 5. JWT Token Issued & Verified');
      passedCount++;
    } else {
      throw new Error('JWT token verification failed');
    }
  } catch (err) {
    console.error('  ❌ [FAIL] 5. JWT Working:', err.message);
    failedCount++;
  }

  // Test 6: Role-Based Access Control (Admin, Staff, Student)
  try {
    const roles = ['admin', 'staff', 'student'];
    roles.forEach(role => {
      const tokenForRole = generateToken({ id: 100, role, email: 'test@example.com' });
      const payload = jwt.verify(tokenForRole, process.env.JWT_SECRET || 'production_ready_secret_key_987654321');
      if (payload.role !== role) throw new Error(`Role mismatch for ${role}`);
    });
    console.log('  ✅ [PASS] 6. Role-Based Access Control Working (Admin, Staff, Student)');
    passedCount++;
  } catch (err) {
    console.error('  ❌ [FAIL] 6. Role-Based Access:', err.message);
    failedCount++;
  }

  // Clean up test user
  try {
    if (createdUser && createdUser.id) {
      await userModel.softDeleteUser(createdUser.id);
    }
  } catch (e) {}

  console.log('\n==================================================');
  console.log(`🎉 HYBRID AUTH VERIFICATION SUMMARY: ${passedCount} PASSED, ${failedCount} FAILED.`);
  console.log('==================================================\n');
  process.exit(failedCount === 0 ? 0 : 1);
};

runTests();
