<template>
  <el-dialog title="更换病床" :close-on-click-modal="false" :visible.sync="visible">
    <el-form
      :model="dataForm"
      :rules="dataRule"
      ref="dataForm"
      @keyup.enter.native="dataFormSubmit()"
      label-width="180px"
    >
      <el-form-item label="姓名：" prop="patientName">{{dataForm.patientName}}</el-form-item>
      <el-form-item label="身份证号：">{{dataForm.patientCardId}}</el-form-item>
      <el-form-item label="当前病床：" prop="bedName">{{dataForm.bedName}}</el-form-item>

      <el-form-item label="病床" prop="itemId">
        <el-select v-model="dataForm.itemId" placeholder="请选择" width="400">
          <el-option
            v-for="item in hospitalsBeds"
            :key="item.itemId"
            :label="item.bedName"
            :value="item.itemId"
            :disabled="item.hasPerson===1"
          >
            <span style="float: left">{{ item.bedName }}</span>
            <span
              style="float: right; color: #f56c6c; font-size: 13px"
              v-if="item.hasPerson"
            >{{item.patientName}}</span>
            <span style="float: right; color: #43bf05; font-size: 13px" v-if="!item.hasPerson">可用</span>
          </el-option>
        </el-select>
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
      hospitalsBeds: [],
      hospitalId: 0,
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
        bedName: "",
        itemId: ""
      },
      dataRule: {
        outTime: [
          { required: true, message: "出院时间不能为空", trigger: "blur" }
        ]
      }
    };
  },
  methods: {
    loadHospitalBeds(id) {
      this.$http({
        url: this.$http.adornUrl("/tb/deviceitem/list_by_user_no_page"),
        method: "get",
        params: this.$http.adornParams({
          hospitalId: id
        })
      }).then(({ data }) => {
        if (data && data.code === 0) {
          console.log("可用病床。。。。", data);
          this.hospitalsBeds = data.data;
        } else {
          this.hospitalsBeds = [];
        }
      });
    },
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
          this.hospitalId = row.hospitalId;
          console.log("换床。。。。", this.hospitalId);
          this.loadHospitalBeds(this.hospitalId);
          // this.$http({
          //   url: this.$http.adornUrl(`/tb/patient/info/${this.dataForm.id}`),
          //   method: "get",
          //   params: this.$http.adornParams()
          // }).then(({ data }) => {
          //   if (data && data.code === 0) {
          //     this.dataForm.patientName = data.patient.patientName;
          //     this.dataForm.patientCardId = data.patient.patientCardId;
          //     this.dataForm.bedName = data.patient.bedName;

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
            url: this.$http.adornUrl(`/tb/patient/change_bed`),
            method: "post",
            data: this.$http.adornData({
              id: this.dataForm.id || undefined,
              deviceItemId: this.dataForm.itemId
            })
          }).then(({ data }) => {
            if (data && data.code === 0) {
              this.$message({
                message: "操作成功",
                type: "success",
                duration: 1500,
                onClose: () => {
                  // this.loadHospitalBeds(this.hospitalId);
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
