var cors = require("cors");
var express = require("express"),
    app = express(),
    port = process.env.PORT || 4000,
    mongoose = require("mongoose"),
    polls = require("./api/models/voteModel"),
    bodyParser = require("body-parser");
    
    
app.use(cors());
mongoose.Promise = global.Promise;
mongoose.connect("mongodb://localhost/Votedb", {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

var routes = require("./api/routes/voteRoutes");
routes(app);

app.listen(port);

console.log(`Listening on port ${port}`)