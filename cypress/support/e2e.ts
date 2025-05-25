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
    
    // Mock WebSocket more robustly
    function MockWebSocket(url: string) {
      // console.log(`MockWebSocket: New connection to ${url}`);
      this.url = url;
      this.readyState = MockWebSocket.CONNECTING; // Initial state
      this.protocol = ''; // Typically set by the server
      this.extensions = '';
      this.bufferedAmount = 0;

      // Event handlers
      this.onopen = null;
      this.onclose = null;
      this.onmessage = null;
      this.onerror = null;

      // Internal list of event listeners for addEventListener/removeEventListener
      this._listeners = { open: [], close: [], message: [], error: [] };

      // Simulate connection opening after a short delay
      setTimeout(() => {
        if (this.readyState === MockWebSocket.CONNECTING) {
          this.readyState = MockWebSocket.OPEN;
          const event = { type: 'open', target: this };
          if (typeof this.onopen === 'function') {
            this.onopen(event);
          }
          this._listeners.open.forEach((listener: any) => listener(event));
          // console.log(`MockWebSocket: ${this.url} OPENED`);
        }
      }, 50);

      this.send = (data: any) => {
        if (this.readyState !== MockWebSocket.OPEN) {
          throw new Error('WebSocket is not open: readyState is ' + this.readyState);
        }
        // console.log(`MockWebSocket: ${this.url} SEND:`, data);
        // To simulate receiving a message (e.g., echo)
        // setTimeout(() => {
        //   const messageEvent = { type: 'message', data: `Echo: ${data}`, target: this };
        //   if (typeof this.onmessage === 'function') this.onmessage(messageEvent);
        //   this._listeners.message.forEach(listener => listener(messageEvent));
        // }, 100);
      };

      this.close = (code?: number, reason?: string) => {
        // console.log(`MockWebSocket: ${this.url} CLOSE called with code=${code}, reason=${reason}`);
        if (this.readyState === MockWebSocket.CLOSED || this.readyState === MockWebSocket.CLOSING) {
          return;
        }
        this.readyState = MockWebSocket.CLOSING;
        setTimeout(() => {
          this.readyState = MockWebSocket.CLOSED;
          const event = { type: 'close', code: code || 1000, reason: reason || 'Normal Closure', wasClean: true, target: this };
          if (typeof this.onclose === 'function') {
            this.onclose(event);
          }
          this._listeners.close.forEach((listener: any) => listener(event));
          // console.log(`MockWebSocket: ${this.url} CLOSED`);
        }, 50);
      };

      this.addEventListener = (type: string, listener: EventListenerOrEventListenerObject) => {
        if (this._listeners[type]) {
          this._listeners[type].push(listener);
        } else {
          // console.warn(`MockWebSocket: addEventListener for unsupported type: ${type}`);
        }
      };

      this.removeEventListener = (type: string, listenerToRemove: EventListenerOrEventListenerObject) => {
        if (this._listeners[type]) {
          this._listeners[type] = this._listeners[type].filter((listener: any) => listener !== listenerToRemove);
        } else {
          // console.warn(`MockWebSocket: removeEventListener for unsupported type: ${type}`);
        }
      };

      // Custom method for tests to simulate receiving a message
      this.simulateMessage = (data: any) => {
        if (this.readyState === MockWebSocket.OPEN) {
          const messageEvent = { type: 'message', data, target: this, origin: this.url, lastEventId: '', source: null, ports: [] };
          if (typeof this.onmessage === 'function') {
            this.onmessage(messageEvent);
          }
          this._listeners.message.forEach((listener: any) => listener(messageEvent));
        } else {
          // console.warn('MockWebSocket: simulateMessage called but WebSocket is not open.');
        }
      };
       // Custom method for tests to simulate an error
      this.simulateError = (errorMessage: string) => {
        const errorEvent = { type: 'error', message: errorMessage, target: this };
        if (typeof this.onerror === 'function') {
          this.onerror(errorEvent);
        }
        this._listeners.error.forEach((listener: any) => listener(errorEvent));
         // console.error(`MockWebSocket: ${this.url} SIMULATED ERROR: ${errorMessage}`);
         // Optionally close the WebSocket on error
        this.close(1006, 'Simulated WebSocket error');
      };
    }

    // Static constants for WebSocket states
    MockWebSocket.CONNECTING = 0;
    MockWebSocket.OPEN = 1;
    MockWebSocket.CLOSING = 2;
    MockWebSocket.CLOSED = 3;

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