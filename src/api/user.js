import request from '@/utils/request'

export function login(data) {
  return request({
    url: '/login',
    method: 'post',
    data
  })
}

export function getInfo(token) {
  return request({
    url: '/userinfo',
    method: 'get',
    params: { token }
  })
}

export function logout() {
  return request({
    url: '/logout',
    method: 'post'
  })
}

export function loginByUsername(username, password) {
  const data = {
    username,
    password
  }
  return request({
    url: '/login',
    method: 'post',
    data
  })
}

export function getUserInfo(token) {
  return request({
    url: '/current',
    method: 'get',
    params: { token }
  })
}

export function getRoleList(token) {
  return request({
    url: '/role',
    method: 'get',
    params: { token }
  })
}

export function getAdminList(token) {
  return request({
    url: '/admin',
    method: 'get',
    params: { token }
  })
}

export function getUserList(param) {
  return request({
    url: '/user',
    method: 'get',
    params: param
  })
}

export function userSearch(name) {
  return request({
    url: '/search/user',
    method: 'get',
    params: { name }
  })
}
