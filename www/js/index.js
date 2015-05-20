/*
    SimpleSerial index.js
    Created 7 May 2013
    Modified 9 May 2013
    by Tom Igoe
*/


var app = {
	
    //bluetooth mac address
    macAddress: "98:D3:31:80:46:D4",
    
    //left and right motor speeds
    speed_left: 0,
    speed_right: 0,
    
    //left and right motor speed display elements
    right_motor_speed_el: null,
    left_motor_speed_el: null,
	
    //ir sensors - make array
    ir_1: null,
    ir_2: null,
    ir_3: null,
    ir_4: null,
    //ir_5: null,
    
    wander_button: null,
    
    mode: 1,
    
    bluetooth_debug: null,
    
    initialize: function() {
    	
    	app.store_elements();
    	app.init_joystick();
    	
    	//register for the deviceready event
    	document.addEventListener('deviceready', this.onDeviceReady, false);
        
    },
    
	/*
	    this runs when the device is ready for user interaction:
	*/
    onDeviceReady: function() {
    	
        // check if Bluetooth is on
        bluetoothSerial.isEnabled(
            app.openBluetoothConnection,
            app.bluetoothNotEnabled
        );
        
    },
    
    
    toggle_wander_mode: function() {
    	
    	if(app.mode == 1) {
    		app.mode = 2;
    	} else {
    		app.mode = 1;
    	}
    	
    	var command = "{mode:" + app.mode + "}\n";
    	
    	bluetoothSerial.write(command, app.successWrite, app.failWrite);
    },
    
    openBluetoothConnection: function() {
    	
    	bluetoothSerial.connect(
            app.macAddress,  // device to connect to
            app.bluetoothSuccess,    // start listening if you succeed
            app.bluetoothFail    // show the error if you fail
        );
        
    },
    
    bluetoothSuccess: function() {
    	
    	//app.updateState('control');
    	
    	app.bluetooth_write_interval = setInterval(function() {
		    
		    var command = "{left:" + app.speed_left + ",right:" + app.speed_right + "}\n";
			
		    bluetoothSerial.write(command, app.successWrite, app.failWrite);
		    
		    left_motor_speed_el.innerHTML = app.speed_left;
		    right_motor_speed_el.innerHTML = app.speed_right;
		    
		}, 50);
		
    	app.bluetooth_read_interval = setInterval(function() {
		    bluetoothSerial.readUntil('\n', app.bluetoothReadSuccess, app.bluetoothReadFail);
		}, 50);
		
    },
    
    bluetoothReadSuccess: function(data) {
    	
    	$('#bluetooth-reading').html(data);
    	
    	var irs = JSON.parse(data);
    	
    	/*
	    	app.ir_1.innerHTML = irs.readings[0];
		    app.ir_2.innerHTML = irs.readings[1];
		    app.ir_3.innerHTML = irs.readings[2];
		    app.ir_4.innerHTML = irs.readings[3];
		*/
	    
	    app.ir_1.setAttribute('style', 'height:' + irs.readings[0] + 'px');
	    app.ir_2.setAttribute('style', 'height:' + irs.readings[1] + 'px');
	    app.ir_3.setAttribute('style', 'height:' + irs.readings[2] + 'px');
	    app.ir_4.setAttribute('style', 'height:' + irs.readings[3] + 'px');
	    //app.ir_5.setAttribute('style', 'height:' + irs.readings[4] + 'px');
	    
    },
    
    bluetoothReadFail: function() {
    	alert('blue tooth read fail');
    },
    
    bluetoothNotEnabled: function() {
    	alert('blue tooth is not fucking enabled you hard on');
    },
    
    updateState: function(state) {
    	
    	var state_name = "#state_" + state;
    	
    	var state_el = $(state_name);
    	
    	if(state_el) {
    		
    		//get the current state
    		var old_state = $('.state.current');
    		
    		//hide it
    		old_state.hide();
    		
    		//show the new state
    		state_el.show();
    		
    	} else {
    		alert('could not transition to state: ' + state_name);
    	}
    	
    },
    
	/*
	    subscribes to a Bluetooth serial listener for newline
	    and changes the button:
	*/
    openPort: function() {
    	
    	/*
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
        });*/
        
    },

    store_elements: function() {
    	
    	this.left_motor_speed_el = document.getElementById("left-motor-speed");
    	this.right_motor_speed_el = document.getElementById("right-motor-speed");
    	
    	this.ir_1 = document.getElementById("ir-1");
    	this.ir_2 = document.getElementById("ir-2");
    	this.ir_3 = document.getElementById("ir-3");
    	this.ir_4 = document.getElementById("ir-4");
    	//this.ir_5 = document.getElementById("ir-5");
    	
    	this.bluetooth_debug = $('#bluetooth-reading');
    	
    	this.wander_button = $('#wander-button');
    	
    	this.wander_button.click(function() {
    		app.toggle_wander_mode();
    	});
    	
    },
    
    init_joystick: function() {
    	
		JoyStick('#joystick1', 120, function(magnitude, theta, x, y) {
		    
		    //cap at 50
		    y = y > 100 ? 100 : y;
		    y = y < -100 ? -100 : y;
		    x = x > 100 ? 100 : x;
		    x = x < -100 ? -100 : x;
		    
		    app.tankdrive(x, y);
		    
		});
		
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
    
	successWrite: function() {
		//alert('successful write');
	},
	
	failWrite: function() {
		alert('fail write');
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