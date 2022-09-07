<template>
  <div>
    <!--面包屑视图-->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>
    <!--卡片视图-->
    <el-card>
      <!--添加分类按钮-->
      <el-button type="primary" @click="showAddCateDialog">添加分类</el-button>
      <!--表格渲染数据-->
      <tree-table
      :data="cateList"
      :columns="columns"
      :selection-type="false"
      :expand-type="false"
      class="tree-table"
      show-index
      border>
      <!--作用于插槽 是否有效-->
      <template slot="isok" slot-scope="scope">
       <i class="el-icon-success" v-if="scope.row.cat_deleted === false" style="color: lightgreen;"></i>
       <i class="el-icon-error" v-else style="color: red;"></i>
      </template>
      <!--作用于插槽 排序-->
      <template slot="isordered" slot-scope="scope">
        <el-tag type="mini" v-if="scope.row.cat_level === 0">一级</el-tag>
        <el-tag type="success" v-else-if="scope.row.cat_level === 1">二级</el-tag>
        <el-tag type="warning" v-else>三级</el-tag>
      </template>
      <!--作用于插槽 操作-->
      <template slot="opt" slot-scope="scope">
        <el-button type="primary" size="mini" icon="el-icon-edit" @click="editCate(scope.row)">编辑</el-button>
        <el-button type="danger" size="mini" icon="el-icon-delete" @click="delCate(scope.row)">删除</el-button>
      </template>

      </tree-table>
      <!--分页-->
      <el-pagination
      background
      layout="total, sizes, prev, pager, next, jumper"
      :total="total"
      :page-size="queryInfo.pagesize"
      :page-sizes="[3, 5, 10, 15]"
      :current-page="queryInfo.pagenum"
      @current-change="handleCurrentChange"
      @size-change="handleSizeChange">
      </el-pagination>
    </el-card>
    <!--添加分类对话框-->
    <el-dialog title="添加分类" :visible.sync="addCateDialogVisible" width="50%">
      <el-form
      :model="addCateForm"
      :rules="addCateFormRules"
      ref="addCateFormRef"
      label-width="100px">
        <!--prop决定验证规则-->
        <el-form-item label="分类名称" prop="cat_name">
          <el-input v-model="addCateForm.cat_name"></el-input>
        </el-form-item>
        <el-form-item label="父级分类">
          <!--级联选择器-->
          <!--options用来指定数据源-->
          <!--props用来指定配置对象-->
          <el-cascader
          :options="parentCateList"
          :props="cateProps"
          v-model="selectedKeys"
          popper-class="cate-cascader"
          @change="handleCascaderChange"
          >
          </el-cascader>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addCateDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addCate">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'CategoryView',
  data () {
    return {
      // 添加分类数据对话框可见性
      addCateDialogVisible: false,
      // 商品分类数据
      cateList: [],
      // 查询参数
      queryInfo: {
        type: 3,
        pagenum: 1,
        pagesize: 5
      },
      // 总条数
      total: 0,
      // tree-table的表头
      columns: [
        {
          label: '分类名称',
          prop: 'cat_name'
        },
        {
          label: '是否有效',
          prop: 'cat_deleted',
          type: 'template', // 模板类型
          template: 'isok' // 模板名称
        },
        {
          label: '排序',
          prop: 'cat_level',
          type: 'template', // 模板类型
          template: 'isordered' // 模板名称
        },
        {
          label: '操作',
          type: 'template',
          template: 'opt'
        }
      ],
      // 添加分类表单数据
      addCateForm: {
        cat_name: '',
        cat_level: 0,
        cat_pid: 0
      },
      // 添加分类表单应用
      addCateFormRef: 'addCateFormRef',
      // 添加分类表单验证规则
      addCateFormRules: {
        cat_name: [
          { required: true, message: '请输入分类名称', trigger: 'blur' }
        ]
      },
      // 父级分类列表
      parentCateList: [],
      // 级联选择器配置对象
      cateProps: {
        expandTrigger: 'hover',
        value: 'cat_id', // 选中的属性
        label: 'cat_name', // 看到的属性
        children: 'children' // 子集的属性
      },
      // 当前选中的分类
      selectedKeys: []
    }
  },
  methods: {
    // 获取商品分类列表
    async getCategoryList () {
      const { data: res } = await this.$http.get('categories', { params: this.queryInfo })
      if (res.meta.status !== 200) return this.$message.error('获取商品分类列表失败！')
      this.cateList = res.data.result
      this.total = res.data.total
    },
    // 编辑商品
    editGoods (row) {
      this.$router.push(`/goods/edit/${row.cat_id}`)
    },
    // 删除商品
    async removeGoods (row) {
      const { data: res } = await this.$http.delete(`/category/${row.cat_id}`)
      if (res.meta.status === 200) {
        this.$message.success('删除商品分类成功')
        this.getCategoryList()
      } else {
        this.$message.error('删除商品分类失败')
      }
    },
    // 分页大小改变
    handleSizeChange (newSize) {
      this.queryInfo.pagesize = newSize
      this.getCategoryList()
    },
    // 当前页改变
    handleCurrentChange (newPage) {
      this.queryInfo.pagenum = newPage
      this.getCategoryList()
    },
    // 显示添加分类对话框
    showAddCateDialog () {
      // 先获取父级分类列表
      this.getParentCateList()
      this.addCateDialogVisible = true
    },
    // 添加分类
    async addCate () {
      // 表单验证
      this.$refs[this.addCateFormRef].validate(async valid => {
        if (!valid) return
        // 发送请求
        const { data: res } = await this.$http.post('categories', this.addCateForm)
        if (res.meta.status !== 201) return this.$message.error('添加分类失败！')
        this.$message.success('添加分类成功！')
        this.addCateDialogVisible = false
        this.getCategoryList()
      })
    },
    // 获取父级分类列表
    async getParentCateList () {
      const { data: res } = await this.$http.get('categories', { params: { type: 2 } })
      if (res.meta.status !== 200) return this.$message.error('获取父级分类列表失败！')
      this.parentCateList = res.data
    },
    // 选择器发生改变触发
    handleCascaderChange () {
      // 如果electedKeys的长度为0，说明没有选中任何分类
      if (this.selectedKeys.length === 0) {
        this.addCateForm.cat_pid = 0
        this.addCateForm.cat_level = 0
      } else {
        // 获取最后一个选中的分类
        const lastCate = this.selectedKeys[this.selectedKeys.length - 1]
        // 获取最后一个选中的分类的等级
        const lastCateLevel = this.selectedKeys.length
        this.addCateForm.cat_pid = lastCate
        this.addCateForm.cat_level = lastCateLevel
      }
    },
    // 监听对话框关闭
    handleDialogClosed () {
      // 重置表单
      this.$refs.addCateFormRef.resetFields()
      // 重置级联选择器
      this.selectedKeys = []
      this.addCateForm.cat_pid = 0
      this.addCateForm.cat_level = 0
    }
  },
  created () {
    this.getCategoryList()
  }
}
</script>

<style lang="less" scoped>
.tree-table {
  margin-top: 20px;
}
.el-cascader {
  width: 100%;
}
.cate-cascader{
  width: 300px;
}
.el-popper {
  width: 300px;
}
</style>
