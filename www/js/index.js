/*
    SimpleSerial index.js
    Created 7 May 2013
    Modified 9 May 2013
    by Tom Igoe
*/


var app = {
    macAddress: "20:13:11:11:48:43",  // get your mac address from bluetoothSerial.list
    chars: "",
    speed_left: 0,
    speed_right: 0,

/*
    Application constructor
 */
    initialize: function() {
    	
    	var left_motor_speed = document.getElementById("left-motor-speed");
    	var right_motor_speed = document.getElementById("right-motor-speed");
    	
    	
    	
        this.bindEvents();
        console.log("Starting SimpleSerial app");
        
        //listeningElement.setAttribute('style', 'display:none;');
        
        vec = Object.seal({
		    x: 0,
		    y: 0
		});
		
		tester = $('#tester');
		tester.draggable();
		
		JoyStick('#joystick1', 120, function(magnitude, theta, x, y) {
		    
		    console.log(magnitude, theta, x, y);
		    
		    //cap at 50
		    y = y > 100 ? 100 : y;
		    y = y < -100 ? -100 : y;
		    x = x > 100 ? 100 : x;
		    x = x < -100 ? -100 : x;
		    
		    //speed_left = speed_right = Math.floor(y / 50 * 100);
		    
		    app.tankdrive(x, y);
		    
		    
		    //vec.x = 10 * (ximpulse / 80);
		    //vec.y = 10 * (yimpulse / 80);
		    
		    //console.log(vec.x, vec.y);
		});
		
		iid = setInterval(function() {
		    
		    var command = "{left:" + app.speed_left + ",right:" + app.speed_right + "}\n";
		    
		    bluetoothSerial.write(command, app.successWrite, app.failWrite);
		    
		    
		    //console.log(magnitude, theta, ximpulse, yimpulse);
		    left_motor_speed.innerHTML = app.speed_left;
		    right_motor_speed.innerHTML = app.speed_right;
		    
		    //console.log(vec, tester.css('top'), tester.css('left'));
		    //tester.css('top', (parseInt(tester.css('top').substr(0, tester.css('top').length - 2), 10) - vec.y) + 'px');
		    //tester.css('left', (parseInt(tester.css('left').substr(0, tester.css('left').length - 2), 10) + vec.x) + 'px');
		    
		}, 50);
        
    },
    
    tankdrive: function(x, y) {
    	
	    // first Compute the angle in deg
		
	    // First hypotenuse
	    var z = Math.sqrt(x*x + y*y);
	    
	    if(z == 0) {
	    	
	    	this.speed_left = 0;
	    	this.speed_right = 0;
	    	
	    	return;
	    	
	    }
	    
	    // angle in radians
	    rad = Math.acos(Math.abs(x)/z);
	    // and in degrees
	    angle = rad*180/Math.PI;
	
	    // Now angle indicates the measure of turn
	    // Along a straight line, with an angle o, the turn co-efficient is same
	    // this applies for angles between 0-90, with angle 0 the co-eff is -1
	    // with angle 45, the co-efficient is 0 and with angle 90, it is 1
	    var tcoeff = -1 + (angle/90)*2;
	    var turn = tcoeff * Math.abs(Math.abs(y) - Math.abs(x));
	    turn = Math.round(turn*100)/100;
	
	    // And max of y or x is the movement
	    var move = Math.max(Math.abs(y),Math.abs(x));
	
	    // First and third quadrant
	    if( (x >= 0 && y >= 0) || (x < 0 &&  y < 0) ) {
	        this.speed_left = move;
	        this.speed_right = turn;
	    } else {
	        this.speed_right = move;
	        this.speed_left = turn;
	    }
	
	    // Reverse polarity
	    if(y < 0) {
	        this.speed_left = 0 - this.speed_left;
	        this.speed_right = 0 - this.speed_right;
	    }
	    
	    this.speed_left = Math.floor(this.speed_left);
	    this.speed_right = Math.floor(this.speed_right);
	    
	},
    
	/*
	    bind any events that are required on startup to listeners:
	*/
    bindEvents: function() {
        
        document.addEventListener('deviceready', this.onDeviceReady, false);
        connectButton.addEventListener('touchend', app.manageConnection, false);
        
        // left.addEventListener('touchend', app.left, false);
        // forward.addEventListener('touchend', app.forward, false);
        // back.addEventListener('touchend', app.back, false);
        // right.addEventListener('touchend', app.right, false);
//         
        // var stop = document.getElementById("stop");
        // stop.addEventListener('touchend', app.stop, false);
        
    },
	
	left: function() {
		bluetoothSerial.write('a', app.successWrite, app.failWrite);
	},
	
	forward: function() {
		bluetoothSerial.write('w', app.successWrite, app.failWrite);
	},
	
	back: function() {
		bluetoothSerial.write('s', app.successWrite, app.failWrite);
	},
	
	right: function() {
		bluetoothSerial.write('d', app.successWrite, app.failWrite);
	},
	
	stop: function() {
		bluetoothSerial.write('T', app.successWrite, app.failWrite);
	},
	
	successWrite: function() {
		//alert('successful write');
	},
	
	failWrite: function() {
		alert('fail write');
	},
	
/*
    this runs when the device is ready for user interaction:
*/
    onDeviceReady: function() {
        // check to see if Bluetooth is turned on.
        // this function is called only
        //if isEnabled(), below, returns success:
        var listPorts = function() {
            // list the available BT ports:
            bluetoothSerial.list(
                function(results) {
                    app.display(JSON.stringify(results));
                },
                function(error) {
                    app.display(JSON.stringify(error));
                }
            );
        }

        // if isEnabled returns failure, this function is called:
        var notEnabled = function() {
            app.display("Bluetooth is not enabled.")
        }

         // check if Bluetooth is on:
        bluetoothSerial.isEnabled(
            listPorts,
            notEnabled
        );
    },
/*
    Connects if not connected, and disconnects if connected:
*/
    manageConnection: function() {

        // connect() will get called only if isConnected() (below)
        // returns failure. In other words, if not connected, then connect:
        var connect = function () {
            // if not connected, do this:
            // clear the screen and display an attempt to connect
            app.clear();
            app.display("Attempting to connect. " +
                "Make sure the serial port is open on the target device.");
            // attempt to connect:
            bluetoothSerial.connect(
                app.macAddress,  // device to connect to
                app.openPort,    // start listening if you succeed
                app.showError    // show the error if you fail
            );
        };

        // disconnect() will get called only if isConnected() (below)
        // returns success  In other words, if  connected, then disconnect:
        var disconnect = function () {
            app.display("attempting to disconnect");
            // if connected, do this:
            bluetoothSerial.disconnect(
                app.closePort,     // stop listening to the port
                app.showError      // show the error if you fail
            );
        };

        // here's the real action of the manageConnection function:
        bluetoothSerial.isConnected(disconnect, connect);
    },
/*
    subscribes to a Bluetooth serial listener for newline
    and changes the button:
*/
    openPort: function() {
        // if you get a good Bluetooth serial connection:
        app.display("Connected to: " + app.macAddress);
        // change the button's name:
        connectButton.innerHTML = "Disconnect";
        // set up a listener to listen for newlines
        // and display any new data that's come in since
        // the last newline:
        bluetoothSerial.subscribe('\n', function (data) {
            app.clear();
            app.display(data);
        });
    },

/*
    unsubscribes from any Bluetooth serial listener and changes the button:
*/
    closePort: function() {
        // if you get a good Bluetooth serial connection:
        app.display("Disconnected from: " + app.macAddress);
        // change the button's name:
        connectButton.innerHTML = "Connect";
        // unsubscribe from listening:
        bluetoothSerial.unsubscribe(
                function (data) {
                    app.display(data);
                },
                app.showError
        );
    },
/*
    appends @error to the message div:
*/
    showError: function(error) {
        app.display(error);
    },

/*
    appends @message to the message div:
*/
    display: function(message) {
        var display = document.getElementById("message"), // the message div
            lineBreak = document.createElement("br"),     // a line break
            label = document.createTextNode(message);     // create the label

        display.appendChild(lineBreak);          // add a line break
        display.appendChild(label);              // add the message node
    },
/*
    clears the message div:
*/
    clear: function() {
        var display = document.getElementById("message");
        display.innerHTML = "";
    }
};      // end of app