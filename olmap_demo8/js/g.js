/**
 * Define a namespace for the application.
 */
window.app = {};
var app = window.app;

var TileLayer = function (options) {
    var layer = new ol.layer.Tile({
        extent: ol.proj.transformExtent(options.mapExtent, options.fromProject, options.toProject),
        source: new ol.source.XYZ({
            attributions: [options.attribution],
            url: options.url,
            tilePixelRatio: options.tilePixelRatio, // THIS IS IMPORTANT
            minZoom: options.mapMinZoom,
            maxZoom: options.mapMaxZoom
        })
    });
    return layer;
}

//popup
var container = document.getElementById('popup');
var content = document.getElementById('popup-content');
var closer = document.getElementById('popup-closer');

var overlay = new ol.Overlay(/** @type {olx.OverlayOptions} */ ({
    element: container,
    autoPan: true,
    autoPanAnimation: {
        duration: 250
    }
    }));

closer.onclick = function() {
    overlay.setPosition(undefined);
    closer.blur();
    return false;
};

//
// Define rotate to north control.
//

/**
 * @constructor
 * @extends {ol.control.Control}
 * @param {Object=} opt_options Control options.
 */
app.RotateNorthControl = function(opt_options) {

  var options = opt_options || {};

  var button = document.createElement('button');
  button.innerHTML = 'N';

  var this_ = this;
  var handleRotateNorth = function(e) {
    this_.getMap().getView().setRotation(0);
  };

  button.addEventListener('click', handleRotateNorth, false);
  button.addEventListener('touchstart', handleRotateNorth, false);

  var element = document.createElement('div');
  element.className = 'rotate-north ol-unselectable ol-control';
  element.appendChild(button);

  ol.control.Control.call(this, {
    element: element,
    target: options.target
  });

};
ol.inherits(app.RotateNorthControl, ol.control.Control);

//g图层
var defaults = {
        url: 'http://localhost:8080/data/{z}/{x}/{y}.png',
        mapExtent: [-2.0037508342787E7, -2.0037508342787E7, 2.0037508342787E7, 2.0037508342787E7],   //57.744140625,-1.2303741774326018,151.259765625,54.82600799909498 
        mapMinZoom: 2,
        mapMaxZoom: 17,
        attribution: new ol.Attribution({
            html: '章丘地图'
        }),
        tilePixelRatio: 1,
        fromProject: "EPSG:102100",
        toProject: "EPSG:3857" //3857
    };

defaults.url="http://mt.google.cn/vt/lyrs=t@258000000&hl=zh-CN&gl=CN&src=app&x={x}&y={y}&z={z}&s=Ga";
var myglayer = new TileLayer(defaults); //地形图
defaults.url="http://mt.google.cn/vt/lyrs=h@177000000&hl=zh-CN&gl=cn&x={x}&y={y}&z={z}&s=";
var mylblayer = new TileLayer(defaults); //标记

defaults.url="zhangqiu/{z}/{x}/{y}.jpg";
var locallayer = new TileLayer(defaults); //本地


var map = new ol.Map({
  controls: ol.control.defaults({
    attributionOptions: /** @type {olx.control.AttributionOptions} */ ({
      collapsible: true
    })
  }).extend([
    
  ]),
  layers: [myglayer,mylblayer], //myglayer,mylblayer //本地locallayer
  overlays: [overlay],
  target: 'map',
  view: new ol.View({
    zoom: 13,
    center: ol.proj.transform([117.5190,36.6964], 'EPSG:4326', 'EPSG:3857'),
    rotation:0
  })
});

//添加属性控件
map.addControl(new ol.control.Attribution());

//旋转恢复控件
map.addControl(new ol.control.Rotate({
    autoHide: false
    }));

//添加鼠标定位控件
map.addControl(new ol.control.MousePosition({
    undefinedHTML: '',
    projection: 'EPSG:4326', 
    coordinateFormat: function(coordinate) {
        return ol.coordinate.format(coordinate, '{x}, {y}', 4); 
        }              
    })
);

//添加比例尺控件
map.addControl(new ol.control.ScaleLine());

