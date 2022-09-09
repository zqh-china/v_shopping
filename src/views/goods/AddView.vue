<template>
    <div>
        <!--面包屑导航-->
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>商品管理</el-breadcrumb-item>
            <el-breadcrumb-item>添加商品</el-breadcrumb-item>
        </el-breadcrumb>
        <!--卡片视图-->
        <el-card>
            <!--提示区域-->
            <el-alert
                    title="添加商品信息"
                    type="info"
                    :closable="false"
                    show-icon
                    center>
            </el-alert>
            <!--步骤条 -0是为了转换为number-->
            <el-steps
            :active="activeIndex-0"
            :space="200"
            finish-status="success"
            align-center
            >
                <el-step title="基本信息"></el-step>
                <el-step title="商品参数"></el-step>
                <el-step title="商品属性"></el-step>
                <el-step title="商品图片"></el-step>
                <el-step title="商品内容"></el-step>
                <el-step title="完成"></el-step>
            </el-steps>
            <!--表单-->
            <el-form
            :model="addForm"
            :rules="addFormRules"
            ref="addFormRef"
            label-width="100px"
            label-position="top"
            >
                <!--竖向tab标签-->
                <el-tabs
                :tab-position="'left'"
                v-model="activeIndex"
                :before-leave="beforeTabLeave"
                @tab-click="handleTabClick"
                >
                <el-tab-pane label="基本信息" name="0">
                    <!--表单item-->
                    <el-form-item label="商品名称" prop="goods_name">
                        <el-input v-model="addForm.goods_name"></el-input>
                    </el-form-item>
                    <el-form-item label="商品价格" prop="goods_price">
                        <el-input v-model="addForm.goods_price"></el-input>
                    </el-form-item>
                    <el-form-item label="商品数量" prop="goods_number">
                        <el-input v-model="addForm.goods_number"></el-input>
                    </el-form-item>
                    <el-form-item label="商品重量" prop="goods_weight">
                        <el-input v-model="addForm.goods_weight"></el-input>
                    </el-form-item>
                    <el-form-item label="商品分类" prop="goods_cat">
                        <el-cascader
                                v-model="addForm.goods_cat"
                                :options="cateList"
                                :props="cateProps"
                                placeholder="请选择商品分类"
                                @change="handleCateChange"
                        >
                        </el-cascader>
                    </el-form-item>
                </el-tab-pane>
                <el-tab-pane label="商品参数" name="1">
                  <el-form-item :label="item.attr_name" v-for="item in manyTableData" :key="item.attr_id">
                    <!--复选框-->
                    <el-checkbox-group v-model="item.attr_vals">
                      <el-checkbox v-for="(cb, i) in item.attr_vals" :label="cb" :key="i" border></el-checkbox>
                    </el-checkbox-group>
                  </el-form-item>
                </el-tab-pane>
                <el-tab-pane label="商品属性" name="2">
                  <el-form-item :label="item.attr_name" v-for="item in onlyTableData" :key="item.attr_id">
                    <el-input v-model="item.attr_vals"></el-input>
                  </el-form-item>
                </el-tab-pane>
                <el-tab-pane label="商品图片" name="3">
                  <!--图片上传-->
                  <el-upload
                  :action="uploadURL"
                  :on-preview="handlePreview"
                  :on-remove="handleRemove"
                  :on-success="handleSuccess"
                  :headers="headerObj"
                  list-type="picture"
                  >
                    <el-button type="primary" size="small">点击上传</el-button>
                  </el-upload>
                </el-tab-pane>
                <el-tab-pane label="商品内容" name="4">
                  <quill-editor v-model="addForm.goods_introduce"></quill-editor>
                  <el-button type="primary" class="btn-add" @click="addGoods">添加商品</el-button>
                </el-tab-pane>
                </el-tabs>
            </el-form>

        </el-card>
        <!--图片预览对话框-->
        <el-dialog title="图片预览" :visible.sync="previewVisible">
            <img width="50%" :src="previewPath" alt="" class="preview-img">
        </el-dialog>

    </div>
</template>

<script>
import _ from 'lodash'

