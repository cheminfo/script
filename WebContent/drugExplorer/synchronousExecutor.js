var synchronousExecutor = (function () {
    var app, service;
    
    app = {
        queue : [],
        
        cursor : -1,
        
        add : function (routine, delay) {
            delay = delay || 0;
            
            app.queue.push(function () {
                window.setTimeout(function () {
                    routine();
                    app.next();
                }, delay);
            });
        },
        
        next : function () {
            app.cursor += 1;
            
            if (app.cursor >= app.queue.length) {
                return;
            }
            
            app.queue[app.cursor]();
        },
        
        run : function () {
            app.next();
        }
    };
    
    return service = {
        add : app.add,
        run : app.run
    };
})();
