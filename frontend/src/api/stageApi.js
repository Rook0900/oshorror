import axios from 'axios'

const api = axios.create({ baseURL: '/api' })

export const getStage = (stageId) =>
  api.get(`/stages/${stageId}`).then((r) => r.data)

export const getHint = (stageId, noteId) =>
  api.get(`/stages/${stageId}/hint/${noteId}`).then((r) => r.data)

export const verifyPuzzle = (stageId, fileId, answer) =>
  api.post(`/stages/${stageId}/puzzle/${fileId}/verify`, { answer }).then((r) => r.data)

export const saveGame = (sessionId, stageId, stateJson) =>
  api.post('/save', { sessionId, stageId, stateJson }).then((r) => r.data)

export const loadGame = (sessionId) =>
  api.get(`/save/${sessionId}`).then((r) => r.data)
