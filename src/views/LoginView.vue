<template>
    <div class="login_container">
        <!-- 登录面板 -->
        <div class="login_box">
            <!-- 登录头像 -->
            <div class="avatar_box">
                <img src="../assets/logo.png" alt="">
            </div>
            <!-- 登录表单 element-ui -->
            <el-form label-width="0px" :model="loginForm" :rules="loginRules" ref="loginFormRef" class="login_form">
                <el-form-item prop="username">
                    <el-input v-model="loginForm.username" prefix-icon="el-icon-user" placeholder="请输入用户名"></el-input>
                </el-form-item>
                <el-form-item prop="password">
                    <el-input v-model="loginForm.password" prefix-icon="el-icon-lock" placeholder="请输入密码" type="password"></el-input>
                </el-form-item>
                <el-form-item class="btns">
                    <el-button type="primary" @click="login">登录</el-button>
                    <el-button type="info" @click="resetForm">重置</el-button>
                </el-form-item>
            </el-form>
        </div>
    </div>
</template>

<script>
export default {
  data () {
    return {
      // 表单提交的数据
      loginForm: {
        username: '',
        password: ''
      },
      // 表单验证规则
      loginRules: {
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          // 最大长度限制
          { min: 3, max: 12, message: '用户名长度在3~12位', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          // 密码长度在6~15位
          { min: 6, max: 15, message: '密码长度在6~15位', trigger: 'blur' }

        ]
      }
    }
  },
  methods: {
    // 重置表单
    resetForm () {
      this.$refs.loginFormRef.resetFields()
    },
    login () {
      // 表单预验证
      this.$refs.loginFormRef.validate(async valid => {
        if (valid) {
          // 验证通过
          console.log('验证通过')
          // 发送登录请求
          const { data: res } = await this.$http.post('login', this.loginForm)
          // console.log(res)
          if (res.meta.status !== 200) return this.$message.error('登录失败')
          this.$message.success('登录成功')
          // 将token保存到本地
          window.sessionStorage.setItem('token', res.data.token)
          // 路由跳转
          this.$router.push('/home')
        } else {
          // 验证失败
          console.log('验证失败')
        }
      })
    }
  }
}
</script>

<style lang="less" scoped>
    .login_container{
        width: 100%;
        height: 100%;
        background-color: #2b4b6b;
    }
    .login_box{
        width: 450px;
        height: 300px;
        background-color: #fff;
        border-radius: 5px;
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%,-50%);
        .avatar_box{
            width: 130;
            height: 130px;
            background-color: #fff;
            border-radius: 50%;
            padding: 10px;
            box-shadow: 0 0 10px #ddd;
            position: absolute;
            top: -65px;
            left: 50%;
            transform: translateX(-50%);

            img{
                width: 100%;
                height: 100%;
                border-radius: 50%;
            }
        }
    }
    .login_form{
        position: absolute;
        bottom: 0;
        width: 100%;
        padding: 0 20px;
        box-sizing: border-box;

    }
    .btns{
        display: flex;
        justify-content: flex-end;
    }

</style>
