<template>
    <div id="J_chartBarBox" class="chart-box"></div>
</template>
<script>
  import echarts from 'echarts'
  export default {
    data () {
      return {
        chartBar: null
      }
    },
    props: {
      row: {
        Type: Object
      }
    },
    mounted () {
      this.initChartBar()
      console.log('进入报表')
      console.log(this.row)
    },
    activated () {
        // 由于给echart添加了resize事件, 在组件激活时需要重新resize绘画一次, 否则出现空白bug
      if (this.chartBar) {
        this.chartBar.resize()
      }
    },
    methods: {
      initChartBar () {
        var xAxisData = []
        var data1 = []
        for (var i = 0; i < 100; i++) {
          xAxisData.push('类目' + i)
          data1.push((Math.sin(i / 5) * (i / 5 - 10) + i / 6) * 5)
        }
        var option = {
          title: {
            text: '柱状图动画延迟'
          },
          legend: {
            data: ['bar'],
            align: 'left'
          },
          toolbox: {
            feature: {
              magicType: {
                type: ['stack', 'tiled']
              },
              dataView: {},
              saveAsImage: {
                pixelRatio: 2
              }
            }
          },
          tooltip: {},
          xAxis: {
            data: xAxisData,
            silent: false,
            splitLine: {
              show: false
            }
          },
          yAxis: {
          },
          series: [{
            name: 'bar',
            type: 'bar',
            data: data1,
            animationDelay: function (idx) {
              return idx * 10
            }
          }],
          animationEasing: 'elasticOut',
          animationDelayUpdate: function (idx) {
            return idx * 5
          }
        }
        this.chartBar = echarts.init(document.getElementById('J_chartBarBox'))
        this.chartBar.setOption(option)
        window.addEventListener('resize', () => {
          this.chartBar.resize()
        })
        console.log('执行完毕')
      }
    }
}
</script>

<style lang="scss">
  .mod-demo-echarts {
    > .el-alert {
      margin-bottom: 10px;
    }
    > .el-row {
      margin-top: -10px;
      margin-bottom: -10px;
      .el-col {
        padding-top: 10px;
        padding-bottom: 10px;
      }
    }
    .chart-box {
      min-height: 400px;
    }
  }
</style>