<template>
    <div class="home">
        <!-- El容器 -->
        <el-container class="home-container">
            <!--头部-->
            <el-header>
                <div>
                    <img src="../assets/index.png" alt="logo" class="logo">
                    <span class="title">Vue Element Admin</span>
                </div>
                <button type="info" @click="logout">退出登录</button>

            </el-header>
            <!--主体-->
            <el-container>
                <!--左侧-->
                <el-aside :width="isCollapse ? '64px' : '200px'">
                    <div class="toggle-button" @click="toggleCollapse">
                        <i :class="isCollapse ? 'el-icon-arrow-right' : 'el-icon-arrow-left'"></i>
                    </div>
                    <!--侧边栏菜单-->
                    <el-menu
                            background-color="#313743"
                            text-color="#fff"
                            active-text-color="#359bff"
                            unique-opened
                            :collapse="isCollapse"
                            :collapse-transition="false"
                            :router="true"
                            :default-active="activePath"
                            >
                        <!--这里index只接收字符串,所以+''使其成为字符串-->
                        <el-submenu :index="item.id+''" v-for="item in menuList" :key="item.id">
                            <template slot="title">
                                <i :class="iconsObj[item.id]"></i>
                                <span>{{ item.authName }}</span>
                            </template>
                            <el-menu-item :index="'/'+subItem.path" v-for="subItem in item.children" :key="subItem.id" @click="saveNavState('/'+subItem.path)">
                                <template slot="title">
                                    <i class="el-icon-menu"></i>
                                    <span>{{ subItem.authName }}</span>
                                </template>
                            </el-menu-item>
                        </el-submenu>
                    </el-menu>

                </el-aside>
                <!--中间-->
                <el-main>
                  <!--路由出口-->
                  <router-view></router-view>
                </el-main>
            </el-container>
        </el-container>
    </div>
</template>

<script>
export default {
// 组件创建后立即获取左侧菜单
  created () {
    this.getMenuList()
    this.activePath = window.sessionStorage.getItem('activePath')
  },
  data () {
    return {
      // 左侧菜单
      menuList: [],
      iconsObj: {
        125: 'iconfont icon-yonghuguanli',
        103: 'iconfont icon-quanxianguanli',
        101: 'iconfont icon-shangpinguanli',
        102: 'iconfont icon-dingdanguanli',
        145: 'iconfont icon-shujutongji'
      },
      // 是否折叠
      isCollapse: false,
      // 当前激活的菜单
      activePath: '/users'
    }
  },
  methods: {
    // 获取左侧菜单
    async getMenuList () {
      const { data: res } = await this.$http.get('menus')
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
      this.menuList = res.data
    },
    // 退出登录
    logout () {
      this.$http.post('/logout').then(res => {
        this.$router.push('/login')
      })
    },
    // 收缩左侧菜单
    toggleCollapse () {
      this.isCollapse = !this.isCollapse
    },
    // 保存导航状态
    saveNavState (activePath) {
      window.sessionStorage.setItem('activePath', activePath)
      this.activePath = activePath
    }
  }
}
</script>

<style lang="less" scoped>
    .el-header {
        background-color: #2e3436;
        display: flex;
        justify-content: space-between;
        padding-left: 0;
        align-items: center;
        color: #fff;
        font-size: 20px;
        > div {
            display: flex;
            align-items: center;
            > img {
                width: 40px;
                height: 40px;
                margin-right: 10px;
            }
            > span {
                margin-left: 15px;
            }
        }
    }
    .el-aside {
        background-color: #313743;
        .el-menu {
            border-right: none;
        }
    }
    .el-main {
        background-color: #e9edf1;
    }
    .home-container {
        height: 100%;
    }
    .home {
        height: 100%;
    }
    .iconfont {
        font-size: 20px;
        margin-right: 10px;
    }
    .toggle-button {
        width: 100%;
        text-align: center;
        color: #4A5064;
        cursor: pointer;
        font-size: 20px;
        line-height: 20px;
        letter-spacing: 0.2em;
    }
</style>
