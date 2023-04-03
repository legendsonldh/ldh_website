import * as echarts from 'echarts';

var chartDom = document.getElementById('main');
var myChart = echarts.init(chartDom);
var option;

// prettier-ignore
let dataAxis = ["上海","苏州","西安"];
// prettier-ignore
let data = [10,5,1];
let yMax = 20;
let dataShadow = [];
for (let i = 0; i < data.length; i++) {
dataShadow.push(yMax);
}
option = {
title: {
    text: '旅行美食地图',
    subtext: '目前已发现的个数'
},
tooltip: {
    trigger: "axis",
    axisPointer: {
      type: "shadow"
    }
  },
yAxis: {
    data: [{
        value: "上海",
        textStyle: {
            color: "#0f172a",
            FontFamily:"SmileySans-Oblique",
        }
    },
    {
        value: "苏州",
        textStyle: {
            color: "#0f172a"
        }
    },
    {
        value: "西安",
        textStyle: {
            color: "#0f172a"
        }
    }],
    axisLabel: {
        inside: true,
        color: '#fff'
    },
    axisTick: {
        show: false
    },
    axisLine: {
        show: false
    },
    z: 10,

},
xAxis: {
    axisLine: {
        show: false
    },
    axisTick: {
        show: false
    },
    axisLabel: {
        color: '#999'
    },
    show: false
},
dataZoom: [
    {
    type: 'inside'
    }
],
series: [
    {
        name: "已发现的数目",
        type: 'bar',
        barWidth: "60%",
        showBackground: false,
        itemStyle: {
            color: '#38bdf8'
        },

        data: data
    }
]
};
// Enable data zoom when user click bar.
const zoomSize = 6;
myChart.on('click', function (params) {
console.log(dataAxis[Math.max(params.dataIndex - zoomSize / 2, 0)]);
myChart.dispatchAction({
    type: 'dataZoom',
    startValue: dataAxis[Math.max(params.dataIndex - zoomSize / 2, 0)],
    endValue:
    dataAxis[Math.min(params.dataIndex + zoomSize / 2, data.length - 1)]
});
});

option && myChart.setOption(option);
