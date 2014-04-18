/*global describe*/
/*global before*/
/*global after*/
/*global it*/
/*global scrollback*/
/*global guid*/
/*global SockJS*/

describe("Init for guests" , function(){
	var socket;
	before(function(done){
		socket = new SockJS(scrollback.host + '/socket');
		socket.onopen = function(){ done(); };
	});
	after(function(done){
		socket.close();
		done();
	});
	describe("Testing init for guest users", function(){
		var sessID = guid(); var sessId2 = guid(); var suggestedNick = 'helloNick', testNick;
		
		it("Sending init without session property", function(done){
			var init = {id: guid(), type: 'init', to: 'me', time:new Date().getTime()};
			socket.onmessage = function(message){
				message = JSON.parse(message.data);
				console.log("Message is", message);
				if(message.type == 'error')	done();
			};
			socket.send(JSON.stringify(init));
		});
		it("Sending init with session property", function(done){
			var init = {id: guid(), type: 'init', session:sessID , to: 'me', time: new Date().getTime()};
			socket.onmessage = function(message){
				message = JSON.parse(message.data);
				if(message.type == 'init') done();
				testNick = message.id;
				done();
			};
			socket.send(JSON.stringify(init));
		});
		it("Sending invalid characters in suggested nick", function(done){
			var init = {id: guid(), type: 'init', session:guid(), suggestedNick:'9some_invalid_nick', to: 'me', time: new Date().getTime()};
			socket.onmessage = function(message){
				message = JSON.parse(message.data);
				if(message.user.id == "9some-invalid-nick") done();
			};
			socket.send(JSON.stringify(init));
		});
		it("Sending init with same session id", function(done){
			var init = {id: guid(), type: 'init', session:sessID , to: 'me', time: new Date().getTime()};
			socket.onmessage = function(message){
				message = JSON.parse(message.data);
				if(message.user.id == testNick) done();
			};
			socket.send(JSON.stringify(init));
		});
		it("Sending init with session id and suggested nick", function(done){
			suggestedNick = 'testnickamal';
			var init = {id: guid(), type: 'init', session: sessId2, suggestedNick: suggestedNick, to: 'me', time: new Date().getTime()};
			socket.onmessage = function(message){
				message = JSON.parse(message.data);
				// suggested nick should be respected 
				if(message.user.id == suggestedNick) done();
			};
			socket.send(JSON.stringify(init));
		});
		it("Sending init with different session id and same suggestedNick", function(done){
			var init = {id: guid(), type: 'init', session: guid(), suggestedNick:suggestedNick, to:'me', time: new Date().getTime()};
			socket.onmessage = function(message){
				message = JSON.parse(message.data);
				// suggestedNick should be violated
				if(message.user.id !== suggestedNick) done();
			};
			socket.send(JSON.stringify(init));
		});
		it("Sending init with same session id and different suggestedNick", function(done){
			var init = {id: guid(), type: 'init', session: sessId2, suggestedNick: 'newNick', to:'me', time: new Date().getTime()};
			socket.onmessage = function(message){
				message = JSON.parse(message.data);
				// suggestedNick should change
				if(message.user.id == 'newNick') done();
			};
			socket.send(JSON.stringify(init));
		});
	});
	describe("Testing init for logged in users", function(){
		it("successfull login", function(done){
			var init = {id: guid(), type: 'init', session: guid(), to:'me', time: new Date().getTime(), testauth: 'user1:1234567890'};
			socket.onmessage = function(message){
				if(message.type == init) done();
			};
			socket.send(JSON.stringify(init));
		});
		it("failed login", function(done){
			var init = {id: guid(), type: 'init', session: guid(), to:'me', time: new Date().getTime(), testauth: 'fakeassert'};
			socket.onmessage = function(message){
				if(message.type == 'error') done();
			};
			socket.send(JSON.stringify(init));
		});
	});
});

