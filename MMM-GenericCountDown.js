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
        // var self = this;
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

      // sync with main clock
      if (cmin != -1) {
          // Log.log("sync minute before: " + now + ", cmin: " + cmin);
          let h = Math.floor(now/3600000);
          let m = (now/60000) % 60;

          // min goes to next hour
          if (now < cmin) {
              h = h - 1;
          }

          now = (h * 3600000) + (cmin * 60000);
          Log.log("sync minute after: " + now + ", h: " + h + ", m: " + m);
      }

      this.delta = 0;

      // get date string
      //var dmsg = new moment(dnow).locale(this.config.language).format('dddd D MMM YYYY');
      this.tickermsg = "";

      if (rawTime >= now) {
          const convertMinsToHrsMins = (mins) => {
              let h = Math.floor(mins / 60);
              let m = mins % 60;
              
              if (h > 0) {
                  if (m != 0) {
                      return `${h}` + this.translate('h') + " " + `${m}` + this.translate('m');
                  } else {
                      return `${h}` + this.translate('h');
                  }
              } else {
                  if (m != 0) {
                      return `${m}` + this.translate('m');
                  } else {
                      return "";
                  }
              }
          }

          this.delta = Math.floor((rawTime - now)/60000);
          Log.log("delta: " + this.delta);
          if ( this.delta > 0 ) {
            /* The following is to test if the sound is playing at the right time
              this.delta = 2;
              if(this.delta = 2) {
                const intervalId = setInterval(() => {
                  for (let i = 5; i > 0; i--) {
                    if(this.config.sound && i == 1) {
                      this.sound.play(); 
                      Log.log("play the song!");
                      clearInterval(intervalId);
                    }
                  }
              }, 1000);
            }
            end of test*/ 
              Log.log("delta is " + this.delta + ", update ticker");
              dstr = convertMinsToHrsMins(this.delta);
              if (dstr != "") {
                  var nmsg = `${name} in ${dstr}`;
                  Log.log(`${name} in ${dstr}`);
                  this.countdownText.update(`${nmsg}`);
                  if (this.delta < this.config.flashThreshold) { 
                    this.countdownText.el.classList.toggle("flash");
                    Log.log("FLASHING!");
                  }
              } else {
                  Log.log("dstring is empty");
                  this.countdownText.update(``);
              }
          } else {
              Log.log("delta is less than 0, reset ticker");
              // this.delta = 0;
              if(this.config.sound && this.delta == 0) {
                this.sound.play(); 
                Log.log("play the song!");
              }
              this.countdownText.update(``);
          }
      } else {
          this.delta = 0;
      }
      
      this.loaded = true;
      this.updateDom();
    },

    updateDisplay: function() {
      // Convert this.delta into hours and minutes
      const hours = Math.floor(this.delta / 60);
      const minutes = this.delta % 60;
      
      let timeString = "";
      if (hours > 0) {
          timeString += hours + "h "; // Add hours to string
      }
      if (minutes > 0 || hours === 0) {
          timeString += minutes + "m"; // Add minutes to string
      }
  
      // Update the countdown text
      if (timeString !== "") {
          const countdownMessage = `Countdown: ${timeString}`;
          this.countdownText.update(countdownMessage);
      } else {
          // Handle the case where countdown is finished
          this.countdownText.update("Event Started");
      }
  
      // Flashing effect if within threshold
      if (this.delta < this.config.flashThreshold) {
          this.countdownText.el.classList.add("flash");
      } else {
          this.countdownText.el.classList.remove("flash");
      }
  
      this.updateDom(); // Update the DOM with the new text
    },

    notificationReceived: function(notification, payload) {
      if (notification === 'NEXT_EVENT_UPDATED') {
          // Initial setup with event details
          const name = JSON.stringify(payload.name);
          const rawTime = payload.time;
          this.updateCountdown(name, rawTime, -1); // -1 indicates initial setup
      } else if (notification === 'CLOCK_MINUTE') {
          // Update countdown every minute
          if (this.delta > 0) { 
              this.delta -= 1; // Decrease by one minute
              this.updateDisplay(); 
          }
      }
    },
      
  });
