const tmi = require('tmi.js');
const express = require("express");
const bodyParser = require("body-parser");
const router = express.Router();
const app = express();
const fetch = require('node-fetch');
var cors = require('cors');

/* ---------------------- CODE FOR THE API ENDPOINTS ---------------------- */
const HOST = 'localhost'
const PORT = 8888
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Post request som kommer in från Overlay för att trigga chattmeddelanden
router.post('/overlay',  async (request, response) => {
  sendMessage(request.body.channel);
  response.end("success");
})

async function sendMessage(user_id){
  let data = await fetch('https://zywokd1ye3.execute-api.eu-north-1.amazonaws.com/dev/', {
    method: 'post',
    body: JSON.stringify({
      "user_id": user_id
    })
  }).then(res => res.json()).then(data => data);
  client.say("#" + data.username, data.link);
  console.log("Message sent to:" + " " + data.username);
}

router.post('/trigger', (request, response) => {
  console.log(request.body.channel);
  let temp_data = chatData.users[request.body.channel.slice(1)];
  let temp_data2 = chatData.campaigns[temp_data];
  client.say(request.body.channel, temp_data2[Object.keys(temp_data2)[0]])
  response.end("success");
})
//-------------------------------------------------------------------------------------


// router.post('/joinchat',(request,response) => {
//   //code to perform particular action.
//   //To access POST variable use req.body()methods.
//   console.log(request.body);
//   response.end('Request successful!');
//   });

app.use("/", router);

app.listen(PORT, ()=> console.log('WOHOO'))

/* ------------------------------------------------------------------------ */

/* Get the data for USERS and CAMPAIGNS on a 5 minute interval ------------ */
let newUsers = [];
let usersToJoin = [];
const getData = () => {
fetch('https://fkrjjkar07.execute-api.eu-north-1.amazonaws.com/dev/').then(res => {
  if(res.status !== 200){
    //throw new Error(res.status);
    return Promise.reject(res.status)
  }
  return res.json()}).then(data => {
  console.log('Fetched data successfully!');
  console.log(data);
  chatData = data;
  usersToJoin = [];
  const users = Object.keys(chatData.users);
  users.forEach((user) => {
    if(newUsers.includes(user) !== true){
      usersToJoin.push(user);
    }
  })
  newUsers = Object.keys(chatData.users);
  if(usersToJoin.length > 0) {
  addNewUsers(usersToJoin);
  }
  else{
    console.log("No new users")
  }
}).catch(error => console.log(error));

}


function addNewUsers(users){
  users.forEach((user, index) => {
    setTimeout(() => {
      client.join(user).then(res => console.log('Joined channel:' + " " + res[0])).catch(err => console.log(err))
    }, index * 500)
    },);
}
const interval = setInterval(getData, 300000);
interval;

/* ------------------------------------------------------------------------- */ 

// Define configuration options
const opts = {
  identity: {
    username: 'adlybot',
    password: 'oauth:90fsydnw4g6p0qjbrz7uq95cqsv42w'
  },
  channels: [
  ]
};

let chatData = {}

// Create a client with our options
const client = new tmi.client(opts);

// Register our event handlers (defined below)
client.on('message', onMessageHandler);
client.on('connected', onConnectedHandler);
client.on('connected', getData);

// Connect to Twitch:
client.connect();

// Called every time a message comes in
function onMessageHandler (target, context, msg, self) {
  if (self) { return; } // Ignore messages from the bot

  // Remove whitespace from chat message
  const commandName = msg.trim();
    console.log(target)

  let temp_data = chatData.users[target.slice(1)];
  let temp_data2 = chatData.campaigns[temp_data];
  console.log(temp_data2);
  // If the command is known, let's execute it
  if(temp_data2){
  if (commandName === Object.keys(temp_data2)[0]){
    client.say(target, temp_data2[Object.keys(temp_data2)[0]])
    console.log(`* Executed ${commandName} command`)
  }
  else {
    console.log(`* Unknown command ${commandName}`)
  }
}
else {console.log('No commands detected')}
  // if (commandName === settings[target].campaign) {


  //   client.say(target, settings[target].message);
  //   console.log(`* Executed ${commandName} command`);
  // } else {
  //   console.log(`* Unknown command ${commandName}`);
  // }
}

// Function called when the "dice" command is issued
function rollDice () {
  const sides = 6;
  return Math.floor(Math.random() * sides) + 1;
}

// Called every time the bot connects to Twitch chat
function onConnectedHandler (addr, port) {
  console.log(`* Connected to ${addr}:${port}`);
}