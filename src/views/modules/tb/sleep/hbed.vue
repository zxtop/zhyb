<template>
  <div class="mod-config">
    <el-form :inline="true" :model="dataForm" @keyup.enter.native="getDataList()">
      <el-form-item label="选择单位">
        <component-hospital v-model="hospitalId" v-on:change="hospitalIdChange"></component-hospital>
      </el-form-item>

      <el-form-item label="设备状态">
        <el-select v-model="deviceStatus">
          <el-option
            v-for="item in deviceOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          ></el-option>
        </el-select>
      </el-form-item>

      <el-form-item label="病床状态">
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
        <el-button @click="getDataRush()">查询</el-button>
      </el-form-item>
      <el-form-item>
        <el-switch v-model="refresh" active-text="开启自动刷新" @change="switchChange"></el-switch>
      </el-form-item>
    </el-form>

    <el-table
      :data="dataList"
      border
      v-loading="dataListLoading"
      style="width: 100%;"
      :default-sort="{prop: 'id', order: 'descending'}"
    >
      <el-table-column prop="id" header-align="center" align="center" label="ID" width="50"></el-table-column>
      <el-table-column prop="hospitalName" header-align="center" align="center" label="医院"></el-table-column>
      <el-table-column prop="itemId" header-align="center" align="center" label="节点编号"></el-table-column>
      <el-table-column prop="bedName" header-align="center" align="center" label="病床名称"></el-table-column>
      <el-table-column prop="lastOnline" header-align="center" align="center" label="最后在线时间"></el-table-column>

      <el-table-column header-align="center" align="center" label="状态">
        <template slot-scope="scope">
          <!-- <el-tag
            :type="scope.row.outTime <= interval && scope.row.outTime !== '' && scope.row.outTime !== null  ? 'success' : 'danger'"
            disable-transitions
          >{{scope.row.outTime|formatter1}}</el-tag>-->

          <el-tag :type="scope.row.status" disable-transitions>{{scope.row.statusText}}</el-tag>
        </template>
      </el-table-column>

      <!-- <el-table-column prop="status" header-align="center" align="center" label="是否有人">
        <template slot-scope="scope">
          <el-button
            v-if="scope.row.outTime <= interval && scope.row.outTime !== '' && scope.row.outTime !== null"
            :type="scope.row.patientName != '' ? 'success' : 'warning'"
            @click="openPatient(scope.row)"
          >{{scope.row.patientName}}</el-button>
        </template>
      </el-table-column>-->

      <el-table-column header-align="center" align="center" label="是否有人">
        <template slot-scope="scope">
          <el-button
            :type="scope.row.patientName != '' ? 'success' : 'warning'"
            @click="openPatient(scope.row)"
          >{{scope.row.patientName}}</el-button>
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

    <!--查看住院病人的 住院详情-->
    <el-dialog :title="patinetNameTitle" :visible.sync="dialogTableVisible">
      <el-table :data="patientList" v-loading="patientListLoading" height="300px">
        <el-table-column label="日期" width="180">
          <template slot-scope="scope">
            <i class="el-icon-date"></i>
            <span style="margin-left: 10px">{{ scope.row.createTime|dateFormatter}}</span>
          </template>
        </el-table-column>

        <el-table-column prop="beNum" label="卧床时间" width="180">
          <template slot-scope="scope">
            <i class="el-icon-time"></i>
            <span style="margin-left: 10px">{{ scope.row.beNum|hourFormatter}}</span>
          </template>
        </el-table-column>

        <!-- <el-table-column label="卧床率" width="180">
          <template slot-scope="scope">
            <span>{{ scope.row.sameNum | percentageFormatter}}</span>
          </template>
        </el-table-column>-->

        <el-table-column label="卧床图表">
          <template slot-scope="scope">
            <el-button
              size="mini"
              type="danger"
              @click="handleEchart(scope.row.createTime,scope.row.patientId)"
            >查看</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!--嵌套的 dialog  展示图表-->
      <el-dialog title="图表" width="1200px" :visible.sync="innerVisible" append-to-body>
        <component-echart :patientId="patientId" :date="dateTime" v-if="innerVisible"></component-echart>
        <span slot="footer" class="dialog-footer">
          <el-button @click="innerVisible = false">取 消</el-button>
          <el-button type="primary" @click="innerVisible = false">确 定</el-button>
        </span>
      </el-dialog>
    </el-dialog>
  </div>
</template>

