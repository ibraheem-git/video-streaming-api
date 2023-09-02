const express = require('express');
const app = express();
const mongoose = require('mongoose')
const session = require("express-session")
const nodemailer = require('nodemailer')
const ejs = require("ejs")
const router = require('./routes/post')
const User = require('./models/Users')
const video = require('./models/videos')
const viewed = require('./models/viewed')
const fs = require('fs');



app.set('view engine', 'ejs')


const dbString = mongoose.connect("mongodb://localhost:27017/test")
.then(()=> console.log("DB Connected Successfully"))
.catch((error) => console.log("Connection String error") ) 

// const dbOption = {
//     useNewUrlParser: true,
//     useUnifiedTopology: true
// }

// const connection = mongoose.createConnection('mongodb://localhost:27017/test', dbOption)


// const sessionStore = new MongoStore({
//     mongooseConnection: connection,
//     collection: "sessions",
//     mongoUrl: 'mongodb://localhost:27017/test'
// })

// app.use(session({
//     secret: 'keyboard cat',
//     resave: false,
//     saveUninitialized: true,
//     store: sessionStore,
//     cookie: { 
//         secure: true,
//         maxAge: 1000 * 60 * 60 * 24
//     }
    
//   }))


app.use(session({ 
    secret: 'keyboard cat', 
    cookie: { maxAge: 60000 },
    resave: false,
    saveUninitialized: true
}))

app.use(express.urlencoded({extended:false}))
app.use(express.json())
app.use(router)



// app.get('/', ( req, res) => {
//     res.send('hello' + JSON.stringify(req))
//     // res.render('post')
// })

app.get('/login', (req, res) => {
    //  console.log(req.session.cookie)
    res.render('login', { err: req.query.err || '' })
})

app.get('/signup', (req, res) => {
   res.render('signUp', { err: ''})
})

app.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('login')
})

app.get('/verify', (req, res) => {
    res.render('verify')
})

app.get('/dashb', ( req, res) => {
    // console.log('dashboard session', req.session)
    if(!req.session.user) {
        return res.redirect('/login?err=You need to be logged in to proceed')   
    }
    return res.render('dashb', { user: req.session.user })
    
})

app.get('/videos', async( req, res) => {
    if(!req.session.user) {
        return res.redirect('/login?err=You need to be logged in to proceed')   
    }
    const { _id } = req.session.user;
    const recent_videos = await viewed.find({ user_id: _id }).select('name').lean();
    return res.render('video', { user: req.session.user, name: req.query.name ?? '', recent_videos })
})

app.get('/edit', ( req, res) => {
    if(!req.session.user) {
        return res.redirect('/login?err=You need to be logged in to proceed')   
    }
    res.render('edit', { user: req.session.user })
}) 

app.get('/stream', async(req, res) => {

    console.log('------ starting -------')
    const name = req.query.name;
    if(!name) {
        return;
    }
    if(!req.session.user) {
        return;  
    }
    const { _id } = req.session.user;
    const is_video_exist = await viewed.findOne({ user_id: _id, name });
    if(!is_video_exist) {
        await viewed.create({
            user_id: _id,
            name
        })
    }
    const file = __dirname + '/vid/'+name+'.mp4';
    const fileSize = fs.statSync(file).size;
    // console.log('file size', fileSize);

    const range = req.headers.range;
    // console.log('range', range);

    const chunk_size = 10 ** 6; 

    const start = Number( range.replace( /\D/g, '') );
    // console.log('start', start );

    const end = Math.min( start + chunk_size, fileSize - 1 );
    // console.log('end', end);

    const headers = {
        "content-range": `bytes ${start}-${end}/${fileSize}`,
        "accept-range": 'bytes',
        "content-length": fileSize,
        "content-type": "video/mp4"
    }
    // console.log('headers', headers);

    res.writeHead(206, headers);

    const videoStream = fs.createReadStream( file, { start, end } );

    videoStream.pipe(res);

    // res.sendFile( file );
})






const port = 3000;

app.listen(port, () => {
    console.log(`Server running on port ${port}`)
})