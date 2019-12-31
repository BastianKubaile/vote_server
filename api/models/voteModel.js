'use strict';
var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var ObjectID = mongoose.Schema.Types.ObjectId;

const AnswerSchema = new Schema({
    name: String,
    correct_answer: Boolean
});

const SubmitionSchema = {
    time: Date,
    selected: [Number]
}

var PollSchema = new Schema({
    client_id: String,
    secret_id: String,
    question: String,
    multipleChoice: Boolean,
    submittable: Boolean,
    end_date: Date,
    answers: [AnswerSchema],
    submitions: [SubmitionSchema]

})

module.exports = mongoose.model("polls", PollSchema);