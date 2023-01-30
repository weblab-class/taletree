/*
|--------------------------------------------------------------------------
| api.js -- server routes
|--------------------------------------------------------------------------
|
| This file defines the routes for your server.
|
*/

const express = require("express");
// import models so we can interact with the database

var app = express()
var bodyParser = require('body-parser');
var mongoose = require('mongoose')

var fs = require('fs');
var path = require('path');
require('dotenv/config');

const User = require("./models/user");
const Snippet = require("./models/snippet");
const Tree = require("./models/tree");

// import authentication library
const auth = require("./auth");

// api endpoints: all these paths will be prefixed with "/api/"
const router = express.Router();

//initialize socket
const socketManager = require("./server-socket");

router.post("/login", auth.login);
router.post("/logout", auth.logout);
router.get("/whoami", (req, res) => {
  if (!req.user) {
    // not logged in
    return res.send({});
  }

  res.send(req.user);
});

router.post("/initsocket", (req, res) => {
  // do nothing if user not logged in
  if (req.user)
    socketManager.addUser(req.user, socketManager.getSocketFromSocketID(req.body.socketid));
  res.send({});
});

// |------------------------------|
// | write your API methods below!|
// |------------------------------|

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

var multer = require('multer');
 
var storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads')
    },
    filename: (req, file, cb) => {
        cb(null, file.fieldname + '-' + Date.now())
    }
});

var upload = multer({ storage: storage });

var imgModel = require('./models/image');

app.get('/', (req, res) => {
  imgModel.find({}, (err, items) => { 
      if (err) {
          console.log(err);
          res.status(500).send('An error occurred', err);
      }
      else {
          res.render('imagesPage', { items: items });
      }
  });
});

app.post('/', upload.single('image'), (req, res, next) => {
 
  var obj = {
      name: req.body.name,
      desc: req.body.desc,
      img: {
          data: fs.readFileSync(path.join(__dirname + '/uploads/' + req.file.filename)),
          contentType: 'image/png'
      }
  }
  imgModel.create(obj, (err, item) => {
      if (err) {
          console.log(err);
      }
      else {
          // item.save();
          res.redirect('/');
      }
  });
});



//returns an object mapping user ids to profile picture URLs
router.get("/profile-pictures", (req, res) => {
  const queryDB = async () => {
    if (req.query.userIds === "") {
      res.send({});
      return;
    }
    const users = await User.find({ _id: { $in: req.query.userIds.split(",") } }).lean();

    res.send(
      users.reduce((acc, curr) => {
        acc[curr._id] = curr.pictureURL;
        return acc;
      })
    );
  };
  queryDB();
});

router.post("/new-tree", (req, res) => {
  console.log("making new tree");
  auth.ensureLoggedIn(req, res, () => {
    const tree = new Tree({ snippets: [] });
    tree.save().then((ret) => {
      res.send(ret._id);
    });
  });
});

router.get("/snippets", (req, res) => {
  console.log(`api called, grabbing several snippets for user with id ${req.query.userId}`);
  const getSnippets = async () => {
    const likedSnippets = await Snippet.find().sort({ numLikes: -1 });
    const recentSnippets = await Snippet.find().sort();
    //res.send({ 1: likedSnippets, 0: recentSnippets });
    res.send([
      { tabName: "New", tabData: recentSnippets },
      { tabName: "Most Popular", tabData: likedSnippets },
    ]);
  };
  getSnippets();
});

router.get("/treeview", (req, res) => {
  console.log("api called, finding snippet with id " + req.query._id);
  const getTree = async () => {
    const snippet = await Snippet.findById(req.query._id).lean();
    if (!snippet) {
      res.status(404).send("Snippet not found");
      return;
    }
    const tree = await Tree.findById(snippet.treeId);
    console.log("Got treeid " + tree._id);
    const snippetList = await Snippet.find({ _id: { $in: tree.snippets } }).lean();
    res.send(
      snippetList.reduce((acc, curr) => {
        acc[curr._id] = curr;
        return acc;
      }, {})
    );
  };
  getTree();
});