<script>
import { formatDate } from "@/utils/commonUtil.js";
import ComponentHospital from "../component-hospital";
import ComponentEchart from "./component/echart-days";
let that; //  用于过滤器替换 this
export default {
  data() {
    return {
      dataForm: {
        key: ""
      },
      dataList: [],
      pageIndex: 1,
      pageSize: 10,
      totalPage: 0,
      dataListLoading: false,
      dataListSelections: [],
      addOrUpdateVisible: false,
      hospitalId: 0, // 初始医院ID
      interval: 10, // 初始话的自动上传
      refresh: false,
      timer: null, //定时器开关
      patientList: [], // 查看病人住院详情表
      patinetNameTitle: "",
      dialogTableVisible: false,
      patientListLoading: false,
      statusOptions: [
        {
          value: "0",
          label: "未登记病人"
        },
        {
          value: "1",
          label: "已登记病人"
        },
        {
          value: "",
          label: "全部"
        }
      ],
      status: "1",
      innerVisible: false,
      echartDeviceId: "", //图表用到的 设备ID
      dateTime: "", // 图标用到的时间
      deviceOptions: [
        {
          value: "0",
          label: "离线"
        },
        {
          value: "1",
          label: "在线"
        },
        {
          value: "",
          label: "全部"
        }
      ],
      deviceStatus: "",
      isOnline: false, //是否在线
      interval2: 10,
      patientId: ""
    };
  },
  components: {
    ComponentHospital,
    ComponentEchart
  },
  beforeCreate: function() {
    that = this; //  用于过滤器替换 this
  },
  created() {
    // 开启定时器
    this.getInterval(); //  关闭定时
    // this.getDataList(); // 只查询一次
  },
  activated() {
    this.getDataList();
  },
  beforeDestroy() {
    if (this.timer) {
      // 如果定时器还在运行 或者直接关闭，不用判断
      clearInterval(this.timer); // 关闭
    }
  },
  methods: {
    hospitalIdChange(id) {
      this.hospitalId = id;
    },

    // 获取数据列表
    getDataList() {
      this.dataList = [];
      // console.log("病床监管", this.hospitalId, this.status, this.deviceStatus);
      this.dataListLoading = true;
      this.$http({
        url: this.$http.adornUrl("/tb/deviceitem/list_by_hospital"),
        method: "get",
        params: this.$http.adornParams({
          page: this.pageIndex,
          limit: this.pageSize,
          hospitalId: this.hospitalId,
          status: this.status,
          deviceStatus: this.deviceStatus
        })
      }).then(({ data }) => {
        if (data && data.code === 0) {
          // 返回设备列表信息后异步查询设备上面的当前住院病人
          this.totalPage = data.page.totalCount;
          data.page.list.map((item, index) => {
            this.getPatientName(item);
          });
        } else {
          this.dataList = [];
          this.totalPage = 0;
        }
        this.dataListLoading = false;
      });
    },

    //查询
    getDataRush() {
      this.dataList = [];
      this.dataListLoading = true;
      this.$http({
        url: this.$http.adornUrl("/tb/deviceitem/list_by_hospital"),
        method: "get",
        params: this.$http.adornParams({
          page: 1,
          limit: this.pageSize,
          hospitalId: this.hospitalId,
          status: this.status,
          deviceStatus: this.deviceStatus
        })
      }).then(({ data }) => {
        console.log(data, "查询。。。。");
        this.pageIndex = 1;
        // console.log(data, "dddd");
        if (data && data.code === 0) {
          // 返回设备列表信息后异步查询设备上面的当前住院病人
          this.totalPage = data.page.totalCount;
          data.page.list.map((item, index) => {
            this.getPatientName(item);
          });
        } else {
          this.dataList = [];
          this.totalPage = 0;
        }
        this.dataListLoading = false;
      });
    },

    // 异步获取住院病人的姓名
    getPatientName(item) {
      let p = {
        deviceItemId: item.itemId
      };
      this.$http({
        url: this.$http.adornUrl("/tb/patient/patient_now"),
        method: "get",
        params: this.$http.adornParams(p)
      }).then(({ data }) => {
        if (data && data.code === 0) {
          console.log("是否有病人", data, "每一项。。。", item);
          if (data.data != null) {
            item.patientName = data.data.patientName;
            item.patientId = data.data.id;
            // item.inTime = data.data.inTime;
          } else {
            item.patientName = "？";
          }
          item.statusText = this.isStutasText(item.serverTime, item.lastOnline);
          item.status = this.isStutas(item.serverTime, item.lastOnline);
          this.dataList.push(item);
        }
        console.log(this.dataList, "ddddd");
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

    // 新增 / 修改
    addOrUpdateHandle(id) {
      this.addOrUpdateVisible = true;
      this.$nextTick(() => {
        this.$refs.addOrUpdate.init(id);
      });
    },

    // 删除
    deleteHandle(id) {
      var ids = id
        ? [id]
        : this.dataListSelections.map(item => {
            return item.id;
          });
      this.$confirm(
        `确定对[id=${ids.join(",")}]进行[${id ? "删除" : "批量删除"}]操作?`,
        "提示",
        {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        }
      ).then(() => {
        this.$http({
          url: this.$http.adornUrl("/tb/hospitalbed/delete"),
          method: "post",
          data: this.$http.adornData(ids, false)
        }).then(({ data }) => {
          if (data && data.code === 0) {
            this.$message({
              message: "操作成功",
              type: "success",
              duration: 1500,
              onClose: () => {
                this.getDataList();
              }
            });
          } else {
            this.$message.error(data.msg);
          }
        });
      });
    },

    // 定时器 自动查询后台数据
    getInterval() {
      this.$http({
        url: this.$http.adornUrl("/sys/config/getvalue"),
        method: "get",
        params: this.$http.adornParams({
          key: "interval"
        })
      }).then(({ data }) => {
        if (data && data.code === 0) {
          this.interval = data.interval;
          //this.timer = setInterval(this.getDataList, that.interval * 1000);
        }
      });
    },

    // 打开住院详情
    // openPatient(row) {
    //   console.log(row);
    //   this.echartDeviceId = row.deviceId;
    //   this.patientList = [];
    //   if (row.inTime != "") {
    //     this.dialogTableVisible = true;
    //     this.patinetNameTitle = row.patientName + " 的住院详情";
    //     let p = {
    //       deviceId: row.deviceId,
    //       sameType: 1,
    //       startTime: row.inTime
    //     };
    //     this.patientListLoading = true;
    //     this.$http({
    //       url: this.$http.adornUrl("/tb/patient/patient_group_day/"+),
    //       method: "get",
    //       params: this.$http.adornParams(p)
    //     }).then(({ data }) => {
    //       if (data && data.code === 0) {
    //         if (data.data != null) {
    //           this.patientList = data.data;
    //         }
    //       }
    //       this.patientListLoading = false;
    //     });
    //   }
    // },

    openPatient(row) {
      // console.log(row);
      this.patientList = [];

      this.dialogTableVisible = true;
      this.patinetNameTitle = row.patientName + " 的住院详情";

      this.patientListLoading = true;
      this.$http({
        url: this.$http.adornUrl(
          "/tb/patient/patient_group_day/" + row.patientId
        ),
        method: "get"
      }).then(({ data }) => {
        console.log("病人住院详情。。。。", data);
        if (data && data.code === 0) {
          if (data.data != null) {
            this.patientList = data.data;
          }
        }
        this.patientListLoading = false;
      });
    },

    // 定时刷新的开关
    switchChange(val) {
      if (val) {
        //this.getInterval();
        this.timer = setInterval(this.getDataList, that.interval * 1000);
      } else {
        clearInterval(this.timer); // 关闭
      }
    },

    handleEchart(dt, pid) {
      // this.dateTime = formatDate(new Date(dt), "yyyy-MM-dd") + " 00:00:00";
      this.dateTime = formatDate(new Date(dt), "yyyy-MM-dd");

      this.innerVisible = true;
      this.patientId = pid;
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
    isStutasText(serveline, lastOnline) {
      let endtime, startime, tendhours;
      if (lastOnline) {
        startime = Date.parse(lastOnline);
      }
      if (serveline) {
        endtime = Date.parse(serveline);
      }
      tendhours = (endtime - startime) / (60 * 1000);
      console.log(tendhours, endtime, startime);
      if (lastOnline) {
        if (tendhours <= this.interval2) {
          return "在线";
        } else {
          return "离线";
        }
      } else {
        return "未知设备";
      }
    },
    isStutas(serveline, lastOnline) {
      let endtime, startime, tendhours;
      if (lastOnline) {
        startime = Date.parse(lastOnline);
      }
      if (serveline) {
        endtime = Date.parse(serveline);
      }
      tendhours = (endtime - startime) / (60 * 1000);
      if (lastOnline) {
        if (tendhours <= this.interval2) {
          return "success";
        } else {
          return "danger";
        }
      } else {
        return "danger";
      }
    }
  },
  filters: {
    formatter(status) {
      const bindColor = {
        0: "无人",
        1: "有人"
      };
      return bindColor[status];
    },
    formatter1(status) {
      console.log(that.interval);
      if (status <= that.interval && status !== "" && status !== null) {
        return "在线";
      } else {
        return "离线";
      }
    },

    formatter2(row) {
      let serveline = row.serverTime; //2020-07-15 17:33:54
      let lastOnline = row.lastOnline; //2020-07-15 17:33:44
      // let lastOnline = "2020-07-15 17:33:44"; //2020-07-15 17:33:44
      // let serveline = "2020-07-15 18:33:54"; //2020-07-15 17:33:54
      let endtime, startime, tendhours;
      if (lastOnline) {
        endtime = Date.parse(lastOnline);
      }

      if (serveline) {
        startime = Date.parse(serveline);
      }
      tendhours = (endtime - startime) / (60 * 1000);
      // console.log(
      //   "是否在线。。。。",
      //   that.interval2,
      //   lastOnline,
      //   serveline,
      //   tendhours
      // );
      // console.log(that.isOnline);
      if (tendhours <= that.interval2) {
        return "在线";
      } else {
        return "离线";
      }
    },

    dateFormatter(date) {
      if (date === undefined || date === null) {
        return "截至今日";
      }
      return formatDate(new Date(date), "yyyy-MM-dd");
    },
    hourFormatter(second) {
      let hour = 0;
      if (second > 0) {
        hour = (second / (1 * 24 * 60 * 60)).toFixed(2);
      }
      return hour;
    },
    percentageFormatter(second) {
      let percentage = 0;
      if (second > 0) {
        percentage = (second / 86400).toFixed(2);
      }
      return percentage;
    }
  }
};
</script>
