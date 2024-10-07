<template>
  <div class="webgl-container">
    <div class="video-section">
      <div class="video-container">
        <video ref="videoStreamVideo" autoplay playsinline muted style="width: 100%;"></video>
        <p class="caption">Video Stream Video</p>
      </div>
      <div class="video-container relative">
        <video ref="videoStreamVideo2" autoplay playsinline muted style="width: 100%;"></video>
        <video ref="unityStreamVideo" id="unityStreamVideo" autoplay playsinline muted style="width: 100%;"></video>
        <p class="caption">Unity Stream Video</p>
      </div>
    </div>
  </div>
</template>

<script>
import io from 'socket.io-client'

export default {
  name: 'WebGLReceiver',
  data () {
    return {
      unityPeerConnection: null,
      videoPeerConnection: null,
      socket: null
    }
  },
  mounted () {
    this.setupSocketConnection()
    this.initWebRTC()
  },
  methods: {
    setupSocketConnection () {
      this.socket = io('https://webrtcsvsocket.onrender.com', {
        withCredentials: true,
        reconnection: true
      })

      this.socket.on('connect', () => {
        console.log('Connected to signaling server')
      })

      this.socket.on('disconnect', () => {
        console.log('Disconnected from signaling server')
      })

      this.listenToSocketEvents()
    },
    listenToSocketEvents () {
      this.socket.on('unity-offer', async (offer) => {
        console.log('Received Unity offer after reload:', offer)
        await this.unityPeerConnection.setRemoteDescription(new RTCSessionDescription(offer))
        const answer = await this.unityPeerConnection.createAnswer()
        await this.unityPeerConnection.setLocalDescription(answer)
        this.socket.emit('unity-answer', answer)
      })

      this.socket.on('unity-candidate', (candidate) => {
        this.unityPeerConnection.addIceCandidate(new RTCIceCandidate(candidate)).catch(e => console.error(e))
      })

      this.socket.on('video-offer', async (offer) => {
        console.log('Received Video offer after reload:', offer)
        await this.videoPeerConnection.setRemoteDescription(new RTCSessionDescription(offer))
        const answer = await this.videoPeerConnection.createAnswer()
        await this.videoPeerConnection.setLocalDescription(answer)
        this.socket.emit('video-answer', answer)
      })

      this.socket.on('video-candidate', (candidate) => {
        this.videoPeerConnection.addIceCandidate(new RTCIceCandidate(candidate)).catch(e => console.error(e))
      })
    },
    initWebRTC () {
      this.unityPeerConnection = new RTCPeerConnection({
        iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
      })

      this.videoPeerConnection = new RTCPeerConnection({
        iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
      })

      this.unityPeerConnection.ontrack = (event) => {
        console.log('Received track for Unity Stream after reload:', event.track)
        const unityVideoElement = this.$refs.unityStreamVideo
        unityVideoElement.srcObject = event.streams[0]
        unityVideoElement.play()
      }

      this.unityPeerConnection.onicecandidate = (event) => {
        if (event.candidate) {
          this.socket.emit('unity-candidate', event.candidate)
        }
      }

      this.videoPeerConnection.ontrack = (event) => {
        console.log('Received track for Video Stream after reload:', event.track)
        const videoElement = this.$refs.videoStreamVideo
        const videoElement2 = this.$refs.videoStreamVideo2
        videoElement.srcObject = event.streams[0]
        videoElement2.srcObject = event.streams[0]
        videoElement.play()
        videoElement2.play()
      }

      this.videoPeerConnection.onicecandidate = (event) => {
        if (event.candidate) {
          this.socket.emit('video-candidate', event.candidate)
        }
      }
    }
  }
}
</script>
<style scoped>
.webgl-container {
  width: 100%;
  height: 100vh;
}
.relative {
  position: relative;
}
#unityStreamVideo {
  position: absolute;
}
.video-section {
  display: flex;
  width: 100%;
  height: 80vh;
  justify-content: space-between;
  margin-top: 15px;
}

.video-container {
  width: 49%;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.caption {
  text-align: center;
  font-size: 16px;
  margin-top: 10px;
  color: #333;
}

video {
  width: 100%;
  height: auto;
  border: 1px solid #ccc;
  border-radius: 8px;
}
</style>
