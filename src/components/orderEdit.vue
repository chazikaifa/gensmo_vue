<template>
  <el-container style="width:100%;" v-loading="pageLoading">
    <el-header>
      <div class="title">政企网络服务中台本地故障单管理系统</div>
    </el-header>
    <el-main>
      <div class="container">
        <el-row>
          <el-col :span="1"></el-col>
          <el-col :span="11">
            <div class="label">故障单编号</div>
          </el-col>
          <el-col :span="11">
            <div class="label">客户名称</div>
          </el-col>
          <el-col :span="1"></el-col>
        </el-row>
        <el-row>
          <el-col :span="1"></el-col>
          <el-col :span="11">
            <div class="content"><el-input v-model="order.id" disabled></el-input></div>
          </el-col>
          <el-col :span="11">
            <div class="content"><el-input v-model="order.name" :disabled="!edit"></el-input></div>
          </el-col>
          <el-col :span="1"></el-col>
        </el-row>

        <el-row>
          <el-col :span="1"></el-col>
          <el-col :span="11">
            <div class="label">故障发生时间</div>
          </el-col>
          <el-col :span="11">
            <div class="label">故障恢复时间</div>
          </el-col>
          <el-col :span="1"></el-col>
        </el-row>
        <el-row>
          <el-col :span="1"></el-col>
          <el-col :span="11">
            <div class="content">
              <el-date-picker 
                type="datetime" 
                style="width:100%;"
                v-model="order.start_time"
                :editable="false"
                :clearable="false"
                value-format="yyyy-MM-dd HH:mm:ss"
                @change="changeTime"
                :disabled="!edit">
              </el-date-picker>
            </div>
          </el-col>
          <el-col :span="11">
            <div class="content">
              <el-date-picker 
                type="datetime" 
                style="width:100%;"
                v-model="order.end_time"
                :editable="false"
                value-format="yyyy-MM-dd HH:mm:ss"
                @change="changeTime"
                :disabled="!edit || order.step != '结单'">
              </el-date-picker>
            </div>
          </el-col>
          <el-col :span="1"></el-col>
        </el-row>

        <el-row>
          <el-col :span="1"></el-col>
          <el-col :span="11">
            <div class="label">{{order.step=='结单'?'历时(分钟)':'目前历时(分钟)'}}</div>
          </el-col>
          <el-col :span="11">
            <div class="label">工单状态</div>
          </el-col>
          <el-col :span="1"></el-col>
        </el-row>
        <el-row>
          <el-col :span="1"></el-col>
          <el-col :span="11">
            <div class="content"><el-input v-model="order.time" disabled></el-input></div>
          </el-col>
          <el-col :span="11">
            <div class="content">
              <el-select v-model="order.step" placeholder="请选择" :disabled="!edit" @change="changeStep">
                <el-option
                  v-for="item in stepList"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value">
                </el-option>
              </el-select>
              <!-- <el-input v-model="order.step"></el-input> -->
            </div>
          </el-col>
          <el-col :span="1"></el-col>
        </el-row>

        <el-row>
          <el-col :span="1"></el-col>
          <el-col :span="22">
            <div class="label">故障简述</div>
          </el-col>
          <el-col :span="1"></el-col>
        </el-row>
        <el-row>
          <el-col :span="1"></el-col>
          <el-col :span="22">
            <div class="content"><el-input v-model="order.trouble_symptom" :disabled="!edit"></el-input></div>
          </el-col>
          <el-col :span="1"></el-col>
        </el-row>

        <el-row>
          <el-col :span="1"></el-col>
          <el-col :span="11">
            <div class="label">19工单编号</div>
          </el-col>
          <el-col :span="11">
            <div class="label">电路编号</div>
          </el-col>
          <el-col :span="1"></el-col>
        </el-row>
        <el-row>
          <el-col :span="1"></el-col>
          <el-col :span="11">
            <div class="content"><el-input v-model="order.link_id" :disabled="!edit"></el-input></div>
          </el-col>
          <el-col :span="11">
            <div class="content"><el-input v-model="order.circuit_number" :disabled="!edit"></el-input></div>
          </el-col>
          <el-col :span="1"></el-col>
        </el-row>

        <el-row>
          <el-col :span="1"></el-col>
          <el-col :span="11">
            <div class="label">客户联系方式</div>
          </el-col>
          <el-col :span="11">
            <div class="label">客户姓名</div>
          </el-col>
          <el-col :span="1"></el-col>
        </el-row>
        <el-row>
          <el-col :span="1"></el-col>
          <el-col :span="11">
            <div class="content"><el-input v-model="order.contact_number" :disabled="!edit"></el-input></div>
          </el-col>
          <el-col :span="11">
            <div class="content"><el-input v-model="order.contact_name" :disabled="!edit"></el-input></div>
          </el-col>
          <el-col :span="1"></el-col>
        </el-row>

        <el-row>
          <el-col :span="1"></el-col>
          <el-col :span="11">
            <div class="label">公司所在区域</div>
          </el-col>
          <el-col :span="11">
            <div class="label">是否故障</div>
          </el-col>
          <el-col :span="1"></el-col>
        </el-row>
        <el-row>
          <el-col :span="1"></el-col>
          <el-col :span="11">
            <div class="content">
              <el-select v-model="order.area" :clearable="true" placeholder="请选择" :disabled="!edit">
                <el-option
                  v-for="item in area"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value">
                </el-option>
              </el-select>
            </div>
          </el-col>
          <el-col :span="11">
            <div class="content">
              <el-select v-model="order.is_trouble" :clearable="true" placeholder="请选择" :disabled="!edit">
                <el-option key="1" label="是" value="1"></el-option>
                <el-option key="0" label="否" value="0"></el-option>
              </el-select>
            </div>
          </el-col>
          <el-col :span="1"></el-col>
        </el-row>

        <el-row>
          <el-col :span="1"></el-col>
          <el-col :span="11">
            <div class="label">是否对端</div>
          </el-col>
          <el-col :span="11">
            <div class="label">故障分类</div>
          </el-col>
          <el-col :span="1"></el-col>
        </el-row>
        <el-row>
          <el-col :span="1"></el-col>
          <el-col :span="11">
            <div class="content">
              <el-select v-model="order.is_remote" :clearable="true" placeholder="请选择" :disabled="!edit">
                <el-option key="1" label="是" value="1"></el-option>
                <el-option key="0" label="否" value="0"></el-option>
              </el-select>
            </div>
          </el-col>
          <el-col :span="11">
            <div class="content">
              <el-select v-model="order.trouble_class" :clearable="true" @change="troubleClassChange" placeholder="请选择" :disabled="!edit">
                <el-option
                  v-for="item in trouble_class"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value">
                </el-option>
              </el-select>
            </div>
          </el-col>
          <el-col :span="1"></el-col>
        </el-row>

        <el-row>
          <el-col :span="1"></el-col>
          <el-col :span="11">
            <div class="label">原因细化</div>
          </el-col>
          <el-col :span="11">
            <div class="label">行业类型</div>
          </el-col>
          <el-col :span="1"></el-col>
        </el-row>
        <el-row>
          <el-col :span="1"></el-col>
          <el-col :span="11">
            <div class="content">
              <el-select v-model="order.trouble_reason" :clearable="true" placeholder="请选择" :disabled="!edit">
                <el-option
                  v-for="item in trouble_reason[order.trouble_class]"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                  >
                </el-option>
              </el-select>
            </div>
          </el-col>
          <el-col :span="11">
            <div class="content">
              <el-select v-model="order.business_type" :clearable="true" placeholder="请选择" :disabled="!edit">
                <el-option
                  v-for="item in business_type"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value">
                </el-option>
              </el-select>
            </div>
          </el-col>
          <el-col :span="1"></el-col>
        </el-row>

        <el-row>
          <el-col :span="1"></el-col>
          <el-col :span="11">
            <div class="label">责任专业</div>
          </el-col>
          <el-col :span="11">
            <div class="label">客户标记</div>
          </el-col>
          <el-col :span="1"></el-col>
        </el-row>
        <el-row>
          <el-col :span="1"></el-col>
          <el-col :span="11">
            <div class="content">
              <el-select v-model="order.major" :clearable="true" placeholder="请选择" :disabled="!edit">
                <el-option
                  v-for="item in major"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value">
                </el-option>
              </el-select>
            </div>
          </el-col>
          <el-col :span="11">
            <div class="content"><el-input v-model="order.mark" disabled></el-input></div>
          </el-col>
          <el-col :span="1"></el-col>
        </el-row>

        <el-row v-if="!newOrder">
          <el-col :span="1"></el-col>
          <el-col :span="22"><div class="label">故障进展</div></el-col>
          <el-col :span="1"></el-col>
        </el-row>

        <el-row v-if="!newOrder">
          <el-col :span="1"></el-col>
          <el-col :span="22">
            <el-table 
              :data='processList'
              style="width:100%"
              size="small"
              :show-header="false"
              stripe>
              <el-table-column type="index" align="center" width="50"></el-table-column>
              <el-table-column align="center" width="95">
                <template slot-scope="scope">
                  <el-tag :type="scope.row.mark ==''?'':'warning'" v-if="!edit">
                    {{markFormatter(scope.row.mark)}}
                  </el-tag>
                  <el-select
                    size="mini"
                    v-model="scope.row.mark"
                    v-else>
                    <el-option key="" label="进展" value=""></el-option>
                    <el-option key="set_suspend" label="挂起" value="set_suspend"></el-option>
                    <el-option key="unset_suspend" label="解挂" value="unset_suspend"></el-option>
                  </el-select> 
                </template>
              </el-table-column>
              <el-table-column property="time" align="center" width="200">
                <template slot-scope="scope">
                  <el-date-picker 
                    type="datetime" 
                    style="width:100%;"
                    v-model="scope.row.time"
                    :editable="false"
                    :clearable="false"
                    value-format="yyyy-MM-dd HH:mm:ss"
                    @change="changeTime"
                    size="mini"
                    :disabled="!edit">
                  </el-date-picker>
                </template>
              </el-table-column>
              <el-table-column>
                <template slot-scope="scope">
                  <span v-if="!edit">{{scope.row.description}}</span>
                  <el-input 
                    v-else
                    v-model="scope.row.description"
                    @blur="autoAddProcess(scope.row)"
                    size="mini">
                  </el-input>
                </template>
              </el-table-column>
              <el-table-column width="50" v-if="edit&&canDo.process_update">
                <template slot-scope="scope">
                  <el-button type="danger" icon="el-icon-delete" size="mini" circle @click="deleteProcess(scope.$index)"></el-button>
                </template>
              </el-table-column>
            </el-table>
            <el-button style="width: 100%;margin-top: 12px" size="small" round  icon="el-icon-plus" type="info" v-if="edit&&canDo.process_update" @click="addProcess">新增进展</el-button>
          </el-col>
          <el-col :span="1"></el-col>
        </el-row>

        <el-row>
          <el-col :span="1"></el-col>
          <el-col :span="22"><div class="label">备注</div></el-col>
          <el-col :span="1"></el-col>
        </el-row>

        <el-row>
          <el-col :span="1"></el-col>
          <el-col :span="22"><el-input type="textarea" :autosize="{minRows:2}" style="word-break: break-all;" v-model="order.remark" :disabled="!edit"></el-input></el-col>
          <el-col :span="1"></el-col>
        </el-row>

        <el-row>
          <el-col :span="24"></el-col>
        </el-row>

        <el-row>
          <el-col :span="1"></el-col>
          <el-col :span="22">
            <el-button style="width:100%" type="primary" @click="submit" :loading="isLoading">{{edit?'确认':'编辑'}}</el-button>
          </el-col>
          <el-col :span="1"></el-col>
        </el-row>

        <el-row>
          <el-col :span="24"></el-col>
        </el-row>
      </div>
    </el-main>
  </el-container>
