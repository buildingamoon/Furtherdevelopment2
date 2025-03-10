const authenticate = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  const refreshToken = req.headers['x-refresh-token'];

  if (!token) return res.status(401).json({ message: 'No token provided' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id);
    if (!req.user) {
      return res.status(401).json({ message: 'User not found' });
    }
    console.log('Authenticated user:', req.user);
    next();
  } catch (err) {
    console.error('Authentication error:', err);
    if (err.name === 'TokenExpiredError' && refreshToken) {
      try {
        const decodedRefresh = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
        const user = await User.findById(decodedRefresh.id);

        if (!user) throw new Error('User not found');

        const newToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '15m' });
        const newRefreshToken = jwt.sign({ id: user._id }, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' });

        res.set('Authorization', `Bearer ${newToken}`);
        res.set('x-refresh-token', newRefreshToken);

        req.user = user;
        console.log('Refreshed token and authenticated user:', req.user);
        next();
      } catch (refreshErr) {
        console.error('Error refreshing token:', refreshErr);
        res.status(401).json({ message: 'Token expired, please login again' });
      }
    } else {
      res.status(401).json({ message: 'Unauthorized' });
    }
  }
};

module.exports = authenticate;
