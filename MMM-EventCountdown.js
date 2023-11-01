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

  // class audioElement {
  //   constructor() {
  //     this.audio = document.createElement("AUDIO");
  //     this.audio.setAttribute("crossOrigin", "anonymous");
  //     const audioSource = document.createElement("source");
  //     audioSource.type = "audio/mp3";
  //     audioSource.src = "file:///D:/Libraries/Documents/1ACode/MagicMirror/modules/MMM-PrayerCountDown/sounds/alarm.mp3";
  //     this.audio.appendChild(audioSource)
  //   }
  // }
  

Module.register("MMM-EventCountdown", {

    defaults: {
        text: "Next event in: ",
        sound: true,
        threshold: 10_000,
        testStart: 20_000,
        testDelta: 0
    },

    start: function() {
    //   this.countdownEl = null;
        Log.info("Starting MMM-EventCountdown DOM.");
        this.wrapper = null;
        this.countdownText = null;
        this.loaded = false;
        // this.sound = new Audio('file:///D:/Libraries/Documents/1ACode/MagicMirror/modules/MMM-PrayerCountDown/sounds/alarm.mp3', {crossorigin: "anonymous"});
        this.sound = new Audio();
        this.sound.src = 'https://interactive-examples.mdn.mozilla.net/media/cc0-audio/t-rex-roar.mp3'; 
        this.sound.preload = 'auto';
    },
  
    getDom: function() {

        Log.info("Updating MMM-EventCountdown DOM.");
        // var self = this;
        if (!this.wrapper) {
            this.wrapper = new MainWrapper();
            this.countdownText = new CountdownText();
            // var alarmAudio = document.createElement("AUDIO");
            this.wrapper.el.appendChild(this.countdownText.el);
            // this.wrapper.el.appendChild(new audioElement().audio);
        }
        return this.wrapper.el;
    },
  
    updateCountdown: function(name, rawTime) {

        // const audio = new Audio('https://drive.google.com/file/d/1x2cYvY16SkvakJ0c4bVpwlw4FdgT2yDF/view?usp=share_link');
        // audio.preload = 'auto';

        const oldNow = (Date.now() + this.config.testStart);
        let testDiff = oldNow - Date.now()

        const intervalId = setInterval(() => {

            const now = Date.now();
            // const diff = rawTime - now;
            // const testDiff = oldNow - now;

            const hours = Math.floor(testDiff / 1000 / 60 / 60);
            const minutes = Math.floor(testDiff / 1000 / 60) % 60;
            const seconds = Math.floor(testDiff / 1000) % 60;
            
            // const hours = Math.floor(diff / 1000 / 60 / 60);
            // const minutes = Math.floor(diff / 1000 / 60) % 60;
            // const seconds = Math.floor(diff / 1000) % 60;
            
            const timeStr = `${hours}:${minutes}:${seconds}`;
            testDiff -= 1000; // update diff

            // this.testDelta = testDiff;
            Log.log(`cryptic ${testDiff}`);

            // if(testDiff < this.config.threshold) {
            //     this.countdownEl.classList.add('flash');
            //     Log.log("FLASHING!");
            //     } else {
            //     this.countdownEl.classList.remove('flash'); 
            //     }


            
            // this.countdownEl.innerHTML = `${name} in ${timeStr}`;
            this.countdownText.update(`${name} in ${timeStr}`);

            if (testDiff < this.config.threshold) { 
                this.countdownText.el.classList.toggle("flash");
                Log.log("FLASHING!");
              }

            if (testDiff <= 0) {
                clearInterval(intervalId);
                if(this.config.sound) {
                    this.sound.play(); 
                    Log.log("play the song!");
                  }
                  this.countdownText.update(`${name} now`);
                // this.countdownEl.innerHTML = `${name} now`;
              }

        }, 1000); // update every 1 second        


     
        this.loaded = true;
        this.updateDom();
    },

    notificationReceived: function(notification, payload) {
        if (notification === 'NEXT_EVENT_UPDATED') {
          const name = JSON.stringify(payload.name);
          const rawTime = payload.time;
          this.updateCountdown(name, rawTime);

        }
      }
  
  });
  //test push