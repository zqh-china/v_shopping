<template>
    <div>
    <!--面包屑视图-->
    <el-breadcrumb separator-class="el-icon-arrow-right">
        <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item>商品管理</el-breadcrumb-item>
        <el-breadcrumb-item>参数列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!--卡片视图-->
    <el-card>
        <!--警告提示框-->
        <el-alert title="注意：只允许对第三级分类添加参数" type="warning" show-icon :closable="false"></el-alert>
        <!--选择商品分类区域-->
        <el-row class="cat-opt">
          <el-col>
            <span>选择商品分类:</span>
            <!--级联选择器-->
            <el-cascader
            v-model="selectedCateKeys"
            :options="cateList"
            :props="cateProps"
            @change="handleCateChange"
            >
            </el-cascader>
          </el-col>
        </el-row>
        <!--tab页签区域-->
        <el-tabs v-model="activeName" @tab-click="handleTabClick">
          <el-tab-pane label="动态参数" name="many">
            <!--添加动态参数按钮-->
            <el-button
            type="primary"
            icon="el-icon-plus"
            size="mini"
            :disabled="isAddBtnDisabled"
            @click="addDialogVisible = true"
            >添加动态参数</el-button>
            <!--动态参数表格-->
            <el-table
            :data="manyTableData"
            border
            stripe
            style="width: 100%"
            >
            <!--展开行-->
            <el-table-column type="expand">
              <template slot-scope="scope">
                <el-tag v-for="(item, i) in scope.row.attr_vals" :key="i" closable @close="handleClose(i, scope.row)">{{ item }}</el-tag>
                <!--添加动态可编辑标签-->
                <el-input
                  class="input-new-tag"
                  v-if="scope.row.inputVisible"
                  v-model="scope.row.inputValue"
                  ref="saveTagInput"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(scope.row)"
                  @blur="handleInputConfirm(scope.row)"
                >
                </el-input>
                <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">+ New Tag</el-button>
              </template>
            </el-table-column>
            <el-table-column type="index">
            </el-table-column>
              <el-table-column
              prop="attr_name"
              label="参数名称"
              >
              </el-table-column>
              <el-table-column
              label="操作"
              >
                <template slot-scope="scope">
                  <el-button type="primary" size="mini" icon="el-icon-edit" @click="handleEdit(scope.row.attr_id)">编辑</el-button>
                  <el-button type="danger" size="mini" icon="el-icon-delete" @click="handleDelete(scope.row.attr_id)">删除</el-button>
                </template>
              </el-table-column>
            </el-table>
          </el-tab-pane>
          <el-tab-pane label="静态属性" name="only">
            <!--添加静态属性按钮-->
            <el-button
            type="primary"
            icon="el-icon-plus"
            size="mini"
            :disabled="isAddBtnDisabled"
            @click="addDialogVisible = true"
            >添加静态属性</el-button>
            <!--静态属性表格-->
            <el-table
            :data="onlyTableData"
            border
            style="width: 100%"
            >
            <!--展开行-->
            <el-table-column type="expand">
              <template slot-scope="scope">
                <el-tag v-for="(item, i) in scope.row.attr_vals" :key="i" closable @close="handleClose(i, scope.row)">{{ item }}</el-tag>
                <!--添加动态可编辑标签-->
                <el-input
                  class="input-new-tag"
                  v-if="scope.row.inputVisible"
                  v-model="scope.row.inputValue"
                  ref="saveTagInput"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(scope.row)"
                  @blur="handleInputConfirm(scope.row)"
                >
                </el-input>
                <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">+ New Tag</el-button>
              </template>
            </el-table-column>
            <el-table-column type="index">
            </el-table-column>
              <el-table-column
              prop="attr_name"
              label="属性名称"
              width="180"
              >
              </el-table-column>
                <el-table-column
                label="操作"
                width="180"
                >
                  <template slot-scope="scope">
                    <el-button type="primary" size="mini" icon="el-icon-edit" @click="handleEdit(scope.row.attr_id)">编辑</el-button>
                    <el-button type="danger" size="mini" icon="el-icon-delete" @click="handleDelete(scope.row.attr_id)">删除</el-button>
                  </template>
                </el-table-column>
            </el-table>
            </el-tab-pane>
        </el-tabs>

    </el-card>
    <!--添加动态参数/静态属性对话框-->
    <el-dialog
    :title="'添加'+titleText"
    :visible.sync="addDialogVisible"
    width="50%"
    @close="addDialogClose"
    >
      <el-form ref="addFormRef" :model="addForm" :rules="addFormRules" label-width="80px">
        <el-form-item :label="titleText" prop="attr_name">
          <el-input v-model="addForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addFormSubmit">确 定</el-button>
      </span>
    </el-dialog>
    <!--编辑动态参数/静态属性对话框-->
    <el-dialog
    :title="'编辑'+titleText"
    :visible.sync="editDialogVisible"
    width="50%"
    @close="editDialogClose">
      <el-form ref="editFormRef" :model="editForm" :rules="editFormRules" label-width="80px">
        <el-form-item :label="titleText" prop="attr_name">
          <el-input v-model="editForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editFormSubmit">确 定</el-button>
      </span>
    </el-dialog>

    </div>
