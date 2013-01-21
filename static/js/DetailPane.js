

var SlidingPane = new Class({
		Implements:[Events, Class.Binds],
		initialize: function(className){
			this.element = e('div');
			// this.element
			this.backdrop = e('div.backdrop');
			this.backdrop.setStyles({
				height:"100%",
				position: "fixed",
				top:0
			});
			this.element.setStyles({
				float:'right'
			})
			if(className) this.element.addClass(className);
			this.element.set('tween', {duration:200});
			this.backdrop.set('tween', {duration:200});
			this.shade = new Shade({maxOpacity:.7, color:null});
			this.shade.element.addEvent('click', this.bound('close'));
		},
		open: function(){
			this.shade.fadeIn();
			document.body.setStyle('overflow','hidden');
			var width = parseInt(document.body.getWidth()*7/8);
			if(width > 800) width = 800;
			if(width < 450) width = document.body.getWidth();
			this.backdrop.setStyles({
				width: width,
				right: -width,
				zIndex: Shade.incrementZ()
			});
			this.element.setStyles({
				marginRight:-width, 
				zIndex:Shade.incrementZ(),
				width:width,
				position:'relative',
				left:0
			});
			document.body.adopt(this.backdrop);
			document.body.adopt(this.element);
			this.element.get('tween').start('marginRight', 0)
				.chain(this.bound('_onOpenComplete'));
			this.backdrop.tween('right', 0);
			window._paneOpen = true;
		},
		_onOpenComplete:function(){
			document.body.setStyle('overflow',null);
			this.fireEvent('openComplete');
		},
		_onCloseComplete: function(){
			this.element.dispose();
			this.backdrop.dispose();
			Shade.decrementZ();
			Shade.decrementZ();
			this.fireEvent('closeComplete');
			window._paneOpen = false;
		},
		close: function(){
			this.shade.fadeOut();
			var width = this.element.getWidth();
			this.element.setStyles({
				marginRight:0, 
				width:width,
				position:'relative',
				left:0
			});
			this.element.get('tween')
					.start('marginRight', -width)
					.chain(this.bound('_onCloseComplete'));	
			this.backdrop.tween('right', -width);
		},
		preventScrolling: function(){
			this.element.setStyles({
				position:'absolute',
				right:0,
				left:null,
				height:'100%',
				overflow:'hidden',
				'float':null
			});
		},
		allowScrolling: function(){
			this.element.setStyles({
				position:'relative',
				right:null,
				left:0,
				height:null,
				overflow:'visible',
				'float':'right'
			});
		}
	});

var ProjectSlidingPane = new Class({
	Extends:SlidingPane,
	initialize: function(projects, currentIndex){
		this.parent('projectSlidingPane');
		this.projects = projects;
		var btns = e('div.btns.white');
		btns.adopt(
			e('div.btn.close', {events:{click:this.bound('close')}}),
			this.leftArrow = e('div.btn.left', {events:{click:this.bound('_onPrev')}}),
			this.rightArrow = e('div.btn.right', {events:{click:this.bound('_onNext')}})
		);
		
		this.container = new ProjectDisplayPane();
		this.element.adopt(this.container);
		this.container.addEvent("finishedAnimationIn", this._onFinishedAnimationIn.bind(this));

		this.loadingHolder = e('div.loadingHolder');
		this.loader = new Loader(true);
		this.startLoading();

		this.element.adopt(btns);
	},
	open: function(){
		this.container.empty();
		this.parent();
	},
	close: function(){
		this.addEvent('closeComplete', this.container.empty.bind(this.container));
		this.parent();
	},
	_onFinishedAnimationIn: function(){
		this.allowScrolling();
		this.stopLoading();
	},
	startLoading: function(){
		this.loadingHolder.inject(this.element).adopt(this.loader);
		this.loader.start();
	},
	stopLoading: function(){
		this.loadingHolder.dispose();
		this.loader.stop();
	},
	slideInProject: function(){
		this.container.animateIn();
	},
	display: function(elem, direction){
		this.startLoading();
		this.preventScrolling();
		this.container.prepareProject(elem, direction || 'up');
	},
	disableRightArrow: function(){
		this.rightArrow.addClass('disabled');
	},
	disableLeftArrow: function(){
		this.leftArrow.addClass('disabled');
	},
	enableBothArrows: function(){
		this.rightArrow.removeClass('disabled');
		this.leftArrow.removeClass('disabled');
	},
	_onPrev: function(){
		this.fireEvent('prevClicked');
	},
	_onNext: function(){
		this.fireEvent('nextClicked');
	},
	toElement: function(){
		return this.element;
	}
});

var Pane = new Class({
	Implements: [Options, Events],
	options: {
		slideSpace:0
	},
	initialize: function(parentElem, opts){
		this.setOptions(opts);
		this.element = e('div.pane');
		this.element.set('tween', {duration:100});
		this.parentElem = parentElem;
	},
	enter: function(from){
		var size = this.parentElem.getSize();
		this.element.setStyles({
			width:size.x,
			height:size.y,
			position:'absolute',
			display:'block'
		});
		this.element.removeClass(from+'-i');
		setTimeout(this._onEnterComplete.bind(this), 200);
	},
	prepareForDirection: function(dir){
		this.element.addClass(dir+'-i');
	},
	_onEnterComplete: function(){
		this.element.setStyles({
			width:null,
			height:null,
			position:'relative'
		});
		this.fireEvent('enterComplete');
	},
	setContent: function(content){
		this.element.empty();
		this.element.adopt(content);
	},
	exit: function(from){
		this.element.addClass(from+'-f');
	},
	toElement: function(){
		return this.element;
	}
});

var ProjectDisplayPane = new Class({
	Implements:[Events],
	initialize: function(){
		this.element = e('div.projectDisplayPane');
		this.currentPane = new Pane(this.element);
	},
	prepareProject: function(projectElem, direction){
		if(!this.secondaryPane) {
			this.secondaryPane = new Pane(this.element);
			this.secondaryPane.addEvent('enterComplete:once', this._onSecondaryEntered.bind(this));
			this.element.setStyles({
				width:'100%',
				height:'100%',
				position:'absolute'
			});
			this.secondaryPane.prepareForDirection(direction);
			this.element.adopt(this.secondaryPane);
		}
		this.secondaryPane.setContent(projectElem);
		this._animDirection = direction;
	},
	animateIn: function(){
		console.log("animate");
		if(this.currentPane) this.currentPane.exit(this._animDirection);
		this.secondaryPane.enter(this._animDirection);
	},
	_onSecondaryEntered: function(){
		if(this.currentPane)
			this.currentPane.element.dispose();
		this.currentPane = this.secondaryPane;
		this.secondaryPane = null;
		this.element.setStyles({
			width:null,
			height:null,
			position:null
		});
		this.fireEvent('finishedAnimationIn');
	},
	empty: function(){
		if(this.currentPane) this.currentPane.element.dispose();
		if(this.secondaryPane) this.secondaryPane.element.dispose();
	},
	toElement: function(){
		return this.element;
	}
});