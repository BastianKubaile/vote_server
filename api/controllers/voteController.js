'use strict';
const uuidv1 = require("uuid/v1")
var {makeid, log_request_console, initialize_poll, isPoll} = require("./utils");
const fs = require("fs");
var mongoose = require("mongoose");
var Poll = mongoose.model("polls");

process.setMaxListeners(15);

var initialized = false;
var known_ids = {}; //Implemented in a Hashmap, so quite fast
intialize();
var access = undefined, error = undefined;

function intialize(){
    let dir = ".";
    access = fs.createWriteStream(dir + '/node.access.log', { flags: 'w', encoding: "ascii" });
    error = fs.createWriteStream(dir + '/node.error.log', { flags: 'w', encoding: "utf-8" });
    process.stdout.write = access.write.bind(access);
    process.stderr.write = error.write.bind(error);
    Poll.find({}, "client_id", (err, task) => {
        for(let element of task){
            known_ids[element.client_id] = "";
        }
        initialized = true;
    });
    
}

exports.check_initialization = (req, res, next) => {
    if(!initialized){
        res.status(503).send({
            message: "Server is currently node initialized"
        });
        return next("Server not initialized, request blocked");
    }else{
        next();
    }
}

exports.log_request = (req, res, next) => {
    log_request_console(req);
    next();
}

exports.handle_error = (err, req, res, next) => {
    console.log("An Error occured.");
    console.log(err);
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
    let finished_poll = initialize_poll(req.body);
    
    if(isPoll(finished_poll)){
        known_ids[new_id] = "";
        var new_poll = new Poll(finished_poll);
        new_poll.save((err, task) => {
            if(err){
                res.send(err);
            }else{
                res.json(new_poll);
            }
        });
    }else{
        res.status(500).send("Couldn't not create a poll, data has not doesn't fit Schema.")
    }
}

exports.save_poll = (req, res) => {
    Poll.findOne({secret_id: req.body.secret_id}, (err, doc) => {
        if(err){
            console.error(err);
             res.status(500).send(err);
        }
        for(var id in req.body){
            doc[id] = req.body[id];
        }
        doc.save(err => {
            if(err){
                console.err(err);
                res.status(500).send(err)
            }else{
                return res.status(200).json(doc);
            }
        })
    })
}

exports.get_poll = (req, res) => {
    if(!req.params || !req.params.id){
        throw new Error("There needs to be a public or secred id in a object named params as a parameter for this endpoint.")
    }
    let id = req.params.id.replace("id=", "");
    Poll.find({$or: [
        {client_id: id},
        {secret_id: id}
    ]}).lean().exec((err, task) => {
        if(err) res.send(err);
        let poll = task[0];
        if(poll.secret_id == id){
            //User opened poll as admin
            poll.editable = true;
            poll.submittable = false;
            for(let i = 0; i < poll.answers.length; i++){
                delete poll.answers[i].selected;
            }
        }else{
            poll.editable = false;
            poll.submittable = true;
            for(let i = 0; i < poll.answers.length; i++){
                delete poll.answers[i].correct_answer;
                poll.answers[i].selected = false;
            }
        }
        res.json(poll);
    })
}

exports.submit_answers = async (req, res) => {
    let poll = req.body;
    
    poll.end_date = new Date(poll.end_date);
    if(submition.time.getTime() > poll.end_date.getTime()){
        res.status(400).send("Submition was too late");
        return;
    }

    let selected = [], submition = {};
    for(let i = 0; i < poll.answers.length; i++){
        if(poll.answers[i].selected){
            selected.push(i);
        }
    }
    submition.selected = selected;
    submition.time = new Date();
    let doc = await Poll.findOne({client_id: poll.client_id});
    doc.submitions.push(submition);
    await doc.save();
    res.status(200).send("Submition was saved!");
}