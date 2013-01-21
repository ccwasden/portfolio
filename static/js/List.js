


var ProjectList = new Class({
		Implements:[Events, Class.Binds],
		initialize: function(elem){
			this.element = elem;
			window.addEvent('resize:pause(80)', this.bound('realignProjects'));
		},
		projects:[],
		refreshSizes: function(){
			var max = 450;
			var numColumns = 1;
			var totalWidth = this.element.getComputedSize().width
			var columnWidth = totalWidth;
			while(columnWidth > max){
				numColumns++;
				columnWidth = Math.round(totalWidth/numColumns);
			}
			this.numberColumns = numColumns;
			this.columnWidth = columnWidth;
		},
		addEntry: function(entry, index){
			this.projects.push(entry);
			this.element.adopt(entry.toListItem(this.columnWidth));
		},
		realignProjects: function(){
			console.log("realining");
			this.refreshSizes();
			var curTop = 0;
			for(var i = 0; i < this.projects.length; i++){
				var pject = this.projects[i];
				var mod = (i%this.numberColumns);
				if(!mod && i) curTop += this.columnWidth;
				pject.toListItem().element.setStyles({
					left: mod*this.columnWidth,
					top: curTop
				});
				pject.resizeListItemElemWidth(this.columnWidth);
			}
			curTop += this.columnWidth;
			this.element.setStyle('height', curTop+60);
		}
	});

var ProjectListItem = new Class({
		Implements:[Events, Class.Binds],
		initialize: function(project){
			this.data = project;
			this.element = e('div.project');
			this.element.addEvents({
				mouseenter:this.bound('_onMouseEnter'),
				mouseleave:this.bound('_onMouseLeave')
			});
			this.opaqueCover = e('div.opaqueCover').inject(this.element);
			this.descriptionBox = e('div.descriptionBox', {tween:{duration:100}}).inject(this.element);
			this.descriptionBox.hide();
			var textHolder = e('div.titleHolder').inject(this.descriptionBox);
			this.element.addEvent('click', this.bound('_onTitleClick'));
			e('h1', {text:project.title}).inject(textHolder);
			e('div', {text:"- view -"}).inject(textHolder);
			// this.element.addEvent('mousemove', this.bound('_onMouseMove'));

			if(project.images.length > 3){
				this._initializeImages();
			}
			else console.warn("not enough images for project...");
		},
		_onTitleClick: function(){
			window.app.projectClicked(this.data.id);
			// this._onMouseLeave();
			// this.fireEvent('clicked', this.project);
		},
		imageSliders:[],
		_initializeImages: function(){
		    console.log("doing images for", this.data.title);
		    var imgs = this.data.images;
			var img0 = loadImage(imgs[0]);
			var img1 = loadImage(imgs[1]);
			var img2 = loadImage(imgs[2]);
			var img3 = loadImage(imgs[3]);
			this.imageSliders = [
				new ImageSlider(imgs[0], img0, imgs[2], img2, 0),
				new ImageSlider(imgs[1], img1, imgs[0], img0, 1),
				new ImageSlider(imgs[2], img2, imgs[3], img3, 2),
				new ImageSlider(imgs[3], img3, imgs[1], img1, 3)
			];
			this.element.adopt(this.imageSliders);
		},
		_onMouseEnter: function(eve){
			this.slideAllOut();
			this.descriptionBox.show();
			// this.opaqueCover.tween('opacity', .5);
			this.descriptionBox.tween('opacity', 1);
		},
		_onMouseLeave: function(eve){
			this.slideAllBack()
			// this.opaqueCover.tween('opacity', 1);
			this.descriptionBox.get('tween').start('opacity', 0).chain(function(){
				this.descriptionBox.hide();
			}.bind(this));
		},
		slideAllOut: function(){
			this.imageSliders.each(function(imgSlider){
				imgSlider.slideOut();
		    }, this);
		},
		slideAllBack: function(){
			this.imageSliders.each(function(imgSlider){
				imgSlider.slideBack();
		    }, this);
		},
		resizeToWidth: function(width){
			this.element.setStyles({width:width, height:width});
			width = width/2;
		    this.imageSliders.each(function(imgSlider){
				imgSlider.resize(width);
		    }, this);
		},
		toElement: function(){ return this.element; }
	});

