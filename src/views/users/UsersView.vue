<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!--卡片视图-->
    <el-card class="box-card">
      <!-- 搜索与添加区域 -->
      <el-row class="search-container" :gutter="20">
        <el-col :span="7">
          <el-input
            v-model="searchForm.query"
            placeholder="请输入内容"
            clearable
            @clear="getUserList"
            @keyup.enter.native="search"
          >
            <el-button
              slot="append"
              icon="el-icon-search"
              @click="getUserList"
            ></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="addUserDialogVisible = true">添加用户</el-button>
        </el-col>
      </el-row>
      <!-- 用户列表区域 -->
      <el-table :data="userList" border stripe>
        <!--索引列-->
        <el-table-column type="index" label="序号" width="50"></el-table-column>
        <!--姓名-->
        <el-table-column
          prop="username"
          label="姓名"
          width="120"
        ></el-table-column>
        <!--手机号-->
        <el-table-column
          prop="mobile"
          label="手机号"
          width="120"
        ></el-table-column>
        <!--邮箱-->
        <el-table-column
          prop="email"
          label="邮箱"
          width="120"
        ></el-table-column>
        <!--角色-->
        <el-table-column
          prop="role_name"
          label="角色"
          width="120"
        ></el-table-column>
        <!--状态-->
        <el-table-column label="状态" width="120">
          <template slot-scope="scope">
            <!--开关-->
            <el-switch
              v-model="scope.row.mg_state"
              @change="changeState(scope.row)"
            ></el-switch>
          </template>
        </el-table-column>
        <!--操作-->
        <el-table-column label="操作">
          <template slot-scope="scope">
            <!--修改按钮-->
            <el-button
              type="primary"
              size="mini"
              @click="editUser(scope.row)"
              icon="el-icon-edit"
            ></el-button>
            <!--删除按钮-->
            <el-button
              type="danger"
              size="mini"
              @click="delUser(scope.row)"
              icon="el-icon-delete"
            ></el-button>
            <!--按钮文字气泡提示-->
            <el-tooltip
              effect="dark"
              content="分配角色"
              placement="top"
              :enterable="false"
            >
              <el-button
                type="warning"
                size="mini"
                @click="assignRole(scope.row)"
                icon="el-icon-setting"
              ></el-button>
              <!--分配角色按钮-->
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
      <!--分页区域-->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="searchForm.pagenum"
        :page-sizes="[2, 5, 10, 20]"
        :page-size="searchForm.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      >
      </el-pagination>
    </el-card>
    <!--添加用户对话框-->
    <el-dialog
      title="添加用户"
      :visible.sync="addUserDialogVisible"
      width="50%"
      :before-close="handleClose"
      @close="addDialogClosed"
    >
      <!--表单-->
      <el-form ref="addUserForm" :model="addUserForm" :rules="addFormRules" label-width="70px">
        <!--用户名-->
        <el-form-item label="用户名" prop="username">
          <el-input v-model="addUserForm.username"></el-input>
        </el-form-item>
        <!--密码-->
        <el-form-item label="密码" prop="password">
          <el-input v-model="addUserForm.password"></el-input>
        </el-form-item>
        <!--邮箱-->
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="addUserForm.email"></el-input>
        </el-form-item>
        <!--手机号-->
        <el-form-item label="手机号" prop="mobile">
          <el-input v-model="addUserForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addUserDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addUser"
          >确 定</el-button
        >
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data () {
    return {
      searchForm: {
        query: '',
        pagenum: 1,
        pagesize: 2
      },
      userList: [],
      total: 0,
      addUserDialogVisible: false,
      addUserForm: {
        username: '',
        password: '',
        email: '',
        mobile: ''
      },
      addFormRules: {
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          { min: 3, max: 10, message: '长度在 3 到 10 个字符', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          { min: 6, max: 15, message: '长度在 6 到 15 个字符', trigger: 'blur' }
        ],
        email: [
          { required: true, message: '请输入邮箱', trigger: 'blur' },
          { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
        ],
        mobile: [
          { required: true, message: '请输入手机号', trigger: 'blur' },
          { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }
        ]
      }
    }
  },
  created () {
    this.getUserList()
  },
  methods: {
    // 获取用户列表
    async getUserList () {
      const { data: res } = await this.$http.get('users', {
        params: {
          query: this.searchForm.query,
          pagenum: this.searchForm.pagenum,
          pagesize: this.searchForm.pagesize
        }
      })
      if (res.meta.status !== 200) { return this.$message.error('获取用户列表失败！') }
      this.userList = res.data.users
      this.total = res.data.total
    },
    // 搜索
    search () {
      this.getUserList()
    },
    // 添加用户
    addUser () {
      this.$refs.addUserForm.validate(async valid => {
        if (!valid) { return }
        const { data: res } = await this.$http.post('users', this.addUserForm)
        if (res.meta.status !== 201) { return this.$message.error('添加用户失败！') }
        this.$message.success(res.meta.msg)
        this.addUserDialogVisible = false
        this.getUserList()
      })
    },
    // 编辑用户
    editUser () {
      this.$router.push('/users/edit')
    },
    // 处理页数改变
    handleCurrentChange (newPage) {
      this.searchForm.pagenum = newPage
      this.getUserList()
    },
    // 处理页面大小改变
    handleSizeChange (newSize) {
      this.searchForm.pagesize = newSize
      this.getUserList()
    },
    // 用户状态改变
    async changeState (user) {
      const { data: res } = await this.$http.put(
        `users/${user.id}/state/${user.mg_state}`
      )
      if (res.meta.status !== 200) {
        user.mg_state = !user.mg_state
        return this.$message.error('修改用户状态失败！')
      }
      this.$message.success('修改用户状态成功！')
    },
    // 处理关闭
    handleClose (done) {
      this.$confirm('确认关闭？')
        .then((_) => {
          done()
        })
        .catch((_) => {})
    },
    // 添加对话框关闭
    addDialogClosed () {
      this.$refs.addUserForm.resetFields()
    }
  }
}
</script>

<style lang="less" scoped></style>
