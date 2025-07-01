const Token = require('../models/Token');

exports.login = async (req, res) => {
  try {
    const token = new Token(req.body);
    await token.save();
    res.status(201).json(token);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.refreshToken = async (req, res) => {
  try {
    const token = await Token.findByIdAndUpdate(req.body.tokenId, {
      accessToken: req.body.accessToken,
      refreshToken: req.body.refreshToken,
      expiresAt: req.body.expiresAt,
      updatedAt: new Date()
    }, { new: true });
    res.status(200).json(token);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};