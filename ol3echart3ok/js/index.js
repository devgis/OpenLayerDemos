var optionsC = function (list) {
   var option = {
        
        tooltip: {
            trigger: 'axis'
        },
       
        calculable: true,
        xAxis: [
            {
                type: 'category',
                boundaryGap: false,
                show:false,
                data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
            }
        ],
        yAxis: [
            {
                type: 'value',
                show:false,
                axisLabel: {
                    formatter: '{value} °C'
                }
            }
        ],
        series: [
            {
                name: '最高气温',
                type: 'line',
                data: [11, 11, 15, 13, 12, 13, 10],
                
             
            }
        ]
   };
   return option;
}

//饼状图
var optionsL = function (list) {
  var   option = {
        tooltip: {
            trigger: 'item',
            formatter: "{b} <br/> {c}"
        },
        legend: {
           
            x: 'left',
            data: ['直接', '邮件', '联盟', '视频', '搜索']
        },
        calculable: false,
        series: [
            {
                name: '访问来源',
                type: 'pie',
                radius: '55%',
                center: ['50%', '60%'],
                data: [
                    { value: 335, name: '直接' },
                    { value: 310, name: '邮件' },
                    { value: 234, name: '联盟' },
                    { value: 135, name: '视频' },
                    { value: 1548, name: '搜索' }
                ]
            }
        ]
  };

  return option;
}