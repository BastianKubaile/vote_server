import test from "ava";
var {isPoll, isPublicPoll} = require("../api/controllers/utils");
const fetch = require("node-fetch");
const Bluebird = require("bluebird");
fetch.Promise = Bluebird;
const data = require("./data/data");
const port = process.env.PORT || 4000;
const url = `http://localhost:${port}`

const poll_url = url + "/poll";
const single_choice = {}, multiple_choice = {};

const save_poll = async (poll, id_store, )  => {
    var response = undefined;
    await fetch(poll_url, {
        method: 'POST',
        body: JSON.stringify(poll),
        headers: {"Content-Type": "application/json"}
    })
    .then(res => res.json())
    .catch(err => {console.error(err)})
    .then(json => {
        id_store.client_id = json.client_id;
        id_store.secret_id = json.secret_id;
        response = json;
    });
    return response;
}

const get_poll = async id => {
    let res;
    await fetch(poll_url + `/id=${id}`,{ 
        method: "GET"
    })
    .then(res => {
        return res.json()
    })
    .then(temp => {
        res = temp;
    });
    return res;

}

test('Adding a Poll', async t => {
    let response = await save_poll(data.single_choice_poll, single_choice);
    t.assert(isPoll(response));
})

test('Adding and retrieving a Poll, checking that it can be retrieved publicly and privately', async t => {
    let get_json, post_json;
    get_json = await save_poll(data.multiple_choice_poll, multiple_choice);
    t.assert(isPoll(get_json));
    post_json = await get_poll(get_json.secret_id);
    t.assert(isPoll(post_json));
    t.assert(!isPublicPoll(post_json))
    t.assert(get_json.client_id === post_json.client_id);
});

test("Checking that a poll can be viewied privately and publically", async t => {
    if(!(single_choice.client_id && single_choice.secret_id)){
        await save_poll(data.single_choice_poll, single_choice);
    }
    let public_poll, private_poll;
    public_poll = await get_poll(single_choice.client_id);
    t.assert(isPublicPoll(public_poll));
    private_poll = await get_poll(single_choice.secret_id);
    t.assert(!isPublicPoll(private_poll));
});

test("Adding a Single Choice Submition", async t => {
    let poll;
    t.pass();
});
