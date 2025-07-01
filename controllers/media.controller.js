const MediaSelection = require('../models/MediaSelection');

exports.selectMedia = async (req, res) => {
  try {
    const media = new MediaSelection(req.body);
    await media.save();
    res.status(201).json(media);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getMediaByUser = async (req, res) => {
  try {
    const media = await MediaSelection.find({ userId: req.params.userId });
    res.status(200).json(media);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};