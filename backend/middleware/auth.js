import jwt from 'jsonwebtoken';

const authUser = async (req, res, next) => {
  const { token } = req.headers;

  if (!token) {
    return res.status(401).json({ success: false, message: 'Not Authorized. Login Again.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Assign userId safely for downstream controllers
    req.userId = decoded.id; // ✅ now use req.userId instead of req.body.userId

    next();
  } catch (error) {
    console.error(error);
    res.status(401).json({ success: false, message: 'Invalid Token' });
  }
};

export default authUser;