</template>

<script>
export default {
  // 数据
  data () {
    return {
      // 商品分类数据
      cateList: [],
      // 级联选择器的配置对象
      cateProps: {
        expandTrigger: 'hover',
        value: 'cat_id',
        label: 'cat_name',
        children: 'children'
      },
      // 选中的分类keys
      selectedCateKeys: [],
      // tab页签的名称
      activeName: 'many',
      // 动态参数表格数据
      manyTableData: [],
      // 静态属性表格数据
      onlyTableData: [],
      // 添加参数对话框是否显示
      addDialogVisible: false,
      // 添加参数表单数据
      addForm: {
        attr_name: ''
      },
      // 添加参数表单验证规则
      addFormRules: {
        attr_name: [
          { required: true, message: '请输入参数名称', trigger: 'blur' }
        ]
      },
      // 编辑参数对话框是否显示
      editDialogVisible: false,
      // 编辑参数表单数据
      editForm: {
        attr_id: 0,
        attr_name: ''
      },
      // 编辑参数表单验证规则
      editFormRules: {
        attr_name: [
          { required: true, message: '请输入参数名称', trigger: 'blur' }
        ]
      }
    }
  },
  // 方法
  methods: {
    // 获取所有商品分类数据
    async getCateList () {
      const { data: res } = await this.$http.get('categories', {
        params: {
          type: 3
        }
      })
      if (res.meta.status !== 200) return this.$message.error('获取商品分类数据失败！')
      this.cateList = res.data
    },
    // 级联选择器的change事件
    handleCateChange () {
      // 只有选中了第三级分类，才允许添加参数
      if (this.selectedCateKeys.length !== 3) {
        this.selectedCateKeys = []
        this.manyTableData = []
        this.onlyTableData = []
        return this.$message.warning('请选择第三级分类！')
      } else {
        // 根据当前面板和选中的分类id，获取对应的参数数据
        this.getParamsData()
      }
    },
    // 根据当前面板和选中的分类id，获取对应的参数数据
    async getParamsData () {
      // 发送请求获取参数数据
      const { data: res } = await this.$http.get(`categories/${this.currentCateId}/attributes`, {
        params: {
          sel: this.activeName
        }
      })
      if (res.meta.status !== 200) return this.$message.error('获取参数数据失败！')
      // console.log(res.data)
      // 将attr_vals转换成数组
      res.data.forEach(item => {
        item.attr_vals = item.attr_vals ? item.attr_vals.split(',') : []
        // 添加一个属性控制文本框的显示隐藏
        item.inputVisible = false
        // 添加一个属性用来存储文本框的值
        item.inputValue = ''
      })
      // console.log(res.data)
      if (this.activeName === 'many') {
        this.manyTableData = res.data
      } else {
        this.onlyTableData = res.data
      }
    },
    // tab页签的点击事件
    handleTabClick () {
      if (this.selectedCateKeys.length !== 3) {
        this.selectedCateKeys = []
        return this.$message.warning('只允许对第三级分类添加参数')
      } else {
        // 根据当前面板和选中的分类id，获取对应的参数数据
        this.getParamsData()
      }
    },
    // 编辑按钮的点击事件
    handleEdit (attrId) {
      // 根据attr_id从后端获取参数数据
      this.getParamsDataById(attrId)
      // 显示编辑对话框
      this.editDialogVisible = true
    },
    // 删除按钮的点击事件
    async handleDelete (attrId) {
      // 弹出确认框
      const resultConfirm = await this.$confirm('此操作将永久删除该参数, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)
      // 如果用户点击了取消按钮，直接return
      if (resultConfirm === 'cancel') return this.$message.info('已取消删除')
      // 发送请求删除参数
      const { data: res } = await this.$http.delete(`categories/${this.currentCateId}/attributes/${attrId}`)
      if (res.meta.status !== 200) return this.$message.error('删除参数失败！')
      this.$message.success('删除参数成功！')
      // 重新获取参数数据
      this.getParamsData()
    },
    // 监听对话框关闭事件
    addDialogClose () {
      // 重置表单
      this.$refs.addFormRef.resetFields()
    },
    // 添加参数对话框确认时提交表单
    addFormSubmit () {
      // 表单验证
      this.$refs.addFormRef.validate(async valid => {
        if (!valid) return
        // 发送请求添加参数
        const { data: res } = await this.$http.post(`categories/${this.currentCateId}/attributes`, {
          attr_name: this.addForm.attr_name,
          attr_sel: this.activeName
        })
        if (res.meta.status !== 201) return this.$message.error('添加参数失败！')
        this.$message.success('添加参数成功！')
        // 关闭对话框
        this.addDialogVisible = false
        // 重置表单
        this.$refs.addFormRef.resetFields()
        // 重新获取参数数据
        this.getParamsData()
      })
    },
    // 监听对话框关闭事件
    editDialogClose () {
      // 重置表单
      this.$refs.editFormRef.resetFields()
      // 重置编辑表单
      this.editForm = {
        attr_name: '',
        attr_vals: ''
      }
    },
    // 编辑参数对话框确认时提交表单
    editFormSubmit () {
      // 表单验证
      this.$refs.editFormRef.validate(async valid => {
        if (!valid) return
        // 发送请求编辑参数
        const { data: res } = await this.$http.put(`categories/${this.currentCateId}/attributes/${this.editForm.attr_id}`, {
          attr_name: this.editForm.attr_name,
          attr_sel: this.activeName
        })
        if (res.meta.status !== 200) return this.$message.error('编辑参数失败！')
        this.$message.success('编辑参数成功！')
        // 关闭对话框
        this.editDialogVisible = false
        // 重置表单
        this.$refs.editFormRef.resetFields()
        // 重新获取参数数据
        this.getParamsData()
      })
    },
    // 根据attr_id从后端获取参数数据
    async getParamsDataById (attrId) {
      // 发送请求获取参数数据
      const { data: res } = await this.$http.get(`categories/${this.currentCateId}/attributes/${attrId}`)
      if (res.meta.status !== 200) return this.$message.error('获取参数数据失败！')
      this.editForm = res.data
    },
    // 文本框失焦或者回车时添加标签
    handleInputConfirm (row) {
      // 如果文本框的值为空，直接return
      if (row.inputValue.trim().length === 0) {
        // 清空文本框的值
        row.inputValue = ''
        // 隐藏文本框
        row.inputVisible = false
        return
      }
      // 如果文本框的值不为空，添加标签
      row.attr_vals.push(row.inputValue.trim())
      // 清空文本框的值
      row.inputValue = ''
      // 隐藏文本框
      row.inputVisible = false
      // 发送请求更新参数
      this.updateParams(row)
    },
    // 显示文本输入框
    showInput (row) {
      row.inputVisible = true
      // 通过$nextTick()方法，等待文本框渲染完成后，再获取焦点
      this.$nextTick(_ => {
        this.$refs.saveTagInput.$refs.input.focus()
      })
    },
    // 更新参数请求
    async updateParams (row) {
      // 发送请求更新参数
      const { data: res } = await this.$http.put(`categories/${this.currentCateId}/attributes/${row.attr_id}`, {
        attr_name: row.attr_name,
        attr_sel: this.activeName,
        attr_vals: row.attr_vals.join(',')
      })
      if (res.meta.status !== 200) return this.$message.error('更新参数失败！')
      this.$message.success('更新参数成功！')
    },
    // 删除标签
    handleClose (index, row) {
      console.log(row, index)
      // 删除标签
      row.attr_vals.splice(index, 1)
      // 发送请求更新参数
      this.updateParams(row)
    }

  },
  // 初始化
  created () {
    this.getCateList()
  },
  // 计算属性
  computed: {
    // 添加按钮是否被禁用
    isAddBtnDisabled () {
      return this.selectedCateKeys.length !== 3
    },
    // 当前选中的三级分类的id
    currentCateId () {
      return this.selectedCateKeys[2] ? this.selectedCateKeys[2] : null
    },
    // 对话框标题文本依据当前tab页名字而定
    titleText () {
      return this.activeName === 'many' ? '动态参数' : '静态属性'
    }

  }

}
</script>

<style lang="less" scoped>
    .cat-opt {
        margin: 15px;
    }
    .el-cascader {
        margin-left: 10px;
    }
    .el-tag + .el-tag {
      margin: 10px;
    }
    .button-new-tag {
      margin-left: 10px;
      height: 32px;
      line-height: 30px;
      padding-top: 0;
      padding-bottom: 0;
    }
    .input-new-tag {
      width: 90px;
      margin-left: 10px;
      vertical-align: bottom;
    }

</style>
