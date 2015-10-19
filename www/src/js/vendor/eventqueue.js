var EventQueue = function(ttl){

	ttl = ttl || 5000;

  return {
    
    run: (function(){

      var eventstack = [];
      var running = false;
	  var timeout = false;

      var popAndPerform = function(){

		if(timeout) clearTimeout(timeout);
        var action = eventstack.shift();

        if(!action){
          running = false;
		  if(timeout) clearTimeout(timeout);
          return;
        }
		
		timeout = setTimeout(function(){
			console.error(new Error("EventQueue Blocked!"));
			console.error(action.toString());
		},ttl);

        running = true;

        var res = new Q.Promise(action);
        res.then(function(){
          popAndPerform();
        });
		
      }

      return function(cb){
        eventstack.push(cb);
        if(!running){ popAndPerform(); }
      }

    })()
    
  }

}

/*
var queue = new EventQueue();

queue.run(function(done){
  console.log("one");
  done();
});

queue.run(function(done){
  setTimeout(function(){
    console.log("two");
    done();  
  },2000)
});

queue.run(function(done){
  console.log("three");
  done();
});

var second = new EventQueue();

second.run(function(done){
  setTimeout(function(){
    console.log("second queue");
    done();  
  },2000)
});

*/