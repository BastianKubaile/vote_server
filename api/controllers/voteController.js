'use strict';
const uuidv1 = require("uuid/v1")
const util = require("util");
var mongoose = require("mongoose");
var Poll = mongoose.model("polls");

var known_ids = {}; //Hashmap
let initialized = false;
Poll.find({}, "client_id", (err, task) => {
    for(let element of task){
        known_ids[element.client_id] = "";
    }
    initialized = true;
});

function makeid(length) {
    var result           = '';
    var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
       result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

exports.wait_for_intialized = (req, res, next) => {
    function sleep_till_initialized(){
        if(!initialized){
            setTimeout(sleep_till_initialized,10);
        }
    };
    sleep_till_initialized();
    next();
}

exports.add_poll = (req, res) => {
    if(!req.body.secret_id==""){
        //This poll is already known and just has been modified
        return this.save_poll(req, res);
    }
    let new_id = makeid(8);
    while(new_id in known_ids){
        new_id = makeid(8);
    }
    req.body.client_id = new_id;
    req.body.secret_id = uuidv1(); 
    known_ids[new_id] = "";
    var new_poll = new Poll(req.body);
    new_poll.save((err, task) => {
        if(err){
            res.send(err);
        }else{
            res.json(new_poll);
        }
    });
}

exports.save_poll = (req, res) => {
    Poll.findOne({secret_id: req.body.secret_id}, (err, doc) => {
        if(err) return console.log(err);
        for(var id in req.body){
            doc[id] = req.body[id];
        }
        doc.save(err => {
            if(err){
                console.log(err);
                res.status(500).send(err)
            }else{
                return res.status(200).json(doc);
            }
        })
    })
}

exports.get_poll = (req, res) => {
    Poll.find({$or: [
        {client_id: req.params.id},
        {secret_id: req.params.id}
    ]}).lean().exec((err, task) => {
        if(err) res.send(err);
        let poll = task[0];
        if(poll.secret_id == req.params.id){
            poll.editable = true;
            poll.submittable = false;
        }
        res.json(poll);
    })
}

exports.submit_answers = async (req, res) => {
    let poll = req.body;
    poll.end_date = new Date(poll.end_date);
    let selected = [];
    for(let i = 0; i < poll.answers.length; i++){
        if(poll.answers[i].selected){
            selected.push(i);
        }
    }
    let submition = {};
    submition.selected = selected;
    submition.time = new Date();
    if(submition.time.getTime() > poll.end_date.getTime()){
        res.status(400).send("Submition was too late");
        return;
    }
    let doc = await Poll.findOne({client_id: poll.client_id});
    doc.submitions.push(submition);
    await doc.save();
    res.status(200).send("Submition was saved!");
}