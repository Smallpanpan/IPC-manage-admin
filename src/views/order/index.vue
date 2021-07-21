<template>
  <div class="app-container calendar-list-container">
    <div class="filter-container">

      <el-select v-model="listQuery.typeId" clearable class="filter-item" style="width: 130px" placeholder="主机类型">
        <el-option v-for="item in typeLists" :key="item.typeId" :label="item.serverName" :value="item.typeId"/>
      </el-select>
      <el-input v-model="listQuery.serverName" style="width: 250px;" class="filter-item" placeholder="主机名称" @keyup.enter.native="handleFilter"/>
      <el-input v-model="listQuery.serverSite" style="width: 250px;" class="filter-item" placeholder="连接地址" @keyup.enter.native="handleFilter"/>

      <el-button v-waves class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">搜索</el-button>
      <el-button class="filter-item" style="margin-left: 10px;" type="primary" icon="el-icon-edit" @click="handleCreate">创建</el-button>
    </div>
    <el-table v-loading="listLoading" :key="tableKey" :data="list" element-loading-text="给我一点时间" border fit highlight-current-row style="width: 100%">

      <el-table-column align="center" label="类别" width="150">
        <template slot-scope="scope">
          <span>{{ scope.row.serverType }}</span>
        </template>
      </el-table-column>

      <el-table-column align="center" width="150" label="主机名称">
        <template slot-scope="scope">
          <span>{{ scope.row.serverName }}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" label="连接地址">
        <template slot-scope="scope">
          <span>{{ scope.row.ipconfig }}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" label="端口">
        <template slot-scope="scope">
          <span>{{ scope.row.port }}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" label="地址">
        <template slot-scope="scope">
          <span>{{ scope.row.serverSite }}</span>
        </template>
      </el-table-column>
      <el-table-column class-name="status-col" label="状态" width="100">
        <template slot-scope="scope">
          <span>{{ scope.row.progress }}</span>
        </template>
      </el-table-column>

      <el-table-column align="center" label="操作" width="400">
        <template slot-scope="scope">
          <el-button size="small" type="danger" @click="getLogs(scope.row)">查看日志
          </el-button>
          <el-button size="small" type="danger" @click="editDate(scope.row)">编辑
          </el-button>
          <el-button size="small" type="danger" @click="delDate(scope.row)">刪除
          </el-button>
          <el-button size="small" type="primary" @click="openConsole(scope.row)">Console
          </el-button>
        </template>
      </el-table-column>

    </el-table>

    <div v-show="!listLoading" class="pagination-container">
      <el-pagination
        :current-page.sync="listQuery.page"
        :page-sizes="[10,20,30, 50]"
        :page-size="listQuery.limit"
        :total="total"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"/>
    </div>

    <el-dialog :visible.sync="dialogCreate" title="创建主机" top="5vh" custom-class="createDig">
      <el-form ref="dataForm" :rules="rules" :model="createList" label-position="left" label-width="120px" style="width: 400px; margin-left:20px;">
        <el-form-item label="主机类型" prop="typeId" >
          <el-select v-model="createList.typeId" class="filter-item" placeholder="Please select">
            <el-option v-for="item in typeLists" :key="item.typeId" :label="item.serverName" :value="item.typeId"/>
          </el-select>
        </el-form-item>
        <el-form-item label="主机名称" prop="serverName">
          <el-input v-model="createList.serverName"/>
        </el-form-item>
        <el-form-item label="主机位置" prop="serverSite">
          <el-input v-model="createList.serverSite" />
        </el-form-item>
        <el-form-item label="ip地址" prop="ipconfig">
          <el-input v-model="createList.ipconfig" />
        </el-form-item>
        <el-form-item label="端口" prop="port">
          <el-input v-model="createList.port" />
        </el-form-item>
        <el-form-item label="数据库端口" prop="dbPort">
          <el-input v-model="createList.dbPort" />
        </el-form-item>
        <el-form-item label="用户名" prop="userName">
          <el-input v-model="createList.userName" />
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="createList.password" />
        </el-form-item>
        <el-form-item label="SN码" prop="snNumber">
          <el-input v-model="createList.snNumber" />
        </el-form-item>
        <el-form-item label="进度备注" prop="progress">
          <el-input v-model="createList.progress" />
        </el-form-item>
        <el-form-item label="日志目录" prop="logSite">
          <el-input v-model="createList.logSite" />
        </el-form-item>
        <el-form-item label="异常目录" prop="errorSite">
          <el-input v-model="createList.errorSite" />
        </el-form-item>
        <el-form-item label="日志名称" prop="logName">
          <el-input v-model="createList.logName" />
        </el-form-item>
        <el-form-item label="异常名称" prop="errorName">
          <el-input v-model="createList.errorName" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="clearList()">清空</el-button>
        <el-button @click="exitList()">取消</el-button>
        <el-button type="primary" @click="createData()">确认</el-button>
      </div>
    </el-dialog>

    <el-dialog :visible.sync="dialogEdit" title="编辑">
      <el-form ref="editForm" :rules="editRules" :model="editList" label-position="left" label-width="120px" style="width: 400px; margin-left:50px;">
        <el-form-item label="ip地址" prop="ipconfig">
          <el-input v-model="editList.ipconfig" />
        </el-form-item>
        <el-form-item label="端口" prop="port">
          <el-input v-model="editList.port" />
        </el-form-item>
        <el-form-item label="数据库端口" prop="dbPort">
          <el-input v-model="editList.dbPort" />
        </el-form-item>
        <el-form-item label="用户名" prop="userName">
          <el-input v-model="editList.userName" />
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="editList.password" />
        </el-form-item>
        <el-form-item label="进度备注" prop="progress">
          <el-input v-model="editList.progress" />
        </el-form-item>
        <el-form-item label="日志目录" prop="logSite">
          <el-input v-model="editList.logSite" />
        </el-form-item>
        <el-form-item label="日志名称" prop="logName">
          <el-input v-model="editList.logName" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogEdit = false">取消</el-button>
        <el-button type="primary" @click="editConfim()">确认</el-button>
      </div>
    </el-dialog>

    <el-dialog :visible.sync="dialogLog" title="日志记录" width="60%" top="5vh" custom-class="createDig">
      <span>{{ logs }}</span>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogLog = false">取消</el-button>
        <el-button type="primary" @click="dialogVisible = false">刷新</el-button>
      </span>
    </el-dialog>

    <consoles ref="console"/>
  </div>
