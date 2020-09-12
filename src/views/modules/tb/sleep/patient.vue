<template>
  <div class="mod-config">
    <el-form :inline="true" :model="dataForm" @keyup.enter.native="getDataList()">
      <el-form-item>
        <component-hospital v-on:change="hospitalIdChange"></component-hospital>
      </el-form-item>

      <el-form-item>
        <el-date-picker
          v-model="dates"
          type="daterange"
          align="right"
          unlink-panels
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          :picker-options="pickerOptions"
          style="width:310px;"
          value-format="yyyy-MM-dd"
        ></el-date-picker>
      </el-form-item>

      <el-form-item>
        <el-select v-model="status">
          <el-option
            v-for="item in statusOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          ></el-option>
        </el-select>
      </el-form-item>

      <el-form-item>
        <el-button @click="getDataList()">查询</el-button>
      </el-form-item>

      <el-form-item>
        <el-button type="primary" @click="getDataOut()">导出</el-button>
      </el-form-item>
    </el-form>

    <el-table
      :data="dataList"
      v-loading="dataListLoading"
      style="width: 100%"
      row-key="id"
      @expand-change="zydescription"
      :default-sort="{prop: 'inTime', order: 'descending'}"
    >
      <el-table-column type="expand">
        <template slot-scope="props">
          <patient-days :row="props.row"></patient-days>
        </template>
      </el-table-column>

      <el-table-column label="病人姓名" prop="patientName"></el-table-column>
      <el-table-column label="医院" prop="hospitalName" sortable></el-table-column>
      <el-table-column label="病床号" prop="bedName"></el-table-column>
      <el-table-column label="入院时间" prop="inTime" :formatter="dateFormat" sortable></el-table-column>
      <el-table-column label="出院时间" prop="outTime" :formatter="dateFormat" sortable></el-table-column>
      <el-table-column label="住院（天）" prop="useNum">
        <!-- <template
          v-if="status=='0'"
          slot-scope="scope"
        >{{getDaysBetween(scope.row.inTime, scope.row.serverTime)}}</template>
        <template
          v-if="status=='1'"
          slot-scope="scope"
        >{{getDaysBetween(scope.row.inTime, scope.row.outTime)}}</template>-->

        <template slot-scope="scope">{{getDaysBetween(scope.row)}}</template>
      </el-table-column>

      <el-table-column label="卧床（天）" width="100">
        <!-- <template slot-scope="scope">{{getYgBydiverId(scope.row.useList)}}</template> -->
        <template slot-scope="scope">{{getYgBydiverId(scope.row.useNum)}}</template>
      </el-table-column>

      <!-- <el-table-column label="异常次数">
        <template slot-scope="scope" v-if="scope.row.useNum>0">
          <el-button type="danger" @click="openWring(scope.row)" round>{{scope.row.useNum}}</el-button>
        </template>
      </el-table-column>-->
      <!-- v-if="scope.row.calculteArr.length>0" -->
      <el-table-column label="异常次数">
        <template slot-scope="scope" v-if="scope.row.calculteArr.length>0">
          <el-button
            type="danger"
            @click="openWring(scope.row)"
            round
          >{{scope.row.calculteArr.length}}</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-pagination
      @size-change="sizeChangeHandle"
      @current-change="currentChangeHandle"
      :current-page="pageIndex"
      :page-sizes="[10, 20, 50, 100]"
      :page-size="pageSize"
      :total="totalPage"
      layout="total, sizes, prev, pager, next, jumper"
    ></el-pagination>

    <el-dialog :title="patinetNameTitle" :visible.sync="dialogTableVisible">
      <el-table :data="wringData" height="200px">
        <!-- <el-table-column property="patientName" label="姓名" width="80"></el-table-column>
        <el-table-column property="bedName" label="病床" width="80"></el-table-column>-->
        <el-table-column property="sameYg" label="压感" width="80"></el-table-column>
        <el-table-column label="时长" width="100">
          <template slot-scope="scope">{{getHourLong(scope.row.sameNum)}}</template>
        </el-table-column>
        <el-table-column label="开始时间">
          <template slot-scope="scope">{{getStartTime(scope.row)}}</template>
        </el-table-column>
        <el-table-column property="createTime" label="结束时间"></el-table-column>
      </el-table>
    </el-dialog>
  </div>
