function e(tag, opts){ return new Element(tag, opts); }

window.addEvent('load', function(){
	
	var projectList = new ProjectList($('list'));
	window.app = new ProjectManager(projectList);

	

	$('infoBtn').addEvent('click', function(){
		var pane = new InfoPane();
		pane.addEvents({
			loaded: function(){
				app.preventMainScroll();
				pane.open();
			},
			closeComplete: app.allowMainScroll.bind(app)
		});
		pane.load();
	});

	$('resumeBtn').addEvent('click', askForResume);

	$('menu').getChildren().addEvent('mouseenter', function(){
		// var elem = e('div.floater', {text:this.title}).adopt(e('div.arrow')).inject(this);
		var box = this.getChildren()[0];
		box.addClass('visible');
		this.addEvent('mouseleave', function(){
			box.removeClass('visible')
		});
	});

});



window.addEvent('scroll', function(){
	if(!window._paneOpen) {
		var sY = window.scrollY;
		var max = 299;
		var min = 90;
		var height = max-sY;
		if(height < min) height = min;
		else if(height > max) height = max;
		if(height >= min) {
			$('header').setStyle('height', height);
		}
		if(height < 275) {
			 $('logo').addClass('left');
			 $('menu').addClass('right');
		}
		else {
			$('logo').removeClass('left');
			$('menu').removeClass('right');
		}
	}
});

var InfoPane = new Class({
	Extends:SlidingPane,
	initialize: function(){
		this.parent('infoPane');
		var btns = e('div.btns');
		btns.adopt(
			e('div.btn.close', {events:{click:this.bound('close')}})
		);
		this.element.adopt(btns);
	},
	load: function(){
		new Request({url:'welcome/info',onComplete:function(res){
			this.element.adopt(e('div.container',{html:res}));
			this.fireEvent('loaded');
		}.bind(this)}).send();
	}
});


