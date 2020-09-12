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
      <el-form-item label="选择医院" prop="hospitalId">
        <component-hospital v-on:change="hospitalIdChange" ref="addComHos"></component-hospital>
        <!-- <el-input v-show="dataForm.id" v-model="dataForm.hospitalName" placeholder="请输入内容"></el-input> -->
      </el-form-item>

      <el-form-item label="设备编号" prop="mac">
        <el-select v-model="dataForm.mac" placeholder="请选择" clearable>
          <el-option v-for="item in devices" :key="item.id" :label="item.mac" :value="item.mac"></el-option>
        </el-select>
      </el-form-item>
    </el-form>

    <span slot="footer" class="dialog-footer">
      <el-button @click="dataFormCancle()">取消</el-button>
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
        mac: "",
        deviceName: "",
        status: "1",
        hospitalName: ""
      },
      dataRule: {
        hospitalId: [
          { required: true, message: "请选择医院", trigger: "change" }
        ],
        mac: [{ required: true, message: "设备ID不能为空", trigger: "change" }],
        deviceName: [
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
  created() {
    this.$nextTick(() => {
      // this.init(0)
      this.loadDevices();
    });
  },
  methods: {
    hospitalIdChange(id) {
      // console.log("传入的医院ID是", id);
      this.dataForm.hospitalId = id;
    },
    init(id, row) {
      console.log("修改的病床ID --" + id);
      this.dataForm.id = id || 0;
      this.visible = true;
      this.$nextTick(() => {
        this.$refs["dataForm"].resetFields();
        if (this.dataForm.id) {
          this.dataForm.hospitalId = row.hospitalId;
          this.dataForm.mac = row.deviceMac;
          this.$refs.addComHos.hospitalId = row.hospitalId;
          this.$refs.addComHos.hospital_status = row.hospitalId;
          this.$http({
            url: this.$http.adornUrl(
              `/tb/hospitaldevice/info/${this.dataForm.id}`
            ),
            method: "get",
            params: this.$http.adornParams()
          }).then(({ data }) => {
            if (data && data.code === 0) {
              // this.$refs.addComHos.hospitalId = data.hospitalBed.hospitalId;
              // this.dataForm.hospitalId = data.hospitalBed.hospitalId;
              // this.dataForm.deviceId = data.hospitalBed.deviceId;
              // this.dataForm.deviceName = data.hospitalBed.deviceName;
              // this.dataForm.createTime = data.hospitalBed.createTime;
              // this.dataForm.createUserId = data.hospitalBed.createUserId;
              // this.dataForm.status = data.hospitalBed.status + "";
            }
          });
        } else {
          this.loadDevices();
        }
      });
    },
    loadDevices() {
      this.$http({
        url: this.$http.adornUrl("/tb/device/list_no_bind"),
        method: "get"
      }).then(({ data }) => {
        // console.log("新增加绑定。。。。。。");
        if (data && data.code === 0) {
          // console.log("设备列表。。。。", data);
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
      if (this.dataForm.mac === "请选择") {
        this.dataForm.mac = "";
      }
      // this.dataForm.hospitalId = this.$refs.addComHos.hospitalId;
      this.$refs["dataForm"].validate(valid => {
        if (valid) {
          this.$http({
            url: this.$http.adornUrl(
              `/tb/hospitaldevice/${!this.dataForm.id ? "save" : "update"}`
            ),
            method: "post",
            data: this.$http.adornData({
              id: this.dataForm.id || undefined,
              hospitalId: this.dataForm.hospitalId,
              deviceMac: this.dataForm.mac
            })
          }).then(({ data }) => {
            if (data && data.code === 0) {
              this.$refs.addComHos.hospitalId = "";
              this.$refs.addComHos.hospital_status = "";
              this.$message({
                message: "操作成功",
                type: "success",
                duration: 1500,
                onClose: () => {
                  this.visible = false;
                  this.$emit("refreshDataList");
                }
              });
              this.loadDevices();
            } else {
              this.$message.error(data.msg);
            }
          });
        }
      });
    },
    //表单取消
    dataFormCancle() {
      this.$refs.addComHos.hospitalId = "";
      this.$refs.addComHos.hospital_status = "";
      this.visible = false;
    }
  }
};
</script>
