import '@testing-library/jest-dom'
import { vi } from 'vitest'

// Mock DOM methods
Element.prototype.scrollIntoView = vi.fn()

// Mock WebRTC APIs
const mockRTCPeerConnection = vi.fn(() => ({
  createOffer: vi.fn().mockResolvedValue({
    type: 'offer',
    sdp: 'mock-offer-sdp'
  }),
  createAnswer: vi.fn().mockResolvedValue({
    type: 'answer', 
    sdp: 'mock-answer-sdp'
  }),
  setLocalDescription: vi.fn().mockResolvedValue(undefined),
  setRemoteDescription: vi.fn().mockResolvedValue(undefined),
  addIceCandidate: vi.fn().mockResolvedValue(undefined),
  close: vi.fn(),
  createDataChannel: vi.fn(() => ({
    send: vi.fn(),
    close: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    readyState: 'open'
  })),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  connectionState: 'new',
  iceConnectionState: 'new',
  iceGatheringState: 'new',
  signalingState: 'stable'
})) as any

// Add static method
mockRTCPeerConnection.generateCertificate = vi.fn()
Object.assign(global, { RTCPeerConnection: mockRTCPeerConnection })

global.RTCSessionDescription = vi.fn() as any
global.RTCIceCandidate = vi.fn() as any

// Mock WebSocket
const mockWebSocket = vi.fn(() => ({
  send: vi.fn(),
  close: vi.fn(),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  readyState: 1,
})) as any

// Add static properties
Object.assign(mockWebSocket, {
  CONNECTING: 0,
  OPEN: 1,
  CLOSING: 2,
  CLOSED: 3
})

Object.assign(global, { WebSocket: mockWebSocket })

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
  length: 0,
  key: vi.fn()
}
Object.assign(global, { localStorage: localStorageMock })

// Mock navigator.mediaDevices
Object.defineProperty(global.navigator, 'mediaDevices', {
  value: {
    getUserMedia: vi.fn(),
    enumerateDevices: vi.fn(),
    getDisplayMedia: vi.fn()
  },
  writable: true
})

// Mock crypto.randomUUID using defineProperty
Object.defineProperty(global, 'crypto', {
  value: {
    randomUUID: vi.fn(() => 'test-uuid-123')
  },
  writable: true
})

// 静默console.error用于测试
const originalError = console.error
beforeAll(() => {
  console.error = (...args: any[]) => {
    if (
      typeof args[0] === 'string' &&
      args[0].includes('Warning: ReactDOM.render is no longer supported')
    ) {
      return
    }
    originalError.call(console, ...args)
  }
})

afterAll(() => {
  console.error = originalError
}) 