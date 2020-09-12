<template>
  <div class="mod-config">
    <el-form :inline="true" :model="dataForm" @keyup.enter.native="getDataList()">
      <el-form-item>
        <component-hospital v-model="hospitalId" v-on:change="hospitalIdChange"></component-hospital>
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
          value-format="yyyy-MM-dd"
          format="yyyy-MM-dd"
          :picker-options="pickerOptions"
          style="width:300px;"
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
        <el-button @click="getDataRush()">查询</el-button>
        <el-button v-if="isAuth('tb:patient:save')" type="primary" @click="addOrUpdateHandle()">新增</el-button>
        <el-button
          v-if="isAuth('tb:patient:delete')"
          type="danger"
          @click="deleteHandle()"
          :disabled="dataListSelections.length <= 0"
        >批量删除</el-button>
      </el-form-item>
    </el-form>
    <el-table
      :data="dataList"
      v-loading="dataListLoading"
      @selection-change="selectionChangeHandle"
      style="width: 100%;"
    >
      <el-table-column type="selection" header-align="center" align="center" width="50"></el-table-column>
      <el-table-column prop="patientName" header-align="center" align="center" label="病人姓名"></el-table-column>
      <el-table-column prop="patientCardId" header-align="center" align="center" label="病人身份证号"></el-table-column>
      <el-table-column prop="bedName" header-align="center" align="center" label="病床号"></el-table-column>
      <el-table-column
        prop="inTime"
        header-align="center"
        align="center"
        label="入住时间"
        :formatter="dateFormat"
      ></el-table-column>

      <el-table-column
        prop="outTime"
        header-align="center"
        align="center"
        label="出院时间"
        :formatter="dateFormat"
      ></el-table-column>

      <el-table-column fixed="right" header-align="center" align="center" width="150" label="操作">
        <template slot-scope="scope">
          <el-button
            type="text"
            size="small"
            v-if="scope.row.outTime == null"
            @click="updateBedHandle(scope.row.id,scope.row)"
          >修改</el-button>

          <el-button
            type="text"
            size="small"
            v-if="scope.row.outTime == null"
            @click="changeBedHandle(scope.row.id,scope.row)"
          >换床</el-button>

          <el-button
            type="text"
            size="small"
            v-if="scope.row.outTime == null"
            @click="outHospitalHandle(scope.row.id,scope.row)"
          >出院</el-button>

          <el-button type="text" size="small" @click="deleteHandle(scope.row.id)">删除</el-button>
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

    <!-- 修改 -->
    <pat-update v-if="padUpdateVisible" ref="padUpdate" @refreshDataList="getDataList"></pat-update>

    <!-- 弹窗, 新增 -->
    <add-or-update v-if="addOrUpdateVisible" ref="addOrUpdate" @refreshDataList="getDataList"></add-or-update>

    <!-- 弹窗, 换病床 -->
    <change-bed v-if="changeBedVisible" ref="changeBed" @refreshDataList="getDataList"></change-bed>

    <!-- 弹窗, 出院 -->
    <out-hospital v-if="outHospitalVisible" ref="outHospital" @refreshDataList="getDataList"></out-hospital>
  </div>
</template>

<script>
import { formatDate } from "@/utils/commonUtil.js";
import AddOrUpdate from "./patient-add-or-update";
import PatUpdate from "./patient-upadte";
import ChangeBed from "./patient-change-bed";
import OutHospital from "./patient-out";
import ComponentHospital from "./component-hospital";
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
      changeBedVisible: false,
      outHospitalVisible: false,
      padUpdateVisible: false,
      hospitalId: 0,
      dates: "",
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
      statusOptions: [
        {
          value: "0",
          label: "未出院"
        },
        {
          value: "1",
          label: "已出院"
        }
      ],
      status: "0"
    };
  },
  components: {
    AddOrUpdate,
    ComponentHospital,
    ChangeBed,
    OutHospital,
    PatUpdate
  },
  activated() {
    this.getDataList();
  },
  methods: {
    hospitalIdChange(id) {
      this.hospitalId = id;
    },
    // 获取数据列表
    getDataList() {
      let p = {
        page: this.pageIndex,
        limit: this.pageSize,
        hospitalId: this.hospitalId,
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
      // console.log(p);
      this.$http({
        url: this.$http.adornUrl("/tb/patient/list"),
        method: "get",
        params: this.$http.adornParams(p)
      }).then(({ data }) => {
        if (data && data.code === 0) {
          console.log("data", data);
          this.dataList = data.page.list;
          this.totalPage = data.page.totalCount;
        } else {
          this.dataList = [];
          this.totalPage = 0;
        }
        this.dataListLoading = false;
      });
    },

    //查询

    getDataRush() {
      let p = {
        page: 1,
        limit: this.pageSize,
        hospitalId: this.hospitalId,
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
      console.log(p);
      this.$http({
        url: this.$http.adornUrl("/tb/patient/list"),
        method: "get",
        params: this.$http.adornParams(p)
      }).then(({ data }) => {
        this.pageIndex = 1;
        if (data && data.code === 0) {
          console.log("data", data);
          this.dataList = data.page.list;
          this.totalPage = data.page.totalCount;
        } else {
          this.dataList = [];
          this.totalPage = 0;
        }
        this.dataListLoading = false;
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
    // 多选
    selectionChangeHandle(val) {
      this.dataListSelections = val;
    },
    // 新增
    addOrUpdateHandle(id) {
      this.addOrUpdateVisible = true;
      this.$nextTick(() => {
        this.$refs.addOrUpdate.init(id);
      });
    },
    //修改
    updateBedHandle(id, row) {
      this.padUpdateVisible = true;
      this.$nextTick(() => {
        this.$refs.padUpdate.init(id, row);
      });
    },
    // 换床
    changeBedHandle(id, row) {
      this.changeBedVisible = true;
      this.$nextTick(() => {
        this.$refs.changeBed.init(id, row);
      });
    },
    // 出院
    outHospitalHandle(id, row) {
      this.outHospitalVisible = true;
      this.$nextTick(() => {
        this.$refs.outHospital.init(id, row);
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
          url: this.$http.adornUrl("/tb/patient/delete"),
          method: "post",
          data: this.$http.adornData(ids, false)
        }).then(({ data }) => {
          if (data && data.code === 0) {
            this.pageIndex = 1;
            this.$message({
              message: "操作成功",
              type: "success",
              duration: 1000,
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
    dateFormat(row, column) {
      var date = row[column.property];
      if (date === undefined || date === null) {
        return "";
      }
      return formatDate(new Date(date), "yyyy-MM-dd");
    }
  }
};
</script>

<style scoped>
.mod-config >>> .el-date-editor .el-range-input {
  width: 31% !important;
}
.mod-config >>> .el-date-editor .el-range-separator {
  width: 9% !important;
}
</style>