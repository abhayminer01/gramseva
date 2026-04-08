const Announcement = require('../models/Announcement');

// @desc    Create announcement
// @route   POST /api/announcements
// @access  Private (Ward Member, Secretary)
const createAnnouncement = async (req, res) => {
  try {
    const { title, content, type, targetAudience } = req.body;
    
    const announcement = await Announcement.create({
      title,
      content,
      type,
      targetAudience, // 'all' or specific ward
      createdBy: req.user._id,
      localBody: req.user.localBodyName
    });

    res.status(201).json(announcement);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get announcements
// @route   GET /api/announcements
// @access  Private
const getAnnouncements = async (req, res) => {
  try {
    const { localBodyName, wardNumber } = req.user;
    
    // Everyone sees 'all', but citizens in ward x also see targetAudience x
    const filter = {
      localBody: localBodyName,
      $or: [
        { targetAudience: 'all' },
        { targetAudience: wardNumber || '' }
      ]
    };

    const announcements = await Announcement.find(filter)
      .populate('createdBy', 'name role')
      .sort({ createdAt: -1 });

    res.json(announcements);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createAnnouncement, getAnnouncements };
