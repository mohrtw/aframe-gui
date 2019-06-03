AFRAME.registerComponent('gui-radio', {
    schema: {
        on: {default: 'click'},
        onclickevent: {type: 'string', default: ''},
        text: {type: 'string', default: 'text'},
        // active: {type: 'boolean', default: true},
        checked: {type: 'boolean', default: false},
        radiosizecoef: {type: 'number', default: 1},
        fontSize: {type: 'string', default: '150px'},
        fontFamily: {type: 'string', default: 'Arial'},
        fontColor: {type: 'string', default: key_grey_dark},
        borderColor: {type: 'string', default: key_white},
        backgroundColor: {type: 'string', default: key_offwhite},
        hoverColor: {type: 'string', default: key_grey_light},
        activeColor: {type: 'string', default: key_orange},
        handleColor: {type: 'string', default: key_grey},
        opacity: { type: 'number', default: 1.0 },
        radiogroup: {type: 'string', default: ''},
        lablelzoffset: { type: 'number', default: 0.02 },
    },
    init: function() {
        const guiRadio = AFRAME.scenes[0].systems["gui-radio"];
        var self = this;
        var data = this.data;
        var el = this.el;
        var guiItem = el.getAttribute("gui-item");

        // console.log(data.on)

        var radioBoxWidth = 0.50
        var radioRadius = guiItem.height*0.2*data.radiosizecoef;
        var radioBoxX = -guiItem.width*0.5 + radioRadius*2;//guiItem.height*0.5;
        var radioBox = document.createElement("a-cylinder");
        this.radioBox = radioBox;
        radioBox.setAttribute('radius', radioRadius);
        radioBox.setAttribute('height', '0.01');
        radioBox.setAttribute('rotation', '90 0 0');
        radioBox.setAttribute('material', `color:${data.handleColor}; shader: flat;`);
        radioBox.setAttribute('position', `${radioBoxX} 0 0`);//
        el.appendChild(radioBox);

        var radioborder = document.createElement("a-torus");
        this.radioborder = radioborder;
        radioborder.setAttribute('radius', guiItem.height*0.19*data.radiosizecoef);
        radioborder.setAttribute('radius-tubular', '0.01');
        radioborder.setAttribute('rotation', '90 0 0');
        radioborder.setAttribute('material', `color:${data.borderColor}; shader: flat;`);
        radioBox.appendChild(radioborder);

        var radioCenter = document.createElement("a-cylinder");
        this.radioCenter = radioCenter;
        var initColor = data.checked ? data.activeColor : data.handleColor;
        radioCenter.setAttribute('radius', guiItem.height*0.18*data.radiosizecoef);
        radioCenter.setAttribute('height', '0.02');
        radioCenter.setAttribute('rotation', '0 0 0');
        radioCenter.setAttribute('material', `color:${initColor}; shader: flat;`);
        radioBox.appendChild(radioCenter);

//        var labelWidth = guiItem.width - radioBoxWidth;
        var labelWidth = guiItem.width - 2*guiItem.height;
        var multiplier = 512; // POT conversion
        var canvasWidth = labelWidth*multiplier;
        var canvasHeight = guiItem.height*multiplier;

        var canvasContainer = document.createElement('div');
        canvasContainer.setAttribute('class', 'visuallyhidden');
        document.body.appendChild(canvasContainer);

        var labelCanvas = document.createElement("canvas");
        this.labelCanvas = labelCanvas;
        labelCanvas.className = "visuallyhidden";
        labelCanvas.setAttribute('width', canvasWidth);
        labelCanvas.setAttribute('height', canvasHeight);
        labelCanvas.id = getUniqueId('canvas');
        canvasContainer.appendChild(labelCanvas);
        var ctxLabel = this.ctxLabel = labelCanvas.getContext('2d');

        el.setAttribute('material', `shader: flat; depthTest:true;transparent: false; opacity: ${data.opacity};  color: ${this.data.backgroundColor}; side:front;`);
        el.setAttribute('geometry', `primitive: plane; height: ${guiItem.height}; width: ${guiItem.height};`);

        drawText(ctxLabel, labelCanvas, data.text, data.fontSize, data.fontFamily, data.fontColor, 1,'left','middle');

        var labelEntityX = 0 + radioRadius*2;//guiItem.height*0.5 - guiItem.width*0.05;
        var labelEntity = document.createElement("a-entity");
        labelEntity.setAttribute('geometry', `primitive: plane; width: ${labelWidth}; height: ${guiItem.height/1.05};`);
        labelEntity.setAttribute('material', `shader: flat; src: #${labelCanvas.id}; transparent: true; opacity: 1; side:front;`);
        labelEntity.setAttribute('position', `${labelEntityX} 0 ${data.lablelzoffset}`); //0
        el.appendChild(labelEntity);

        if (self.data.radiogroup) {
            guiRadio.addToGroup(self.data.radiogroup, el);
        }

        // this.updateToggle(   );
        // el.setAttribute("checked",data.active);

        // set initial checked/unchecked
        this.animateChecked(data.checked);

        el.addEventListener('uncheckradio', function(evt) {
            console.log('uncheckradio event received');
            self.uncheck();
        });

        el.addEventListener('radioclicked', function(evt) {
            if (evt.detail.radiogroup == data.radiogroup && evt.target != el) {
                self.uncheck();
            }
            else {
            }
        });

        el.addEventListener('mouseenter', function(evt) {
            console.log('mouseenter');
            radioborder.removeAttribute('animation__leave');
            radioborder.setAttribute('animation__enter', `property: material.color; from: ${data.borderColor}; to:${data.hoverColor}; dur:200;`);
        });
        el.addEventListener('mouseleave', function(evt) {
            console.log('mouseleave');
            radioborder.removeAttribute('animation__enter');
            radioborder.setAttribute('animation__leave', `property: material.color; from: ${data.hoverColor}; to:${data.borderColor}; dur:200; easing: easeOutQuad;`);
        });
        el.addEventListener(data.on, function (evt) {
            // console.log('I was clicked at: ', evt.detail.intersection.point); // Commented out to use own made click event without defining detail
            if(data.radiogroup) {
                el.parentElement.emit('radioclicked', { radiogroup: data.radiogroup });
            }

            self.toggleChecked();
            if(data.checked) {
                guiRadio.updateGroup(data.radiogroup, el);
            }

            // var guiInteractable = el.getAttribute("gui-interactable");
            // console.log("guiInteractable: "+guiInteractable);
            // console.log(guiInteractable);
            // var clickActionFunctionName = guiInteractable.clickAction;
            // console.log("clickActionFunctionName: "+clickActionFunctionName);
            // console.log(clickActionFunctionName);
            // // find object
            // var clickActionFunction = window[clickActionFunctionName];
            // console.log("clickActionFunction: "+clickActionFunction);
            // console.log(clickActionFunction);
            // //console.log("clickActionFunction: "+clickActionFunction);
            // // is object a function?
            // if (typeof clickActionFunction === "function") clickActionFunction(evt);
        });

        ////WAI ARIA Support
        el.setAttribute('role', 'radio');

    },
    update: function(){
        var data = this.data;
        // this.updateToggle(data.active)
    },


    toggleChecked: function(){
        var data = this.data;
        var el = this.el;
        data.checked = !data.checked;
        this.animateChecked(data.checked);
        if (data.checked) {
            if(data.onclickevent) {
                el.emit(data.onclickevent, {value: data.text});
            }
        }
    },

    animateChecked: function(checked) {
        var data = this.data;
        var radioCenter = this.radioCenter;

        if (checked) {
            radioCenter.removeAttribute('animation__colorOut');
            radioCenter.removeAttribute('animation__rotationOut');
            radioCenter.removeAttribute('animation__position1Out');
            radioCenter.removeAttribute('animation__position2Out');
            radioCenter.setAttribute('animation__colorIn', `property: material.color; from: ${data.handleColor}; to:${data.activeColor}; dur:500; easing:easeInOutCubic;`);
            radioCenter.setAttribute('animation__rotationIn', `property: rotation; from: 0 0 0; to:-180 0 0; dur:500; easing:easeInOutCubic;`);
            radioCenter.setAttribute('animation__position1In', `property: position; from: 0 0 0; to:0 0.3 0; dur:200; easing:easeInOutCubic;`);
            radioCenter.setAttribute('animation__position2In', `property: position; from: 0 0.3 0; to:0 0 0; dur:200; easing:easeInOutCubic; delay:300;`);
        }else{
            radioCenter.removeAttribute('animation__colorIn');
            radioCenter.removeAttribute('animation__rotationIn');
            radioCenter.removeAttribute('animation__position1In');
            radioCenter.removeAttribute('animation__position2In');
            radioCenter.setAttribute('animation__colorOut', `property: material.color; from: ${data.activeColor}; to:${data.handleColor}; dur:500; easing:easeInOutCubic;`);
            radioCenter.setAttribute('animation__rotationOut', `property: rotation; from: -180 0 0; to:0 0 0; dur:500; easing:easeInOutCubic;`);
            radioCenter.setAttribute('animation__position1Out', `property: position; from: 0 0 0; to:0 0.3 0; dur:200; easing:easeInOutCubic; `);
            radioCenter.setAttribute('animation__position2Out', `property: position; from: 0 0.3 0; to:0 0 0; dur:200; easing:easeInOutCubic; delay:300;`);
        }
    },

    uncheck: function() {
        this.data.checked = false;
        this.animateChecked(false);
    }


});

