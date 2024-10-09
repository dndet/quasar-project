<template>
  <div class="webcam-container">
    <video ref="video" autoplay playsinline></video>
  </div>
</template>

<script>
export default {
  name: 'WebcamView',
  data () {
    return {
      stream: null
    }
  },
  props: ['selected-Camera'],
  mounted () {
    this.startWebcam()
  },
  methods: {
    async startWebcam () {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ video: true })
          this.$refs.video.srcObject = stream
          this.stream = stream
        } catch (err) {
          console.error('Error accessing webcam: ', err)
        }
      } else {
        console.error('getUserMedia không được hỗ trợ trên trình duyệt của bạn!')
      }
    },
    beforeDestroy () {
      if (this.stream) {
        const tracks = this.stream.getTracks()
        tracks.forEach((track) => track.stop())
      }
    }
  }
}
</script>

<style scoped>
.webcam-container {
  width: 100%;
  height: auto;
}

.webcam-container video {
  width: 100%;
  height: auto;
  object-fit: cover;
}
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s;
}
.fade-enter,
.fade-leave-to {
  opacity: 0;
}
</style>