var ImageArrayPane = new Class({
	Implements:[Events, Class.Element, Class.Binds, Options],
	options: { maxHeight:680 },
	initialize: function(imgDataArray, opts){
		this.setOptions(opts);
		this.element = e('div.imageArrayPane');
		this.imageContainer = e('div.imageContainer').inject(this);
		this.imageContainer.set('morph', {duration:200});
		this.imageList = e('div.imageList').inject(this.imageContainer);
		this.btns = e('div.btns').inject(this);
		this.nextBtn = e('div.btn.right').inject(this.btns);
		this.nextBtn.addEvent("click", this.bound("_next"));
		this.prevBtn = e('div.btn.left.disabled').inject(this.btns);
		this.prevBtn.addEvent("click", this.bound("_prev"));
		imgDataArray.each(this.bound('_addImageFromData'));
		this.imgDataArray = imgDataArray;
		this.addEvent('_scrollToCurrent:pause(100)', this.bound('scrollToCurrentIndex'));
	},
	images:[],
	imageDimensions:[],
	imageElements:[],
	_addImageFromData: function(data){
		var styles = {height:300};
		var elem = e('div.imageHolder', {styles:styles}).inject(this.imageList);
		this.imageElements.push(elem);
		if(data.description){
			var description = e('div.moreInfo');
			var expand = e('div.expand').addEvent('click', this.toggle.pass(description,this));
			description
				.adopt(expand)
				.adopt(e('div.text', {html:data.description}))
				.inject(elem);
		}
	},
	toggle: function(imgElem){
		if(imgElem.hasClass('expanded')) {
			imgElem.removeClass('expanded');
			imgElem.setStyle('height', null);
		}
		else {
			imgElem.addClass('expanded');
			var inside = imgElem.getElements('.text')[0];
			imgElem.setStyle('height', inside.getHeight());
		}
	},
	_getImageScroll: function(){
		if(!this._scroll) 
			this._scroll = new Fx.Scroll(this.imageContainer,{duration: 200});
		return this._scroll;
	},
	_next: function(){
		var totalNum = this.imageElements.length;
		if(totalNum-1 > this.currentIndex) {
			this.currentIndex++;
			if(totalNum-1 == this.currentIndex)
				this.nextBtn.addClass("disabled");
			this.prevBtn.removeClass("disabled");
			this.fireEvent('_scrollToCurrent');
		}
	},
	_prev: function(){
		if(this.currentIndex > 0) {
			this.currentIndex--;
			if(this.currentIndex == 0)
				this.prevBtn.addClass("disabled");
			this.nextBtn.removeClass("disabled");
			this.fireEvent('_scrollToCurrent');
		}
	},
	scrollToCurrentIndex: function(){
		this.element.getElements('.moreInfo').removeClass('expanded').setStyle('height', null);
		var x = 0;
		for(var i = 0; i < this.currentIndex; i++) 
			x += this.imageDimensions[i].width;
		var index = this.currentIndex;
		new Fx.Scroll(this.imageContainer,{duration: 200}).start(x,0).chain(function(){
			if(index == this.currentIndex)
				this.imageContainer.morph(this.imageDimensions[this.currentIndex]);	
		}.bind(this));
	},
	adjustView: function(){
		this.imageContainer.setStyle('width', null);
		var width = this.imageContainer.getWidth();
		console.log("vue adjust", width);
		var curX = 0;
		for(var i = 0; i < this.imgDataArray.length; i++){
			var imgData = this.imgDataArray[i];
			var imgElem = this.imageElements[i];
			var dimensions = this.getPrefferedDimensions(
				parseInt(imgData["width"]), parseInt(imgData["height"]), width, this.options.maxHeight);
			this.imageDimensions[i] = dimensions;
			imgElem.setStyles(dimensions).setStyle('left',curX);
			curX += dimensions.width;
		}
		console.log("curX", curX);
		this.imageList.setStyle('width', curX);
		this.currentIndex = 0;
		this.imageContainer.offsetLeft = 0;
		this.imageContainer.setStyles(this.imageDimensions[0]);
		this.prevBtn.addClass("disabled");
		this.nextBtn.removeClass("disabled");
		// this.scrollToCurrentIndex();
	},
	getPrefferedDimensions: function(actWidth, actHeight, maxWidth, maxHeight){
		var maxR = maxWidth/maxHeight;
		var actR = actWidth/actHeight;
		if(maxR > actR){ // fill to height
			if(maxHeight > actHeight) return {width:actWidth, height:actHeight};
			return {height:maxHeight, width:Math.round(actWidth*maxHeight/actHeight)}
		}
		else { // fill to width
			console.log(actWidth, maxWidth);
			if(maxWidth > actWidth) return {width:actWidth, height:actHeight};
			return {width:maxWidth, height:Math.round(actHeight*maxWidth/actWidth)}
		}
	},
	loaded: false,
	images: [],
	imageElements:[],
	numberNotLoaded:0,
	load: function(){
		if(!this.loaded) {
			this.numberNotLoaded = this.imgDataArray.length;
			this.imgDataArray.each(function(imgData, i){
				loadImage(imgData, function(img){
					this.images[i] = img;
					this.imageElements[i].adopt(img);
					if(!(--this.numberNotLoaded)) {
						this.loaded = true;
						this.fireEvent('loaded');
					}
				}.bind(this));
			}, this);
		} 
		else this.fireEvent('loaded');
	}
});


var ProjectDetailPane = new Class({
	Implements:Events,
	initialize: function(data){
		this.element = e('div.detailPane');
		this.element.adopt(e('h1.title', {text:data.title}));
		this.imageArrayPane = new ImageArrayPane(data.images);
		this.element.adopt(this.imageArrayPane);
		this.element.adopt(e('div.details', {html:data.description}));
	},
	loaded: false,
	isLoaded: function(){
		return !!this.loaded;
	},
	load: function(){
		if(!this.isLoaded()) {
			this.imageArrayPane.addEvent('loaded', function(){
				this.loaded = true;
				this.fireEvent('loaded');	
			}.bind(this)).load();
		}
		else this.fireEvent('loaded');
	},
	adjustView: function(){
		this.imageArrayPane.adjustView();
	},
	toElement: function(){
		return this.element;
	}
});


