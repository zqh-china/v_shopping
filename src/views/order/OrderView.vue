<template>
    <div>
        <!-- 面包屑导航 -->
      <el-breadcrumb separator-class="el-icon-arrow-right">
        <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item>订单管理</el-breadcrumb-item>
        <el-breadcrumb-item>订单列表</el-breadcrumb-item>
      </el-breadcrumb>
      <!--卡片视图-->
      <el-card>
        <el-row>
            <el-col :span="8">
                <el-input>
                    <el-button slot="append" icon="el-icon-search"></el-button>
                </el-input>
            </el-col>
        </el-row>
        <el-table :data="orderList" style="width: 100%" border stripe>
            <el-table-column type="index" label="序号" width="50"></el-table-column>
            <el-table-column prop="order_number" label="订单编号" width="180"></el-table-column>
            <el-table-column prop="order_price" label="价格" width="180">
            </el-table-column>
            <el-table-column prop="pay_status" label="是否付款" width="180">
                <template slot-scope="scope">
                    <el-tag v-if="scope.row.pay_status === '0'" type="danger">未付款</el-tag>
                    <el-tag v-else type="success">已付款</el-tag>
                </template>
            </el-table-column>
            <el-table-column prop="is_send" label="是否发货">
              <template slot-scope="scope">
                <el-tag v-if="scope.row.is_send === '否'" type="danger">未发货</el-tag>
                <el-tag v-else type="success">已发货</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="create_time" label="下单时间">
              <template slot-scope="scope">
                {{ scope.row.create_time | dateFormat }}
              </template>
            </el-table-column>
            <el-table-column label="操作">
              <template>
                <el-button type="warning" size="mini" icon="el-icon-edit" @click="showAddrDialog"></el-button>
                <el-button type="primary" size="mini" icon="el-icon-location" @click="showProgressDialog"></el-button>
              </template>
            </el-table-column>
        </el-table>
        <!--分页-->
        <el-pagination
          background
          layout="total, sizes, prev, pager, next, jumper"
          :page-sizes="[5, 10, 15]"
          :total="total"
          :page-size="queryInfo.pagesize"
          :current-page.sync="queryInfo.pagenum"
          @current-change="handleCurrentChange"
          @size-change="handleSizeChange"
        ></el-pagination>
      </el-card>
      <!--修改地址对话框-->
      <el-dialog title="修改地址" :visible.sync="addrVisible" width="50%">
        <el-form :model="addrForm" :rules="addrFormRules" label-width="120px" >
          <el-form-item label="省市区/县" prop="address1">
            <!-- <el-input v-model="addrForm.address1"></el-input> -->
            <v-distpicker v-model="addrForm.address1" :placeholders="placeholders" style="width: 360px;"></v-distpicker>
          </el-form-item>
          <el-form-item label="详细地址" prop="address2">
            <el-input v-model="addrForm.address2"></el-input>
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button @click="addrVisible = false">取 消</el-button>
          <el-button type="primary" @click="addrVisible = false">确 定</el-button>
        </span>
      </el-dialog>
      <!-- 展示物流进度对话框 -->
      <el-dialog title="物流进度" :visible.sync="progressVisible" width="50%">
        <el-steps :active="progressActive" finish-status="success" align-center>
          <el-step title="已下单"></el-step>
          <el-step title="已发货"></el-step>
          <el-step title="已签收"></el-step>
        </el-steps>
        <span slot="footer" class="dialog-footer">
          <el-button @click="progressVisible = false">取 消</el-button>
          <el-button type="primary" @click="progressVisible = false">确 定</el-button>
        </span>
      </el-dialog>
    </div>
</template>

<script>
import VDistpicker from 'v-distpicker'
export default {
  components: {
    VDistpicker
  },
  data () {
    return {
      // 查询参数
      queryInfo: {
        query: '',
        pagenum: 1,
        pagesize: 10
      },
      // 订单列表数据
      orderList: [],
      // 总条数
      total: 0,
      // 修改地址对话框可见
      addrVisible: false,
      // 修改地址表单数据
      addrForm: {
        address1: [],
        address2: ''
      },
      // 表单验证规则
      addrFormRules: {
        address1: [
          { required: true, message: '请选择省市区', trigger: 'blur' }
        ],
        address2: [
          { required: true, message: '请输入详细地址', trigger: 'blur' }
        ]
      },
      // 省市区选择器的占位符
      placeholders: {
        province: '省',
        city: '市',
        area: '区'
      },
      // 展示进度对话框可见
      progressVisible: false,
      // 省市信息
      cityData: {
        province: '',
        city: '',
        area: ''
      },
      // 物流信息
      progressInfo: [],
      // 当前进度
      progressActive: 0
    }
  },
  methods: {
    // 获取订单列表数据
    async getOrderList () {
      const { data: res } = await this.$http.get('orders', {
        params: this.queryInfo
      })
      if (res.meta.status !== 200) return this.$message.error('获取订单列表失败！')
      this.orderList = res.data.goods
      this.total = res.data.total
    },
    // 分页器页码改变
    handleCurrentChange (newPage) {
      this.queryInfo.pagenum = newPage
      this.getOrderList()
    },
    // 分页器每页条数改变
    handleSizeChange (newSize) {
      this.queryInfo.pagesize = newSize
      this.getOrderList()
    },
    // 显示修改地址对话框
    showAddrDialog () {
      this.addrVisible = true
    },
    // 显示修改物流进度对话框
    showProgressDialog () {
      // 获取物流信息
      this.getProgress()
      this.progressVisible = true
    },
    // 获取物流信息
    async getProgress () {
      // TODO: 这里有问题，触发后直接使得服务器崩溃
      const { data: res } = await this.$http.get('kuaidi/804909574412544580')
      if (res.status !== 200) return this.$message.error('获取物流信息失败！')
      this.progressInfo = res.data
      console.log(this.progressInfo)
    }
  },
  computed: {
  },
  created () {
    this.getOrderList()
  }
}
</script>

<style lang="less" scoped>
  label {
    width: 150px !important;
  }
</style>
