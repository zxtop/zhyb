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
      <el-form-item label="设备编号" prop="mac">
        <el-input v-model="dataForm.mac" placeholder="设备编号"></el-input>
      </el-form-item>

      <el-form-item label="设备名称" prop="deviceName">
        <el-input v-model="dataForm.deviceName" placeholder="设备名称"></el-input>
      </el-form-item>

      <el-form-item label="mqtt主题" prop="mqttTopic">
        <el-input v-model="dataForm.mqttTopic" placeholder="mqtt主题"></el-input>
      </el-form-item>
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
        mac: "",
        mqttTopic: "",
        deviceName: ""
      },
      dataRule: {
        deviceName: [
          { required: true, message: "设备名称不能为空", trigger: "blur" }
        ],
        mac: [{ required: true, message: "设备编号不能为空", trigger: "blur" }],
        mqttTopic: [
          { required: true, message: "mqtt主题不能为空", trigger: "blur" }
        ]
      },
      devices: []
    };
  },
  components: {
    ComponentHospital
  },
  created() {
    this.$nextTick(() => {
      // this.init(0)
      //this.loadDevices();
    });
  },
  methods: {
    init(id) {
      this.dataForm.id = id || 0;
      this.visible = true;
      this.$nextTick(() => {
        this.$refs["dataForm"].resetFields();
        if (this.dataForm.id) {
          this.$http({
            url: this.$http.adornUrl(`/tb/device/info/${this.dataForm.id}`),
            method: "get",
            params: this.$http.adornParams()
          }).then(({ data }) => {
            if (data && data.code === 0) {
              this.dataForm.mac = data.device.mac;
              this.dataForm.mqttTopic = data.device.mqttTopic;
              this.dataForm.deviceName = data.device.deviceName;
            }
          });
        }
      });
    },
    // 表单提交
    dataFormSubmit() {
      this.$refs["dataForm"].validate(valid => {
        if (valid) {
          this.$http({
            url: this.$http.adornUrl(
              `/tb/device/${!this.dataForm.id ? "save" : "update"}`
            ),
            method: "post",
            data: this.$http.adornData({
              id: this.dataForm.id || undefined,
              mac: this.dataForm.mac,
              mqttTopic: this.dataForm.mqttTopic,
              deviceName: this.dataForm.deviceName
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