AFRAME.registerPrimitive( 'a-gui-radio', {
    defaultComponents: {
        'gui-interactable': { },
        'gui-item': { type: 'radio' },
        'gui-radio': { }
    },
    mappings: {
        'onclick': 'gui-interactable.clickAction',
        'onhover': 'gui-interactable.hoverAction',
        'key-code': 'gui-interactable.keyCode',
        'width': 'gui-item.width',
        'height': 'gui-item.height',
        'margin': 'gui-item.margin',
        'on': 'gui-radio.on',
        'value': 'gui-radio.text',
        // 'active': 'gui-radio.active',
        'checked': 'gui-radio.checked',
        'font-color': 'gui-radio.fontColor',
        'font-size': 'gui-radio.fontSize',
        'font-family': 'gui-radio.fontFamily',
        'border-color': 'gui-radio.borderColor',
        'background-color': 'gui-radio.backgroundColor',
        'hover-color': 'gui-radio.hoverColor',
        'active-color': 'gui-radio.activeColor',
        'handle-color': 'gui-radio.handleColor',
        'radiosizecoef': 'gui-radio.radiosizecoef',
        'opacity': 'gui-radio.opacity',
        'radiogroup': 'gui-radio.radiogroup',
        'onclickevent': 'gui-radio.onclickevent',
        'lablelzoffset': 'gui-radio.lablelzoffset'
    }
});
