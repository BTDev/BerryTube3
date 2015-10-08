var EventQueue = function(){

  return {
    
    run: (function(){

      var eventstack = [];
      var running = false;

      var popAndPerform = function(){

        var action = eventstack.shift();

        if(!action){
          running = false;
          return;
        }

        running = true;

        var res = new Q.Promise(action);
        res.then(function(){
          popAndPerform();
        })
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