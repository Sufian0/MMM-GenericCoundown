class CountdownText {
    constructor() {
      this.el = document.createElement("span");
      this.el.classList.add("countdown-text"); 
    }
  
    update(text) {
      this.el.innerText = text;
    }
  }
  
  class MainWrapper {
    constructor() {
      this.el = document.createElement("div");
      this.el.classList.add("main-wrapper");
    }
  }

  const soundMap = {
    "wolf": {
      "logMessage": "wolf sound selected",
      "soundSrc": 'modules/MMM-GenericCountdown/sounds/alarm.mp3',
      "preload": 'auto'
    },
    "default": {
      "logMessage": "no sound selected",
      "soundSrc": '',
      "preload": ''
    }
  };

Module.register("MMM-GenericCountdown", {

    defaults: {
        sound: false,                        // Select the alarm sound when timer is over. Required parameter, please define in config.js
        flashThreshold: false,               // Select when the flashing will occur. Required parameter, please define in config.js
    },

    getStyles: function() {
      return ["MMM-GenericCountdown.css"];
  },

    start: function() {
        Log.info("Starting MMM-EventCountdown DOM.");
        this.wrapper = null;
        this.countdownText = null;
        this.loaded = false;
        this.sound = new Audio();
        var soundConfig = soundMap[this.config.sound] || soundMap["default"];
        Log.log(soundConfig.logMessage);
        this.sound.src = soundConfig.soundSrc;
        this.sound.preload = soundConfig.preload;
    },
  
    getDom: function() {

        Log.info("Updating MMM-EventCountdown DOM.");
        if (!this.wrapper) {
            this.wrapper = new MainWrapper();
            this.countdownText = new CountdownText();
            this.wrapper.el.appendChild(this.countdownText.el);
        }
        return this.wrapper.el;
    },
  
    updateCountdown: function(name, rawTime, cmin) {

      Log.log(`what is cmin? ` + cmin);

      var dnow = new Date();

      // truncate to nearest minutes
      let now = Math.floor(dnow.valueOf()/60000) * 60000;
      this.delta = 0;
      this.tickermsg = "";

      if (rawTime >= now) {

          this.delta = Math.floor((rawTime - now) / 60000);

          // Check if the event is still in the future
          if (this.delta > 0) {
              Log.log("Delta is " + this.delta + ", updating display");
              this.updateDisplay(); // Call updateDisplay to handle the visual update
          } else {
              // Handle the event start or past event
              Log.log("Event has started or already passed");
              this.delta = 0;
              this.updateDisplay();
          }
      }
    },

    updateDisplay: function() {
      // Convert this.delta into hours and minutes
      const hours = Math.floor(this.delta / 60);
      const minutes = this.delta % 60;
      Log.log(`we have delta: ${this.delta} and we have minutes: ${minutes}`);
      
      let timeString = "";
      if (hours > 0) {
          timeString += hours + "h "; // Add hours to string
      }
      if (minutes > 0 || hours === 0) {
          timeString += minutes + "m"; // Add minutes to string
      }
  
      // Update the countdown text
      if (timeString !== "") {
          const countdownMessage = `${this.eventName} is in: ${timeString}`;
          this.countdownText.update(countdownMessage);
          this.soundPlayed = false; // Reset sound played flag
      } else {
          if (!this.soundPlayed) {
            this.sound.play();
            this.soundPlayed = true; // Set flag to prevent multiple plays
            Log.log("Sound played for event: " + this.eventName)
          }
          // Handle the case where countdown is finished
          this.countdownText.update(`${this.eventName}: Event Started`);
      }
  
      // Flashing effect if within threshold
      if (this.delta < this.config.flashThreshold) {
          this.countdownText.el.classList.add("flash");
      } else {
          this.countdownText.el.classList.remove("flash");
      }
      this.loaded = true;
      this.updateDom(); // Update the DOM with the new text
    },

    notificationReceived: function(notification, payload, sender) {
      if (notification === 'NEXT_EVENT_UPDATED') {
          // Initial setup with event details
          Log.log("Event notification received from: " + sender.name + ", payload: " + JSON.stringify(payload));
          this.eventName = payload.name; // Store the event name
          const rawTime = payload.time;
          this.updateCountdown(this.eventName, rawTime, -1); // -1 indicates initial setup
      } else if (notification === 'CLOCK_MINUTE') {
          // Update countdown every minute
          Log.log("CLOCK_MINUTE notification received from: " + sender.name + ", payload: " + payload);
          if (this.delta > 0) { 
              Log.log(`Delta pre decrement: ${this.delta} `);
              this.delta -= 1; // Decrease by one 
              Log.log(`Delta post decrement but pre display: ${this.delta} `);
              this.updateDisplay(); 
              Log.log(`Delta post display: ${this.delta} `);
          }
      }
    },
  });
