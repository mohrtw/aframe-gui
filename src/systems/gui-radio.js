AFRAME.registerSystem("gui-radio", {
    init: function() {
      this.radiogroups = {};
    },
  
    addToGroup: function(radiogroup, el) {
        if (this.radiogroups.hasOwnProperty(radiogroup)) {
            this.radiogroups[radiogroup].push(el);
        }
        else {
            this.radiogroups[radiogroup] = [el];
        }
    },

    updateGroup: function(radiogroup, checkedEl) {
        for (var el of this.radiogroups[radiogroup]) {
            if (el != checkedEl) {
                el.emit('uncheckradio');
            }
        }
    }
  });
  