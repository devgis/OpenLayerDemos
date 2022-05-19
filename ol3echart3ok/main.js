/**
 * echarts 百度地图扩展，必须在echarts初始化前使用
 *
 * @desc echarts基于Canvas，纯Javascript图表库，提供直观，生动，可交互，可个性化定制的数据统计图表。
 * @author pxm
 */
define(function (require) {

	/**
	 * 构造函数
	 *
	 * @param {String|HTMLElement|ol.Map} obj
	 * @param {ol} ol
	 * @param {echarts} ec
	 * @parma {Object=} mapOption ol3地图参数
	 * @constructor
	 */
	function OL3Ext(obj, ol, ec, mapOption) {
		this._init(obj, ol, ec, mapOption);
	};

	/**
	 * echarts 容器元素
	 *
	 * @type {HTMLElement}
	 * @private
	 */
	OL3Ext.prototype._echartsContainer = null;

	/**
	 * ol3地图实例
	 *
	 * @type {ol.Map}
	 * @private
	 */
	OL3Ext.prototype._map = null;

	/**
	 * 
	 *使用的echarts实例
	 * @type {ECharts}
	 * @private
	 */
	OL3Ext.prototype._ec = null;

	/**
	 * geoCoord
	 *
	 * @type {Object}
	 * @private
	 */
	OL3Ext.prototype._geoCoord = [];

	/**
	 * 记录地图的偏移量
	 *
	 * @type {Array.<number>}
	 * @private
	 */
	OL3Ext.prototype._mapOffset = [0, 0];


	/**
	 * 初始化方法
	 *
	 * @param {ol} ol
	 * @param {echarts} ec
	 * @private
	 */
	OL3Ext.prototype._init = function (ol, ec, mapOption) {
		var self = this;
		self._map = new ol.Map(mapOption);
		
		self.createEchartsContainer = function (map){
			var size = map.getSize();
			var div = self._echartsContainer = document.createElement('div');
			div.style.position = 'absolute';
			div.style.height = size[1] + 'px';
			div.style.width = size[0] + 'px';
			div.id="test";
			div.style.top = 0;
			div.style.left = 0;
			map.getViewport().appendChild(div);	
		}
		self.createEchartsContainer(self._map);
		/**
		 * 获取echarts容器
			*
		 * @return {HTMLElement}
		 * @public
		 */
		self.getEchartsContainer = function () {
			return self._echartsContainer;
		};
		/**
		 * 获取map实例
			*
		 * @return {ol.Map}
		 * @public
		 */
		self.getMap = function () {
			return self._map;
		}
		/**
		 * 自定义拖拽事件
		 */
		self.onmoving = null;
		self.onmoveend = null;
		
		/**
		 * 自定义缩放事件
		 */
		self.onzoom = null;
		/**
		 * 经纬度转换为屏幕像素
			*
		 * @param {Array.<number>} geoCoord  ¾­Î³¶È
		 * @return {Array.<number>}
		 * @public
		 */
		self.geoCoord2Pixel = function (geoCoord) {
			var coordinate = ol.proj.transform([geoCoord[0], geoCoord[1]],'EPSG:4326', 'EPSG:3857')
			var pixel = self._map.getPixelFromCoordinate(coordinate);
			return pixel;
		};
		/**
		 * 屏幕像素转换为经纬度
			*
		 * @param {Array.<number>} pixel  ÏñËØ×ø±ê
		 * @return {Array.<number>}
		 * @public
		 */
		self.pixel2GeoCoord = function (pixel) {
			var coordinate = self._map.getCoordinateFromPixel(pixel);
			return coordinate;
		};
		/**
		 * 初始化echarts实例
			*
		 * @return {ECharts}
		 * @public
		 */
		self.initECharts = function () {
			self._ec = ec.init.apply(self, arguments);
			self._bindEvent();
			//self._addMarkWrap();
			return self._ec;
		};
		/**
         * 获取ECharts实例
         *
         * @return {ECharts}
         * @public
         */
        self.getECharts = function () {
            return self._ec;
        };

        /**
         * 获取地图的偏移量
         *
         * @return {Array.<number>}
         * @public
         */
        self.getMapOffset = function () {
            return self._mapOffset;
        };
		/**
		 *对echarts的setOption加一次处理
         * 用来为markPoint、markLine中添加x、y坐标，需要name与geoCoord对应
		 * @param {Object}
		 * @public
		 */
		self.setOption = function (option, notMerge) {
			var series = option.series || {};
			
			 // 记录所有的geoCoord
			for (var i = 0, item; item = series[i++];) {
				var geoCoord = item.geoCoord;
				if (geoCoord) {
					for (var k in geoCoord) {
						self._geoCoord[k] = geoCoord[k];
					}
				}
			}
			
			  // 添加x、y
			for (var i = 0, item; item = series[i++];) {
				var markPoint = item.markPoint || {};
				var markLine = item.markLine || {};
				
				var data = markPoint.data;
				if (data && data.length) {
					for (var k = 0, len = data.length; k < len; k++) {
						self._AddPos(data[k]);
					}
				}
				
				data = markLine.data;
				if (data && data.length) {
					for (var k = 0, len = data.length; k < len; k++) {
						self._AddPos(data[k][0]);
						self._AddPos(data[k][1]);
					}
				}
			}
			self._ec.setOption(option, notMerge);
		}
		
		/**
		 * 增加x、y坐标
			*
		 * @param {Object} obj  markPoint¡¢markLine dataÖÐµÄÏî£¬±ØÐëÓÐname
		 * @param {Object} geoCoord
		 */
		self._AddPos = function (obj) {
			var coord = this._geoCoord[obj.name]
			var pos = this.geoCoord2Pixel(coord);
			obj.x = pos[0] - self._mapOffset[0];
			obj.y = pos[1] - self._mapOffset[1];
		};

		/**
         * 绑定地图事件的处理方法
         *
         * @private
         */
        self._bindEvent = function () {

            // self._map.on('pointerdrag', _moveHandler('moving'));
            self._map.on('moveend', _moveHandler('moveend'));

            self._ec.getZrender().on('dragstart', _dragZrenderHandler(true));
            self._ec.getZrender().on('dragend', _dragZrenderHandler(false));
        }
        /**
         * 地图移动、如拖拽触发事件
         *
         * @param {string} type moving | moveend  移动中|移动结束
         * @return {Function}
         * @private
         */
        function _moveHandler(type) {
            return function () {
                // 记录偏移量
                var offsetEle =
                    self._echartsContainer.parentNode.parentNode.parentNode;
                self._mapOffset = [
                    - parseInt(offsetEle.style.left) || 0,
                    - parseInt(offsetEle.style.top) || 0
                ];
                self._echartsContainer.style.left = self._mapOffset[0] + 'px';
                self._echartsContainer.style.top = self._mapOffset[1] + 'px';

                _fireEvent(type);
            }
        }
         /**
         * 触发事件
         *
         * @param {stirng}  type 事件类型
         * @private
         */
        function _fireEvent(type) {
            var func = self['on' + type];
            if (func) {
                func();
            } else {
                self.refresh();
            }
        }

        /**
         * Zrender拖拽触发事件
         *
         * @param {boolean} isStart
         * @return {Function}
         * @private
         */
        function _dragZrenderHandler(isStart) {
            return function () {
                makeMapDrag(!isStart);
            }
        }
        /**
        *地图拖拽限制
        */
        function makeMapDrag(flag){
        	var interactions = self._map.getInteractions().getArray();
			var dragPanInteraction = interactions.filter(function(interaction) {
			  return interaction instanceof ol.interaction.DragPan;
			})[0];
			dragPanInteraction.setActive(flag)
        }
		/**
         * 刷新页面
         *
         * @public
         */
        self.refresh = function () {
            if (self._ec) {
                var option = self._ec.getOption();
                var component = self._ec.component || {};
                var legend = component.legend;
                var dataRange = component.dataRange;

                if (legend) {
                    option.legend.selected = legend.getSelectedMap();
                }

                if (dataRange) {
                    option.dataRange.range = dataRange._range;
                }
                self._ec.clear();
                self.setOption(option);
            }
        };
	};

	return OL3Ext;
});