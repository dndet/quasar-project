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
  props: { selectedCamera: { type: Object, required: true }, stateUnity: { type: Boolean, required: false } },
  watch: {
    selectedCamera: {
      handler (newCamera) {
        this.startVideoStream(newCamera.value)
      },
      immediate: true
    },
    stateUnity: {
      handler (state) {
        if (!state) this.startVideoStream(this.selectedCamera.value)
      }
    }
  },
  methods: {
    beforeDestroy () {
      if (this.stream) {
        const tracks = this.stream.getTracks()
        tracks.forEach((track) => track.stop())
      }
    },
    async startVideoStream (deviceId) {
      try {
        if (this.$refs.video.srcObject) {
          this.$refs.video.srcObject.getTracks().forEach(track => track.stop())
        }
      } catch (e) {}
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { deviceId: { exact: deviceId } }
      })
      this.$refs.video.srcObject = stream
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
