<template>
  <el-dialog
    :title="!dataForm.id ? '新增' : '修改'"
    :close-on-click-modal="false"
    :visible.sync="visible"
  >
    <el-form
      :model="dataForm"
      :rules="dataRule"
      ref="dataForm"
      @keyup.enter.native="dataFormSubmit()"
      label-width="80px"
    >
      <el-form-item label="设备名称" prop="deviceMac">
        <el-select v-model="dataForm.deviceMac" clearable placeholder="请选择设备名称" @clear="clearMac()">
          <el-option
            v-for="item in tempData"
            :key="item.key"
            :label="item.deviceName"
            :value="item.key"
          ></el-option>
        </el-select>
      </el-form-item>

      <el-form-item label="节点ID" prop="itemId">
        <el-input v-model="dataForm.itemId" placeholder="节点ID">varchar</el-input>
      </el-form-item>

      <el-form-item label="病床名称" prop="bedName">
        <el-input v-model="dataForm.bedName" placeholder="病床名称">varchar</el-input>
      </el-form-item>

      <!-- <el-form-item label="添加时间" prop="createTime">
        <el-input v-model="dataForm.createTime" placeholder="添加时间">datetime</el-input>
      </el-form-item>-->
    </el-form>

    <span slot="footer" class="dialog-footer">
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" @click="dataFormSubmit()">确定</el-button>
    </span>
  </el-dialog>
</template>

<script>
export default {
  data() {
    return {
      visible: false,
      dataForm: {
        id: 0,
        itemId: "",
        deviceMac: "",
        bedName: ""
      },
      dataRule: {
        // hospitalId: [
        //   { required: true, message: "医院ID不能为空", trigger: "blur" }
        // ],
        deviceMac: [
          { required: true, message: "网关编码不能为空", trigger: "change" }
        ],

        itemId: [
          { required: true, message: "节点ID不能为空", trigger: "blur" }
        ],
        bedName: [
          { required: true, message: "病床名称不能为空", trigger: "blur" }
        ]

        // createTime: [
        //   { required: true, message: "添加时间不能为空", trigger: "blur" }
        // ]
      },
      tempData: []
    };
  },

  created() {},
  methods: {
    clearMac() {
      this.dataForm.deviceMac = "";
    },

    getListData() {
      let _that = this;
      this.tempData = [];
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
    init(id, mac, row) {
      // console.log("每次点击....");
      this.getListData();
      this.dataForm.id = id || 0;
      this.visible = true;
      this.$nextTick(() => {
        this.$refs["dataForm"].resetFields();
        if (this.dataForm.id) {
          this.dataForm.itemId = row.itemId;
          this.dataForm.deviceMac = row.deviceMac;
          this.dataForm.bedName = row.bedName;
          // console.log("ddddd", this.dataForm, "修改....");

          this.$http({
            url: this.$http.adornUrl(`/tb/deviceitem/info/${this.dataForm.id}`),
            method: "get",
            params: this.$http.adornParams({
              itemId: this.dataForm.itemId,
              deviceMac: this.dataForm.deviceMac
            })
          }).then(({ data }) => {
            if (data && data.code === 0) {
              this.dataForm.deviceMac = data.deviceItem.deviceMac;
              this.dataForm.itemId = data.deviceItem.itemId;
              // console.log(data, "修改....");
            }
          });
        } else {
          this.dataForm.deviceMac = mac;
        }
      });
    },

    // 表单提交
    dataFormSubmit() {
      this.$refs["dataForm"].validate(valid => {
        if (valid) {
          console.log("提交。。。。", this.dataForm);
          this.$http({
            url: this.$http.adornUrl(
              `/tb/deviceitem/${!this.dataForm.id ? "save" : "update"}`
            ),
            method: "post",
            data: this.$http.adornData({
              id: this.dataForm.id,
              itemId: this.dataForm.itemId || undefined,
              deviceMac: this.dataForm.deviceMac,
              bedName: this.dataForm.bedName
              // hospitalId: this.dataForm.hospitalId,
              // bedName: this.dataForm.bedName
              // createTime: this.dataForm.createTime
            })
          }).then(({ data }) => {
            // console.log("添加。。。。", data);
            if (data && data.code === 0) {
              this.$message({
                message: "操作成功",
                type: "success",
                duration: 1500,
                onClose: () => {
                  this.visible = false;
                  this.$emit("refreshDataList");
                }
              });
            } else {
              this.$message.error(data.msg);
            }
          });
        }
      });
    }
  }
};
</script>
