exports.authenticate = (req, res, next) => {
  //  récupérer le user depuis un token JWT ou session
  req.user = { id: "fakeUserId123" }; 
  next();
};
