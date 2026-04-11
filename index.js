require('dotenv').config();  
const express = require("express");
const path = require("path");
let jwt = require('jsonwebtoken');
const cookieParser = require("cookie-parser");

const app = express();
const PORT = process.env.PORT || 3000;

// Database Connection
const mongoose = require('mongoose');

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected ✅"))
  .catch(err => console.log(err));

  //multer config
const upload = require("./config/multer");

// admin model
let adminModel = require("./model/admin");
let projectModel = require("./model/project");
let blog = require("./model/Blog");

// View Engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Static Folder
app.use(express.static(path.join(__dirname, "public")));

app.use(express.urlencoded({ extended: true })); // form data support
app.use(cookieParser())
app.use(express.json()); // JSON body support



//ROUTERS

app.get("/", async (req, res) => {

  let projects = await projectModel.find()
    res.render("user/index", {projects});
});


app.get("/admin/dashboard",requireLogin,  (req, res) => {
  res.render("admin/dashboard");
});

function requireLogin(req, res, next) { 
    const token = req.cookies.token;
    if (!token) {
        return res.redirect("/login/admin");
    }
    try {
        const decoded = jwt.verify(token, "rox");
        req.userId = decoded.userid;
        next();
    } catch (err) {
        console.log(err);
        res.clearCookie("token");
        return res.redirect("/login/admin");
    }
}


app.get('/signup/admin', async (req,res)=>{
  let admin=  await adminModel.create({

      pass:'rox#00%@',
      name:'rox'

    })
    

});



app.get("/login/admin" , async (req,res)=>{

    res.render("admin/adminlogin.ejs")

});

app.post("/login/admin" , async (req,res)=>{
   const { name, pass } = req.body;
  try {
    const user = await adminModel.findOne({ name, pass });

    if (user) {
      
      let token = jwt.sign({userid: user._id }, "rox");
                   res.cookie("token", token)
                   res.redirect("/admin/dashboard")
    } else {
      res.send(`<h2 style="text-align:center; color:red;">Invalid name or password</h2>`);
    }
  } catch (err) {
    console.log(err);
    res.status(500).send("Server error");
  }
});



app.get("/logout", (req, res) => {
    res.clearCookie("token");
    res.redirect("/login/admin");
});

app.get ('/admin/project/add',requireLogin,  async (req,res)=>{
  let projects = await projectModel.find();
    res.render('admin/addproject',{projects})
});



app.post(
    "/admin/project/add",
    upload.fields([
        { name: "coverimage", maxCount: 1 },
        { name: "extraimage", maxCount: 10 }
    ]),
    async (req, res) => {
        try {
            const coverImg = req.files["coverimage"]
                ? req.files["coverimage"][0].filename
                : null;

            const extraImgs = req.files["extraimage"]
                ? req.files["extraimage"].map(file => file.filename)
                : [];

          const objectivesArray = req.body.projectobjectives.split(',').map(item => item.trim());

            const newProject = new projectModel({
                projectTitle: req.body.projectTitle,
                projectname: req.body.projectname,
                description: req.body.description,
                projectgoal: req.body.projectgoal,
                projectarea: req.body.projectarea,
                beneficiary: req.body.beneficiary,
                projectobjectives: objectivesArray,
                coverimage: coverImg,
                extraimage: extraImgs
            });

            await newProject.save();

            res.send(newProject);

        } catch (err) {
            console.log(err);
            res.send("Error uploading project ❌");
        }
    }
);


app.get('/showprojects/:id', async (req,res)=>{
    let projects = await projectModel.find({ _id: req.params.id });
    res.render("user/showproject", { projects });
});

app.get('/admindelete/:id', async (req,res)=>{
    await projectModel.findByIdAndDelete(req.params.id);
    res.redirect('/admin/project/add');
});



app.get('/about', async (req,res)=>{
    
    res.render("user/about");
});


app.get('/project', async (req,res)=>{
    
    res.render("user/project");
});


app.get('/donate', async (req,res)=>{
    
    res.render("user/donate");
});


app.get('/contact', async (req,res)=>{
    
    res.render("user/contact");
});


app.get('/review', async (req,res)=>{
    
    res.render("user/review");
});


app.get('/blog', async (req,res)=>{
     let blogs = await blog.find()
    res.render("user/blog", {blogs});
});



app.get('/stories/:id', async (req,res)=>{
     let storys = await blog.findOne({_id:req.params.id});
     console.log(storys);
    res.render("user/showBlog", {storys});
});



app.get('/admin/blog/add', async (req,res)=>{

    const blogs = await blog.find();
     
    res.render("admin/addblog", { blogs });
});


app.get('/admin/blog/create', async (req,res)=>{

    
     
    res.redirect("/admin/blog/add");
});



app.post('/admin/blog/create', upload.single('featuredImage'), async (req, res) => {
    try {
        const { title, category, excerpt, content, status } = req.body;
        
        const newBlog = new blog({
            title,
            category,
            excerpt,
            content,
            featuredImage: `/uploads/blogs/${req.file.filename}`,
            isPublished: status === 'published' ? true : false
        });

        await newBlog.save();
        res.redirect('/admin/blog/add'); // সাকসেস হলে লিস্ট পেজে পাঠাবে
    } catch (err) {
        console.error(err);
        res.status(500).send("Blog creation failed!");
    }
});



app.get('/stories/delete/:id', async (req,res)=>{

        await blog.findByIdAndDelete(req.params.id);    

        res.send("BLOGS DELETED");
});



app.get('/stories/edit/:id', async (req,res)=>{

            let storys = await blog.findOne({_id:req.params.id});    
        
        res.render("admin/editblog", { storys });
});

app.post('/stories/edit/:id', upload.single('featuredImage'), async (req, res) => {
    try {
        const { title, category, excerpt, content, status } = req.body;
        const updateData = {
            title,
            category,
            excerpt,
            content,
            isPublished: status === 'published' ? true : false
        };  

        if (req.file) {
            updateData.featuredImage = `/uploads/blogs/${req.file.filename}`;
        }

        await blog.findByIdAndUpdate(req.params.id, updateData);
        res.redirect('/admin/blog/add'); // সাকসেস হলে লিস্ট পেজে পাঠাবে
    } catch (err) {
        console.error(err);
        res.status(500).send("Blog update failed!");
    }   
});



app.get('/healthz', (req, res) => {
  res.status(200).send("OK");
});     

// Server Start
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});