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
import echarts from "echarts";
export default {
  data() {
    return {
      chartBar: null,
      xAxisData: [],
      data1: [],
      option: {}
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
    console.log("图标初始化日期" + this.date);
    this.initChartBar();
  },
  activated() {
    // 由于给echart添加了resize事件, 在组件激活时需要重新resize绘画一次, 否则出现空白bug
    if (this.chartBar) {
      this.chartBar.resize();
    }
  },
  watch() {},
  methods: {
    initChartBar() {
      this.getDataList();
      this.xAxisData = [];
      this.data1 = [];
      this.option = {
        title: {
          // text: "传感器检测图--大于50表示卧床状态",
          text: "传感器检测图--每10分钟内有人的卧床时长（10分=600秒）"
        },
        legend: {
          data: ["卧床时长"],
          align: "left"
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
        tooltip: {},
        xAxis: {
          data: this.xAxisData,
          silent: false,
          splitLine: {
            show: false
          }
        },
        yAxis: {},
        series: [
          {
            name: "卧床时长",
            type: "bar",
            data: this.data1,
            animationDelay: function(idx) {
              return idx * 10;
            }
          }
        ],
        animationEasing: "elasticOut",
        animationDelayUpdate: function(idx) {
          return idx * 5;
        }
      };
      // this.chartBar = echarts.init(document.getElementById('J_chartBarBox'))
      // this.chartBar.setOption(option)
      window.addEventListener("resize", () => {
        if (this.chartBar) {
          this.chartBar.resize();
        }
      });

      console.log("执行完毕");
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
      console.log(p, "tttttttt");

      this.$http({
        url: this.$http.adornUrl("/tb/patient/patient_use_list"),
        method: "get",
        params: this.$http.adornParams(p)
      }).then(({ data }) => {
        console.log(data, "表格数据。。。。。");
        if (data && data.code === 0) {
          for (var i = 0; i < data.data.length; i++) {
            this.xAxisData.push(this.formadate(data.data[i].createTime));
            this.data1.push(data.data[i].beNum);
          }
          this.chartBar = echarts.init(
            document.getElementById("J_chartBarBox")
          );
          this.chartBar.setOption(this.option);
        }
        this.dataListLoading = false;
      });
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
  watch: {
    date(newvalue, oldvalue) {
      console.log("日期变化了");
      this.initChartBar();
    }
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