<template>
  <div>
    <!--面包屑导航-->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!--卡片视图-->
    <el-card>
        <el-row :gutter="20">
          <el-col :span="8">
            <!--搜索输入框-->
            <el-input placeholder="请输入商品名称" v-model="queryInfo.query" clearable @clear="handleClear">
              <el-button slot="append" icon="el-icon-search" @click="handleSearch"></el-button>
            </el-input>
          </el-col>
          <el-col :span="4">
            <el-button type="primary" @click="toAddPage">添加商品</el-button>
          </el-col>
        </el-row>
        <!--表格渲染数据-->
        <el-table :data="goodsList" border stripe>
            <el-table-column type="index"></el-table-column>
            <el-table-column prop="goods_name" label="商品名称"></el-table-column>
            <el-table-column prop="goods_price" label="商品价格(元)" width="95px"></el-table-column>
            <el-table-column prop="goods_number" label="商品库存(件)" width="95px"></el-table-column>
            <el-table-column prop="goods_weight" label="商品重量(kg)" width="95px"></el-table-column>
            <el-table-column prop="add_time" label="创建时间" width="140px" >
                <template slot-scope="scope">
                    {{ scope.row.add_time | dateFormat }}
                </template>
            </el-table-column>
            <el-table-column label="操作" width="130px">
              <template slot-scope="scope">
                <el-button type="primary" size="mini" icon="el-icon-edit" @click="handleEdit(scope.row.goods_id)"></el-button>
                <el-button type="danger" size="mini" icon="el-icon-delete" @click="handleDelete(scope.row.goods_id)"></el-button>
              </template>
            </el-table-column>
        </el-table>

        <!--分页-->
        <el-pagination
        background
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
        :page-size="queryInfo.pagesize"
        :page-sizes="[3, 5, 10, 15]"
        :current-page="queryInfo.pagenum"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange">
        >
        </el-pagination>
    </el-card>
  </div>
</template>

<script>
export default {
  name: 'ListView',
  data () {
    return {
      // 数据
      queryInfo: {
        query: '',
        pagenum: 1,
        pagesize: 5
      },
      // 总条数
      total: 0,
      // 商品列表数据
      goodsList: []
    }
  },
  methods: {
    // 方法
    // 搜索
    handleSearch () {
    //   this.$refs.goodsTable.getData()
      this.getGoodsList()
    },
    // 清空
    handleClear () {
      this.queryInfo.query = ''
      this.getGoodsList()
      //   this.$refs.goodsTable.getData()
    },
    // 获取商品数据
    async getGoodsList () {
      const { data: res } = await this.$http.get('goods', {
        params: this.queryInfo
      })
      if (res.meta.status !== 200) return this.$message.error('获取商品列表失败！')
      this.goodsList = res.data.goods
      this.total = res.data.total
    },
    // 分页大小改变
    handleSizeChange (newSize) {
      this.queryInfo.pagesize = newSize
      // 重新获取数据
      this.getGoodsList()
    //   this.$refs.goodsTable.getData()
    },
    // 当前页改变
    handleCurrentChange (newPage) {
      this.queryInfo.pagenum = newPage
      // 重新获取数据
      this.getGoodsList()
      //   this.$refs.goodsTable.getData()
    },
    // 处理编辑
    handleEdit (id) {
      this.$router.push(`/goods/edit/${id}`)
    },
    // 处理删除
    async handleDelete (id) {
      const confirmResult = await this.$confirm('此操作将永久删除该商品, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)
      if (confirmResult !== 'confirm') return this.$message.info('已取消删除')
      const { data: res } = await this.$http.delete(`goods/${id}`)
      if (res.meta.status !== 200) return this.$message.error('删除商品失败！')
      this.$message.success('删除商品成功！')
      this.getGoodsList()
    },
    // 跳转到添加商品页面
    toAddPage () {
      this.$router.push('/goods/add')
    }
  },
  created () {
    // 初始化
    this.getGoodsList()
  }
}
</script>

<style lang="less" scoped></style>
