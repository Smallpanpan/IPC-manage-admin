import request from '@/utils/request'

export function fetchList(query) {
  return request({
    url: '/server/list',
    method: 'get',
    params: query
  })
}

export function fetchOrder(id) {
  return request({
    url: '/order/' + id,
    method: 'get'
  })
}
export function typeList(id) {
  return request({
    url: '/server/type',
    method: 'get'
  })
}

export function updateOrderStatus(json) {
  return request({
    url: '/order/status',
    method: 'post',
    data: json
  })
}
export function addList(json) {
  return request({
    url: '/server/add',
    method: 'post',
    data: json
  })
}
// ,delList,
export function editList(json) {
  return request({
    url: '/server/edit',
    method: 'post',
    data: json
  })
}
export function delList(json) {
  return request({
    url: '/server/del',
    method: 'post',
    data: json
  })
}
export function getLog(json) {
  return request({
    url: '/logs/getlog',
    method: 'post',
    data: json
  })
}

export function delOrder(id) {
  return request({
    url: '/order/' + id,
    method: 'delete'
  })
}

