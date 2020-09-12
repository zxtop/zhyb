<template>
  <div class="mod-config">
    <el-form :inline="true" :model="dataForm" @keyup.enter.native="getDataList()">
      <el-form-item label="绑定状态">
        <el-select v-model="dataForm.hasUse" placeholder="请选择">
          <el-option key="1" label="全部" value></el-option>
          <el-option key="2" label="未绑" value="0"></el-option>
          <el-option key="3" label="已绑" value="1"></el-option>
        </el-select>
      </el-form-item>

      <el-form-item>
        <el-button @click="getDataRush()">查询</el-button>
        <el-button v-if="isAuth('tb:device:save')" type="primary" @click="addOrUpdateHandle()">新增</el-button>
        <el-button
          v-if="isAuth('tb:device:delete')"
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
      <el-table-column prop="mac" header-align="center" align="center" label="设备编号" sortable></el-table-column>
      <el-table-column prop="deviceName" header-align="center" align="center" label="设备名称"></el-table-column>
      <el-table-column prop="mqttTopic" header-align="center" align="center" label="mqtt主题"></el-table-column>
      <el-table-column prop="createTime" header-align="center" align="center" label="入网时间" sortable></el-table-column>
      <el-table-column prop="online" header-align="center" align="center" label="最后在线时间" sortable></el-table-column>

      <!--  设备节点 -->
      <el-table-column header-align="center" align="center" label="设备节点">
        <template slot-scope="scope">
          <el-button type="text" size="small" @click="showDevice(scope)">
            <icon-svg name="config"></icon-svg>
            <span style="vertical-align:top">设定</span>
          </el-button>
        </template>
      </el-table-column>

      <el-table-column fixed="right" header-align="center" align="center" width="150" label="操作">
        <template slot-scope="scope">
          <el-button type="text" size="small" @click="addOrUpdateHandle(scope.row.id)">修改</el-button>
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
import AddOrUpdate from "./device-add-or-update";
export default {
  data() {
    return {
      dataForm: {
        mac: "",
        mqttTopic: "",
        hasUse: ""
      },
      dataList: [],
      pageIndex: 1,
      pageSize: 10,
      totalPage: 0,
      dataListLoading: false,
      dataListSelections: [],
      addOrUpdateVisible: false
    };
  },
  components: {
    AddOrUpdate
  },
  activated() {
    this.getDataList();
  },
  methods: {
    //查看设备节点
    showDevice(scop) {
      // console.log(scop.row.id, "dddd");
      this.$router.push({ name: "tb-deviceitem", params: scop.row });
    },
    // 获取数据列表
    getDataList() {
      this.dataListLoading = true;
      console.log("绑定状态，，，", this.dataForm.hasUse);
      this.$http({
        url: this.$http.adornUrl("/tb/device/list"),
        method: "get",
        params: this.$http.adornParams({
          page: this.pageIndex,
          limit: this.pageSize,
          hasUse: this.dataForm.hasUse
        })
      }).then(({ data }) => {
        if (data && data.code === 0) {
          console.log(data, "设备列表。。。。");
          this.dataList = data.page.list;
          this.totalPage = data.page.totalCount;
        } else {
          this.dataList = [];
          this.totalPage = 0;
        }
        this.dataListLoading = false;
      });
    },

    //点击查询
    getDataRush() {
      this.dataListLoading = true;
      console.log("查询绑定状态....", this.dataForm.hasUse);
      this.$http({
        url: this.$http.adornUrl("/tb/device/list"),
        method: "get",
        params: this.$http.adornParams({
          page: 1,
          limit: this.pageSize,
          hasUse: this.dataForm.hasUse
        })
      }).then(({ data }) => {
        if (data && data.code === 0) {
          console.log(data, "查询设备列表。。。。");
          this.dataList = data.page.list;
          this.totalPage = data.page.totalCount;
          this.pageIndex = 1;
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
        // `确定对[id=${ids.join(",")}]进行[${id ? "删除" : "批量删除"}]操作?`,
        `确定删除该设备以及设备下的节点信息?`,
        "提示",
        {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        }
      )
        .then(() => {
          this.$http({
            url: this.$http.adornUrl("/tb/device/delete"),
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
        })
        .catch(() => {
          console.log("cancel....取消。。。。");
        });
    }
  },
  filters: {
    formatter(status) {
      const bindColor = {
        0: "未绑",
        1: "已绑"
      };
      return bindColor[status];
    }
  }
};
</script>
