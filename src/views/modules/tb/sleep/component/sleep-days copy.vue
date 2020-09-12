<template>
  <div class="mod-demo-echarts">
    <el-row :gutter="20">
      <el-col :span="24">
        <el-card>
          <div id="h_chartBarBox" class="chart-box" ref="sleepBox"></div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import echarts from "echarts";
export default {
  data() {
    return {
      chartBar: null,
      xAxisData: [],
      data1: [],
      option: {},
      echartsOption: {
        color: ["#2880ca"],
        // backgroundColor: "rgba(40,128,202,0.5)",
        title: {
          text: "睡眠检测图---(颜色浅=睡眠较浅---颜色深=睡眠深)"
        },
        legend: {
          data: ["睡眠深度"],
          align: "right",
          right: "40%"
        },
        tooltip: {
          trigger: "item",
          formatter: function(params) {
            // console.log(params, "每一项目.......");
            let temname = params.name;
            let res = params.name + "<br>";
            if (params.color == "#2880ca") {
              return (res += "深度睡眠" + parseInt(params.value) + "分钟");
            }

            if (params.color == "#56a7ec") {
              return (res += "中度睡眠" + parseInt(params.value) + "分钟");
            }

            if (params.color == "#89c7fb") {
              return (res += "浅睡眠" + parseInt(params.value) + "分钟");
            }
          }
        },
        toolbox: {
          feature: {
            magicType: {
              type: ["stack", "tiled"]
            },
            dataView: {},
            saveAsImage: {
              pixelRatio: 2
            }
          }
        },
        xAxis: {
          type: "category",
          data: [],
          axisLine: {
            // lineStyle: {
            //   color: "#fff"
            // }
          }
        },
        yAxis: {
          type: "value",
          axisLine: {
            // lineStyle: {
            //   color: "#fff"
            // }
          },
          splitLine: false
        },
        series: [
          {
            data: [],
            type: "bar",
            name: "睡眠深度"
          }
        ]
      }
    };
  },
  props: {
    patientId: {
      Type: Number
    },
    date: {
      Type: Date
    }
  },
  created() {
    // console.log("图标初始化日期" + this.date);
    // this.initChartBar();
  },
  activated() {
    // 由于给echart添加了resize事件, 在组件激活时需要重新resize绘画一次, 否则出现空白bug
  },
  watch() {},
  methods: {
    initChartBar() {
      let dom = this.$refs.sleepBox;
      let myChart = this.$echarts.init(dom);
      this.getDataList()
        .then(res => {
          // console.log("返回数据。。。。。", res);
          res.data.map((item, index) => {
            this.gethoursDate(item);
            this.getChangNum(item);
          });
          this.dataListLoading = false;
        })
        .then(() => {
          myChart.setOption(this.echartsOption, true);
          console.log(this.echartsOption.xAxis, "dddddd");
        });
    },

    // 获取数据列表
    getDataList() {
      let p = {};
      if (this.patientId !== "") {
        p.patientId = this.patientId;
      }
      if (this.date && this.date !== "") {
        p.dayTime = this.date;
      }
      this.dataListLoading = true;
      return this.$http({
        url: this.$http.adornUrl("/tb/patient/patient_use_list"),
        method: "get",
        params: this.$http.adornParams(p)
      }).then(({ data }) => {
        return data;
      });
    },

    getChangNum(item) {
      let date = new Date(item.createTime);
      if (
        (date.getHours() >= 22 && date.getHours() <= 23) ||
        (date.getHours() >= 0 && date.getHours() <= 8)
      ) {
        if (item.changeNum >= 0 && item.changeNum <= 2) {
          this.echartsOption.series[0].data.push({
            value: item.beNum / 60,
            itemStyle: {
              normal: {
                color: "#2880ca"
              }
            }
          });
        }
        if (item.changeNum >= 3 && item.changeNum <= 6) {
          this.echartsOption.series[0].data.push({
            value: item.beNum / 60,
            itemStyle: {
              normal: {
                color: "#56a7ec"
              }
            }
          });
        }
        if (item.changeNum >= 6 && item.changeNum <= 10) {
          this.echartsOption.series[0].data.push({
            value: item.beNum / 60,
            itemStyle: {
              normal: {
                color: "#89c7fb"
              }
            }
          });
        }
      }
    },

    gethoursDate(item) {
      let date = new Date(item.createTime);
      if (
        (date.getHours() >= 22 && date.getHours() <= 23) ||
        (date.getHours() >= 0 && date.getHours() <= 8)
      ) {
        let hours =
          date.getHours() < 10 ? "0" + date.getHours() : date.getHours();
        let minitues =
          date.getMinutes() < 10 ? "0" + date.getMinutes() : date.getMinutes();

        this.echartsOption.xAxis.data.push(hours + ":" + minitues);
      }
    },

    formadate(timer) {
      let date = new Date(timer);
      let hours =
        date.getHours() < 10 ? "0" + date.getHours() : date.getHours();
      let minitues =
        date.getMinutes() < 10 ? "0" + date.getMinutes() : date.getMinutes();
      return hours + ":" + minitues;
    }
  },
  watch: {},
  mounted() {
    this.initChartBar();
  }
};
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