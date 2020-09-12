<template>
    <div class="mod-demo-echarts">
    <el-row :gutter="20">
      <el-col :span="24">
        <el-card>
          <div id="J_chartBarBox" class="chart-box"></div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>
<script>
  import echarts from 'echarts'
  export default {
    data () {
      return {
        chartBar: null,
        xAxisData: [],
        data1: [],
        option: {}
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
        // var xAxisData = []
        // var data1 = []
        // for (var i = 0; i < 100; i++) {
        //   this.xAxisData.push('类目' + i)
        //   this.data1.push((Math.sin(i / 5) * (i / 5 - 10) + i / 6) * 5)
        // }
        this.getDataList()
        this.option = {
          title: {
            text: '传感器检测图--大于50表示卧床状态'
          },
          legend: {
            data: ['压感值'],
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
            data: this.xAxisData,
            silent: false,
            splitLine: {
              show: false
            }
          },
          yAxis: {
          },
          series: [{
            name: '压感值',
            type: 'bar',
            data: this.data1,
            animationDelay: function (idx) {
              return idx * 10
            }
          }],
          animationEasing: 'elasticOut',
          animationDelayUpdate: function (idx) {
            return idx * 5
          }
        }
        // this.chartBar = echarts.init(document.getElementById('J_chartBarBox'))
        // this.chartBar.setOption(option)
        window.addEventListener('resize', () => {
          this.chartBar.resize()
        })
        console.log('执行完毕')
      },
      // 获取数据列表
      getDataList () {
        let p = {
          'yesorno': -1
          // 'type': 1
        }
        if (this.row.deviceId !== '') {
          p.deviceId = this.row.deviceId
        }
        if (this.row && this.row.inTime !== '') {
          p.startTime = this.row.inTime
          p.endTime = this.row.outTime
        }
        this.dataListLoading = true
        this.$http({
          url: this.$http.adornUrl('/tb/patientuse/diverdata'),
          method: 'get',
          params: this.$http.adornParams(p)
        }).then(({data}) => {
          if (data && data.code === 0) {
            console.log(data)
            let except = 0
            let num = 0
            // if (data.data.length > 100) {
            //   except = Math.ceil(data.data.length / 100)
            // }
            // console.log(except)
            // for (var i = 0; i < data.data.length - except; i++) {
            //   this.xAxisData.push(data.data[i].createTime)
            //   this.data1.push(data.data[i].yg)
            //   i += Number(except)
            //   num += 1
            // }
            if (data.data.length > 100) {
              // except = Math.ceil(data.data.length / 100)
            }
            console.log(except)
            for (var i = 0; i < data.data.length; i++) {
              this.xAxisData.push(data.data[i].createTime)
              this.data1.push(data.data[i].yg)
              // i += Number(except)
              num += 1
            }
            this.chartBar = echarts.init(document.getElementById('J_chartBarBox'))
            this.chartBar.setOption(this.option)
            console.log(num)
          }
          this.dataListLoading = false
        })
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