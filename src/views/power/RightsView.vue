<template>
    <div>
        <!--面包屑视图-->
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>权限管理</el-breadcrumb-item>
            <el-breadcrumb-item>权限列表</el-breadcrumb-item>
        </el-breadcrumb>
        <!--卡片视图-->
        <el-card>
            <!--表格渲染数据-->
            <el-table :data="rightsList" border stripe>
                <el-table-column type="index"></el-table-column>
                <el-table-column prop="authName" label="权限名称"></el-table-column>
                <el-table-column prop="path" label="路径"></el-table-column>
                <el-table-column prop="level" label="权限等级">
                    <!--根据权限等级不同渲染不同样式的el-tag-->
                    <template slot-scope="scope">
                        <el-tag v-if="scope.row.level == 0">一级权限</el-tag>
                        <el-tag v-else-if="scope.row.level == 1"  type="success">二级权限</el-tag>
                        <el-tag v-else type="warning">三级权限</el-tag>
                    </template>
                </el-table-column>

            </el-table>

        </el-card>

    </div>
</template>

<script>
export default {
  name: 'RightsView',
  data () {
    return {
      // 数据
      // 权限列表
      rightsList: []
    }
  },
  methods: {
    // 方法
    // 获取权限列表
    async getRightsList () {
      const { data: res } = await this.$http.get('rights/list')
      if (res.meta.status !== 200) return this.$message.error('获取权限列表失败！')
      this.rightsList = res.data
    }
  },
  created () {
    // 初始化
    this.getRightsList()
  }
}
</script>

<style lang="less" scoped>

</style>
