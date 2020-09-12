<template>
  <div class="mod-demo-echarts">
    <el-row :gutter="20">
      <el-col :span="24">
        <el-card>
          <div id="h_chartBarBox" class="chart-box" ref="sleepBox">
            <ul class="xAxis_title">
              <li>
                <b style="background: #2880ca;"></b>
                <span>深度睡眠</span>
              </li>
              <li>
                <b style="background: #56a7ec;"></b>
                <span>中度睡眠</span>
              </li>
              <li>
                <b style="background: #89c7fb;"></b>
                <span>浅睡眠</span>
              </li>
            </ul>

            <ul class="xAxis_dist">
              <!-- <li
                v-for="(item,index) in optionData"
                :key="index"
                :style="{width:item.percent}"
                :class="{'isvisible':index == hoverIndex}"
              >{{item.value}}</li>-->
              <!-- <span style="font-size:12px;width:50px;display:block">(小时)</span> -->
            </ul>

            <ul class="xAxis">
              <li
                v-for="(item,index) in optionData"
                :key="index"
                :style="{width:item.percent,backgroundColor:item.color,height:'200px'}"
                :class="{'hoverBg':index == hoverIndex}"
                @mousemove="hoverEvent($event,index,item)"
                @mouseout="hoverOutEvent($event,index,item)"
              ></li>

              <div class="diagBox" ref="diagBox">
                <span>{{timer}}</span>
                <br />
                <span>{{colorText+`:`}}</span>
                <span>{{dist+`小时`}}</span>
              </div>
            </ul>

            <ul class="xAxis" v-show="optionData.length == 0">
              <li>
                <p style="color:red;text-align:center">该时间段无数据！</p>
              </li>
            </ul>

            <ul class="xAxis_time">
              <!-- <li
                v-for="(item,index) in optionData"
                :key="index"
                :style="{width:item.percent}"
                :class="{'isvisible':index == hoverIndex}"
              >{{item.timer}}</li>-->
              <!-- <span style="font-size:12px;width:50px;display:block">(时刻)</span> -->
            </ul>

            <ul>
              <p style="text-align: center">
                统计病人
                <b>晚22:00到早8:00</b> 的睡眠监测,颜色越深睡眠质量较好
              </p>
            </ul>
          </div>
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
      optionData: [],
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
      },
      hoverIndex: -1,
      timer: "",
      dist: "",
      colorText: "",
      dom: null
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
  },
  methods: {
    hoverEvent(e, index, item) {
      this.hoverIndex = index;
      this.timer = item.timer;
      this.dist = item.value;
      this.colorText = item.colorText;
      // console.log(e, "ddddd");
      this.dom.style.left = e.layerX - 45 + "px";
      this.dom.style.top = e.layerY + 20 + "px";
    },

    hoverOutEvent(e, index, item) {
      this.hoverIndex = -1;
      this.dom.style.left = -500 + "px";
    },
    initChartBar() {
      let _that = this;
      let dom = this.$refs.sleepBox;
      this.getDataList().then(res => {
        console.log(res, "数据..........");
        this.loadData(res.data).then(res => {
          // console.log(res);
          let timeData = _that.getDataNum(res); //筛选时间段相同的数据
          // console.log("timmmm", timeData);
          _that.gethoursDate(timeData); //给时间段加入数值
          this.addPercent(); //计算时间数据比例占
          // console.log(this.optionData, "筛选后的数据........");
        });
        this.dataListLoading = false;
      });
    },

    addPercent() {
      let len = this.optionData.length;
      let arr = this.optionData;
      if (len > 0) {
        let total = 0;
        this.optionData.map((item, index) => {
          total += parseFloat(item.value);
          item.percent = null;
          item.key = index;
          if (item.color == "#2880ca") {
            item.colorText = "深度睡眠";
          }
          if (item.color == "#56a7ec") {
            item.colorText = "中度睡眠";
          }
          if (item.color == "#89c7fb") {
            item.colorText = "浅睡眠";
          }
        });
        arr.map((item, index) => {
          item.percent =
            (parseFloat(item.value) / total).toFixed(2) * 100 + "%";
        });
      } else {
        console.log("没有监测到该时间段数据");
      }
    },

    //筛选数据changenum变化频率一致的时间段
    getDataNum(res) {
      // console.log("resssssssss", res);
      if (res.arr1.length == 0 && res.arr2.length == 0) {
        return [];
      }
      if (res.arr1.length > 0 && res.arr2.length > 0) {
        let arr1 = this.repeatChangeNum(res.arr1);
        let arr2 = this.repeatChangeNum(res.arr2);
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

          // if (date.getHours() >= 10 && date.getHours() <= 18) {
          //   obj.arr1.push(item);
          //   // console.log("筛选22:00数据", obj.arr2);
          // }

          if (date.getHours() >= 22 && date.getHours() <= 23) {
            obj.arr2.push(item);
            // console.log("筛选22:00数据", obj.arr2);
          } else if (date.getHours() >= 0 && date.getHours() < 8) {
            obj.arr1.push(item);
          } else if (date.getHours == 8 && date.getMinutes() == 0) {
            obj.arr.push(item);
          }
          // console.log("筛选08:00数据", obj.arr1);
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
      let _that = this;
      if (arrData.length > 0) {
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
              if (arrData[i].changeNum >= 0 && arrData[i].changeNum <= 2) {
                this.optionData.push({
                  timer: time1 + "~" + time2,
                  value: temphours,
                  color: "#2880ca",
                  createTime: time1
                });
              }

              if (arrData[i].changeNum >= 3 && arrData[i].changeNum <= 6) {
                this.optionData.push({
                  timer: time1 + "~" + time2,
                  value: temphours,
                  color: "#56a7ec",
                  createTime: time1
                });
              }
              if (arrData[i].changeNum >= 7) {
                this.optionData.push({
                  timer: time1 + "~" + time2,
                  value: temphours,
                  color: "#89c7fb",
                  createTime: time1
                });
              }
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
  mounted() {
    // this.initChartBar();
    this.dom = this.$refs.diagBox;
  }
};
</script>

<style lang="scss">
.mod-demo-echarts {
  position: relative;
}
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
    padding-left: 20px;
    padding-right: 20px;
    min-height: 400px;
  }
  .chart-box ul {
    padding: 0;
    width: 100%;
    display: flex;
    flex-wrap: nowrap;
  }
  .chart-box ul li {
    list-style: none;
    display: block;
    text-align: center;
  }
  .chart-box ul.xAxis {
    position: relative;
  }
  .chart-box ul.xAxis li.hoverBg {
    background-color: rgb(3, 71, 134) !important;
  }
  .chart-box ul.xAxis_time li {
    text-align: center;
    opacity: 0;
  }
  .chart-box ul.xAxis_time li:first-child {
    opacity: 1;
  }
  .chart-box ul.xAxis_dist li {
    opacity: 0;
  }
  .chart-box ul.xAxis_dist li:first-child {
    opacity: 1;
  }
  .isvisible {
    opacity: 1 !important;
  }

  .xAxis_title b {
    width: 32px;
    height: 16px;
    display: block;
    border-radius: 3px;
    float: left;
  }
  .xAxis_title span {
    height: 16px;
    width: 90px;
    float: left;
    display: block;
    line-height: 16px;
    text-align: left;
    margin-left: 5px;
  }
  .diagBox {
    width: 100px;
    background: rgba(0, 0, 0, 0.5);
    color: #fff;
    border-radius: 8px;
    padding: 10px;
    position: absolute;
    left: -500px;
    top: 0px;
  }
}
</style>