var Project = new Class({
		Implements:[Events, Class.Binds],
		initialize:function(data, onSuccess){
			this.data = data;
			this.index = data.index;
			this.onSuccess = onSuccess;
			this.listItemElem = new ProjectListItem(data);
		},
		index:-1,
		images:[],
		toListItem: function(columnWidth){
			this.listItemElem.resizeToWidth(columnWidth);
			return this.listItemElem;
		},
		toDetailPane: function(){
			if(!this.detailPane){
				this.detailPane = new ProjectDetailPane(this.data);
			}
			return this.detailPane;
		},
		loadDetailPane: function(){
			var dpane = this.toDetailPane();
			if(dpane.isLoaded()) this._fireDetailPaneLoaded();
			else dpane.addEvent('loaded', this.bound('_fireDetailPaneLoaded')).load();
		},
		_fireDetailPaneLoaded: function(){
			this.fireEvent('detailPaneLoaded', [this.toDetailPane()]);
		},
		resizeListItemElemWidth: function(columnWidth){
			this.listItemElem.resizeToWidth(columnWidth);
		},
		_prepareForDOM: function(img){
			this.listItemElem.setImage(img);
			this.onSuccess();
		}
	});



var ProjectManager = new Class({
		Implements:[Class.Binds],
		initialize: function(list){
			this.list = list;
			this._initRequest();
		},
		projects:[],
		projectsById:{},
		_initRequest: function(){
			new Request.JSON({
				url:'welcome/projectInfo',
				onComplete:this._handleRequestData.bind(this)
			}).send();
		},
		_handleRequestData: function(data){
			data.each(function(entry, i){
				entry.index = i;
				var project = new Project(entry, this.list.bound('realignProjects'));
				this.list.addEntry(project, i);
				this.projects.push(project);
				this.projectsById[entry.id] = project;
			}, this);
			this.list.realignProjects();
		},
		projectClicked: function(id){
			var pject = this.curProject = this.projectsById[id];
			var spane = this.getSlidingPane();
			spane.addEvent('openComplete:once', function(){
				this.showProjectWithDirection(pject, 'up');
				// pject.addEvent('detailPaneLoaded:once', function(detailPane){
				//	spane.display(detailPane);
				//	detailPane.adjustView();
				//	spane.slideInProject();
				// }).loadDetailPane();
			}.bind(this));
			spane.open();
			this.preventMainScroll();
		},
		preventMainScroll: function(){
			var scrollTop = document.body.scrollTop;
			document.body.scrollTop = 0;
			$('container').addClass('noscroll').scrollTop = scrollTop;
		},
		allowMainScroll: function(){
			var scrollTop = $('container').scrollTop;
			$('container').removeClass('noscroll').scrollTop = 0;
			document.body.scrollTop = scrollTop;
		},
		_previousClicked: function(){
			var pject = this.projects[this.curProject.index-1];
			this.showProjectWithDirection(pject, 'right');
		},
		_nextClicked: function(){
			var pject = this.projects[this.curProject.index+1];
			this.showProjectWithDirection(pject, 'left');

		},
		showProjectWithDirection: function(pject, direction){
			if(pject){
				this.curProject = pject;
				var spane = this.getSlidingPane();

				spane.enableBothArrows();
				if(!this.curProject.index) spane.disableLeftArrow();
				else if(this.curProject.index == this.projects.length-1) 
					spane.disableRightArrow();

				pject.addEvent('detailPaneLoaded:once', function(detailPane){
					if(!this._bufferTimePending) {
						this._bufferTimePending = true;
						setTimeout(function(){this._bufferTimePending = false}.bind(this), 200);
						spane.display(detailPane, direction);
						detailPane.adjustView();
						spane.slideInProject();
					}
				}.bind(this)).loadDetailPane();
			}
		},
		getSlidingPane: function(){
			if(!this.slidingPane){
				this.slidingPane = new ProjectSlidingPane();
				this.slidingPane.addEvents({
					prevClicked:this.bound('_previousClicked'),
					nextClicked:this.bound('_nextClicked'),
					closeComplete:this.bound('allowMainScroll')
				});
			}
			return this.slidingPane;
		}
	});


