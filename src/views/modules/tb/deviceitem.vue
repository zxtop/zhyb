<template>
  <div class="mod-config">
    <!-- <span>{{queryDate}}</span> -->
    <el-form :inline="true" :model="dataForm" @keyup.enter.native="getDataList()">
      <el-form-item>
        <!-- <el-input v-model="dataForm.key" placeholder="参数名" clearable></el-input> -->
        <el-select v-model="dataForm.mac" clearable placeholder="请选择设备编号" @clear="clearMac()">
          <el-option
            v-for="item in tempData"
            :key="item.key"
            :label="item.deviceName"
            :value="item.key"
          ></el-option>
        </el-select>
      </el-form-item>

      <el-form-item>
        <el-button @click="getDataList()">查询</el-button>
        <el-button v-if="isAuth('tb:hospital:save')" type="primary" @click="addOrUpdateHandle()">新增</el-button>
        <el-button
          v-if="isAuth('tb:hospital:delete')"
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
      <el-table-column prop="itemId" header-align="center" align="center" label="节点ID"></el-table-column>
      <el-table-column prop="deviceMac" header-align="center" align="center" label="网关MAC"></el-table-column>
      <el-table-column prop="bedName" header-align="center" align="center" label="病床名称"></el-table-column>
      <el-table-column prop="createTime" header-align="center" align="center" label="创建时间"></el-table-column>
      <el-table-column prop="lastOnline" header-align="center" align="center" label="最后上传数据时间"></el-table-column>

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
import AddOrUpdate from "./deviceitem-add-or-update";
export default {
  data() {
    return {
      restaurants: [],
      dataForm: {
        mac: ""
      },
      dataList: [],
      pageIndex: 1,
      pageSize: 10,
      totalPage: 0,
      dataListLoading: false,
      dataListSelections: [],
      addOrUpdateVisible: false,
      tempData: []
    };
  },

  components: {
    AddOrUpdate
  },
  activated() {
    this.dataForm.mac = this.$route.params.mac;
    this.getDataList();
  },
  computed: {
    queryDate() {
      // console.log("参数。。。", this.$route.params.id);
      return this.$route.params;
    }
  },
  created() {
    let _that = this;
    this.$http({
      url: this.$http.adornUrl("/tb/device/list_all"),
      method: "get",
      params: this.$http.adornParams()
    }).then(({ data }) => {
      if (data && data.code === 0) {
        // console.log(data, "ddd");
        data.data.map((item, index) => {
          _that.tempData.push({
            deviceName: item.deviceName,
            key: item.mac
          });
        });
      } else {
      }
    });
  },

  methods: {
    clearMac() {
      this.dataForm.mac = "";
    },

    // 获取数据列表
    getDataList() {
      // console.log(this.dataForm.mac);/tb/hospitaldevice/listBed
      this.dataListLoading = true;
      // console.log(this.dataForm.mac);
      this.$http({
        url: this.$http.adornUrl("/tb/deviceitem/list"),
        method: "get",
        params: this.$http.adornParams({
          page: this.pageIndex,
          limit: this.pageSize,
          deviceMac: this.dataForm.mac
        })
      }).then(({ data }) => {
        console.log("data....节点列表", data);
        if (data && data.code === 0) {
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
      console.log(" 新增 / 修改。。。", id);
      this.addOrUpdateVisible = true;
      let mac = this.dataForm.mac;
      this.$nextTick(() => {
        this.$refs.addOrUpdate.init(id, mac, row);
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
          url: this.$http.adornUrl("/tb/deviceitem/delete"),
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
    //   console.log("loadalll,,,,,,");
  }
};
</script>
