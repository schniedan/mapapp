'use strict';

var Header = React.createClass({
render: function() {
	return (
	  <h2>
		Journible
	  </h2>
	);
  }
});

class Map extends React.Component {
	constructor(props) {
		super(props);
		
		this.state = {map: null}
		
	}	
	
	initMap() {
		// Create a map object and specify the DOM element for display.
		
		var init_map = L.map('map').setView([-27.487, 152.98400000000004], 14);
        var mapLink = 
            '<a href="http://www.esri.com/">Esri</a>';
        var wholink = 
            'i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community';
        L.tileLayer(
            'http://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
            attribution: '&copy; '+mapLink+', '+wholink,
            maxZoom: 18,
            }).addTo(init_map);
			
		this.state.map = init_map
		
		this.state.markerLayer = L.layerGroup().addTo(this.state.map);
		
/*		this.state.map = new google.maps.Map(document.getElementById('map'), {
		  center: {lat: -34.397, lng: 150.644},
		  scrollwheel: true,
		  zoom: 8,
		  mapTypeId: 'satellite'
		});
*/		
	}

	componentDidMount() {	
		this.initMap();
	}

	render() {
		var that = this
		
		if(this.state.markerLayer) {
			this.state.markerLayer.clearLayers();
		}
		
		this.props.tripTokens.forEach(function(token) {
/*			var place;
			try {
				place = JSON.parse(strPlace);
			} catch(e) {
				place = strPlace;
			}
			
			
			var tripToken = new TripToken(place.geometry.location, place.address_components[0].short_name);
			console.log(tripToken.getLocation().lat);
*/			
			//var marker = L.marker([place.geometry.location.lat, place.geometry.location.lng],
			var marker = L.marker([token.getLocation().lat, token.getLocation().lng],
				{
					draggable: true,
					title: 	token.getText(),
					riseOnHover: true
				}
			).addTo(that.state.markerLayer);
			//marker.bindTooltip(place.address_components[0].short_name, {className: 'toolTipClass', permanent: true, direction: 'bottom'}).openTooltip();
			
			token.setId(marker._leaflet_id);			
						
			marker.on('click', function() {
				that.props.onTokenSelect(token);
			});
			
			marker.on('dragend', function() {		
				that.props.tokenManuallyMoved(marker);
			});
			
			var style = document.createElement('style');
			style.setAttribute('id', 'style' + marker._leaflet_id);
			style.type = 'text/css';
			style.innerHTML = '.iconClass' + marker._leaflet_id + token.getTextStyle();
			document.getElementsByTagName('head')[0].appendChild(style);			
			
			var divIcon = L.divIcon({ 
				html: token.getText(),
				className: 'iconClass' + marker._leaflet_id
			})
			
			var textMarker = L.marker(new L.LatLng(token.getTextLocation().lat, token.getTextLocation().lng), { icon: divIcon, draggable: true }).addTo(that.state.markerLayer);
			
			
			textMarker.on('click', function() {
				that.props.onTokenSelect(token);
			});	
			
			textMarker.on('dragend', function() {		
				that.props.tokenManuallyMoved(textMarker);
			});
			
			token.setRelatedTextId(textMarker._leaflet_id);
		});
		return (
		  <div id="map"></div>
		);
	  }
}

class GoogleMarkerSearch extends React.Component {
	constructor(props) {
		super(props);
		this.state = {};
		
		this.handleResultSelected = this.handleResultSelected.bind(this);
	}	
	
	componentDidMount() {
		var input = document.getElementById('newMarkerSearch-input');
		this.state.autocomplete = new google.maps.places.Autocomplete(input);
		
		this.state.autocomplete.addListener('place_changed', this.handleResultSelected);		
	}
	
	handleResultSelected() {
		var placeObject = this.state.autocomplete.getPlace();
		
		var newToken = new TripToken({lat: placeObject.geometry.location.lat(), lng: placeObject.geometry.location.lng()},
									 {lat: placeObject.geometry.location.lat(), lng: placeObject.geometry.location.lng()},
									 placeObject.address_components[0].short_name);
		
		this.props.markerSelected(newToken);		
	}
	
	render() {
			
		return (
			<div id="googleMarkerSearchInput">
				<input id="newMarkerSearch-input" type="text" placeholder="Enter a location" />
			</div>
		);
	}
}

class OptimisticDataSaver extends React.Component {
	constructor(props) {
		super(props);
		this.state = {}
		
		this.saveRequired 		= false;
		
		this.saveSuccess    	= this.saveSuccess.bind(this);
		this.sendData    		= this.sendData.bind(this);
		this.updateIfRequired 	= this.updateIfRequired.bind(this);
	}
	
