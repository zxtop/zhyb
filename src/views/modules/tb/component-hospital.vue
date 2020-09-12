<template>
  <el-select
    v-model="hospitalId"
    placeholder="请选择"
    :disabled="hospital_status"
    @change="changeHospital"
  >
    <el-option v-for="item in hospitals" :key="item.id" :label="item.hospitalName" :value="item.id"></el-option>
  </el-select>
</template>
<script>
export default {
  data() {
    return {
      hospitalId: "",
      hospitals: []
    };
  },
  computed: {
    userHospital: {
      get() {
        return this.$store.state.user.hospitalId;
      },
      set(val) {
        this.$store.commit("user/updateHospital", val);
      }
    },
    hospital_status: {
      get() {
        return this.userHospital > 0;
      },
      set(val) {
        this.userHospital = val;
      }
    }
  },
  created() {
    this.loadHospitals();
    this.changeHospital();
  },
  methods: {
    changeHospital() {
      this.$emit("change", this.hospitalId);
    },
    loadHospitals() {
      this.$http({
        url: this.$http.adornUrl("/tb/hospital/listall"),
        method: "get"
      }).then(({ data }) => {
        if (data && data.code === 0) {
          this.hospitals = data.data;
        } else {
          this.hospitals = [];
        }
        let hospital = {
          id: "",
          hospitalName: "请选择"
        };
        this.hospitals.push(hospital);
        if (this.userHospital > 0) {
          console.log(this.hospitals);
          console.log("设置医院" + this.userHospital);
          this.hospitalId = this.userHospital;
          this.$emit("change", this.hospitalId);
        }
      });
    }
  }
};
</script>