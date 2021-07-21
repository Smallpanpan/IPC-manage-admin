import axios from 'axios'

const options = {
  execCommond(commond) {
    return axios.post(`/execShell`, {
      commond: commond || ''
    })
  },
  requestTerminal(id) {
    return axios.get(`/terminal?id=${id}`)
  },
  openSSH(data) {
    return axios.post(`/openSSH`, data)
  }
}

export default options
