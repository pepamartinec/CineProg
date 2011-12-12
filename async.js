asyncblock  = require('asyncblock');

asyncblock(function(flow){
    console.time('time');

    setTimeout(flow.add(), 1000);
    setTimeout(flow.add(), 2000);
    flow.wait();

    console.timeEnd('time'); //2 seconds
});

console.log('here');