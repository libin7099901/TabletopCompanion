// ***********************************************************
// This example support/e2e.ts is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

// Import commands.js using ES2015 syntax:
import './commands'

// Alternatively you can use CommonJS syntax:
// require('./commands')

// 全局配置
Cypress.on('uncaught:exception', (err, runnable) => {
  // 忽略WebRTC相关的错误，因为在测试环境中可能不支持
  if (err.message.includes('WebRTC') || err.message.includes('RTCPeerConnection')) {
    return false
  }
  return true
})

// Mock WebRTC APIs在测试环境中
beforeEach(() => {
  cy.window().then((win) => {
    // Mock WebRTC APIs with proper constructor functions
    function MockRTCPeerConnection() {
      this.connectionState = 'new'
      this.iceConnectionState = 'new'
      this.iceGatheringState = 'new'
      this.signalingState = 'stable'
      
      this.createOffer = () => {
        return Promise.resolve({
          type: 'offer',
          sdp: 'mock-offer-sdp'
        })
      }
      
      this.createAnswer = () => {
        return Promise.resolve({
          type: 'answer',
          sdp: 'mock-answer-sdp'
        })
      }
      
      this.setLocalDescription = () => {
        return Promise.resolve()
      }
      
      this.setRemoteDescription = () => {
        return Promise.resolve()
      }
      
      this.addIceCandidate = () => {
        return Promise.resolve()
      }
      
      this.createDataChannel = () => {
        return {
          send: () => {},
          close: () => {},
          addEventListener: () => {},
          removeEventListener: () => {},
          readyState: 'open'
        }
      }
      
      this.close = () => {}
      this.addEventListener = () => {}
      this.removeEventListener = () => {}
    }
    
    MockRTCPeerConnection.generateCertificate = () => {
      return Promise.resolve({})
    }
    
    (win as any).RTCPeerConnection = MockRTCPeerConnection
    
    function MockRTCSessionDescription(init: any) {
      this.type = init.type
      this.sdp = init.sdp
      
      this.toJSON = () => {
        return { type: this.type, sdp: this.sdp }
      }
    }
    
    (win as any).RTCSessionDescription = MockRTCSessionDescription
    
    function MockRTCIceCandidate(init: any) {
      this.candidate = init.candidate
      this.sdpMid = init.sdpMid
      this.sdpMLineIndex = init.sdpMLineIndex
      
      this.toJSON = () => {
        return {
          candidate: this.candidate,
          sdpMid: this.sdpMid,
          sdpMLineIndex: this.sdpMLineIndex
        }
      }
    }
    
    (win as any).RTCIceCandidate = MockRTCIceCandidate
    
    // Mock WebSocket with constructor function
    function MockWebSocket() {
      this.readyState = 1
      this.CONNECTING = 0
      this.OPEN = 1
      this.CLOSING = 2
      this.CLOSED = 3
      this.onopen = null
      this.onclose = null
      this.onmessage = null
      this.onerror = null
      
      const self = this
      setTimeout(() => {
        if (self.onopen) self.onopen({})
      }, 100)
      
      this.send = () => {}
      this.close = () => {}
      this.addEventListener = () => {}
      this.removeEventListener = () => {}
    }
    
    MockWebSocket.CONNECTING = 0
    MockWebSocket.OPEN = 1
    MockWebSocket.CLOSING = 2
    MockWebSocket.CLOSED = 3
    
    (win as any).WebSocket = MockWebSocket
    
    // Mock crypto.randomUUID
    if (!win.crypto) {
      (win as any).crypto = {}
    }
    (win as any).crypto.randomUUID = () => {
      return 'test-uuid-' + Math.random().toString(36).substr(2, 9)
    }
  })
}) 