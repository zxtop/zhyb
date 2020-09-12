<template>
  <el-dialog
    width="900px"
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
      <el-form-item label="用户名" prop="userName">
        <el-input v-model="dataForm.userName" placeholder="登录帐号"></el-input>
      </el-form-item>
      <el-form-item label="密码" prop="password" :class="{ 'is-required': !dataForm.id }">
        <el-input v-model="dataForm.password" type="password" placeholder="密码"></el-input>
      </el-form-item>
      <el-form-item label="确认密码" prop="comfirmPassword" :class="{ 'is-required': !dataForm.id }">
        <el-input v-model="dataForm.comfirmPassword" type="password" placeholder="确认密码"></el-input>
      </el-form-item>
      <el-form-item label="邮箱" prop="email" v-show="false">
        <el-input v-model="dataForm.email" placeholder="邮箱"></el-input>
      </el-form-item>
      <el-form-item label="手机号" prop="mobile" v-show="false">
        <el-input v-model="dataForm.mobile" placeholder="手机号"></el-input>
      </el-form-item>
      <el-form-item label="角色" size="mini" prop="roleIdList">
        <el-checkbox-group v-model="dataForm.roleIdList">
          <el-checkbox
            v-for="role in roleList"
            :key="role.roleId"
            :label="role.roleId"
          >{{ role.roleName }}</el-checkbox>
        </el-checkbox-group>
      </el-form-item>

      <el-form-item label="选择医院" prop="hospitalId">
        <el-select
          v-if="dataForm.id"
          v-model="dataForm.hospitalId"
          placeholder="请选择"
          v-on:change="hospitalIdChange"
        >
          <el-option
            v-for="item in hospitals"
            :key="item.id"
            :label="item.hospitalName"
            :value="item.id"
          ></el-option>
        </el-select>

        <component-hospital v-else v-on:change="hospitalIdChange" ref="addComHos"></component-hospital>
      </el-form-item>

      <el-form-item label="选择病床" style="height:200px;overflow-y:auto">
        <el-checkbox-group v-model="dataForm.checkList" @change="gethospitalbed($event)">
          <el-checkbox
            v-for="item in hospitalsBeds"
            :key="item.itemId"
            :label="item.itemId"
          >{{item.bedName}}</el-checkbox>
        </el-checkbox-group>
      </el-form-item>

      <el-form-item label="状态" size="mini" prop="status">
        <el-radio-group v-model="dataForm.status">
          <el-radio :label="0">禁用</el-radio>
          <el-radio :label="1">正常</el-radio>
        </el-radio-group>
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
    var validatePassword = (rule, value, callback) => {
      if (!this.dataForm.id && !/\S/.test(value)) {
        callback(new Error("密码不能为空"));
      } else {
        callback();
      }
    };
    var validateComfirmPassword = (rule, value, callback) => {
      if (!this.dataForm.id && !/\S/.test(value)) {
        callback(new Error("确认密码不能为空"));
      } else if (this.dataForm.password !== value) {
        callback(new Error("确认密码与密码输入不一致"));
      } else {
        callback();
      }
    };
    return {
      visible: false,
      roleList: [],
      dataForm: {
        id: 0,
        userName: "",
        password: "",
        comfirmPassword: "",
        salt: "",
        email: "",
        mobile: "",
        roleIdList: [],
        status: 1,
        hospitalId: "",
        checkList: []
      },
      dataRule: {
        userName: [
          { required: true, message: "用户名不能为空", trigger: "blur" }
        ],
        password: [{ validator: validatePassword, trigger: "blur" }],
        comfirmPassword: [
          { validator: validateComfirmPassword, trigger: "blur" }
        ]
      },
      hospitals: [],

      hospitalsBeds: [],
      inithospitalid: ""
    };
  },

  components: {
    ComponentHospital
  },
  methods: {
    gethospitalbed(e) {
      // console.log(this.dataForm.checkList, e, "ddddd");
    },
    hospitalIdChange(id) {
      console.log("aaaa", id);
      this.hospitalId = id;
      this.hospitalsBeds = [];
      // this.dataForm.deviceId = "";
      this.dataForm.hospitalId = id;
      if (id > 0) {
        this.loadHospitalBeds(this.hospitalId);
      } else {
        this.hospitalsBeds = [];
      }
    },
    loadHospitalBeds(id) {
      console.log(id, "loadhospitalbedsssssssss.....");
      this.$http({
        url: this.$http.adornUrl("/tb/deviceitem/list_by_hospital_no_page"),
        method: "get",
        params: this.$http.adornParams({
          hospitalId: id
        })
      }).then(({ data }) => {
        console.log("查询病床返回了数据", data);
        if (data && data.code === 0) {
          this.hospitalsBeds = data.data;
        } else {
          this.hospitalsBeds = [];
        }
        this.$forceUpdate();
      });
    },

    init(id, row) {
      console.log("增加", "修改。。", id, row);
      this.dataForm.id = id || 0;
      this.loadHospitals();
      this.$http({
        url: this.$http.adornUrl("/sys/role/select"),
        method: "get",
        params: this.$http.adornParams()
      })
        .then(({ data }) => {
          this.roleList = data && data.code === 0 ? data.list : [];
        })
        .then(() => {
          this.visible = true;
          this.$nextTick(() => {
            this.$refs["dataForm"].resetFields();
          });
        })
        .then(() => {
          if (this.dataForm.id) {
            this.$http({
              url: this.$http.adornUrl(`/sys/user/info/${this.dataForm.id}`),
              method: "get",
              params: this.$http.adornParams()
            }).then(({ data }) => {
              if (data && data.code === 0) {
                console.log(data, "ddd");
                this.dataForm.userName = data.user.username;
                this.dataForm.salt = data.user.salt;
                this.dataForm.email = data.user.email;
                this.dataForm.mobile = data.user.mobile;
                this.dataForm.roleIdList = data.user.roleIdList;
                this.dataForm.status = data.user.status;
                this.dataForm.hospitalId = data.user.hospitalId;
                this.loadHospitalBeds(this.dataForm.hospitalId);
                // console.log("checklist....", this.dataForm.checkList);
                data.user.userBeds.map((item, index) => {
                  this.dataForm.checkList.push(item.deviceItemId);
                });
              }
            });
          }
        });
    },

    // 表单提交
    dataFormSubmit() {
      console.log(this.dataForm.id, "dddd");
      this.$refs["dataForm"].validate(valid => {
        if (valid) {
          let userBeds = [];
          this.dataForm.checkList.map((item, index) => {
            userBeds.push({
              userId: "",
              deviceItemId: item
            });
          });
          // console.log(userBeds);
          this.$http({
            url: this.$http.adornUrl(
              `/sys/user/${!this.dataForm.id ? "save" : "update"}`
            ),
            method: "post",
            data: this.$http.adornData({
              userId: this.dataForm.id || undefined,
              username: this.dataForm.userName,
              password: this.dataForm.password,
              salt: this.dataForm.salt,
              email: this.dataForm.email,
              mobile: this.dataForm.mobile,
              status: this.dataForm.status,
              roleIdList: this.dataForm.roleIdList,
              hospitalId: this.dataForm.hospitalId,
              userBeds: userBeds
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
    loadHospitals() {
      this.$http({
        url: this.$http.adornUrl("/tb/hospital/listall"),
        method: "get"
      }).then(({ data }) => {
        console.log(data);
        if (data && data.code === 0) {
          this.hospitals = data.data;
        } else {
          this.hospitals = [];
        }
        this.dataListLoading = false;
      });
    }
  }
};
</script>
