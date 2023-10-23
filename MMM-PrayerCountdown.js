Module.register("MMM-PrayerCountdown", {

    defaults: {
        text: "Next prayer in: ",
        sound: true,
        threshold: 10_000,
        testStart: 20_000,
        testDelta: 0
    },

    start: function() {
    //   this.countdownEl = null;
        Log.info("Starting MMM-PrayerCountdown DOM.");
        this.wrapper = null;
        this.loaded = false;
        this.sound = new Audio();
        this.sound.src = './sounds/alarm.mp3';
        this.sound.preload = 'auto';
    },
  
    getDom: function() {

        Log.info("Updating MMM-PrayerCountdown DOM.");
        var self = this;

        if (this.wrapper == null) {
            this.wrapper = document.createElement("div");
            this.wrapper.setAttribute("id", "ptimeDOM-mainDiv");

            var span = document.createElement("span");
            span.setAttribute("id", "ptimeDOM-span");
            span.className = "small";


            this.countdownEl = span;

            Log.log(`leaves ${this.testDelta}`);
            if(this.testDelta < this.config.threshold) {
                this.countdownEl.classList.add('flash');
                Log.log("FLASHING!");
                } else {
                this.countdownEl.classList.remove('flash'); 
                }

            this.wrapper.appendChild(this.countdownEl);
        }
        return this.wrapper;
    },
  
    updateCountdown: function(name, rawTime) {

        // const audio = new Audio('https://drive.google.com/file/d/1x2cYvY16SkvakJ0c4bVpwlw4FdgT2yDF/view?usp=share_link');
        // audio.preload = 'auto';

        const oldNow = (Date.now() + this.config.testStart);

        const intervalId = setInterval(() => {

            const now = Date.now();
            // const diff = rawTime - now;
            const testDiff = oldNow - now;

            const hours = Math.floor(testDiff / 1000 / 60 / 60);
            const minutes = Math.floor(testDiff / 1000 / 60) % 60;
            const seconds = Math.floor(testDiff / 1000) % 60;
            
            // const hours = Math.floor(diff / 1000 / 60 / 60);
            // const minutes = Math.floor(diff / 1000 / 60) % 60;
            // const seconds = Math.floor(diff / 1000) % 60;
            
            const timeStr = `${hours}:${minutes}:${seconds}`;

            this.testDelta = testDiff;
            Log.log(`cryptic ${this.testDelta}`);

            // if(testDiff < this.config.threshold) {
            //     this.countdownEl.classList.add('flash');
            //     Log.log("FLASHING!");
            //     } else {
            //     this.countdownEl.classList.remove('flash'); 
            //     }
            
            this.countdownEl.innerHTML = `${name} in ${timeStr}`;

            if (testDiff <= 0) {
                clearInterval(intervalId);
                if(this.config.sound) {
                    this.sound.play(); 
                  }
                this.countdownEl.innerHTML = `${name} now`;
                Log.log("play the song!");
              }

        }, 1000); // update every 1 second        


     
        this.loaded = true;
        this.updateDom();
    },

    notificationReceived: function(notification, payload) {
        if (notification === 'NEXT_PRAYER_UPDATED') {
          const name = JSON.stringify(payload.name);
          const rawTime = payload.time;
          this.updateCountdown(name, rawTime);

        }
      }
  
  });