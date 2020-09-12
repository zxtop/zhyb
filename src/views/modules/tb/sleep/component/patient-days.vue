<template>
  <div>
    <el-table :data="row.useList" style="width: 100%">
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

      <!-- <el-table-column label="卧床图表">
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="danger"
            @click="handleEchart(scope.row.createTime,scope.row)"
          >查看</el-button>
        </template>
      </el-table-column>-->

      <el-table-column label="睡眠监控">
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="success"
            @click="handleSleep(scope.row.createTime,scope.row)"
          >查看</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog title="睡眠监测图表" :visible.sync="sleepVisible" width="1200px">
      <component-sleep :patientId="patientId" :date="dateTime" v-if="sleepVisible"></component-sleep>
      <span slot="footer" class="dialog-footer">
        <el-button @click="sleepVisible = false">取 消</el-button>
        <el-button type="primary" @click="sleepVisible = false">确 定</el-button>
      </span>
    </el-dialog>

    <el-dialog title="图表" :visible.sync="dialogVisible" width="1200px">
      <component-echart :patientId="patientId" :date="dateTime" v-if="dialogVisible"></component-echart>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="dialogVisible = false">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>


<script>
import { formatDate } from "@/utils/commonUtil.js";
import ComponentEchart from "./echart-days";
import ComponentSleep from "./sleep-days";

export default {
  data() {
    return {
      dialogVisible: false,
      dateTime: "",
      patientId: "",
      sleepVisible: false
    };
  },
  props: {
    row: {
      Type: Object
    }
  },
  created() {
    console.log(this.row, "详情列表。。。。");
    // this.deviceId = this.row.deviceId;
    this.getDataList();
  },
  components: {
    ComponentEchart,
    ComponentSleep
  },
  methods: {
    handleSleep(dt, row) {
      this.dateTime = formatDate(new Date(dt), "yyyy-MM-dd");
      this.patientId = row.patientId;
      this.sleepVisible = true;
    },
    handleEchart(dt, row) {
      // console.log("查看。。。。。");
      // this.dateTime = formatDate(new Date(dt), "yyyy-MM-dd") + " 00:00:00";
      this.dateTime = formatDate(new Date(dt), "yyyy-MM-dd");
      this.patientId = row.patientId;
      this.dialogVisible = true;
    },
    getDataList() {
      // console.log(this.row.id, "id.....");
      this.$http({
        url: this.$http.adornUrl(
          "/tb/patient/patient_group_day/" + this.row.id
        ),
        method: "get"
        // params: this.$http.adornParams({
        //   id: this.row.id
        // })
      }).then(({ data }) => {
        // console.log(data);
        if (data && data.code === 0) {
          // this.dataList = data.page.list;
          // this.totalPage = data.page.totalCount;
          console.log("卧床详情。。。", data);
          this.row.useList = data.data;
        } else {
          // this.dataList = [];
          // this.totalPage = 0;
        }
        // this.dataListLoading = false;
      });
    }
  },
  filters: {
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