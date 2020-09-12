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
      <el-form-item label="病床名称" prop="bedName">
        <el-input v-model="dataForm.bedName" placeholder="设备名称(病床号)"></el-input>
      </el-form-item>

      <!-- <el-form-item label="状态" prop="status">
      <template>
        <el-radio v-model="dataForm.status" label="1">启用</el-radio>
        <el-radio v-model="dataForm.status" label="0">禁用</el-radio>
      </template>
      </el-form-item>-->
    </el-form>
    <span slot="footer" class="dialog-footer">
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" @click="dataFormSubmit()">确定</el-button>
    </span>
  </el-dialog>
</template>

<script>
import ComponentHospital from "./component-hospital";
export default {
  data() {
    return {
      visible: false,
      dataForm: {
        id: 0,
        hospitalId: "",
        itemId: "",
        bedName: "",
        mac: "",
        status: "1"
      },
      dataRule: {
        hospitalId: [
          { required: true, message: "请选择医院", trigger: "change" }
        ],
        deviceId: [
          { required: true, message: "设备ID不能为空", trigger: "change" }
        ],
        bedName: [
          {
            required: true,
            message: "设备名称(病床号)不能为空",
            trigger: "blur"
          }
        ]
      },
      devices: []
    };
  },
  components: {
    ComponentHospital
  },
  // created() {
  //   this.$nextTick(() => {
  //     // this.init(0)
  //     this.loadDevices();
  //   });
  // },
  methods: {
    hospitalIdChange(id) {
      console.log("传入的医院ID是", id);
      this.dataForm.hospitalId = id;
    },
    init(id, row) {
      console.log("修改的病床ID --" + id);
      this.dataForm.id = id || 0;
      this.visible = true;
      this.$nextTick(() => {
        this.$refs["dataForm"].resetFields();
        if (this.dataForm.id) {
          this.dataForm.itemId = row.itemId;
          this.dataForm.mac = row.deviceMac;
          this.$http({
            url: this.$http.adornUrl(`/tb/deviceitem/info/${this.dataForm.id}`),
            method: "get",
            params: this.$http.adornParams()
          }).then(({ data }) => {
            if (data && data.code === 0) {
              this.dataForm.bedName = data.deviceItem.bedName;
            }
          });
        }
      });
    },
    loadDevices() {
      this.$http({
        url: this.$http.adornUrl("/tb/device/listall"),
        method: "get"
      }).then(({ data }) => {
        if (data && data.code === 0) {
          this.devices = data.data;
        } else {
          this.devices = [];
        }
        let hospital = {
          id: "请选择",
          mac: "请选择"
        };
        this.devices.push(hospital);
      });
    },
    // 表单提交
    dataFormSubmit() {
      this.$refs["dataForm"].validate(valid => {
        if (valid) {
          this.$http({
            url: this.$http.adornUrl(
              `/tb/deviceitem/${!this.dataForm.id ? "save" : "update"}`
            ),
            method: "post",
            data: this.$http.adornData({
              id: this.dataForm.id || undefined,
              itemId: this.dataForm.itemId || undefined,
              deviceMac: this.dataForm.mac,
              bedName: this.dataForm.bedName
            })
          }).then(({ data }) => {
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
              // this.loadDevices();
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
