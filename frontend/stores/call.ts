import { defineStore } from 'pinia'

export const useCallStore = defineStore('call', {
  state: () => ({
    active:       false,
    peerId:       '' as string,
    peerName:     '' as string,
    type:         'video' as 'video' | 'audio',
    incoming:     false,
    incomingOffer: null as RTCSessionDescriptionInit | null,
  }),
  actions: {
    initCall(peerId: string, peerName: string, type: 'video' | 'audio') {
      this.peerId    = peerId
      this.peerName  = peerName
      this.type      = type
      this.incoming  = false
      this.active    = true
    },
    receiveCall(peerId: string, peerName: string, type: 'video' | 'audio', offer: RTCSessionDescriptionInit) {
      this.peerId        = peerId
      this.peerName      = peerName
      this.type          = type
      this.incoming      = true
      this.incomingOffer = offer
      this.active        = true
    },
    endCall() {
      this.active        = false
      this.peerId        = ''
      this.peerName      = ''
      this.incoming      = false
      this.incomingOffer = null
    },
  },
})
