map = new ol.Map({
	interactions: ol.interaction.defaults().extend([
		new ol.interaction.DragRotateAndZoom()
	]),
	layers: [
		new ol.layer.Tile({
		source: new ol.source.MapQuest({layer: 'sat'})
		})
	],
	target: 'map',
	view: new ol.View({
		center: [0, 0],
		zoom: 2
	})
});