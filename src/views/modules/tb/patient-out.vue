<template>
  <el-dialog title="出院登记" :close-on-click-modal="false" :visible.sync="visible">
    <el-form
      :model="dataForm"
      :rules="dataRule"
      ref="dataForm"
      @keyup.enter.native="dataFormSubmit()"
      label-width="180px"
    >
      <el-form-item label="病床：" prop="bedName">{{dataForm.bedName}}</el-form-item>
      <el-form-item label="姓名：" prop="patientName">{{dataForm.patientName}}</el-form-item>
      <el-form-item label="身份证号：">{{dataForm.patientCardId}}</el-form-item>

      <el-form-item label="住院时间：">{{dateFormat(dataForm.inTime)}}</el-form-item>
      <el-form-item label="出院时间" prop="outTime">
        <el-date-picker
          v-model="dataForm.outTime"
          type="date"
          readonly
          placeholder="选择日期"
          value-format="yyyy-MM-dd"
        ></el-date-picker>
      </el-form-item>
    </el-form>
    <span slot="footer" class="dialog-footer">
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" @click="dataFormSubmit()">确定</el-button>
    </span>
  </el-dialog>
</template>

<script>
import { formatDate } from "@/utils/commonUtil.js";
export default {
  data() {
    return {
      visible: false,
      dataForm: {
        id: 0,
        patientName: "",
        patientCardId: "",
        patientHealthId: "",
        createTime: "",
        createUserId: "",
        deviceId: "",
        inTime: "",
        outTime: "",
        bedName: ""
      },
      dataRule: {
        outTime: [
          { required: true, message: "出院时间不能为空", trigger: "blur" }
        ]
      }
    };
  },
  methods: {
    init(id, row) {
      let now = new Date();
      let year = now.getFullYear(); //年
      let month = now.getMonth() + 1; //月
      let day = now.getDate();
      let dateStr = year + "-" + month + "-" + day;
      this.dataForm.outTime = dateStr;
      this.dataForm.id = id || 0;
      this.visible = true;
      this.$nextTick(() => {
        this.$refs["dataForm"].resetFields();
        if (this.dataForm.id) {
          this.dataForm.patientName = row.patientName;
          this.dataForm.patientCardId = row.patientCardId;
          this.dataForm.bedName = row.bedName;
          this.dataForm.inTime = row.inTime;
          // this.$http({
          //   url: this.$http.adornUrl(`/tb/patient/info/${this.dataForm.id}`),
          //   method: "get",
          //   params: this.$http.adornParams()
          // }).then(({ data }) => {
          //   if (data && data.code === 0) {
          //     this.dataForm.patientName = data.patient.patientName;
          //     this.dataForm.patientCardId = data.patient.patientCardId;
          //     this.dataForm.bedName = data.patient.bedName;
          //     this.dataForm.inTime = data.patient.inTime;
          //   }
          // });
        }
      });
    },
    // 表单提交
    dataFormSubmit() {
      this.$refs["dataForm"].validate(valid => {
        if (valid) {
          this.$http({
            url: this.$http.adornUrl(
              `/tb/patient/${!this.dataForm.id ? "save" : "out"}`
            ),
            method: "post",
            data: this.$http.adornData({
              id: this.dataForm.id || undefined,
              outTime: this.dataForm.outTime
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
    },
    dateFormat(date) {
      if (date === undefined || date === null) {
        return "";
      }
      return formatDate(new Date(date), "yyyy-MM-dd");
    }
  }
};
</script>
