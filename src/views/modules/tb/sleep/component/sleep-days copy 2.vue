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
        // legend: {
        //   data: ["睡眠深度"],
        //   align: "right",
        //   right: "40%"
        // },
        tooltip: {
          trigger: "item",
          formatter: function(params) {
            // console.log(params, "每一项目.......");
            let temname = params.name;
            let res = params.name + "<br>";
            if (params.color == "#2880ca") {
              return (res += "深度睡眠" + params.data.num + "小时");
            }

            if (params.color == "#56a7ec") {
              return (res += "中度睡眠" + params.data.num + "小时");
            }

            if (params.color == "#89c7fb") {
              return (res += "浅睡眠" + params.data.num + "小时");
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
            lineStyle: {
              color: "#02cefa"
            }
          }
        },
        yAxis: {
          type: "value",
          axisLine: {
            lineStyle: {
              color: "#fff"
            }
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
      let _that = this;
      let dom = this.$refs.sleepBox;
      let myChart = this.$echarts.init(dom);
      let rightData = [];
      this.getDataList()
        .then(res => {
          this.loadData(res.data).then(res => {
            let timeData = _that.getDataNum(res); //筛选时间段相同的数据
            //给x轴加入筛选
            _that.gethoursDate(timeData);
          });
          this.dataListLoading = false;
        })
        .then(() => {
          myChart.setOption(this.echartsOption, true);
        });
    },

    //筛选数据changenum变化频率一致的时间段
    getDataNum(res) {
      // console.log("resssssssss", res);
      if (res.arr1.length > 0 && res.arr2.length > 0) {
        let arr1 = this.repeatChangeNum(res.arr1);
        let arr2 = this.repeatChangeNum(res.arr2);
        // let arr = arr1.concat(arr2);
        // arr.push(res.arr2[res.arr2.length - 1]);
        let a = this.repeatNameNum(arr1);
        let b = this.repeatNameNum(arr2);
        let c = a.concat(b);
        c.push(res.arr2[res.arr2.length - 1]);
        return c;
      }

      if (res.arr1.length > 0 && res.arr2.length == 0) {
        let arr1 = this.repeatChangeNum(res.arr1);
        let a = this.repeatNameNum(arr1);
        a.push(res.arr1[res.arr1.length - 1]);
        return a;
      }

      if (res.arr1.length == 0 && res.arr2.length > 0) {
        let arr2 = this.repeatChangeNum(res.arr2);
        let a = this.repeatNameNum(arr2);
        a.push(res.arr2[res.arr2.length - 1]);
        return a;
      }
    },

    //根据数组重复值建立不重复数组方法
    repeatChangeNum(arr) {
      let temp = arr[0];
      let repeatArr = [];
      repeatArr.push(temp);
      for (let i = 1; i < arr.length; i++) {
        if (temp.changeNum == arr[i].changeNum) {
          temp = arr[i];
        } else {
          temp = arr[i];
          repeatArr.push(arr[i]);
        }
      }
      return repeatArr;
    },

    repeatNameNum(arr) {
      let temp = arr[0];
      let repeatArr = [];
      repeatArr.push(temp);
      for (let i = 1; i < arr.length; i++) {
        if (temp.nameValue == arr[i].nameValue) {
          temp = arr[i];
        } else {
          temp = arr[i];
          repeatArr.push(arr[i]);
        }
      }
      return repeatArr;
    },

    //筛选22:00到08:00数据
    loadData(data) {
      let obj = {
        arr1: [],
        arr2: []
      };
      return new Promise(resolve => {
        data.map((item, index) => {
          if (item.changeNum >= 0 && item.changeNum <= 2) {
            item.nameValue = 0;
          }
          if (item.changeNum >= 3 && item.changeNum <= 6) {
            item.nameValue = 1;
          }
          if (item.changeNum >= 7) {
            item.nameValue = 2;
          }
          let date = new Date(item.createTime);
          if (date.getHours() >= 22 && date.getHours() <= 23) {
            obj.arr2.push(item);
            // console.log("筛选22:00数据", obj.arr2);
          } else if (date.getHours() >= 0 && date.getHours() <= 8) {
            obj.arr1.push(item);
            // console.log("筛选08:00数据", obj.arr1);
          }
        });
        resolve(obj);
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

    gethoursDate(arrData) {
      console.log("arrrrdata....", arrData);
      let _that = this;
      for (let i = 0; i < arrData.length; i++) {
        if (i == arrData.length - 1) {
          return;
        } else {
          let time1 = _that.formadate(arrData[i].createTime);
          let time2 = _that.formadate(arrData[i + 1].createTime);
          let temphours = _that.getTimeBetween(
            arrData[i].createTime,
            arrData[i + 1].createTime
          );
          if (time1 !== time2 && temphours < 9) {
            console.log(temphours, "ddd");
            _that.echartsOption.xAxis.data.push(time1 + "~" + time2);
            if (arrData[i].changeNum >= 0 && arrData[i].changeNum <= 2) {
              this.echartsOption.series[0].data.push({
                value: 100,
                num: temphours,
                itemStyle: {
                  normal: {
                    color: "#2880ca"
                  }
                }
              });
            }

            if (arrData[i].changeNum >= 3 && arrData[i].changeNum <= 6) {
              this.echartsOption.series[0].data.push({
                value: 100,
                num: temphours,
                itemStyle: {
                  normal: {
                    color: "#56a7ec"
                  }
                }
              });
            }
            if (arrData[i].changeNum >= 7) {
              this.echartsOption.series[0].data.push({
                value: 100,
                num: temphours,
                itemStyle: {
                  normal: {
                    color: "#89c7fb"
                  }
                }
              });
            }
          }
        }
      }
    },

    formadate(timer) {
      let date = new Date(timer);
      let hours =
        date.getHours() < 10 ? "0" + date.getHours() : date.getHours();
      let minitues =
        date.getMinutes() < 10 ? "0" + date.getMinutes() : date.getMinutes();
      return hours + ":" + minitues;
    },
    //获取时间差
    getTimeBetween(time1, time2) {
      var startDate = Date.parse(time1);
      var endDate = Date.parse(time2);

      var hours = ((endDate - startDate) / (60 * 60 * 1000)).toFixed(2);
      return hours;
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