</template>

<script>

function haveDateTime(str){
  let reg = /[1-2][0-9]{3}-[0-9]{1,2}-[0-9]{1,2} [0-2][0-9]:[0-5][0-9]:[0-5][0-9]/g;
  if(str.match(reg) == null){
    return null;
  }else{
    let res = {
      time:str.match(reg),
      description:str.split(reg)
    }
    return res;
  }
}

export default {
  name: 'OrderEdit',
  data() {
    return {
      token:'',
      user_name:'Unknown',
      pageLoading:true,
      isLoading:false,
      canDo:{},
      doList:['order_view','order_new','order_edit','update','getProcessList','process_update'],
      edit:false,
      newOrder:false,
      stepList:[
        {label:'结单',value:'结单'},
        {label:'未结单',value:'未结单'},
        {label:'挂起中',value:'挂起中'},
        {label:'已撤销',value:'已撤销'}
      ],
      trouble_class:[{label:'光缆故障',value:'光缆故障'},{label:'设备故障',value:'设备故障'},{label:'动力配套',value:'动力配套'},{label:'电缆故障',value:'电缆故障'}],
      trouble_reason:{
        '光缆故障':[
          {label:'市政施工',value:'市政施工'},
          {label:'三线整治',value:'三线整治'},
          {label:'河涌整治',value:'河涌整治'},
          {label:'恶意剪线',value:'恶意剪线'},
          {label:'车辆挂断',value:'车辆挂断'},
          {label:'老鼠咬断',value:'老鼠咬断'},
          {label:'自然灾害',value:'自然灾害'},
          {label:'光缆劣化',value:'光缆劣化'},
          {label:'尾纤松动',value:'尾纤松动'},
          {label:'客户内线',value:'客户内线'}
        ],
        '设备故障':[
          {label:'传输设备',value:'传输设备'},
          {label:'交换设备',value:'交换设备'},
          {label:'数据设备',value:'数据设备'},
          {label:'接入设备',value:'接入设备'},
          {label:'客户设备',value:'客户设备'},
          {label:'客户端联通设备',value:'客户端联通设备'}
        ],
        '动力配套':[
          {label:'机房停电',value:'机房停电'},
          {label:'机房电池',value:'机房电池'},
          {label:'机房空调',value:'机房空调'},
          {label:'基站停电',value:'基站停电'},
          {label:'基站电池',value:'基站电池'},
          {label:'基站空调',value:'基站空调'},
          {label:'室分停电',value:'室分停电'},
          {label:'室分电池',value:'室分电池'},
          {label:'室分空调',value:'室分空调'},
          {label:'客户动力',value:'客户动力'}
        ],
        '电缆故障':[
          {label:'市政施工',value:'市政施工'},
          {label:'三线整治',value:'三线整治'},
          {label:'河涌整治',value:'河涌整治'},
          {label:'恶意剪线',value:'恶意剪线'},
          {label:'车辆挂断',value:'车辆挂断'},
          {label:'老鼠咬断',value:'老鼠咬断'},
          {label:'自然灾害',value:'自然灾害'},
          {label:'电缆劣化',value:'电缆劣化'},
          {label:'电缆松动',value:'电缆松动'},
          {label:'客户内线',value:'客户内线'}
        ]
      },
      business_type:[
        {label:'党政军部门',value:'党政军部门'},
        {label:'金融、保险业',value:'金融、保险业'},
        {label:'交通运输（含邮政、快递）、仓储业',value:'交通运输（含邮政、快递）、仓储业'},
        {label:'科学教育、文化卫生',value:'科学教育、文化卫生'},
        {label:'旅游、饭店、娱乐服务业',value:'旅游、饭店、娱乐服务业'},
        {label:'通信、电子设备制造和计算机应用服务业',value:'通信、电子设备制造和计算机应用服务业'},
        {label:'邮电计算机信息业',value:'邮电计算机信息业'},
        {label:'建筑业',value:'建筑业'},
        {label:'其他行业',value:'其他行业'}
      ],
      area:[
        {label:'天河',value:'天河'},
        {label:'越秀',value:'越秀'},
        {label:'白云南',value:'白云南'},
        {label:'白云北',value:'白云北'},
        {label:'番禺',value:'番禺'},
        {label:'萝岗',value:'萝岗'},
        {label:'海珠',value:'海珠'},
        {label:'花都',value:'花都'},
        {label:'黄埔',value:'黄埔'},
        {label:'荔湾',value:'荔湾'},
        {label:'从化',value:'从化'},
        {label:'增城',value:'增城'},
        {label:'南沙',value:'南沙'},
        {label:'非广州',value:'非广州'},
      ],
      major:[
        {label:'传输',value:'传输'},
        {label:'交换',value:'交换'},
        {label:'数据',value:'数据'},
        {label:'接入',value:'接入'},
        {label:'政企云',value:'政企云'},
        {label:'其他',value:'其他'}
      ],
      id:'',
      order:{},
      processList:[],
      timeCounter:undefined,
    }
  },
  created: function() {
    this.pageLoading = true;
    this.token = this.$cookies.get('user_token');
    this.user_name = this.$cookies.get('user_name');
    this.id = this.$route.query.id;
    if(this.id != undefined){
      let self = this;
      this.assess_query(this.doList).then(function(){
        self.edit = (self.$route.query.edit == 'true') && self.canDo.order_edit
        self.getData();
      })
    }else{
      this.edit = true;
      this.newOrder = true;
      this.pageLoading = false;
    }
  },
  methods: {
    getData: function() {
      let self = this;
      let data = new FormData();
      data.append('token', this.token);
      data.append('id',this.id);
      this.axios
        .post('http://' + this.$global_msg.HOST + 'scripts/order/getOrderById.php', data)
        .then(function(res){
          if(res.data.status == 'success'){
            self.order = res.data;
            document.title = res.data.name;
            self.getProcessList();
          }else{
            self.$message.error("[getData]Error:"+res.data.errMsg);
          }
          self.pageLoading = false;
        })
        .catch(function(e){
          console.log("[getData]"+e);
          self.$message.error("[getData]Network Error:"+e);
          self.pageLoading = true;
        })
    },
    getProcessList:function(){
      let self = this;
      let data = new FormData();
      data.append('token', this.token);
      data.append('id',this.id);
      this.axios
        .post('http://' + this.$global_msg.HOST + 'scripts/order/get_process_list_by_order_id.php', data)
        .then(function(res){
          if(res.data.status == 'success'){
            self.processList = res.data.result
          }else{
            self.$message.error("[getProcessList]error:"+res.data.errMsg);
          }
        })
        .catch(function(e){
          console.log("[getProcessList]"+e);
          self.$message.error("[getProcessList]Network Error:"+e);
        })
    },
    refreshProcessList:function(){
      for(let i in this.processList){
        this.processList[i].list_order = i
      }
    },
    deleteProcess:function(index){
      let self = this;
      this.$confirm('确认要删除这一条进展吗?','警告',{
        type:'warning'
      }).then(function(){
        self.processList.splice(index,1)
        self.refreshProcessList();
      }).catch(function(){})
    },
    addProcess:function(){
      this.processList.push({
        process_id:'New Process',
        order_id:this.id,
        time:'',
        description:'',
        mark:'',
        list_order:-1
      })
      this.refreshProcessList();
    },
    autoAddProcess: function(obj) {
      let self = this;
      let res = haveDateTime(obj.description)
      if (res) {
        this.$confirm("检测到进展包含时间，是否自动整理？", '提示', {
            type: 'info'
          })
          .then(function() {
            let index = Number(obj.list_order);
            if (res.time.length > res.description.length) {
              self.$message.error('字符串分割错误！')
            } else {
              if (res.time.length < res.description.length) {
                if (res.description[0] != "") {
                  self.processList[index].description = res.description[0].trim();
                  res.description.splice(0, 1);
                  index++;
                } else {
                  res.description.splice(0, 1);
                  self.processList.splice(index, 1);
                }
              }
              for (let i = 0; i < res.description.length; i++) {
                if (res.description[i] != "") {
                  let fd = new Date(res.time[i]).Format("yyyy-MM-dd hh:mm:ss");
                  let newProcess = {
                    process_id: "newProcess",
                    order_id: self.id,
                    description: res.description[i].trim(),
                    time: fd,
                    mark: "",
                    list_order: index + ""
                  }
                  self.processList.splice(index, 0, newProcess);
                }
                index++;
              }
              self.refreshProcessList();
            }
          }).catch(function(){})
      }
    },
    deleteProcessList:function(callback){
      let self = this;
      let data = new FormData();
      data.append('token', this.token);
      data.append('id',this.id);
      this.axios
        .post('http://' + this.$global_msg.HOST + 'scripts/order/delete_process_by_order_id.php', data)
        .then(function(res){
          if(res.data.status == 'success'){
            callback();
          }else{
            self.$message.error("[deleteProcessByOrderId]error:"+res.data.errMsg);
          }
        })
        .catch(function(e){
          console.log("[deleteProcessByOrderId]"+e);
          self.$message.error("[deleteProcessByOrderId]Network Error:"+e);
        })
    },
    updateProcessList:function(callback){
      let self = this;
      let data = new FormData();
      data.append('token', this.token);

      let json = {sum:0,data:[]};
      for(let i in this.processList){
        let arr = [];
        arr.push(this.processList[i].process_id);
        arr.push(this.processList[i].order_id);
        arr.push(this.processList[i].time);
        arr.push(this.processList[i].description);
        arr.push(this.processList[i].list_order);
        arr.push(this.processList[i].mark);
        json.data.push(arr)
      }
      data.append('DATA',JSON.stringify(json));
      self.deleteProcessList(function(){
        self.axios
        .post('http://' + self.$global_msg.HOST + 'scripts/order/add_process_list.php', data)
        .then(function(res){
          if(res.data.status == 'success'){
            callback()
          }else{
            self.$message.error("[updateProcessList]error:"+res.data.errMsg);
          }
        })
        .catch(function(e){
          console.log("[updateProcessList]"+e);
          self.$message.error("[updateProcessList]Network Error:"+e);
        })
      })
    },
    getOrderData:function(){
      let paramList = ['id','name','start_time','end_time','step','trouble_symptom','link_id','process','circuit_number','contact_number','contact_name','area','is_trouble','is_remote','trouble_class','trouble_reason','business_type','remark','major'];
      let data = new FormData();
      for(let i in paramList){
        data.append(paramList[i],this.order[paramList[i]]==undefined?'':this.order[paramList[i]])
      }
      return data;
    },
    orderUpdate:function(callback){
      let self = this;
      let data = this.getOrderData();
      data.append('token', this.token);

      this.axios
        .post('http://' + self.$global_msg.HOST + 'scripts/order/update.php', data)
        .then(function(res){
          if(res.data.status == 'success'){
            callback();
          }else{
            self.$message.error("[orderUpdate]error:"+res.data.errMsg);
          }
        })
        .catch(function(e){
          console.log("[orderUpdate]"+e);
          self.$message.error("[orderUpdate]Network Error:"+e);
        })
    },
    orderNew:function(callback){
      let self = this;
      let data = this.getOrderData();
      data.append('token', this.token);

      this.axios
        .post('http://' + self.$global_msg.HOST + 'scripts/order/new.php', data)
        .then(function(res){
          if(res.data.status == 'success'){
            callback(res.data.id);
          }else{
            self.$message.error("[orderUpdate]error:"+res.data.errMsg);
          }
        })
        .catch(function(e){
          console.log("[orderUpdate]"+e);
          self.$message.error("[orderUpdate]Network Error:"+e);
        })
    },
    timeCheck:function(){
      if(!this.order.start_time){
        return {result:false,msg:'请输入故障发生时间'}
      }
      if(!this.order.name){
        return {result:false,msg:'请输入客户名称'}
      }
      if(this.order.step == '结单'){
        if (!this.order.end_time) {
          return {result:false,msg:'请输入结单时间'}
        }
        if(new Date(this.order.end_time) - new Date(this.order.start_time) < 0){
          return {result:false,msg:'结单时间小于故障发生时间'}
        }
      }
      if(this.processList.length > 0){
        let suspend = false;
        let last_time = new Date(this.order.start_time);
        for(let i in this.processList){
          let p = this.processList[i]
          if(!p.time){
            return {result:false,msg:'请输入进展时间'}
          }
          if(p.mark == 'set_suspend'){
            if(suspend){
              return {result:false,msg:'请先解挂后再挂起'}
            }
            suspend = true;
          }
          if(p.mark == 'unset_suspend'){
            if(!suspend){
              return {result:false,msg:'错误的解挂标志'}
            }
            suspend = false;
          }
          let time = new Date(p.time);
          if(time - last_time < 0){
            return {result:false,msg:'进展时间存在交错'}
          }
          last_time = time;
        }
        if(this.order.step == '结单' && new Date(this.order.end_time) - last_time < 0){
          return {result:false,msg:'结单时间小于最后进展时间'}
        }
      }
      return {result:true};
    },
    submit:function(){
      let self = this;
      if(this.newOrder){
        let check = this.timeCheck();
        if(!check.result){
          this.$message.error(check.msg);
          return;
        }
        this.isLoading = true;
        this.orderNew(function(id){
          self.$router.replace({
            name: 'orderEdit',
            query: {
              id:id,
              edit:false
            }
          })
          self.isLoading = false;
        });
      }else{
        if(this.edit){
          let check = this.timeCheck();
          if(!check.result){
            this.$message.error(check.msg);
            return;
          }
          this.isLoading = true;
          this.updateProcessList(function(){
            self.orderUpdate(function(){
              self.$router.replace({
                name: 'orderEdit',
                query: {
                  id:self.id,
                  edit:'false'
                }
              })
              self.isLoading = false;
            })
          });
        }else{
          self.$router.replace({
            name: 'orderEdit',
            query: {
              id:self.id,
              edit:'true'
            }
          })
        }
      }
    },
    troubleClassChange:function(e){
      this.order.trouble_reason = '';
    },
    changeStep:function(){
      if(this.order.step != '结单'){
        this.order.end_time = '';
        this.changeTime();
      }
    },
    changeTime:function(e){
      if(this.timeCounter){
        clearTimeout(this.timeCounter);
      }
      if(this.order.start_time && this.order.end_time){
        this.order.time = ((new Date(this.order.end_time) - new Date(this.order.start_time))/60000).toFixed(0);
      }else if(this.order.start_time){
        this.order.time = ((new Date() - new Date(this.order.start_time))/60000).toFixed(0);
        this.timeCounter = setTimeout(this.changeTime,60000);
      }else{
        this.order.time = '';
      }
    },
    markFormatter:function(mark){
      switch(mark){
        case '':
          return '进展';
        case 'set_suspend':  
          return '挂起';
        case 'unset_suspend':  
          return '解挂';
      }
    },
    assess_query:async function(list){
      let self = this;
      for(let i in list){
        await this.canDoQuery(list[i]).then(function(res){
          self.canDo[list[i]] = res;
        })
      }
    },
    canDoQuery:async function(op){
      let data = new FormData();
      data.append('token', this.token);
      data.append('operation',op);
      let canDo = false;
      await this.axios
        .post('http://' + this.$global_msg.HOST + 'scripts/system/canDoQuery.php', data)
        .then(function(res) {
          if(res.data.status == 'success'){
            canDo = true;
          }else{
            console.log("can NOT do "+op+":"+res.data.errMsg);
          }
        })
        .catch(function(e){
          console.log("query error:"+e)
        })
      return canDo;
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.title{
  display: flex;
  height: 100%;
  justify-content: center;
  align-items: center;
  color: #409EFF;
  font-size: 26px;
}
.el-main{
  width: 100%;
  display: flex;
  flex-direction: row;
  justify-content: center;
  padding: 8px 0 8px 0;
  /*overflow: visible;*/
  z-index: 3;
}
.container{
  margin-bottom: 32px;
  background: white;
  border-radius: 24px;
  max-width: 840px;
  min-width: 620px;
  width:80%;
  height: fit-content;
  box-shadow: #AAAAAA 1px 1px 10px;
}
.el-col{
  min-height: 36px;
  position: relative;
}
.label{
  height:12px;
  font-size:12px;
  color:#409EFF;
  position: absolute;
  bottom: 10px;
}
.content{
  padding-right: 24px;
  height: 36px;
  display: flex;
  align-items: center;
}
.content .el-select{
  width:100%;
}
</style>
