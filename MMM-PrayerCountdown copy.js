Module.register("MMM-PrayerCountdown", {

    defaults: {
        text: "Next prayer in: "
    },

    start: function() {
    //   this.countdownEl = null;
        Log.info("Starting MMM-PrayerCountdown DOM.");
        this.wrapper = null;
        this.loaded = false;

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
            this.wrapper.appendChild(this.countdownEl);
        }
        return this.wrapper;
    },
  
    updateCountdown: function(name, rawTime) {

        const intervalId = setInterval(() => {

            const now = Date.now();
            const diff = rawTime - now;
            
            const hours = Math.floor(diff / 1000 / 60 / 60);
            const minutes = Math.floor(diff / 1000 / 60) % 60;
            const seconds = Math.floor(diff / 1000) % 60;
            
            const timeStr = `${hours}:${minutes}:${seconds}`;
            
            this.countdownEl.innerHTML = `${name} in ${timeStr}`;

        }, 1000); // update every 1 second        

        if (diff <= 0) {
            clearInterval(intervalId);
            this.countdownEl.innerHTML = `${name} now`;
          }
     
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