	saveSuccess() {
		console.log("Yeah");		
		this.saveRequired = false;
	}	
	
	componentDidUpdate(prevProps, prevState) {
        this.saveRequired = true;
	}	  
	
	componentDidMount() {		
		this.timer = setInterval(this.updateIfRequired, 3000);
	}  
	
	componentWillUnmount(){
        clearInterval(this.timer);
    }
	
	updateIfRequired(){
        if(this.saveRequired) {
			console.log("I think I need to save something");
			this.sendData();
		}
    }
	
	sendData() {		
		var jsonData = JSON.stringify({ trip: JSON.stringify(this.props.tripTokens) })
		$.ajax({
			type: "POST",
			url: "api/trip/",
			data: jsonData,
			contentType: "application/json; charset=utf-8",
			dataType: "json",
			success: this.saveSuccess(),
		});
	}
	
	render() {
		return null;
	}
}

class Ui extends React.Component {
	constructor(props) {
		super(props);
		this.state = {}				
		
		this.initTextSizeSlider   	= this.initTextSizeSlider.bind(this);
		this.initColorPicker    	= this.initColorPicker.bind(this);
	}	
	
	initTextSizeSlider() {		
		if(this.props.selectedToken) {	
			var textSizeSlider = $("#textSizeInput").slider();
			var that = this;
			textSizeSlider.on('change', function(change) {that.props.onTextSizeUpdate(change);});
			textSizeSlider.slider('setValue', this.props.selectedToken.getTextSize());
		}
	}
	
	initColorPicker() {
		var that = this;
		$('#cp2').colorpicker();
		$('#cp2').colorpicker().on('changeColor', function(ev){
		  that.props.onTextColorUpdate(ev.color);
		});
		
		if(this.props.selectedToken) {
			$('#cp2').colorpicker('setValue', that.props.selectedToken.getTextColor());
		}
	}
	
	componentDidMount() {
		this.initTextSizeSlider();
		this.initColorPicker();
	}
	
	componentDidUpdate(prevProps, prevState) {
		this.initTextSizeSlider();	
		this.initColorPicker();		
	}
	
	render() {
		var rows = [];
		var that = this;
		
		this.props.tripTokens.forEach(function(token) {
			
				rows.push (
						<a href="#" key={token.getId()} onClick={ () => {that.props.onTokenSelect(token)} } className="list-group-item">{token.getText()}<span className="glyphicon glyphicon-remove pull-right" aria-hidden="true" onClick={ () => {that.props.onTokenDelete(token, event)} }></span></a>
				);
			}
		);
					
		return (
			<div id="uiComponent">
				<GoogleMarkerSearch markerSelected={this.props.onMarkerUpdate}/>
				<br />
				{this.props.tripTokens.length} tokens in your list
				<br />
				<br />
				{this.props.selectedToken && this.props.selectedToken.getText() + " selected."}
				<br />
				<br />
				
				
				<div className="list-group col-xs-2" >
				{rows}
				</div>
				
				{	this.props.selectedToken && 
					<div>
						<input id="textSizeInput" data-slider-id='textSizeSlider' type="text" data-slider-min="0" data-slider-max="30" data-slider-step="1" data-slider-value={this.props.selectedToken.getTextSize()}/>
						<br />
						<br />					
						<div id="cp2" className="col-xs-1">
							<span className="input-group-addon"><br /></span>
						</div>
						<div className="col-xs-1"> 
							<ReactFontPicker	
								fonts={["Arial",
										"Arial Black",
										"Arial Narrow",
										"Courier New",
										"Georgia",
										"Gill Sans",
										"Impact", 
										"Lucida Sans Unicode",
										"Palatino Linotype", 
										"Tahoma", 
										"Times New Roman",
										"Trebuchet MS",
										"Verdana"]}
								previews={true}
								activeColor="#64B5F6"
								value={this.props.selectedToken && this.props.selectedToken.getTextFont()}
								onChange={this.props.onTextFontUpdate}
							/>
						</div>
					</div>
				}
					
			</div>
		);
	}
}

