<template>
  <div v-show="visiable" ref="terminal" class="consoleBox">
    <div class="header" @mousedown="mousedown">
      <div class="status">
        <div class="dot normal"/>
      </div>
      <div class="close">
        <i class="el-icon-close" @click="close" />
      </div>
    </div>
    <div ref="parentElement" class="content">
      <div id="console" class="console"/>
    </div>
  </div>
</template>
<script>
import paasApi from '@/api/paasApi'
import 'xterm/dist/xterm.css'
import { Terminal } from 'xterm'
import * as fit from 'xterm/lib/addons/fit/fit'
import * as attach from 'xterm/lib/addons/attach/attach'
import socketClient from 'socket.io-client'
import { setTimeout } from 'timers'
Terminal.applyAddon(fit)
Terminal.applyAddon(attach)
const { execCommond, openSSH } = paasApi
export default {
  name: 'Terminal',
  data() {
    return {
      dom: document.getElementById('console'),
      xterm: null,
      dialogTableVisible: false,
      dialogFormVisible: false,
      formLabelWidth: '20px',
      serviceid: null,
      loading: false,
      loginfo: '',
      visiable: false,
      socket: null,
      inited: false,
      keydown: '',
      ipconfig: {}
    }
  },
  created() {
    console.log('xterm:', this.xterm)
  },
  mounted() {
  },
  methods: {
    close() {
      // 1. 发送关闭ssh链接信号
      this.visiable = false
      this.$emit('onClose', '')
      this.xterm && this.xterm.clear ? this.xterm.clear() : ''
    },
    open(row) {
      // 建立websocket链接
      console.log('ipconfig', row)
      this.ipconfig = row
      this.dom = document.getElementById('console')
      const url = process.env.SOCKET_IP
      console.log('url', url)
      this.startSocket(url) // websocket连接
      this.visiable = true
      if (this.inited) {
      } else {
        this.inited = true
        setTimeout(() => {
          this.initTerminal() // xterm初始化
        }, 500)
      }
    },
    async openSSH(params) {
      const result = await openSSH(params)
      return result
    },
    initTerminal() {
      const self = this
      const container = this.$refs.console
      var xterm = new Terminal({
        cursorBlink: 5,
        scrollback: 30,
        tabStopWidth: 4
      })
      xterm.open(this.dom, true)
      xterm.fit()
      // xterm.attach(ws);
      this.xterm = xterm
      console.log(xterm)
      // Log the keyCode of every keyDown event
      this.xterm.focus()
      xterm.textarea.onkeydown = function(e) {
        const keyCode = e.keyCode
        if (keyCode == 13) {
          xterm.write('\n\r')
          return false
        }
        // ws.send(that.encodeBase64Content(e.keyCode.toString()));
        // ws.send('bHM=');
      }

      xterm.attachCustomKeyEventHandler(function(e) {
        if (e.keyCode == 13) {
          console.log('enter')
          self.sendMsg('cmd', this.keydown)
          this.keydown = null
          return false
        }
      })
      xterm.on('data', function(data) {
        console.log('data xterm=>', data)
        if (this.keydown) {
          this.keydown = this.keydown + data
        } else {
          this.keydown = data
        }
        console.log(this.keydown)
        xterm.write(data)
        // ws.send(that.encodeBase64Content(data.toString()));
      })

      xterm.on('output', arrayBuffer => {
        console.log('output===', arrayBuffer)
      })

      xterm.on('blur', arrayBuffer => {
        console.log('blur===', arrayBuffer)
        xterm.write(arrayBuffer)
      })

      xterm.on('focus', arrayBuffer => {
        console.log('focus===', arrayBuffer)
        xterm.write(arrayBuffer)
      })
      xterm.on('keydown', arrayBuffer => {
        console.log('keydown===', arrayBuffer.key)
        if (arrayBuffer.key == 'Backspace') {
          xterm.write('\b')
          this.keydown = this.keydown.substring(0, this.keydown.length - 1)
        }
        if (arrayBuffer.key == 'Esc') {
          this.keydown = null
        }
      })

      xterm.on('lineFeed', arrayBuffer => {
        console.log('lineFeed===', arrayBuffer)
        xterm.write(arrayBuffer)
      })

      xterm.on('resize', size => {
        console.log('resize', [size.cols, size.rows])
      })
    },
    startSocket(linkpath) {
      const self = this
      const socket = socketClient(linkpath)
      console.log(socket)
      socket.on('connect', async() => {
        console.log('connect')
        // 发送链接SSH请求
        self.socket = socket
        self.sendMsg('openSSH', { id: this.ipconfig.id })
        // self.sendMsg('openTest',"");
      })
      // 监听返回字段
      socket.on('res', function(msg) {
        console.log('res:', msg)
        if (!self.xterm) return
        self.ab2str(msg, (str) => {
          console.log(str.toString() + 'end')
          const arrs = str.split('\n')
          console.log(arrs)
          for (var i = 0; i < arrs.length; i++) {
            if (arrs[i] == '') return
            self.xterm.write(arrs[i])
            self.xterm.write('\n\r')
          }
        })
      })
      socket.on('closeSSH', function(msg) {
        console.log('closeSSH:', msg)
      })
      socket.on('openSSH', function(msg) {
        console.log('openSSH:', msg)
      })
      socket.on('event', function(data) {
        console.log(data)
      })
      socket.on('disconnect', function() {
        console.log('disconnect')
      })
      socket.onclose = function() {
        console.log('close')
        self.xterm.write('remote connect fail:\n\r')
      }
    },
    ab2str(u, f) {
      var b = new Blob([u])
      var r = new FileReader()
      r.readAsText(b, 'utf-8')
      r.onload = function() { if (f)f.call(null, r.result) }
    },
    sendMsg(method, msg) {
      if (this.socket) {
        this.socket.emit(method, msg)
      }
    },
    decodeBase64Content(base64Content) {
      // base64 解码
      let commonContent = base64Content.replace(/\s/g, '+')
      commonContent = Buffer.from(commonContent, 'base64').toString()
      return commonContent
    },
    encodeBase64Content(commonContent) {
      // base64 编码
      const base64Content = Buffer.from(commonContent).toString('base64')
      return base64Content
    },
    mousedown(e) {
      const target = e.target
      console.log(e)
      const { offsetX, offsetY } = e
      const terminal = this.$refs.terminal
      function mousemove(e) {
        const { clientX, clientY } = e
        const speed = 0.2
        // console.log(e,123)
        const left = clientX - offsetX
        const top = clientY - offsetY
        console.log('left:', left, '--top:', top)
        terminal.style.left = left + 'px'
        terminal.style.top = top + 'px'
      }
      target.addEventListener('mousemove', mousemove)
      target.addEventListener('mouseup', (e) => {
        console.log('--mouseup--')
        target.removeEventListener('mousemove', mousemove)
      })
      target.addEventListener('mouseleave', (e) => {
        console.log('--mouseleave--')
        target.removeEventListener('mousemove', mousemove)
      })
    }
  }
}
</script>

