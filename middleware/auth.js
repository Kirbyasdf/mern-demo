const jwt = require("jsonwebtoken");

exports.clientVerify = (req, res, next) => {
  const token = req.header("x-auth-token");

  if (!token) {
    return res.status(401).json({ msg: "Not authorized : NO TOKEN" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECERT);
    req.user = decoded;
    next();
  } catch (err) {
    console.error(err.message);
    res.status(401).json({ msg: "TOKEN IS INVALID " });
  }
};
