'use strict';
const controller = require("../controllers/voteController");

module.exports = function(app){
    var vote = require("../controllers/voteController");

    app.use(controller.wait_for_intialized);
    //Vote Routes
    app.route("/poll")
        .post(vote.add_poll);
        
    app.route("/poll/:id")
        .get(vote.get_poll);
    
    app.route("/poll/submit")
        .post(vote.submit_answers);
}