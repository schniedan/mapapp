class TripToken {	
    constructor(location, textLocation, text, textSize, textColor, textFont) {
		textSize = textSize ? textSize : "20";
		textColor = textColor ? textColor : "#FFFFFF";
		textFont = textFont ? textFont : "Arial";
		
		this._id;
		this._relatedTextId;
		this._location = location;
		this._textLocation = textLocation;
		this._text = text;
		this._textSize = textSize;
		this._textColor = textColor;
		this._textFont = textFont;
		
		//console.log("Created new TripToken: " + location + " " + text + " " + textSize + " " + textColor + " " + textFont)
    }
	
	getId() {
		return this._id;
	}
	
	setId(id) {
		this._id = id;
	}
	
    getLocation() {
		return this._location;
    }
	
	setLocation(location) {
		this._location = location;
	}	
	
    getTextLocation() {
		return this._textLocation;
    }
	
	setTextLocation(location) {
		this._textLocation = location;
	}
	
	getText() {
		return this._text;
	}	
	
	getRelatedTextId() {
		return this._relatedTextId;
	}
	
	setRelatedTextId(textId) {
		this._relatedTextId = textId;
	}
	
	getTextStyle() {
		var textStyle = "{color: " + this._textColor + "; " 
					+ "white-space: nowrap; "
					+ "font-size: " + this._textSize + "pt;"
					+ "font-family: " + this._textFont
					+ "}";
		//console.log("textStyle: " + textStyle);
			return textStyle;
	}
	
	setTextSize(size) {
		this._textSize = size;		
	}
	
	getTextSize() {
		return this._textSize;
	}
	
	setTextColor(color) {
		this._textColor = color;		
	}
	
	getTextColor() {
		return this._textColor;
	}
	
	setTextFont(font) {
		this._textFont = font;		
	}
	
	getTextFont() {
		return this._textFont;
	}
}