router.post("/new-snippet", (req, res) => {
  console.log("posting snippet to DB");
  auth.ensureLoggedIn(req, res, () => {
    console.log("from post: user is indeed logged in");
    const leaf = new Snippet({
      authorName: req.body.authorName,
      authorId: req.body.authorId,
      content: req.body.input,
      children: [],
      numLikes: 0,
      parentId: req.body.parentId,
      treeId: req.body.treeId,
    });
    leaf.save().then((snippet) => {
      res.send(snippet);
      //add to parent snippet's children
      Snippet.findById(req.body.parentId).then((parent) => {
        parent.children.push(snippet._id);
        parent.save();
      });
      //add to author's contribs
      User.findById(snippet.authorId).then((user) => {
        user.contribs.push(snippet._id);
        user.save();
      });
      //add to tree
      Tree.findById(snippet.treeId).then((tree) => {
        tree.snippets.push(snippet._id);
        tree.save();
      });
    });
  });
});

router.get("/profile", (req, res) => {
  console.log("getting profile data of user " + req.query.id);
  User.findById(req.query.id)
    .then((user) => {
      res.send(user);
    })
    .catch((err) => {
      res.status(400).send(err);
    });
});

router.get("/users", (req, res) => {
  const query = async () => {
    if (req.query.ids === "") {
      res.send([]);
      return;
    }
    const ret = await User.find({ _id: { $in: req.query.ids.split(",") } }).catch((err) => {
      res.status(400).send(err);
      return;
    });
    res.send(ret);
  };
  query();
});

router.get("/profile-snippet-data", (req, res) => {
  console.log("getting snippet data");
  console.log(req.query);
  const query = async (field) => {
    const ids = req.query[field];
    if (ids === "") return [];
    return Snippet.find({ _id: { $in: ids.split(",") } }).catch((err) => {
      res.status(400).send(err);
    });
  };
  let promises = [];
  let fields = [];
  for (const field in req.query) {
    const list = query(field);
    promises.push(list);
    fields.push(field);
  }
  let ret = {};
  Promise.all(promises).then((values) => {
    for (let i = 0; i < values.length; i++) {
      if (!values[i]) return; //in case error occurred in query
      ret[fields[i]] = values[i];
    }
    res.send(ret);
  });
});

//router.post("/snippet-attribs", (req, res) => {
//  console.log("changing user's favorites/bookmarks");
//  auth.ensureLoggedIn(req, res, () => {
//    console.log("from post: user is indeed logged in");
//    favorite = req.body.attrib === "favorite";
//    let guy = undefined;
//    User.findById(req.body.viewer)
//      .then((user) => {
//        guy = user;
//        return favorite ? user.favorites : user.bookmarks;
//      })
//      .then((attrib) => {
//        console.log(attrib);
//        if (req.body.state) attrib.push(req.body._id);
//        else attrib = attrib.filter((s) => s != req.body._id);
//        return favorite
//          ? Object.assign(guy, { favorites: attrib })
//          : Object.assign(guy, { bookmarks: attrib });
//      })
//      .then((user) => {
//        return user.save();
//      })
//      .then((updatedUser) => {
//        res.json({ msg: "user updated", updatedUser });
//      });
//  });
//});

router.post("/snippet-attribs", (req, res) => {
  console.log("changing user's favorites/bookmarks");
  auth.ensureLoggedIn(req, res, () => {
    const updateDB = async () => {
      const user = await User.findById(req.body.viewerId);
      if (req.body.state) user[req.body.attrib].push(req.body._id);
      else user[req.body.attrib] = user[req.body.attrib].filter((s) => s !== req.body._id);
      return user.save();
    };
    updateDB();
  });
});

// anything else falls to this "not found" case
router.all("*", (req, res) => {
  console.log(`API route not found: ${req.method} ${req.url}`);
  res.status(404).send({ msg: "API route not found" });
});

module.exports = router;
