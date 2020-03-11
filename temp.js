var mongoose = require("mongoose");

var child_schema = new mongoose.Schema({
    bar: Number
});

var parent_schema = new mongoose.Schema({
    foo: String,
    bars: [child_schema]
});

let tree = Object.keys(parent_schema.tree).filter(str => str !== "_id");

console.log("End");
