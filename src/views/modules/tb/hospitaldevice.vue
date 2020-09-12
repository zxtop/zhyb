<template>
  <div class="mod-config">
    <el-form :inline="true" :model="dataForm" @keyup.enter.native="getDataList()">
      <el-form-item>
        <component-hospital v-on:change="hospitalIdChange"></component-hospital>
      </el-form-item>

      <el-form-item>
        <el-button @click="getDataRush()">查询</el-button>
        <el-button
          v-if="isAuth('tb:hospitaldevice:save')"
          type="primary"
          @click="addOrUpdateHandle()"
        >新增</el-button>
        <el-button
          v-if="isAuth('tb:hospitaldevice:delete')"
          type="danger"
          @click="deleteHandle()"
          :disabled="dataListSelections.length <= 0"
        >批量删除</el-button>
      </el-form-item>
    </el-form>

    <el-table
      :data="dataList"
      border
      v-loading="dataListLoading"
      @selection-change="selectionChangeHandle"
      style="width: 100%;"
    >
      <el-table-column type="selection" header-align="center" align="center" width="50"></el-table-column>
      <el-table-column prop="hospitalId" header-align="center" align="center" label="医院ID"></el-table-column>
      <el-table-column prop="hospitalName" header-align="center" align="center" label="医院名称"></el-table-column>
      <el-table-column prop="deviceName" header-align="center" align="center" label="设备名称"></el-table-column>

      <el-table-column prop="deviceMac" header-align="center" align="center" label="设备编码"></el-table-column>
      <el-table-column prop="createTime" header-align="center" align="center" label="添加时间"></el-table-column>

      <el-table-column fixed="right" header-align="center" align="center" width="150" label="操作">
        <template slot-scope="scope">
          <el-button type="text" size="small" @click="addOrUpdateHandle(scope.row.id,scope.row)">修改</el-button>
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
    <!-- 弹窗, 新增 / 修改 -->
    <add-or-update v-if="addOrUpdateVisible" ref="addOrUpdate" @refreshDataList="getDataList"></add-or-update>
  </div>
</template>

<script>
import AddOrUpdate from "./hospitaldevice-add-or-update";
import ComponentHospital from "./component-hospital";

export default {
  data() {
    return {
      dataForm: {
        mac: "",
        hospitalId: ""
      },
      dataList: [],
      pageIndex: 1,
      pageSize: 10,
      totalPage: 0,
      dataListLoading: false,
      dataListSelections: [],
      addOrUpdateVisible: false,
      tempData: [],
      hospitalId: ""
    };
  },
  components: {
    AddOrUpdate,
    ComponentHospital
  },
  activated() {
    this.getDataList();
  },
  methods: {
    hospitalIdChange(id) {
      this.hospitalId = id;
      this.dataForm.hospitalId = id;
      console.log(
        "列表页传入的医院ID是--->" + this.dataForm.hospitalId,
        "，，，"
      );
    },
    // 获取数据列表
    getDataList() {
      this.dataListLoading = true;
      this.$http({
        url: this.$http.adornUrl("/tb/hospitaldevice/list"),
        method: "get",
        params: this.$http.adornParams({
          page: this.pageIndex,
          limit: this.pageSize,
          hospitalId: this.dataForm.hospitalId
          // key: this.dataForm.key
        })
      }).then(({ data }) => {
        if (data && data.code === 0) {
          console.log("医院设备。。。。", data);
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
      this.dataListLoading = true;
      this.$http({
        url: this.$http.adornUrl("/tb/hospitaldevice/list"),
        method: "get",
        params: this.$http.adornParams({
          page: 1,
          limit: this.pageSize,
          hospitalId: this.dataForm.hospitalId
          // key: this.dataForm.key
        })
      }).then(({ data }) => {
        this.pageIndex = 1;
        if (data && data.code === 0) {
          console.log("医院设备。。。。", data);
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
    // 新增 / 修改
    addOrUpdateHandle(id, row) {
      if (id) {
      } else {
        this.dataForm.hospitalId = "";
      }
      this.addOrUpdateVisible = true;
      this.$nextTick(() => {
        this.$refs.addOrUpdate.init(id, row);
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
          url: this.$http.adornUrl("/tb/hospitaldevice/delete"),
          method: "post",
          data: this.$http.adornData(ids, false)
        }).then(({ data }) => {
          if (data && data.code === 0) {
            this.pageIndex = 1;
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
    }
  },
  mounted() {
    // let _that = this;
    // this.$http({
    //   url: this.$http.adornUrl("/tb/device/list"),
    //   method: "get"
    //   // params: this.$http.adornParams({
    //   //     page: this.pageIndex,
    //   //     limit: this.pageSize
    //   // })
    // }).then(({ data }) => {
    //   if (data && data.code === 0) {
    //     // console.log(data, "ddd");
    //     data.page.list.map((item, index) => {
    //       _that.tempData.push({
    //         deviceName: item.deviceName,
    //         key: item.mac
    //       });
    //     });
    //   } else {
    //   }
    // });
  }
};
</script>
