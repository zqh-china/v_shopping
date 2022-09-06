<template>
    <div>
         <!--面包屑视图-->
         <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>权限管理</el-breadcrumb-item>
            <el-breadcrumb-item>角色列表</el-breadcrumb-item>
        </el-breadcrumb>
        <!--卡片试图-->
        <el-card>
            <el-row>
              <el-col :span="4">
                <el-button type="primary">添加角色</el-button>
              </el-col>
            </el-row>
            <!--角色列表-->
            <el-table :data="roleList" border stripe>
                <!--展开列-->
                <el-table-column type="expand">
                    <template slot-scope="scope">
                       <el-row :class="['vcenter', 'bdbottom', i1 === 0 ? 'bdtop': '']" v-for="(item1, i1) in scope.row.children" :key="item1.id">
                         <el-col :span="5">
                            <el-tag closable @close="removeRight(scope.row, item1.id)">{{ item1.authName }}</el-tag>
                            <i class="el-icon-caret-right"></i>
                         </el-col>
                         <el-col :span="19">
                            <el-row :class="[i2 === 0 ? '': 'bdtop', 'vcenter']" v-for="(item2, i2) in item1.children" :key="item2.id" >
                              <el-col :span="6">
                                <el-tag type="success" closable @close="removeRight(scope.row, item2.id)" >{{ item2.authName }}</el-tag>
                                <i class="el-icon-caret-right"></i>
                              </el-col>
                              <el-col :span="18">
                                <el-tag type="warning" v-for="item3 in item2.children" :key="item3.id" closable @close="removeRight(scope.row, item3.id)">
                                    {{ item3.authName }}
                                </el-tag>
                              </el-col>
                            </el-row>
                         </el-col>
                       </el-row>
                    </template>
                </el-table-column>
              <el-table-column type="index"></el-table-column>
              <el-table-column prop="roleName" label="角色名称"></el-table-column>
              <el-table-column prop="roleDesc" label="角色描述"></el-table-column>
              <el-table-column label="操作" width="300px">
                <template slot-scope="scope">
                    <el-button type="primary" size="mini" icon="el-icon-edit">编辑</el-button>
                    <el-button type="danger" size="mini" icon="el-icon-delete">删除</el-button>
                    <el-button type="warning" size="mini" icon="el-icon-setting" @click="showSetRightDialog(scope.row)">分配权限</el-button>
                </template>
              </el-table-column>
            </el-table>
        </el-card>
        <!--分配权限对话框-->
        <el-dialog title="分配权限" :visible.sync="setRightDialogVisible" width="50%" @close="setRightDialogClosed">
            <el-row>
                <el-col :span="12">
                    <el-tree
                        :data="treeData"
                        :props="defaultProps"
                        node-key="id"
                        show-checkbox
                        default-expand-all
                        :default-checked-keys="defaultCheckedKeys"
                        :expand-on-click-node="false"
                        ref="treeRef"
                    >
                    </el-tree>
                </el-col>
            </el-row>
            <span slot="footer" class="dialog-footer">
                <el-button @click="setRightDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="allotRights">确 定</el-button>
            </span>
        </el-dialog>

    </div>
</template>

<script>
export default {
  // 数据
  data () {
    return {
      // 角色列表
      roleList: [],
      // 分配权限对话框是否可见
      setRightDialogVisible: false,
      // 树形控件数据
      treeData: [],
      // 树形控件默认属性
      defaultProps: {
        children: 'children',
        label: 'authName'
      },
      // 树形控件默认选中的节点
      defaultCheckedKeys: [],
      // 分配权限列表
      rightsList: [],
      // 当前选中的角色
      currentRole: {}

    }
  },
  // 方法
  methods: {
    // 获取角色列表
    async getRoleList () {
      const { data: res } = await this.$http.get('roles')
      if (res.meta.status !== 200) return this.$message.error('获取角色列表失败！')
      this.roleList = res.data
    },
    // 删除权限
    async removeRight (role, rightId) {
      // 1. 弹出确认框
      const confirmResult = await this.$confirm('此操作将永久删除该权限, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)
      // 2. 判断用户是否点击了取消按钮
      if (confirmResult === 'cancel') return this.$message.info('已取消删除')
      // 3. 发送请求
      const { data: res } = await this.$http.delete(`roles/${role.id}/rights/${rightId}`)
      if (res.meta.status !== 200) return this.$message.error('删除权限失败！')
      this.$message.success('删除权限成功！')
      // 4. 重新获取角色列表
      //   this.getRoleList()
      role.children = res.data // 防止整个页面重新渲染
    },
    // 展示分配权限的对话框
    showSetRightDialog (role) {
      // 1. 显示对话框
      this.setRightDialogVisible = true
      // 2. 获取所有权限列表
      this.getAllRightsList()
      // 3. 获取当前角色的权限列表
      this.getRightsByRoleId(role.id)
      // 4. 保存当前角色的信息
      this.currentRole = role
      // 将角色所有三级节点的id保存到数组中
      this.getChildren(role, this.defaultCheckedKeys)
    },

    // 获取所有权限列表
    async getAllRightsList () {
      const { data: res } = await this.$http.get('rights/tree')
      if (res.meta.status !== 200) return this.$message.error('获取权限列表失败！')
      this.treeData = res.data
    },

    // 获取当前角色的权限列表
    async getRightsByRoleId (roleId) {
      const { data: res } = await this.$http.get(`roles/${roleId}`)
      if (res.meta.status !== 200) return this.$message.error('获取权限列表失败！')
      this.rightsList = res.data
    },
    // 递归获取角色所有三级节点
    getChildren (node, arr) {
      // 包含子节点，不是三级节点
      if (node.children) {
        node.children.forEach(item => {
          this.getChildren(item, arr)
        })
      } else {
        arr.push(node.id)
      }
    },

    // 分配权限对话框关闭时触发
    setRightDialogClosed () {
      // 1. 清空数组
      this.defaultCheckedKeys = []
      // 2. 清空数组
      this.rightsList = []
    },

    // 分配权限
    async allotRights () {
      // 1. 获取当前角色的id
      const roleId = this.currentRole.id
      // 2. 获取当前选中或半选中的权限的id
      const rids = [...this.$refs.treeRef.getCheckedKeys(), ...this.$refs.treeRef.getHalfCheckedKeys()]
      const idStr = rids.join(',')
      // 3. 发送请求
      const { data: res } = await this.$http.post(`roles/${roleId}/rights`, {
        rids: idStr
      })
      if (res.meta.status !== 200) return this.$message.error('分配权限失败！')
      this.$message.success('分配权限成功！')
      // 4. 关闭对话框
      this.setRightDialogVisible = false
      // 5. 重新获取角色列表
      this.getRoleList()
    }

  },
  // 初始化
  created () {
    this.getRoleList()
  }
}
</script>

<style lang="less" scoped>
    .el-tag{
        margin: 7px;
    }
    .bdtop {
        border-top: 1px solid #eee;
    }
    .bdbottom {
        border-bottom: 1px solid #eee;
    }

    /* 纵向剧中对齐 */
    .vcenter{
        display: flex;
        align-items: center;
    }

</style>
