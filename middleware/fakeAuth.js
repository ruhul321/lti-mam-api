
module.exports = (req, res, next) => {
    const token = req.headers['authorization'];
  
    // Simulate a fake bearer token check
    if (!token || !token.startsWith('Bearer fake-token')) {
      return res.status(401).json({ message: 'Unauthorized: Invalid or missing token' });
    }
  
    // Attach fake user info (normally decoded from real token)
    req.user = {
      id: '648e4f79d4cf8fcd51234567', // use real _id for actual Mongo logic
      name: 'Test Instructor',
      email: 'testuser@brightspace.com',
      role: 'Instructor'
    };
  
    next();
  };
  