//添加缩放到当前视图滑动控件
map.addControl(new ol.control.ZoomToExtent());

 var iconStyle = new ol.style.Style({
        image: new ol.style.Icon(/** @type {olx.style.IconOptions} */ ({
          anchor: [0.5, 46],
          anchorXUnits: 'fraction',
          anchorYUnits: 'pixels',
          src: './img/ico.png'
        }))
      });


//标注图层
var source = new ol.source.Vector({
    wrapX: false
});
var vector = new ol.layer.Vector({
    source: source,
    style: pointStyleFunction
    //style:iconStyle
    /*
    style: new ol.style.Style({
          fill: new ol.style.Fill({
            color: 'rgba(255, 255, 255, 0.2)'
          }),
          stroke: new ol.style.Stroke({
            color: '#ffcc33',
            width: 2
          }),
          image: new ol.style.Circle({
            radius: 7,
            fill: new ol.style.Fill({
              color: '#ffcc33'
            })
          }),
          text: new ol.style.Text({ //文本样式
            font: '12px Calibri,sans-serif',
            text: '@name',
            //offsetX:10,
            offsetY:-20,
            fill: new ol.style.Fill({
              color: '#000'
            }),
            stroke: new ol.style.Stroke({
              color: '#fff',
              width: 3
            })
          })
        })
        */
});
map.addLayer(vector);

function pointStyleFunction(feature, resolution) {
        return new ol.style.Style({
          image: new ol.style.Circle({
            radius: 5,
            fill: new ol.style.Fill({color: 'rgba(255, 0, 0, 0.1)'}),
            stroke: new ol.style.Stroke({color: 'green', width: 5})
          }),
          text: createTextStyle(feature, resolution)
        });
      }

var createTextStyle = function(feature, resolution) {

        return new ol.style.Text({
          font: '12px Calibri,sans-serif',
            text: feature.G.name+':'+feature.G.rain,
            //offsetX:10,
            offsetY:-20,
            fill: new ol.style.Fill({
              color: '#f00079'
            }),
            stroke: new ol.style.Stroke({
              color: '#ffffff',
              width: 3
            })
        });
      };

function addRandomFeature() {
    var x = Math.random() * 360 - 180;
    var y = Math.random() * 180 - 90;
    var geom = new ol.geom.Point(ol.proj.transform([x, y],
        'EPSG:4326', 'EPSG:3857'));
    var feature = new ol.Feature({
        geometry: geom,
        labelPoint: geom,
        name: 'TestNAME'
    });
    source.addFeature(feature);
}

source.on('addfeature', function(e) {
        //flash(e.feature);
      });
      
//window.setInterval(addRandomFeature, 1000);
var duration = 3000;
function flash(feature) {
        var start = new Date().getTime();
        var listenerKey;

        function animate(event) {
          var vectorContext = event.vectorContext;
          var frameState = event.frameState;
          var flashGeom = feature.getGeometry().clone();
          var elapsed = frameState.time - start;
          var elapsedRatio = elapsed / duration;
          // radius will be 5 at start and 30 at end.
          var radius = ol.easing.easeOut(elapsedRatio) * 25 + 5;
          var opacity = ol.easing.easeOut(1 - elapsedRatio);

          var flashStyle = new ol.style.Circle({
            radius: radius,
            snapToPixel: false,
            stroke: new ol.style.Stroke({
              color: 'rgba(255, 0, 0, ' + opacity + ')',
              width: 1
            })
          });

          vectorContext.setImageStyle(flashStyle);
          vectorContext.drawPointGeometry(flashGeom, null);
          if (elapsed > duration) {
            ol.Observable.unByKey(listenerKey);
            return;
          }
          // tell OL3 to continue postcompose animation
          map.render();
        }
        listenerKey = map.on('postcompose', animate);
      }
      
var select = null;  // ref to currently selected interaction

//要素选择相关代码
var selectSingleClick = new ol.interaction.Select(); 
var selectClick = new ol.interaction.Select({
        condition: ol.events.condition.click
      });