class App extends React.Component {
	constructor(props) {
		super(props);

		this.state = {tripTokens: [],
					  selectedToken: null}
		
		var that = this;
		
		$.getJSON('api/trip', function(data) {
			var loadedToken = [];
			var parsedData = JSON.parse(data["trip"]);
			if(parsedData) {
				parsedData.forEach(function(marker) {					
					loadedToken.push(new TripToken(marker._location, marker._textLocation, marker._text, marker._textSize, marker._textColor, marker._textFont));
				});
				
				that.setState({
					tripTokens: loadedToken				
				});	
			}
		
		});

		this.updateMarkers   		= this.updateMarkers.bind(this);
		this.updateTextSize  		= this.updateTextSize.bind(this);
		this.updateTextColor 		= this.updateTextColor.bind(this);
		this.updateTextFont  		= this.updateTextFont.bind(this);
		this.selectToken     		= this.selectToken.bind(this);
		this.deleteToken     		= this.deleteToken.bind(this);
		this.onTokenManuallyMoved   = this.onTokenManuallyMoved.bind(this);
		this.getTokenById   		= this.getTokenById.bind(this);
		this.getTokenByTextMarkerId = this.getTokenByTextMarkerId.bind(this);
	}	
	
	getTokenById(searchId) {
		for (let t of this.state.tripTokens) {
		  console.log(t.getId() + " == " + searchId);
			if(searchId === t.getId()) {
				return t;
			}
		}
	}	
	
	getTokenByTextMarkerId(searchId) {
		for (let t of this.state.tripTokens) {
		  console.log(t.getRelatedTextId() + " == " + searchId);
			if(searchId === t.getRelatedTextId()) {
				return t;
			}
		}
	}
	
	onTokenManuallyMoved(marker) {
		console.log("new lat lng: " + marker.getLatLng());
		
		var tokenToUpdate = this.getTokenById(marker._leaflet_id);
		var updatingTheIcon = true;
		if(!tokenToUpdate) {
			console.log("No token found, looking for text marker");
			updatingTheIcon = false;
			tokenToUpdate = this.getTokenByTextMarkerId(marker._leaflet_id);
		}
		
		if(updatingTheIcon) {
			tokenToUpdate.setLocation(marker.getLatLng());
		} else {
			tokenToUpdate.setTextLocation(marker.getLatLng());
		}
		
		this.setState({	tripTokens: this.state.tripTokens});
	}
	
	selectToken(token) {
		this.setState({selectedToken: token});
	}
	
	updateMarkers(newToken) {
		this.setState({
			tripTokens: this.state.tripTokens.concat([newToken])
		});		
	}
	
	deleteToken(delToken, event) {		
		
		event.stopPropagation();
		
		var updateTokens = this.state.tripTokens;
		var delIndex = updateTokens.indexOf(delToken);
		console.log("Deleting token: " + delToken.getText() + " index: " + delIndex);
		updateTokens.splice(delIndex, 1);
		//delete this.state.selectedToken;
		this.setState({	tripTokens: updateTokens});
		
		this.setState({selectedToken: false});
		
		this.selectToken(null);
		
		this.forceUpdate();
						
		console.log(this.state.selectedToken);
	}
	
	updateTextSize(change) {
		var token = this.state.selectedToken;
		token.setTextSize(change.value.newValue);
		var style = document.getElementById('style' + token.getId());
		style.innerHTML = '.iconClass' + token.getId() + token.getTextStyle();
	}
	
	updateTextColor(color) {
		var token = this.state.selectedToken;
		token.setTextColor(color.toHex());
		var style = document.getElementById('style' + token.getId());
		style.innerHTML = '.iconClass' + token.getId() + token.getTextStyle();	
	}
	
	updateTextFont(font) {
		var token = this.state.selectedToken;
		token.setTextFont(font);
		var style = document.getElementById('style' + token.getId());
		style.innerHTML = '.iconClass' + token.getId() + token.getTextStyle();		
		//this.selectToken(this.state.selectedToken);
	}
	
	render() {
		return (
			<div className="app">
			  <Header />
				<Map 	tripTokens			= {this.state.tripTokens} 					
						onTokenSelect		= {this.selectToken}	
						tokenManuallyMoved  = {this.onTokenManuallyMoved}
				/>
						
				<Ui 	onMarkerUpdate		= {this.updateMarkers} 
						onTokenDelete		= {this.deleteToken} 
						onTextSizeUpdate	= {this.updateTextSize}
						onTextColorUpdate	= {this.updateTextColor}
						onTextFontUpdate	= {this.updateTextFont}
						onTokenSelect		= {this.selectToken}
						tripTokens			= {this.state.tripTokens}
						selectedToken		= {this.state.selectedToken} />
				  
				<OptimisticDataSaver 
						tripTokens			= {this.state.tripTokens}
				/>
			</div>
		);
	  }
}

ReactDOM.render(<App />, document.getElementById('app'));