</template>

<style scoped>
.demo-table-expand {
  font-size: 0;
}
.demo-table-expand label {
  width: 90px;
  color: #99a9bf;
}
.demo-table-expand .el-form-item {
  margin-right: 0;
  margin-bottom: 0;
  width: 50%;
}
.mod-config >>> .el-date-editor .el-range-input {
  width: 31% !important;
}
.mod-config >>> .el-date-editor .el-range-separator {
  width: 9% !important;
}
</style>

<script>
import { formatDate } from "@/utils/commonUtil.js";
import ComponentHospital from "../component-hospital";
import ComponentEchart from "../component-echart";
import PatientDays from "./component/patient-days";
export default {
  data() {
    return {
      dataForm: {
        key: ""
      },
      hospitalId: 0,
      dates: "",
      dataList: [],
      pageIndex: 1,
      pageSize: 10,
      totalPage: 0,
      dataListLoading: false,
      dataListSelections: [],
      addOrUpdateVisible: false,
      pickerOptions: {
        shortcuts: [
          {
            text: "最近一周",
            onClick(picker) {
              const end = new Date();
              const start = new Date();
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 7);
              picker.$emit("pick", [start, end]);
            }
          },
          {
            text: "最近一个月",
            onClick(picker) {
              const end = new Date();
              const start = new Date();
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 30);
              picker.$emit("pick", [start, end]);
            }
          },
          {
            text: "最近三个月",
            onClick(picker) {
              const end = new Date();
              const start = new Date();
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 90);
              picker.$emit("pick", [start, end]);
            }
          }
        ]
      },
      dialogTableVisible: false, //异常数据弹出框开关
      wringData: [], // 异常数据列表
      patinetNameTitle: "", // 住院异常记录弹出框标题
      statusOptions: [
        {
          value: "0",
          label: "未出院"
        },
        {
          value: "1",
          label: "已出院"
        },
        {
          value: "100",
          label: "全部"
        }
      ],
      status: "1"
    };
  },
  components: {
    ComponentHospital,
    ComponentEchart,
    PatientDays
  },
  created() {
    this.getDataList();
  },
  methods: {
    hospitalIdChange(id) {
      this.hospitalId = id;
    },
    // 获取数据列表
    getDataList() {
      this.dataList = [];
      let p = {
        page: this.pageIndex,
        limit: this.pageSize,
        usedata: "y", //是否获取病床压感数据的标识字段
        status: this.status
      };
      if (this.hospitalId) {
        p.hospitalId = this.hospitalId;
      }
      if (this.dates && this.dates !== "" && this.dates.length > 1) {
        p.startDate = this.dates[0];
        p.endDate = this.dates[1];
      }
      this.dataListLoading = true;
      this.$http({
        url: this.$http.adornUrl("/tb/patient/list_detail"),
        method: "get",
        params: this.$http.adornParams(p)
      }).then(({ data }) => {
        if (data && data.code === 0) {
          data.page.list.map((item, index) => {
            this.getItem(item.id, item);
          });
          // this.dataList = data.page.list;
          this.totalPage = data.page.totalCount;
          console.log("this.datalist....", this.dataList);
        } else {
          this.dataList = [];
          this.totalPage = 0;
        }
        this.dataListLoading = false;
      });
    },

    getItem(id, item) {
      this.$http({
        url: this.$http.adornUrl("/tb/patient/patient_unusual_data/" + id),
        method: "get"
      }).then(({ data }) => {
        item.calculteArr = data.data;
        this.dataList.push(item);
        // console.log("请求。。。ddddd", data, item);
      });
    },

    //导出数据列表
    getDataOut() {
      const queryParams = {};

      queryParams.status = this.status;
      if (this.hospitalId) {
        queryParams.hospitalId = this.hospitalId;
      }
      if (this.dates && this.dates !== "" && this.dates.length > 1) {
        queryParams.startDate = this.dates[0];
        queryParams.endDate = this.dates[1];
      }
      console.log("queryparams......", queryParams);

      this.$http({
        url: this.$http.adornUrl("/api/excel_download"),
        method: "get",
        params: this.$http.adornParams(queryParams)
      }).then(response => {
        // console.log("导出.....", response);
        window.location.href = response.request.responseURL;
      });
    },

    // 每页数
    sizeChangeHandle(val) {
      this.pageSize = val;
      this.pageIndex = 1;
      this.getDataList();
    },
    // 当前页
    currentChangeHandle(val) {
      this.pageIndex = val;
      this.getDataList();
    },
    // 获取两个日期相差天数
    getDaysBetween(row) {
      var startDate = Date.parse(row.inTime);
      var endDate;
      if (row.outTime !== null) {
        endDate = Date.parse(row.outTime);
      } else {
        endDate = Date.parse(row.serverTime);
      }
      // console.log(endDate - startDate);
      var days = ((endDate - startDate) / (1 * 24 * 60 * 60 * 1000)).toFixed(2);
      // console.log(days);
      return days;
    },
    getCurrentDate() {
      var now = new Date();
      var year = now.getFullYear(); // 得到年份
      var month = now.getMonth(); // 得到月份
      var date = now.getDate(); // 得到日期
      month = month + 1;
      if (month < 10) month = "0" + month;
      if (date < 10) date = "0" + date;
      var time = "";
      time = year + "-" + month + "-" + date + " " + "00:00:00";
      return time;
    },
    // 获取有人状态的时间和
    // getYgBydiverId(useList) {
    //   var allSecoud = 0;
    //   if (useList != null && useList.length > 0) {
    //     for (let i = 0; i < useList.length; i++) {
    //       allSecoud += useList[i].sameNum;
    //     }
    //   }
    //   return (allSecoud / 60 / 60 / 24).toFixed(2);
    // },

    getYgBydiverId(useNum) {
      var allSecoud = 0;
      if (useNum != null) {
        allSecoud = useNum;
      }
      return (allSecoud / 60 / 60 / 24).toFixed(2);
      // let temp = 60000;
      // return (temp / 60 / 60 / 24).toFixed(2);
    },

    dateFormat(row, column) {
      var date = row[column.property];
      if (date === undefined || date === null) {
        return "截至今日";
      }
      return formatDate(new Date(date), "yyyy-MM-dd");
    },
    async zydescription() {
      // alert('aaa')
    },

    // 打开异常数据接口 查询病人住院的异常数据
    openWring(row) {
      this.dialogTableVisible = true;
      this.patinetNameTitle = row.patientName + " 卧床异常记录";
      let p = {
        deviceId: row.deviceId,
        startTime: row.inTime,
        endTime: row.outTime
      };
      // console.log("获取病人异常数据。。。", row);
      this.$http({
        url: this.$http.adornUrl("/tb/patient/patient_unusual_data/" + row.id),
        method: "get"
      }).then(({ data }) => {
        if (data && data.code === 0) {
          console.log(data, "异常数据。。。");
          this.wringData = data.data;
        } else {
          this.wringData = [];
        }
        this.dataListLoading = false;
      });
    },
    // 异常时间 秒转小时
    getHourLong(num) {
      return (num / 60 / 60).toFixed(2) + "(小时)";
    },
    // 推算开始时间
    getStartTime(row) {
      let date1 = new Date(row.createTime);
      let s1 = date1.getTime() - row.sameNum * 1000;
      let fillTime = this.getTime(s1);
      return fillTime;
    },
    getTime(nS) {
      var date = new Date(parseInt(nS));
      var year = date.getFullYear();
      var mon = date.getMonth() + 1;
      if (mon < 10) {
        mon = "0" + mon;
      }
      var day = date.getDate();
      if (day < 10) {
        day = "0" + day;
      }
      var hours = date.getHours();
      if (hours < 10) {
        hours = "0" + hours;
      }
      var minu = date.getMinutes();
      if (minu < 10) {
        minu = "0" + minu;
      }
      var sec = date.getSeconds();
      if (sec < 10) {
        sec = "0" + sec;
      }

      return (
        year + "-" + mon + "-" + day + " " + hours + ":" + minu + ":" + sec
      );
    }
  }
};
</script>
<style>
.el-table .warning-row {
  background: #f7ffd6;
}

.el-table .success-row {
  background: #f0f9eb;
}
</style>