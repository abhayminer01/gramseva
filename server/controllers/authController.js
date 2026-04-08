const Citizen = require('../models/Citizen');
const Authority = require('../models/Authority');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const generateToken = (id, scope) => {
  return jwt.sign({ id, scope }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// @desc    Register citizen
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
  try {
    const { name, phone, password, rationCardNumber, district, localBodyType, localBodyName, wardNumber } = req.body;

    // Check if phone exists entirely in Citizen pool
    const userExists = await Citizen.findOne({ phone });

    if (userExists) {
      return res.status(400).json({ message: 'Phone number already registered as a Citizen' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await Citizen.create({
      name,
      phone,
      password: hashedPassword,
      rationCardNumber,
      district,
      localBodyType,
      localBodyName,
      wardNumber,
      role: 'citizen',
      isApproved: false // Requires approval
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        phone: user.phone,
        role: user.role,
        isApproved: user.isApproved,
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Authenticate user
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
  try {
    const { phone, password, loginType } = req.body;

    let user = null;
    let scopeValidation = '';

    if (loginType === 'citizen') {
       user = await Citizen.findOne({ phone });
       scopeValidation = 'citizen';
    } else if (loginType === 'auth') {
       user = await Authority.findOne({ phone });
       scopeValidation = 'authority';
    } else {
       return res.status(400).json({ message: 'System missing login portal specification' });
    }

    // Completely physically separate login checking
    if (user && (await bcrypt.compare(password, user.password))) {
      if (loginType === 'citizen' && user.isRejected) {
        return res.status(401).json({ message: 'Account was rejected by authority' });
      }
      if (loginType === 'citizen' && !user.isApproved) {
        return res.status(401).json({ message: 'Account pending approval by authority' });
      }

      res.json({
        _id: user._id,
        name: user.name,
        phone: user.phone,
        role: user.role,
        localBodyName: user.localBodyName,
        token: generateToken(user._id, scopeValidation), // Issue strictly scoped token
      });
    } else {
      res.status(401).json({ message: 'Invalid phone or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Approve citizen
// @route   PUT /api/auth/approve/:id
// @access  Private/Authority (Secretary/Admin)
const approveCitizen = async (req, res) => {
  try {
    const user = await Citizen.findById(req.params.id);

    if (user) {
      user.isApproved = true;
      const updatedUser = await user.save();
      res.json({ message: 'Citizen approved successfully', user: updatedUser });
    } else {
      res.status(404).json({ message: 'Citizen not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Reject citizen
// @route   PUT /api/auth/reject/:id
// @access  Private/Authority (Secretary/Admin)
const rejectCitizen = async (req, res) => {
  try {
    const user = await Citizen.findById(req.params.id);

    if (user) {
      user.isRejected = true;
      const updatedUser = await user.save();
      res.json({ message: 'Citizen rejected successfully', user: updatedUser });
    } else {
      res.status(404).json({ message: 'Citizen not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create Authority Account
// @route   POST /api/auth/admin/create-authority
// @access  Private/Admin
const createAuthorityAccount = async (req, res) => {
  try {
    const { name, phone, password, role, district, localBodyType, localBodyName, wardNumber } = req.body;
    
    if(!['ward_member', 'secretary', 'higher_authority', 'admin'].includes(role)){
      return res.status(400).json({ message: 'Invalid role assignment' });
    }

    const startPassword = password || '123456';
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(startPassword, salt);

    const user = await Authority.create({
      name, phone, password: hashedPassword, role, district, localBodyType, localBodyName, wardNumber
    });

    res.status(201).json(user);
  } catch (error) {
    if (error.code === 11000) {
       return res.status(400).json({ message: 'Phone number already registered to an Authority account' });
    }
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all authorities for admin
// @route   GET /api/auth/admin/users
// @access  Private/Admin
const getAllUsers = async (req, res) => {
  try {
    const users = await Authority.find({}).select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get unapproved citizens for authority
// @route   GET /api/auth/unapproved
// @access  Private/Authority
const getUnapprovedCitizens = async (req, res) => {
  try {
    const query = { isApproved: false, isRejected: false };
    if (req.user && req.user.role === 'secretary') {
      query.localBodyName = req.user.localBodyName;
      query.district = req.user.district; // Explicit strict filter
    }
    const citizens = await Citizen.find(query).select('-password').sort({ createdAt: -1 });
    res.json(citizens);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get approved citizens for authority
// @route   GET /api/auth/approved
// @access  Private/Authority
const getApprovedCitizens = async (req, res) => {
  try {
    const query = { isApproved: true };
    if (req.user && req.user.role === 'secretary') {
      query.localBodyName = req.user.localBodyName;
      query.district = req.user.district; // Explicit strict filter
    }
    const citizens = await Citizen.find(query).select('-password').sort({ createdAt: -1 });
    res.json(citizens);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Edit existing Authority Account
// @route   PUT /api/auth/admin/users/:id
// @access  Private/Admin
const editUserAccount = async (req, res) => {
  try {
    const { name, phone, password } = req.body;
    const user = await Authority.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'Authority record not found' });
    }

    if (name) user.name = name;
    if (phone && phone !== user.phone) {
       user.phone = phone;
    }

    if (password && password.trim() !== '') {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
    }

    const updatedUser = await user.save();
    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      phone: updatedUser.phone,
      role: updatedUser.role
    });
  } catch (error) {
    if (error.code === 11000) {
       return res.status(400).json({ message: 'Phone number already registered to another Authority' });
    }
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete Authority Account
// @route   DELETE /api/auth/admin/users/:id
// @access  Private/Admin
const deleteUserAccount = async (req, res) => {
  try {
    const user = await Authority.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'Authority record not found' });
    }
    
    // Prevent deletion of the master admin
    if (user.role === 'admin') {
       return res.status(403).json({ message: 'Cannot delete master admin account' });
    }

    await Authority.findByIdAndDelete(req.params.id);
    res.json({ message: 'Authority account permanently deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { registerUser, loginUser, approveCitizen, rejectCitizen, createAuthorityAccount, getAllUsers, getUnapprovedCitizens, getApprovedCitizens, editUserAccount, deleteUserAccount };
