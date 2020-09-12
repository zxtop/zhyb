<template>
  <div class="mod-demo-echarts" v-loading="dataLoading">
    <el-row :gutter="20">
      <el-col :span="24">
        <el-card>
          <div id="J_chartLineBox" class="chart-box"></div>
        </el-card>
      </el-col>
      <el-col :span="24">
        <el-card>
          <div id="J_chartBarBox" class="chart-box"></div>
        </el-card>
      </el-col>
      <el-col :span="24">
        <el-card>
          <div id="J_chartPieBox" class="chart-box"></div>
        </el-card>
      </el-col>

      <!-- <el-col :span="12">
        <el-card>
          <div id="J_chartScatterBox" class="chart-box"></div>
        </el-card>
      </el-col>-->
    </el-row>
  </div>
</template>

<script>
import echarts from "echarts";
export default {
  data() {
    return {
      chartLine: null,
      chartBar: null,
      chartPie: null,
      chartScatter: null,
      dataLoading: false,
      lineLegend: [],
      lineXAxis: [],
      lineSeries: [],
      barXAxis: [],
      barSerise: [],
      pieSeries: [],
    };
  },
  mounted() {
    this.getDataList();
  },
  activated() {
    // 由于给echart添加了resize事件, 在组件激活时需要重新resize绘画一次, 否则出现空白bug
    if (this.chartLine) {
      this.chartLine.resize();
    }
    if (this.chartBar) {
      this.chartBar.resize();
    }
    if (this.chartPie) {
      this.chartPie.resize();
    }
    if (this.chartScatter) {
      this.chartScatter.resize();
    }
  },
  methods: {
    // 折线图
    initChartLine() {
      var option = {
        title: {
          text: "各医院全年住院统计图",
        },
        tooltip: {
          trigger: "axis",
        },
        legend: {
          data: this.lineLegend,
        },
        grid: {
          left: "3%",
          right: "4%",
          bottom: "3%",
          containLabel: true,
        },
        toolbox: {
          feature: {
            saveAsImage: {},
          },
        },
        xAxis: {
          type: "category",
          boundaryGap: false,
          data: this.lineXAxis,
        },
        yAxis: {
          type: "value",
        },
        series: this.lineSeries,
      };
      this.chartLine = echarts.init(document.getElementById("J_chartLineBox"));
      this.chartLine.setOption(option);
      window.addEventListener("resize", () => {
        this.chartLine.resize();
      });
    },
    // 柱状图
    initChartBar() {
      var option = {
        title: {
          text: "本年度各医院住院天数统计",
        },
        tooltip: {
          trigger: "axis",
        },
        xAxis: {
          type: "category",
          data: this.barXAxis,
        },
        yAxis: {
          type: "value",
        },
        series: [
          {
            data: this.barSerise,
            type: "bar",
            showBackground: true,
            backgroundStyle: {
              color: "rgba(220, 220, 220, 0.8)",
            },
          },
        ],
      };
      this.chartBar = echarts.init(document.getElementById("J_chartBarBox"));
      this.chartBar.setOption(option);
      window.addEventListener("resize", () => {
        this.chartBar.resize();
      });
    },
    // 饼状图
    initChartPie() {
      var option = {
        backgroundColor: "#2c343c",
        title: {
          text: "本年度各院住院人数占比",
          left: "center",
          top: 20,
          textStyle: {
            color: "#ccc",
          },
        },
        tooltip: {
          trigger: "item",
          formatter: "{a} <br/>{b} : {c} ({d}%)",
        },
        visualMap: {
          show: false,
          min: 80,
          max: 600,
          inRange: {
            colorLightness: [0, 1],
          },
        },
        series: [
          {
            name: "住院人数及占比",
            type: "pie",
            radius: "55%",
            center: ["50%", "50%"],
            data: this.pieSeries.sort(function (a, b) {
              return a.value - b.value;
            }),
            roseType: "radius",
            label: {
              normal: {
                textStyle: {
                  color: "rgba(255, 255, 255, 0.3)",
                },
              },
            },
            labelLine: {
              normal: {
                lineStyle: {
                  color: "rgba(255, 255, 255, 0.3)",
                },
                smooth: 0.2,
                length: 10,
                length2: 20,
              },
            },
            itemStyle: {
              normal: {
                color: "#c23531",
                shadowBlur: 200,
                shadowColor: "rgba(0, 0, 0, 0.5)",
              },
            },
            animationType: "scale",
            animationEasing: "elasticOut",
            animationDelay: function (idx) {
              return Math.random() * 200;
            },
          },
        ],
      };
      this.chartPie = echarts.init(document.getElementById("J_chartPieBox"));
      this.chartPie.setOption(option);
      window.addEventListener("resize", () => {
        this.chartPie.resize();
      });
    },
    // 散点图
    initChartScatter() {
      var option = {
        backgroundColor: new echarts.graphic.RadialGradient(0.3, 0.3, 0.8, [
          { offset: 0, color: "#f7f8fa" },
          { offset: 1, color: "#cdd0d5" },
        ]),
        title: {
          text: "1990 与 2015 年各国家人均寿命与 GDP",
        },
        legend: {
          right: 10,
          data: ["1990", "2015"],
        },
        xAxis: {
          splitLine: {
            lineStyle: {
              type: "dashed",
            },
          },
        },
        yAxis: {
          splitLine: {
            lineStyle: {
              type: "dashed",
            },
          },
          scale: true,
        },
        series: [
          {
            name: "1990",
            data: [
              [28604, 77, 17096869, "Australia", 1990],
              [31163, 77.4, 27662440, "Canada", 1990],
              [1516, 68, 1154605773, "China", 1990],
              [13670, 74.7, 10582082, "Cuba", 1990],
              [28599, 75, 4986705, "Finland", 1990],
              [29476, 77.1, 56943299, "France", 1990],
              [31476, 75.4, 78958237, "Germany", 1990],
              [28666, 78.1, 254830, "Iceland", 1990],
              [1777, 57.7, 870601776, "India", 1990],
              [29550, 79.1, 122249285, "Japan", 1990],
              [2076, 67.9, 20194354, "North Korea", 1990],
              [12087, 72, 42972254, "South Korea", 1990],
              [24021, 75.4, 3397534, "New Zealand", 1990],
              [43296, 76.8, 4240375, "Norway", 1990],
              [10088, 70.8, 38195258, "Poland", 1990],
              [19349, 69.6, 147568552, "Russia", 1990],
              [10670, 67.3, 53994605, "Turkey", 1990],
              [26424, 75.7, 57110117, "United Kingdom", 1990],
              [37062, 75.4, 252847810, "United States", 1990],
            ],
            type: "scatter",
            symbolSize: function (data) {
              return Math.sqrt(data[2]) / 5e2;
            },
            label: {
              emphasis: {
                show: true,
                formatter: function (param) {
                  return param.data[3];
                },
                position: "top",
              },
            },
            itemStyle: {
              normal: {
                shadowBlur: 10,
                shadowColor: "rgba(120, 36, 50, 0.5)",
                shadowOffsetY: 5,
                color: new echarts.graphic.RadialGradient(0.4, 0.3, 1, [
                  { offset: 0, color: "rgb(251, 118, 123)" },
                  { offset: 1, color: "rgb(204, 46, 72)" },
                ]),
              },
            },
          },
          {
            name: "2015",
            data: [
              [44056, 81.8, 23968973, "Australia", 2015],
              [43294, 81.7, 35939927, "Canada", 2015],
              [13334, 76.9, 1376048943, "China", 2015],
              [21291, 78.5, 11389562, "Cuba", 2015],
              [38923, 80.8, 5503457, "Finland", 2015],
              [37599, 81.9, 64395345, "France", 2015],
              [44053, 81.1, 80688545, "Germany", 2015],
              [42182, 82.8, 329425, "Iceland", 2015],
              [5903, 66.8, 1311050527, "India", 2015],
              [36162, 83.5, 126573481, "Japan", 2015],
              [1390, 71.4, 25155317, "North Korea", 2015],
              [34644, 80.7, 50293439, "South Korea", 2015],
              [34186, 80.6, 4528526, "New Zealand", 2015],
              [64304, 81.6, 5210967, "Norway", 2015],
              [24787, 77.3, 38611794, "Poland", 2015],
              [23038, 73.13, 143456918, "Russia", 2015],
              [19360, 76.5, 78665830, "Turkey", 2015],
              [38225, 81.4, 64715810, "United Kingdom", 2015],
              [53354, 79.1, 321773631, "United States", 2015],
            ],
            type: "scatter",
            symbolSize: function (data) {
              return Math.sqrt(data[2]) / 5e2;
            },
            label: {
              emphasis: {
                show: true,
                formatter: function (param) {
                  return param.data[3];
                },
                position: "top",
              },
            },
            itemStyle: {
              normal: {
                shadowBlur: 10,
                shadowColor: "rgba(25, 100, 150, 0.5)",
                shadowOffsetY: 5,
                color: new echarts.graphic.RadialGradient(0.4, 0.3, 1, [
                  { offset: 0, color: "rgb(129, 227, 238)" },
                  { offset: 1, color: "rgb(25, 183, 207)" },
                ]),
              },
            },
          },
        ],
      };
      this.chartPie = echarts.init(
        document.getElementById("J_chartScatterBox")
      );
      this.chartPie.setOption(option);
      window.addEventListener("resize", () => {
        this.chartPie.resize();
      });
    },
    getDataList() {
      let _that = this;
      this.dataLoading = true;
      this.$http({
        url: this.$http.adornUrl("/api/get_patient_num"),
        method: "get",
        params: null,
      }).then(({ data }) => {
        console.log(data, "各医院全年住院。。。。");
        if (data && data.code === 0) {
          if (data.series.length > 0) {
            this.lineXAxis = data.xAxis_data;
            for (let i in data.series) {
              let lineData = {
                name: "",
                type: "line",
                data: [],
              };
              for (let j in data.series[i]) {
                lineData.name = j;
                this.lineLegend.push(j);
                let arr = [];
                for (let m in data.xAxis_data) {
                  arr.push(data.series[i][j][data.xAxis_data[m]]);
                }
                lineData.data = arr;
                _that.lineSeries.push(lineData);
                // console.log("dddd", _that.lineSeries);
              }
            }
          }
          this.initChartLine();

          this.$http({
            url: this.$http.adornUrl("/api/get_patient_num_by_hospital"),
            method: "get",
            params: null,
          }).then(({ data }) => {
            // console.log("dddd", data);

            for (let i in data.data) {
              let peiSeries = {
                value: 0,
                name: "",
              };
              this.barXAxis.push(i + "");
              this.barSerise.push(data.data[i]);
              peiSeries.value = data.data[i];
              peiSeries.name = i + "";
              this.pieSeries.push(peiSeries);
            }
            //console.log(this.pieSeries);
            this.initChartBar();
            this.initChartPie();
          });

          this.initChartPie();
          // this.initChartScatter();
        } else {
          this.lineXAxis = [];
        }
        this.dataLoading = false;
      });
    },
  },
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
