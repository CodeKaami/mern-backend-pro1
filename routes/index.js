var express = require('express');
var router = express.Router();


const userModel =require('./users')
const postmodel = require('./post')
const passport = require('passport')
const upload = require ('./multer')

const localStrategy = require('passport-local')
passport.use(new localStrategy(userModel.authenticate()))


/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/feed', function(req, res, next) {
  res.render('feed', { title: 'Express' });
});


router.post('/upload',isLoggedIn ,upload.single("file"),async function(req, res, next) {
if(!req.file){
  return res.status(404).send("no file were given")
};
const user = await userModel.findOne({username : req.session.passport.user});
   const post = await postmodel.create({
  image : req.file.filename,
  imageText : req.body.fileCaption,
  user: user._id,
});

user.posts.push(post._id);
await user.save();
 res.redirect("/profile")
});

router.get('/login', function(req, res, next) {
  res.render('login', { error: req.flash("error") });
});

router.get('/profile', isLoggedIn ,async function(req, res, next) {
  const user = await userModel.findOne({
    username : req.session.passport.user
  })
  .populate("posts")

  res.render('profile',{user});
});
router.post('/register', function(req, res, next) {
  // const userDate = new userModel({
  //   username: req.body.username,
  //   email: req.body.email,
  //   fullname:req.body.fullname,
  // })
  const {email,username, fullname} = req.body;
  const userDate = new userModel({username,email, fullname});

  userModel.register(userDate, req.body.password)
  .then(function(){
    passport.authenticate('local')(req ,res , function(){
      res.redirect('/profile')
    })
  })
});

router.post('/login', passport.authenticate("local",{
  successRedirect:"/profile",
  failureRedirect:"/login",
  failureFlash: true 
}),
 function(req, res, next) {
  
 
});

router.get("/logout",function(req,res){
  req.logout(function(err) {
    if (err) { return next(err); }
    res.redirect('/');
  });
});


function isLoggedIn (req, res, next){
  if(req.isAuthenticated()) return next();
  res.redirect('/login');
}
module.exports = router;