var changeInteraction = function() {
    if (select !== null) {
        map.removeInteraction(select);
    }
    select = selectClick;
    if (select !== null) {
        map.addInteraction(select);
        select.on('select', function(e) {
            //alert(e.selected[0].G.name);
            //show popup
            if(! e.selected[0]|| !e.selected[0].G)
            {
              return;              
            }
            
             var coordinate = e.selected[0].G.geometry; //evt.coordinate;
            //var hdms = ol.coordinate.toStringHDMS(ol.proj.transform(coordinate, 'EPSG:3857', 'EPSG:4326'));
            var htmlcontentL = '<img src=\"'+e.selected[0].G.imgurl+'\"  alt="测试图片"><br>编号(ID):<code>' + e.selected[0].G.id +
                '</code><br>'+'名称(Name):<code>' + e.selected[0].G.name +
                '</code><br>'+'降雨量:<code>' + e.selected[0].G.rain +
                '</code>';
            
            var pix=map.getPixelFromCoordinate(e.selected[0].getGeometry().getCoordinates());
            
            addWindow(e.selected[0].G.name,htmlcontentL,pix[0],pix[1]);
            return;
            content.innerHTML=htmlcontent;
            var coord = [7.85, 47.983333];
            var template = 'Coordinate is ({x}|{y}).';
            var out = ol.coordinate.format(coord, template);
            
            overlay.setPosition(e.selected[0].getGeometry().getCoordinates()); //coordinate
            /*
        document.getElementById('status').innerText = '&nbsp;' +
            e.target.getFeatures().getLength() +
            ' selected features (last operation selected ' + e.selected.length +
            ' and deselected ' + e.deselected.length + ' features)';
            */
        });
    }
};
changeInteraction();

//测试数据
var TestPointInfo='[{"id":1,"name":"点位1","rain":"500ml","imgurl":"http://s.cn.bing.net/th?id=OIP.M8acffb1db4a974038aff9d1cc0f1e93eo0&w=216&h=119&c=7&rs=1&qlt=90&o=4&pid=1.1","X":114.4832,"Y":36.7266},{"id":2,"name":"点位2","rain":"600ml","imgurl":"http://s.cn.bing.net/th?id=OIP.M8acffb1db4a974038aff9d1cc0f1e93eo0&w=216&h=119&c=7&rs=1&qlt=90&o=4&pid=1.1","X":117.5389,"Y":36.6801},{"id":3,"name":"点位3","rain":"450ml","imgurl":"http://s.cn.bing.net/th?id=OIP.M8acffb1db4a974038aff9d1cc0f1e93eo0&w=216&h=119&c=7&rs=1&qlt=90&o=4&pid=1.1","X":117.5055,"Y":36.7000},{"id":4,"name":"点位4","rain":"500ml","imgurl":"http://s.cn.bing.net/th?id=OIP.M8acffb1db4a974038aff9d1cc0f1e93eo0&w=216&h=119&c=7&rs=1&qlt=90&o=4&pid=1.1","X":117.5834,"Y":36.7095}]';

function addPoints(pointjson) {
  var arr=eval('(' + pointjson + ')');
    for(var i=0;i<arr.length;i++){  
        var geom = new ol.geom.Point(ol.proj.transform([arr[i].X,arr[i].Y],
            'EPSG:4326', 'EPSG:3857'));
        var feature = new ol.Feature({
            geometry: geom,
            labelPoisFinitent: geom,
            id: arr[i].id,
            name: arr[i].name,
            rain: arr[i].rain,
            imgurl:arr[i].imgurl
        });
        //var style=getStyle(arr[i].rain);
        //feature.getStyle(style);
        source.addFeature(feature);
    }

}

//遍历所有的要素信息
function getFeature() //attname,attvalue
{
     source.forEachFeature(function (feature) {

     var properties = feature.getProperties();
        console.log(properties['name']);

    });
}

//根据属性查找要素
function getFeature(attname,attvalue) //
{
     source.forEachFeature(function (feature) {

     var properties = feature.getProperties();
     if(attvalue==properties[attname])
     {
         console.log(properties[attname]);
     }
    });
}

function getStyle(txt)
{

return new ol.style.Style({
          fill: new ol.style.Fill({
            color: 'rgba(255, 255, 255, 0.2)'
          }),
          stroke: new ol.style.Stroke({
            color: '#ffcc33',
            width: 2
          }),
          image: new ol.style.Circle({
            radius: 7,
            fill: new ol.style.Fill({
              color: '#ffcc33'
            })
          }),
          text: new ol.style.Text({ //文本样式
            font: '12px Calibri,sans-serif',
            text: txt,
            //offsetX:10,
            offsetY:-20,
            fill: new ol.style.Fill({
              color: '#000'
            }),
            stroke: new ol.style.Stroke({
              color: '#fff',
              width: 3
            })
          })
        });  
}

