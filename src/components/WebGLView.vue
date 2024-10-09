<template>
  <div class="webgl-container">
    <iframe
      ref="myIframe"
      id="unity-iframe"
      src="/webgl/index.html"
      style="border:0; width:100%; height:100vh;"
      @load="startStreaming"
    ></iframe>
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
  name: 'WebGLView',
  props: ['selectedCamera'],
  data () {
    return {
      unityPeerConnection: null,
      videoPeerConnection: null,
      socket: null
    }
  },
  mounted () {
    if (!this.selectedCamera) {
      this.$router.push('*')
    }
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
    this.initWebRTC()

    window.cameraData = { label: this.selectedCamera.label, value: this.selectedCamera.value }
    localStorage.setItem('slectedCamera', JSON.stringify(window.cameraData))
    console.log(window.cameraData)
  },
  methods: {
    initWebRTC () {
      this.unityPeerConnection = new RTCPeerConnection({
        iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
      })

      this.videoPeerConnection = new RTCPeerConnection({
        iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
      })

      this.socket.on('unity-offer', async (offer) => {
        await this.unityPeerConnection.setRemoteDescription(new RTCSessionDescription(offer))
        const answer = await this.unityPeerConnection.createAnswer()
        await this.unityPeerConnection.setLocalDescription(answer)
        this.socket.emit('unity-answer', answer)
      })

      this.socket.on('unity-answer', async (answer) => {
        await this.unityPeerConnection.setRemoteDescription(new RTCSessionDescription(answer))
      })

      this.socket.on('unity-candidate', (candidate) => {
        this.unityPeerConnection.addIceCandidate(new RTCIceCandidate(candidate))
      })

      this.unityPeerConnection.onicecandidate = (event) => {
        if (event.candidate) {
          this.socket.emit('unity-candidate', event.candidate)
        }
      }

      this.socket.on('video-offer', async (offer) => {
        await this.videoPeerConnection.setRemoteDescription(new RTCSessionDescription(offer))
        const answer = await this.videoPeerConnection.createAnswer()
        await this.videoPeerConnection.setLocalDescription(answer)
        this.socket.emit('video-answer', answer)
      })

      this.socket.on('video-answer', async (answer) => {
        await this.videoPeerConnection.setRemoteDescription(new RTCSessionDescription(answer))
      })

      this.socket.on('video-candidate', (candidate) => {
        this.videoPeerConnection.addIceCandidate(new RTCIceCandidate(candidate))
      })

      this.videoPeerConnection.onicecandidate = (event) => {
        if (event.candidate) {
          this.socket.emit('video-candidate', event.candidate)
        }
      }
    },
    startStreaming () {
      const iframe = document.getElementById('unity-iframe')
      try {
        const unityCanvas = iframe.contentWindow.document.getElementById('unity-canvas')
        if (unityCanvas) {
          const unityStream = unityCanvas.captureStream(120)
          console.log(unityStream)
          const videoElement = this.$refs.unityStreamVideo
          videoElement.srcObject = unityStream
          videoElement.onloadedmetadata = function () {
            videoElement.play()
          }

          unityStream.getTracks().forEach(track => {
            this.unityPeerConnection.addTrack(track, unityStream)
          })

          this.unityPeerConnection.createOffer().then(offer => {
            return this.unityPeerConnection.setLocalDescription(offer)
          }).then(() => {
            this.socket.emit('unity-offer', this.unityPeerConnection.localDescription)
          }).catch(error => {
            console.error('Error creating or sending Unity offer', error)
          })

          console.log('Unity stream started')
        } else {
          console.error('Canvas not found inside iframe.')
        }
      } catch (error) {
        console.error('Error accessing canvas inside iframe:', error)
      }

      try {
        const videoCanvas = iframe.contentWindow.document.getElementById('video-canvas')
        if (videoCanvas) {
          const videoStream = videoCanvas.captureStream(120)
          const videoElement2 = this.$refs.videoStreamVideo
          const videoElement3 = this.$refs.videoStreamVideo2
          videoElement2.srcObject = videoStream
          videoElement3.srcObject = videoStream

          videoStream.getTracks().forEach(track => {
            this.videoPeerConnection.addTrack(track, videoStream)
          })

          this.videoPeerConnection.createOffer().then(offer => {
            return this.videoPeerConnection.setLocalDescription(offer)
          }).then(() => {
            this.socket.emit('video-offer', this.videoPeerConnection.localDescription)
          }).catch(error => {
            console.error('Error creating or sending Video offer', error)
          })
        } else {
          console.error('Canvas not found inside iframe.')
        }
      } catch (error) {
        console.error('Error accessing canvas inside iframe:', error)
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
