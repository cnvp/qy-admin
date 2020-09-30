<template>
  <div class="app-container">
    <div class="filter-container">
      <el-button class="filter-item" style="margin-left: 10px;" type="primary" icon="el-icon-edit" @click="handleCreate">
        创建模型
      </el-button>
      <el-table
        :key="tableKey"
        v-loading="listLoading"
        :data="list"
        fit
        highlight-current-row
        style="width: 100%;"
        @sort-change="sortChange"
      >
        <el-table-column label="排序" align="center" width="100">
          <template slot-scope="scope">
            <el-input v-model="scope.row.listorder" />
          </template>
        </el-table-column>
        <el-table-column label="模型名称" align="center">
          <template slot-scope="scope">
            <span>{{ scope.row.title }}</span>
          </template>
        </el-table-column>
        <el-table-column label="模型结构" align="center">
          <template slot-scope="scope">
            <span>{{ type_arr[scope.row.type] }}</span>
          </template>
        </el-table-column>
        <el-table-column label="显示字段" align="center">
          <template slot-scope="scope">
            <span>{{ scope.row.listfields }}</span>
          </template>
        </el-table-column>
        <el-table-column label="模型描述" align="center">
          <template slot-scope="scope">
            <span>{{ scope.row.description }}</span>
          </template>
        </el-table-column>
        <el-table-column v-if="is_admin" label="操作" align="center" width="260" class-name="small-padding fixed-width">
          <template slot-scope="scope">
            <el-button type="primary" size="small" @click="fieldEdit(scope.row)">
              模型字段
            </el-button>
            <el-button type="primary" size="mini" @click="handleUpdate(scope.row)">
              修改
            </el-button>
            <el-button size="mini" type="danger" @click="deleteBtn(scope.$index, scope.row)">
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-button v-if="list.length > 0" class="filter-item" style="margin-left: 10px; margin-top: 15px;" type="primary" @click="handleSort">
        排序
      </el-button>

      <pagination v-show="total>0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="getModuleList" />
      <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible">
        <el-form ref="dataForm" :rules="rules" :model="temp" label-position="left" label-width="100px" style="width: 400px; margin-left:50px;">
          <el-form-item label="Type" prop="type">
            <el-select v-model="temp.type" class="filter-item" placeholder="Please select">
              <el-option v-for="item in calendarTypeOptions" :key="item.key" :label="item.display_name" :value="item.key" />
            </el-select>
          </el-form-item>
          <el-form-item label="Date" prop="timestamp">
            <el-date-picker v-model="temp.timestamp" type="datetime" placeholder="Please pick a date" />
          </el-form-item>
          <el-form-item label="模型名称" prop="name">
            <el-input v-model="temp.name" />
          </el-form-item>
          <el-form-item label="Remark">
            <el-input v-model="temp.remark" :autosize="{ minRows: 2, maxRows: 4}" type="textarea" placeholder="Please input" />
          </el-form-item>
        </el-form>
        <div slot="footer" class="dialog-footer">
          <el-button @click="dialogFormVisible = false">
            Cancel
          </el-button>
          <el-button type="primary" @click="dialogStatus==='create'?createData():updateData()">
            Confirm
          </el-button>
        </div>
      </el-dialog>
    </div>
  </div>
</template>

<script>
import { fetchModuleList, deleteModule, updateModuleSort } from '@/api/module'
import { mapGetters } from 'vuex'
import Pagination from '@/components/Pagination'

const calendarTypeOptions = [
  { key: 'CN', display_name: 'China' },
  { key: 'US', display_name: 'USA' },
  { key: 'JP', display_name: 'Japan' },
  { key: 'EU', display_name: 'Eurozone' }
]

const calendarTypeKeyValue = calendarTypeOptions.reduce((acc, cur) => {
  acc[cur.key] = cur.display_name
  return acc
}, {})

export default {
  name: 'Module',
  components: { Pagination },
  filters: {
    statusFilter(status) {
      const statusMap = {
        published: 'success',
        draft: 'info',
        deleted: 'danger'
      }
      return statusMap[status]
    },
    typeFilter(type) {
      return calendarTypeKeyValue[type]
    }
  },
  data() {
    return {
      tableKey: 0,
      list: [],
      total: 0,
      listLoading: true,
      listQuery: {
        page: 1,
        limit: 20,
        name: ''
      },
      showReviewer: false,
      dialogFormVisible: false,
      dialogStatus: '',
      type_arr: ['文章列表', '普通', '树形'],
      textMap: {
        update: '编辑',
        create: '创建'
      },
      temp: {
        id: undefined,
        remark: '',
        timestamp: new Date(),
        name: '',
        type: '',
        status: 'published'
      },
      is_admin: false, // 判断当前角色是否为超级管理员，只有超级管理员才能修改模型
      calendarTypeOptions,
      statusOptions: ['published', 'draft', 'deleted'],
      rules: {
        type: [{ required: true, message: 'type is required', trigger: 'change' }],
        timestamp: [{ type: 'date', required: true, message: 'timestamp is required', trigger: 'change' }],
        name: [{ required: true, message: 'title is required', trigger: 'blur' }]
      }
    }
  },
  computed: {
    ...mapGetters([
      'roles'
    ])
  },
  created() {
    if (this.roles.includes('admin')) {
      this.is_admin = true
    }
  },
  mounted() {
    this.getModuleList()
  },
  methods: {
    getModuleList() {
      fetchModuleList(this.listQuery).then(data => {
        this.list = data.items
        this.total = data.total
        this.listLoading = false
      })
    },
    // 添加模型
    handleCreate() {
      // this.$store.dispatch('tagsView/addView', { name: 'CreateModule' })
      this.$router.push('/module/create')
    },
    sortChange(data) {
      const { prop, order } = data
      if (prop === 'id') {
        this.sortByID(order)
      }
    },
    // 跳转到模型字段管理
    fieldEdit(row) {
      console.log(row)
      this.$router.push('/module/field/' + row.id)
    },
    handleUpdate(row) {
      this.$router.push('/module/edit/' + row.id)
      // this.temp = Object.assign({}, row)
      // this.temp.timestamp = new Date(this.temp.timestamp)
      // this.dialogStatus = 'update'
      // this.dialogFormVisible = true
      // this.$nextTick(() => {
      //   this.$refs['dataForm'].clearValidate()
      // })
    },
    deleteBtn(index, row) {
      this.$confirm(`确定删除${row.title || ''}模型?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        deleteModule({ moduleid: row.id }).then(data => {
          this.$notify({
            title: '成功',
            message: '删除模型成功',
            type: 'success',
            duration: 2000
          })
          this.list.splice(index, 1)
        })
      }).catch((err) => {
        console.log(err)
      })
    },
    // 保存排序
    handleSort() {
      const sortData = this.list.map(item => {
        return {
          id: item.id,
          listorder: item.listorder
        }
      })
      updateModuleSort({ sortData }).then(data => {
        this.$notify({
          title: '成功',
          message: '排序成功',
          type: 'success',
          duration: 2000
        })
        this.list.sort((a, b) => {
          return a.listorder - b.listorder
        })
      })
    }
  }
}
</script>