//调用测试方法 也是你需要调用的
addPoints(TestPointInfo);


//tooltip
var info = $('#info');
    info.tooltip({
    animation: false,
    trigger: 'manual'
});

var displayFeatureInfo = function(pixel) {
    info.css({
        left: pixel[0] + 'px',
        top: (pixel[1] - 15) + 'px'
    });
    var feature = map.forEachFeatureAtPixel(pixel, function(feature) {
        return feature;
    });
    if (feature) {
        info.tooltip('hide')
            .attr('data-original-title', "ID:"+feature.get('id')+"Name:"+feature.get('name'))
            .tooltip('fixTitle')
            .tooltip('show');
    } else {
        info.tooltip('hide');
    }
};

map.on('pointermove', function(evt) {
    if (evt.dragging) {
        info.tooltip('hide');
        return;
    }
    displayFeatureInfo(map.getEventPixel(evt.originalEvent));
});

/*
map.on('click', function(evt) {
    displayFeatureInfo(evt.pixel);
});
*/
map.on('click', function(evt) {
    var coordinate = evt.coordinate;
    var pix=map.getPixelFromCoordinate(coordinate);
    //$.newWindow({title:'测试标题',content:'测试内容',posx:pix[0],posy:pix[1]});
    //return;
    
    //addWindow(e.selected[0].G.name,htmlcontentL,pix[0],pix[1]);
    
    var marker = new ol.Overlay({
      position: coordinate,
      positioning: 'center-center',
      element: $.newWindow({title:'测试标题',content:'测试内容',posx:pix[0],posy:pix[1]}), //
      stopEvent: true
    });
    map.addOverlay(marker);
    
    /*
    var overlay = new ol.Overlay({
        //element: $.newWindow({title:'测试标题',content:'测试内容',posx:pix[0],posy:pix[1]})
    });
    //overlay.setPosition(coordinate);
    map.addOverlay(overlay);
    */
    marker.on("change:position", function(){
        console.log("位置改变！");
    })
    
    
    /**
    * Object literal with config options for the overlay.
    * @typedef {{id: (number|string|undefined),
    *     element: (Element|undefined),
    *     offset: (Array.<number>|undefined),
    *     position: (ol.Coordinate|undefined),
    *     positioning: (ol.OverlayPositioning|string|undefined),
    *     stopEvent: (boolean|undefined),
    *     insertFirst: (boolean|undefined),
    *     autoPan: (boolean|undefined),
    *     autoPanAnimation: (olx.animation.PanOptions|undefined),
    *     autoPanMargin: (number|undefined)}}
    * @api stable
    */
    
    //overlay 支持的事件
    //change，当引用计数器增加时，触发；
    //change:element，overlay 对应的 element 变化时触发；
    //change:map，overlay 对应的 map 变化时触发；
    //change:offset，overlay 对应的 offset 变化时触发；
    //change:position，overlay 对应的 position 变化时触发；
    //change:positioning，overlay 对应的 positioning 变化时触发；
    //propertychange，overlay 对应的属性变化时触发；
    
    //属性
    //getOffset，获取 offset 属性；
    //getPosition，获取 position 属性；
    //getPositioning，获取 positioning 属性；
    //setElement；设置 overlay 的 element；
    //setMap，设置与 overlay 的 map 对象；
    //setOffset，设置 offset；
    //setPosition，设置 position 属性；
    //setPositioning，设置 positioning 属性。
  
    /*
    var hdms = ol.coordinate.toStringHDMS(ol.proj.transform(
            coordinate, 'EPSG:4326', 'EPSG:4326'));
    overlay.setPosition(coordinate);
    content.innerHTML = '<p>You clicked here:</p><code>' + hdms +
    '</code>';
    container.style.display = 'block';
    title.innerHTML = "提示信息";
    title.style.display = 'block';
    map.getView().setCenter(coordinate);
    */
});


getFeature('id',"1");

function addWindow(title,content,x,y)
{
    $.newWindow({title:title,content:content,posx:x,posy:y});
}
//addWindow();


