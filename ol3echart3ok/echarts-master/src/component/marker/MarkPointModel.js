define(function (require) {
    // Default enable markPoint
    // var globalDefault = require('../../model/globalDefault');
    var modelUtil = require('../../util/model');
    // // Force to load markPoint component
    // globalDefault.markPoint = {};

    var MarkPointModel = require('../../echarts').extendComponentModel({

        type: 'markPoint',

        dependencies: ['series', 'grid', 'polar'],
        /**
         * @overrite
         */
        init: function (option, parentModel, ecModel, extraOpt, createdBySelf) {
            this.mergeDefaultAndTheme(option, ecModel);
            this.mergeOption(option, ecModel, createdBySelf, true);
        },

        mergeOption: function (newOpt, ecModel, createdBySelf, isInit) {
            if (!createdBySelf) {
                ecModel.eachSeries(function (seriesModel) {
                    var markPointOpt = seriesModel.get('markPoint');
                    var mpModel = seriesModel.markPointModel;
                    if (!markPointOpt || !markPointOpt.data) {
                        seriesModel.markPointModel = null;
                        return;
                    }
                    if (!mpModel) {
                        if (isInit) {
                            // Default label emphasis `position` and `show`
                            modelUtil.defaultEmphasis(
                                markPointOpt.label,
                                ['position', 'show', 'textStyle', 'distance', 'formatter']
                            );
                        }
                        var opt = {
                            // Use the same series index and name
                            seriesIndex: seriesModel.seriesIndex,
                            name: seriesModel.name
                        };
                        mpModel = new MarkPointModel(
                            markPointOpt, this, ecModel, opt, true
                        );
                    }
                    else {
                        mpModel.mergeOption(markPointOpt, ecModel, true);
                    }
                    seriesModel.markPointModel = mpModel;
                }, this);
            }
        },

        defaultOption: {
            zlevel: 0,
            z: 5,
            symbol: 'pin',         // ????????????
            symbolSize: 50,  // ????????????
            // symbolRotate: null, // ??????????????????
            tooltip: {
                trigger: 'item'
            },
            label: {
                normal: {
                    show: true,
                    // ???????????????????????????Tooltip.formatter??????????????????
                    // formatter: null,
                    // ?????????'left'|'right'|'top'|'bottom'
                    position: 'inside'
                    // ???????????????????????????????????????TEXTSTYLE
                    // textStyle: null
                },
                emphasis: {
                    show: true
                    // ???????????????????????????Tooltip.formatter??????????????????
                    // formatter: null,
                    // position: 'inside'  // 'left'|'right'|'top'|'bottom'
                    // textStyle: null     // ???????????????????????????????????????TEXTSTYLE
                }
            },
            itemStyle: {
                normal: {
                    // color: ?????????
                    // ??????????????????????????????color
                    // borderColor: ??????,
                    // ???????????????????????????px????????????1
                    borderWidth: 2
                },
                emphasis: {
                    // color: ??????
                }
            }
        }
    });

    return MarkPointModel;
});