<style rel="stylesheet/scss" lang="scss">
.consoleBox{
    position: absolute;
    width: 620px;
    background: #000;
    border-radius: 3px;
    box-shadow: 0 0 10px #657275;
    margin: 0 auto;
    left:20%;
    top:20%;
    //transform:translateX(-50%) translateY(-50%);
    z-index: 999;
    .header{
      height: 50px;
      width: 100%;
      background:rgb(12, 12, 12);
      border-bottom: 1px solid rgb(80, 80, 80);
      color: #fff;
      font-size: 20px;
      line-height:50px;
      .status{
        float: left;
        height: 100%;
        padding: 18px;
        .dot{
          height: 15px;
          width: 15px;
          background: #fff;
          border-radius: 50%;
          &.normal{
            background: green;
          }
        }
      }
      .close{
        width: 50px;
        height:50px;
        float: right;
        margin-right:0px;
        .el-icon-close{
          transition: all .5s linear;
          &:hover{
            cursor: pointer;
            transform: rotate(180deg)
          }
        }
      }
    }
    .content{
      padding: 10px;
      .console{
          margin: 0 auto;
          width: 600px;
          height: 410px;
        }
    }

}

.marin {
  margin: 4px;
}

.padding-left10 {
  padding-left: 10px;
}
.xterm .xterm-viewport{
    overflow: hidden;
}
</style>
