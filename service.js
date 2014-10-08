var WebSocketServer = require('ws').Server;
var uuid = require('node-uuid');
var wss = new WebSocketServer({port:8080});
wss.on('connection', onConnection);
var clients = [];
var master;
var tweets = [];

function onConnection(ws)
{
    ws.on('message', onMessage);
    ws.on('close', onClose);   
    var id = uuid.v1();
    clients[id] = {ws:ws, id:id};
    ws.id = id; 
	try {
    	ws.send(JSON.stringify({type:'uuid', data:{id:id}}));
	}
	catch (e) {

	}    
}
function onMessage(data, flags)
{
	var currentWs = this;
	var event = JSON.parse(data);
	switch(event.type){
		
		case 'UserType':
			console.log("user type: "+ event.data.user);	
			if(event.data.user =="slave"){
				currentWs.type = "slave";

			}else if(event.data.user == "master"){						
				master = currentWs;
				master.type = "master";
				initMaster();					
			}
		break;
		case 'UserTweet':
			tweets.push(event.data);
			try {
				currentWs.send(JSON.stringify({type:'UserTurn', data:{turn:tweets.length}}));			   
			}
			catch (e) {

			}

		break;
	}	
}
function initMaster(){
	
	var t = setInterval(function(){
		if(master){
			if(tweets.length != 0){
				var tweet = tweets.pop();
				try{
					master.send(JSON.stringify({type:'UserTweet', data:{tweet:tweet}}));
				}catch(e){

				}
			}else{
				try{
					master.send(JSON.stringify({type:'UserTweet', data:{tweet:false}}));	
				}catch(e){

				}				
			}				
		}else{
			clearInterval(t);
		}
	
	},5000);
	
}
function onClose()
{
    if(this.type == 'master'){
    	master = null;
    }
    switch(this.type){
    
    
    }
}
console.log("service running");