var ImageSlider = new Class({
		Implements:[Events, Class.Binds],
		initialize: function(img1Data, img1, img2Data, img2, seq){
			this.element = e('div.imageSlider');

			this.loader = new Loader();
			this.loader.start();
			this.element.adopt(this.loader);

			this.sequence = seq;
			var styles = {};
			if(seq == 0 || seq == 1) styles.top = 0;
			if(seq == 0 || seq == 2) styles.left = 0;
			if(seq == 1 || seq == 3) styles.right = 0;
			if(seq == 2 || seq == 3) styles.bottom = 0;
			this.element.setStyles(styles);
			img1.addEvent('load:once', this.bound('_primaryImageLoad'));
			img2.addEvent('load:once', this.bound('_secondaryImageLoad'));
			this.image1Data = img1Data;
			this.image2Data = img2Data;
			var prop = (this.sequence == 0 || this.sequence == 3) ? "top" : "left";
			var sign = (this.sequence == 0 || this.sequence == 2) ? "neg" : "pos";
			var className = prop+" "+sign;
			this.image1Holder = e('div.imgHolder.alt').inject(this);
			this.image1Holder.addClass(className+" holder1");
			this.image2Holder = e('div.imgHolder').inject(this);
			this.image2Holder.addClass(className+" holder2");
	    },
	  //   _outStyles: function(){
			// var styles = {};
			// styles[this._keyOutProp()] = this._keyOutSign()*this.size;
			// return styles;
	  //   },
	  //   _keyOutProp: function(){
			// return this.sequence == 0 || this.sequence == 3 ? "top" : "left";
	  //   },
	  //   _keyOutSign: function(){
			// return this.sequence == 0 || this.sequence == 2 ? 1 : -1;
	  //   },
	  //   _inStyles: function(){
			// return {left:null, top:null};
	  //   },
	    _primaryImageLoad: function(img){
	        if(typeOf(img) == 'element'){
				this.image1 = img;
				// this.image1Holder.set('tween', {duration:100});
                this.image1Holder.adopt(img);
                this.resize(this.size);
                this.loader.stop();
             }
	    },
	    _secondaryImageLoad: function(img){
			if(typeOf(img) == 'element'){
				this.image2 = img.clone();
				// this.image2Holder.set('tween', {duration:100});
				this.image2Holder.adopt(this.image2);
				this.resize(this.size);
			}
	    },
	    resize: function(size){
			this.size = size;
			this.element.setStyles({width:size, height:size});
			if(this.image1) 
				this.image1.setStyles(this.stylesForImage(this.image1Data, size));
			if(this.image2) 
				this.image2.setStyles(this.stylesForImage(this.image2Data, size));
			// this.image2Holder.setStyles(this._outStyles());
			// this.image1Holder.setStyles(this._inStyles());
	    },
	    stylesForImage: function(imageData, size){
			var dims = {};
	        if(parseInt(imageData.height) > parseInt(imageData.width)){
	            dims.width = size;
	            dims.height = (size/imageData.width)*imageData.height;   
	            dims.top = (size-dims.height)/2;
	            dims.left = 0;
	        }
	        else {
	            dims.width = (size/imageData.height)*imageData.width;
	            dims.height = size;
	            dims.left = (size-dims.width)/2;
	            dims.top = 0;
	        }
			return dims;
	    },
	    slideOut: function(){
			// this.image1Holder.tween(this._keyOutProp(), -1*this.size*this._keyOutSign());
			// this.image2Holder.tween(this._keyOutProp(), 0);
	    },
	    slideBack: function(){
			// this.image2Holder.tween(this._keyOutProp(), this.size*this._keyOutSign());
			// this.image1Holder.tween(this._keyOutProp(), 0);
	    },
	    toElement:function(){
			return this.element;
	    }
	});