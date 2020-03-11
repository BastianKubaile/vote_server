const pollSchema = require("../models/voteModel").pollSchema;

module.exports.makeid = (length) => {
    var result           = '';
    var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
       result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

module.exports.log_request_console = req => {
    const content_type = req.get("content-type");
    const query = req.query;
    const now = new Date();
    const h = now.getHours(),mins = now.getMinutes(), s = now.getSeconds();
    console.log("***")
    console.log(`Recieved a ${req.method} request at ${h}:${mins} ${s} seconds`)
    console.log(`Request recieved at  ${req.protocol}://${req.get("host")}${req.originalUrl}`)
    if(Object.keys(query).length > 0) console.log(`Query: ${JSON.stringify(query)}`);
    if(content_type == "application/json"){
        console.log(`content-type:  ${content_type}`);
        console.log(JSON.stringify(req.body, null, "\t"))
    } 
}

module.exports.isPoll = (poll) => {
    let required_attributes = Object.keys(pollSchema.tree).filter(str => 
        (str !== "_id") && (str !== "__v") && (str !== "id")) 
    for(let key of required_attributes){
        if(poll[key] === undefined) return false;
    }
    return true;
}

module.exports.isPublicPoll = (poll) => {
    if(!this.isPoll(poll)) return false;
    if(poll.editable) return false;
    let is_correct_answer = false, is_selected = false;
    for(let answer of poll.answers){
        if(answer.correct_answer !== undefined){
            is_correct_answer = true;
        }
        if(answer.selected !== undefined){
            is_selected = true;
        }
    }
    if(is_selected === is_correct_answer){
        throw new Error("This Poll is neither public nor private, but formatted wrongly!")
    }
    if(is_correct_answer){
        return false;
    }
    return true;
}

module.exports.initialize_poll = (raw_poll) => {
    let attribs = Object.keys(raw_poll)
    if(attribs.indexOf("multipleChoice") < 0) raw_poll.multipleChoice = true;
    if(attribs.indexOf("submitions") < 0) raw_poll.submitions = [];
    if(attribs.indexOf("end_date") < 0) raw_poll.end_date = Date.now().toString();
    if(attribs.indexOf("submittable") < 0) raw_poll.submittable = true;
    return raw_poll
}