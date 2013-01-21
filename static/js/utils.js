

function loadImage(imageData, callback){
	return Asset.image('uploads/'+imageData.path, {
	    id: 'image:'+imageData.id,
		title: 'myImage',
		onLoad: callback,
		onError: function(){console.error("issue loading image: ", imageData);}.bind(this)
	});
}


var Loader = new Class({
	initialize: function(alt){
		this.element = e('div.loader');
		this.element.adopt(
			this.flash = e('div')
		);
		this.alternative = !!alt;
	},
	start: function(secondTime){
		this.element.show('inline-block');
		var i = 0;
		if(!secondTime) setTimeout(this.start.pass(true, this), parseInt(Math.random()*150));
		else {
			clearInterval(this.interval);
			this.interval = setInterval(function(){
				var change = i++%2;
				if(this.alternative)
					 this.flash.setStyle('marginTop', change ? 10 : 0);
				else this.flash[change ? "hide" : "show"]();
			}.bind(this), 150)
		}
	},
	stop: function(){
		clearInterval(this.interval);
		this.element.hide();
	},
	toElement: function(){
		return this.element;
	}
});


var Shade = new Class({
		Implements:[Options],
		options:{
			maxOpacity: .5,
			color:'#000',
			tweenDuration:100
		},
		initialize: function(opts){
			this.element = e('div.shade');
			this.setOptions(opts);
			this.element.set('tween', {duration:this.options.tweenDuration});
			this.element.setStyles({
				position:'fixed',
				left:0,
				top:0,
				width:'100%',
				height:'100%',
				background: this.options.color,
				opacity:0
			});
		},
		place: function(){
			this.element.inject(document.body);
		},
		fadeIn: function(){
			this.element.setStyles({zIndex:++Shade._curOverlZindex});
			this.place();
			this.element.fade([0,this.options.maxOpacity]);
		},
		fadeOut: function(){
			this.element.get('tween')
					.start('opacity', [this.options.maxOpacity, 0]).chain(function(){
						this.element.dispose();
						--Shade._curOverlZindex;
			}.bind(this));
		}
	});

Shade._curOverlZindex = 1000000;
Shade.incrementZ = function(){ return ++Shade._curOverlZindex; }
Shade.decrementZ = function(){ return --Shade._curOverlZindex; }


function askForResume(){
	var s = new Shade({color:null});
	s.fadeIn();
	var closeBtn = e('div', {text:'Cancel'});
	var sendBtn = e('div', {text:'Send'});
	var btns = e('div.buttons').adopt(closeBtn, sendBtn);
	var txt = e('p', {text:"Please input your email here, and I will send you my resume within the next 48 hours."});
	var inp = e('input', {placeholder:'youremail@example.com'});
	var dia = e('div.dialog.hidden').adopt(txt, inp, btns);
	dia.setStyle('zIndex', Shade.incrementZ());
	document.body.adopt(dia);
	document.body.style.overflow = "hidden";
	setTimeout(function(){dia.removeClass('hidden')},10);
	var closeDia = function(){
		dia.addClass('hidden');
		setTimeout(function(){dia.dispose(); Shade.decrementZ()},400);
		s.fadeOut();
		if(this._shown) {
			this._shown.dispose();
			this._shown = false;
		}
		document.body.style.overflow = null;
	};
	closeBtn.addEvent('click', function(){
		closeDia();	
	});
	sendBtn.addEvent('click', function(){
		var em = inp.get('value').trim();
		if(validateEmail(em)) {
			new Request({
				url:'welcome/email/',
				data:{address:em}
			}).send();
			closeDia();
		}
		else if(!this._shown) {
			this._shown = e('div.error', {text:"invalid email"}).inject(inp, 'after');
		}
	});
}

function validateEmail(email) { 
    var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
} 

Class.Element = new Class({
	toElement: function(){ return this.element; }
});

/*
---
name: Class.Binds
description: A clean Class.Binds Implementation
authors: Scott Kyle (@appden), Christoph Pojer (@cpojer)
license: MIT-style license.
requires: [Core/Class, Core/Function]
provides: Class.Binds
...
*/

Class.Binds = new Class({

	$bound: {},

	bound: function(name){
		return this.$bound[name] ? this.$bound[name] : this.$bound[name] = this[name].bind(this);
	}

});