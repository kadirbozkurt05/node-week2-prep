const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const fs = require("fs");

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.post("/blogs", (req, res) => {
  const blog = { title: req.body.title, content: req.body.content };
  if (blog.content && blog.title) {
    if (!fs.existsSync("blogs")) {
      fs.mkdirSync("blogs");
    }

    fs.writeFileSync(`blogs/${blog.title}`, JSON.stringify(blog.content));
    res.statusCode = 201;
    res.json({ message: `${blog.title} created!` });
    res.end();
  } else {
    error400(res);
  }
});

app.put("/posts/:title", (req, res) => {
  const blog = { title: req.body.title, content: req.body.content };

  if (!fs.existsSync(`blogs/${req.params.title}`)) {
    error404(res, "This blog doesn't exist!");
  } else {
    if (blog.content && blog.title) {
      try {
        fs.renameSync(`blogs/${req.params.title}`, `blogs/${blog.title}`);
        fs.writeFileSync(`blogs/${blog.title}`, JSON.stringify(blog.content));
        res.statusCode = 201;
        res.json({ message: `${req.params.title} is updated!` });
        res.end();
      } catch {
        error404(res);
      }
    } else {
      error400(res);
    }
  }
});

app.delete("/blogs/:title", (req, res) => {
  if (!fs.existsSync(`blogs/${req.params.title}`)) {
    error404(res, "This blog doesn't exist!");
  } else {
    try {
      fs.unlinkSync(`blogs/${req.params.title}`);
      res.json({
        message: `${req.params.title} has been deleted!`,
      });
      res.statusCode = 204;
      res.end();
    } catch {
      error404(res);
    }
  }
});

app.get("/blogs/:title", (req, res) => {
  if (!fs.existsSync(`blogs/${req.params.title}`)) {
    error404(res, "This blog doesn't exist!");
  } else {
    try {
      const post = fs.readFileSync(`blogs/${req.params.title}`);
      res.contentType = "text/plain";
      res.status = 200;
      res.end(post);
    } catch {
      error404(res);
    }
  }
});

app.get("/blogs", (req, res) => {
  try {
    const files = fs.readdirSync("blogs");
    if (files.length !== 0) {
      res.statusCode = 200;
      res.contentType = "application/json";
      res.json({ blogs: files });
      res.end();
    } else {
      res.statusCode = 301;
      res.contentType = "application/json";
      res.json({ message: "There is no blog post!" });
      res.end();
    }
  } catch {
    error404(res);
  }
});

const error404 = (res, message = "Not Found!") => {
  res.statusCode = 404;
  res.json({ message: message });
  res.end();
};

const error400 = (res, message = "Object is not processable") => {
  res.contentType = "application/json";
  res.statusCode = 400;
  res.json({ message: message });
  res.end();
};

app.listen(3000);
