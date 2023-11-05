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

Module.register("MMM-GenericCountdown", {

    defaults: {
        text: "Next event in: ",
        sound: 'none', //choice of wolf or none
        flashThreshold: 10, //when should the countdown start flashing in minutes? Set to 0 to disable
    },

    getStyles: function() {
      return ["MMM-GenericCountdown.css"];
  },

    start: function() {
        Log.info("Starting MMM-EventCountdown DOM.");
        this.wrapper = null;
        this.countdownText = null;
        this.loaded = false;
        switch (this.config.sound){
            case 'wolf':
                Log.log("wolf sound selected");
                this.sound = new Audio();
                this.sound.src = 'modules/MMM-GenericCountdown/sounds/alarm.mp3'; 
                this.sound.preload = 'auto';
                break;
            default:
                Log.log("no sound selected");
                this.sound = null;
                this.sound.src = '';
                this.sound.preload = '';
                break;
        }
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
              this.delta = 0;
              if(this.config.sound) {
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

    notificationReceived: function(notification, payload) {
        if (notification === 'NEXT_EVENT_UPDATED') {
          const name = JSON.stringify(payload.name);
          const rawTime = payload.time;
          const cmin = payload.min;
          this.updateCountdown(name, rawTime, cmin);

        }
      }
  });