export default {
  data () {
    return {
      // 步骤条的激活状态
      activeIndex: '0',
      // 商品分类的数据
      cateList: [],
      // 商品分类的配置
      cateProps: {
        value: 'cat_id',
        label: 'cat_name',
        children: 'children',
        expandTrigger: 'hover'
        // checkStrictly: true
      },
      // 动态参数数据
      manyTableData: [],
      // 静态属性数据
      onlyTableData: [],
      // 图片上传地址
      uploadURL: this.$http.defaults.baseURL + 'upload',
      // 上传图像的头部数据
      headerObj: {
        Authorization: window.sessionStorage.getItem('token')
      },
      // 预览图片路径
      previewPath: '',
      previewVisible: false,
      // 表单数据
      addForm: {
        goods_name: '',
        goods_price: 0,
        goods_number: 0,
        goods_weight: 0,
        goods_cat: [],
        pics: [],
        goods_introduce: '',
        attrs: []
      },
      // 表单验证规则
      addFormRules: {
        goods_name: [
          { required: true, message: '请输入商品名称', trigger: 'blur' }
        ],
        goods_price: [
          { required: true, message: '请输入商品价格', trigger: 'blur' }
        ],
        goods_number: [
          { required: true, message: '请输入商品数量', trigger: 'blur' }
        ],
        goods_weight: [
          { required: true, message: '请输入商品重量', trigger: 'blur' }
        ],
        goods_cat: [
          { required: true, message: '请选择商品分类', trigger: 'change' }
        ]
      }

    }
  },
  methods: {
    // 获取分类数据
    async getCateList () {
      const { data: res } = await this.$http.get('categories', {
        params: {
          type: 3,
          pagenum: 1,
          pagesize: 100
        }
      })
      if (res.meta.status !== 200) return this.$message.error('获取分类数据失败！')
      // console.log(res)
      this.cateList = res.data.result
    },
    // 监听商品分类的变化
    handleCateChange () {
      // 只允许选择三级分类
      if (this.addForm.goods_cat.length !== 3) {
        this.addForm.goods_cat = []
        return this.$message.warning('只允许选择三级分类')
      }
    },
    // 阻止tab标签的切换
    beforeTabLeave (activeName, oldActiveName) {
      if (oldActiveName === '0' && this.addForm.goods_cat.length !== 3) {
        this.$message.warning('请先完成本页内容')
        return false
      }
    },
    // 处理tab点击事件
    handleTabClick () {
      // 动态参数面板
      if (this.activeIndex === '1') {
        // 获取动态参数数据
        this.getAttrList('many')
      } else if (this.activeIndex === '2') {
        // 获取静态属性数据
        this.getAttrList('only')
      }
    },
    // 获取动态参数数据
    async getAttrList (attrSel) {
      const { data: res } = await this.$http.get(`categories/${this.cateId}/attributes`, {
        params: {
          sel: attrSel
        }
      })
      if (res.meta.status !== 200) return this.$message.error('获取动态参数数据失败！')
      if (attrSel === 'only') {
        this.onlyTableData = res.data
      } else {
        res.data.forEach(item => {
          item.attr_vals = item.attr_vals ? item.attr_vals.split(',') : []
        })
        this.manyTableData = res.data
      }
    },
    // 处理图片预览
    handlePreview (file) {
      this.previewPath = file.response.data.url
      this.previewVisible = true
    },
    // 处理图片删除
    handleRemove (file) {
      // 获取要删除的图片的临时路径
      const filePath = file.response.data.tmp_path
      // 从addForm的pics中找到其索引
      const i = this.addForm.pics.findIndex(x => x.pic === filePath)
      this.addForm.pics.splice(i, 1)
    },
    // 处理上传成功
    handleSuccess (response) {
      // 图片信息
      const picInfo = {
        pic: response.data.tmp_path
      }

      this.addForm.pics.push(picInfo)
    },
    // 添加商品
    async addGoods () {
      // 校验表单
      this.$refs.addFormRef.validate(async valid => {
        if (!valid) return this.$message.warning('请先完成本页内容')
        // 深拷贝
        const form = _.cloneDeep(this.addForm)
        form.goods_cat = this.addForm.goods_cat.join(',')
        // 处理动态参数
        this.manyTableData.forEach(item => {
          const newInfo = {
            attr_id: item.attr_id,
            attr_value: item.attr_vals.join(' ')
          }
          this.addForm.attrs.push(newInfo)
        })
        // 处理静态参数
        this.onlyTableData.forEach(item => {
          const newInfo = {
            attr_id: item.attr_id,
            attr_value: item.attr_vals
          }
          this.addForm.attrs.push(newInfo)
        })
        form.attrs = this.addForm.attrs
        // 发送请求
        const { data: res } = await this.$http.post('goods', form)
        if (res.meta.status !== 201) return this.$message.error('添加商品失败！')
        this.$message.success('添加商品成功！')
        this.$router.push('/goods')
      })
    }

  },
  created () {
    this.getCateList()
  },
  computed: {
    cateId () {
      return this.addForm.goods_cat.length === 3 ? this.addForm.goods_cat[2] : null
    }
  }
}

</script>

<style lang="less" scoped>
.el-steps {
    margin: 20px;
}
.el-step__title {
    font-size: 13px;
}
.el-checkbox {
  margin: 0 5px 0 0 !important;
}
.preview-img {
  width: 100%;
}

.btn-add {
  margin-top: 15px;
}
</style>
