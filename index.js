const express = require("express");

const app = express();

const bodyParser = require("body-parser");


const path = require("path");
const multer = require("multer");
const fs = require("fs");

const imageSize=require("image-size");
const sharp=require("sharp");
const { fit } = require("sharp");


// const imageConversion = require("image-conversion"); #Package used to compress file



var list = "";
var width;
var height;


var dir = "public";
var subDirectory = "public/uploads";

var outputFilePath;

// To create directory on the fly
if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir);

  fs.mkdirSync(subDirectory);
}

app.use(express.static("public"));

app.use(bodyParser.urlencoded({ extended: false }));

app.use(bodyParser.json());


// To upload the file
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/uploads");
  },
  filename: function (req, file, cb) {
    cb(
      null,
      file.fieldname + "-" + Date.now() + path.extname(file.originalname)
    );
  },
});

//Check for file type
const imageFilter = function (req, file, cb) {
  if (
    file.mimetype == "image/png" ||
    file.mimetype == "image/jpg" ||
    file.mimetype == "image/jpeg"
  ) {
    cb(null, true);
  } else {
    cb(null, false);
    return cb(new Error("Only .png, .jpg and .jpeg format allowed!"));
  }
};

var upload = multer({ storage: storage, fileFilter: imageFilter });

//Send indext.html file at root directory
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

//Function called when download button is pressed
app.post("/processimage", upload.single("file"), (req, res) => {
    format = req.body.format;
  
    //height and width of the image specified by the user
    width1 = parseInt(req.body.width);
    height1 = parseInt(req.body.height);
  

    //height and width of the original image
    dimensions = imageSize(req.file.path);
      width = parseInt(dimensions.width);
      height = parseInt(dimensions.height);

 //To  caluclate the size of the image   
/*  var stats = fs.statSync(req.file.path);
 var fileSizeInBytes = stats.size;
 Convert the file size to kilobytes (optional)
 var fileSizeInKilobytes = fileSizeInBytes / 1024;
 console.log(fileSizeInKilobytes);
*/

//To check for the size of the file
/* if(fileSizeInKilobytes>100){
    imageConversion.compressAccurately(req.file.path,100);
 } */

    //If nothing specified then default dimensions are used
    if (isNaN(width1) && isNaN(height1)) {
      processImage(width, height, req, res);
    } 
     
    //If both the values are specified
    else if (!isNaN(width1) && !isNaN(height1)) {

      processImage(width1, height1, req, res);
    
  }
     //if only width is specified
    else if(!isNaN(width1)){
     if(width1<width){
       width=width1;
     }
      processImage(width, null, req, res);
    
    }

    //if only height is specified
    else{
      if (height1 < height) {
        height = height1;
      } 
        processImage(null, height, req, res);
    }
    
  });

  //Resizes images and converts them to format specified and downloads them
  function processImage(width, height, req, res) {
    outputFilePath = Date.now() + "output." + format;
    if (req.file) {
      sharp(req.file.path)
        .resize(width, height,{   //Preserving aspect ratio, resize the image to be as large as possible 
          fit: "inside"           //while ensuring its dimensions are less than or equal to both those specified.
        })
        .toFile(outputFilePath, (err, info) => {
          if (err) throw err;
          res.download(outputFilePath, (err) => {
            if (err) throw err;
            //to delete the file after download
            fs.unlinkSync(req.file.path);
            fs.unlinkSync(outputFilePath);
          });
        });
    }
  }


app.listen(3000, () => {
  console.log(`App is listening on Port 3000`);
});