</template>

<script>
import { fetchList, fetchOrder, updateOrderStatus, addList, editList, delList, getLog, typeList } from '@/api/order'
import waves from '@/directive/waves/index.js' // 水波纹指令
import { parseTime } from '@/utils'
import Consoles from '../console/console'

export default {
  name: 'OrderList',
  directives: {
    waves
  },
  components: {
    Consoles
  },
  filters: {
    timeFilter(time) {
      return parseTime(time, 'YYYY-MM-DD HH:mm:ss')
    },
    statusFilter(status) {
      const statusMap = {
        P: 'warning',
        S: 'success',
        C: 'info'
      }
      return statusMap[status]
    },
    billStatusFilter(status) {
      const statusMap = {
        P: '工控机',
        S: '前端服务器'
      }
      return statusMap[status]
    }
  },
  data() {
    return {
      opBy: this.$store.state.user.name,
      list: null,
      total: null,
      listLoading: true,
      listQuery: {
        page: 1,
        limit: 20,
        serverName: '',
        serverSite: '',
        typeId: ''
      },
      dialogStatus: '',
      dialogPvVisible: false,
      pvData: [],
      tableKey: 0,
      dialogCreate: false, // 创建弹框
      dialogLog: false,
      dialogEdit: false, // 编辑弹框
      editList: {}, // 编辑列表
      typeLists: {}, // 类型列表
      logs: '', // 日志信息
      info: {}, // 工控机列表信息
      createList: { // 创建列表
        serverType: '',
        serverName: '',
        typeId: '',
        serverSite: '',
        ipconfig: '',
        userName: '',
        port: '',
        password: '',
        dbPort: '',
        snNumber: '',
        progress: '',
        logSite: 'node/logs',
        errorSite: 'node/logs',
        logName: 'app-out.log',
        errorName: 'app-err.log'
      },
      rules: {
        typeId: [{ required: true, message: '请选择类别', trigger: 'change' }],
        serverName: [{ required: true, message: '请输入主机名称', trigger: 'blur' }],
        ipconfig: [{ required: true, message: '请输入备注', trigger: 'blur' }],
        serverSite: [{ required: true, message: '请输入主机位置', trigger: 'blur' }],
        userName: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
        port: [{ required: true, message: '请输入端口', trigger: 'blur' }],
        password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
        dbPort: [{ required: true, message: '请输入数据端口', trigger: 'blur' }],
        snNumber: [{ required: true, message: '请输入SN码', trigger: 'blur' }]
      },
      editRules: {
        ipconfig: [{ required: true, message: '请输入备注', trigger: 'blur' }],
        userName: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
        port: [{ required: true, message: '请输入端口', trigger: 'blur' }],
        password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
        dbPort: [{ required: true, message: '请输入数据端口', trigger: 'blur' }]
      }
    }
  },
  created() {
    this.getList()
    this.getType()
  },
  methods: {
    // 获取当前服务器列表
    getList() {
      this.listLoading = true
      fetchList(this.listQuery).then(data => {
        this.list = data.result
        this.total = data.total
        this.listLoading = false
      })
    },
    // 获取主机类型
    getType() {
      typeList().then(res => {
        if (res) {
          this.typeLists = res.result
        }
      })
    },
    handleFilter() {
      this.listQuery.page = 1
      this.getList()
    },
    handleSizeChange(val) {
      this.listQuery.limit = val
      this.getList()
    },
    handleCurrentChange(val) {
      this.listQuery.page = val
      this.getList()
    },
    // 打开Console界面
    openConsole(row) {
      const console = this.$refs.console // 获取子组件语句柄
      console.open(row)
    },
    handleCreate() {
      this.dialogCreate = true
      // this.$nextTick(() => {
      //   this.$refs['dataForm'].clearValidate()
      // })
    },
    // 创建主机列表
    createData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          this.createList.serverType = this.typeLists.filter(item => item.typeId == this.createList.typeId)[0].serverName
          // console.log('valid',this.createList);
          addList(this.createList).then(res => {
            this.getList()
            this.dialogCreate = false
            this.$notify({
              title: '成功',
              message: res.msg,
              type: 'success',
              duration: 2000
            })
            this.clearList()
          }).catch(err => {
            // TODO 提示网络有误
          })
        }
      })
    },
    // 清空新增列表
    clearList() {
      this.createList = {
        serverType: '',
        serverName: '',
        typeId: '',
        serverSite: '',
        ipconfig: '',
        userName: '',
        port: '',
        password: '',
        dbPort: '',
        snNumber: '',
        progress: '',
        logSite: 'node/logs',
        errorSite: 'node/logs',
        logName: 'app-out.log',
        errorName: 'app-err.log'
      }
    },
    exitList() {
      this.dialogCreate = false
      this.clearList()
    },
    // 编辑主机列表
    editDate(row) {
      this.editList = row
      this.dialogEdit = true
    },
    editConfim() {
      this.$refs['editForm'].validate((valid) => {
        if (valid) {
          editList(this.editList).then(res => {
            this.getList()
            this.dialogEdit = false
            this.$notify({
              title: '成功',
              message: res.msg,
              type: 'success',
              duration: 2000
            })
          }).catch(err => {
            // TODO 提示网络有误
          })
        }
      })
    },
    // 刪除列表
    delDate(row) {
      this.$confirm('您确定要操作吗？操作后不可恢复!', '提示', { type: 'warning' }).then(() => {
        delList({ id: row.id }).then(data => {
          this.$message({
            message: data.msg,
            type: 'success'
          })
          this.getList()
        })
      }).catch((error) => {})
    },
    getLogs(row) {
      const { id } = row
      getLog({ type: 'log', id }).then(res => {
        if (res && res.code == 200) {
          this.logs = res.result
          this.dialogLog = true
        }
      })
    }
  }
}
</script>
<style rel="stylesheet/scss" lang="scss" >
.createDig{
  max-height:90%;
  overflow:auto;
  word-wrap:break-word;
}
</style>
