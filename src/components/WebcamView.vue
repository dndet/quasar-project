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
      stream: null,
      alpha: 0,
      beta: 0,
      gamma: 0,
      accelerationX: null,
      accelerationY: null,
      accelerationZ: null,
      magneticFieldX: null,
      magneticFieldY: null,
      magneticFieldZ: null,
      lightLevel: null,
      proximityDistance: null,
      latitude: null,
      longitude: null,
      targetDevice: null
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
  async mounted () {
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
    },
    async requestDeviceOrientation () {
      if (typeof DeviceOrientationEvent.requestPermission === 'function') {
        DeviceOrientationEvent.requestPermission()
          .then(permissionState => {
            if (permissionState === 'granted') {
              window.addEventListener('deviceorientation', this.handleOrientation)
              console.log('Device orientation access granted.')
            } else {
              console.log('Device orientation access denied.')
            }
          })
          .catch(console.error)
      } else {
        window.addEventListener('deviceorientation', this.handleOrientation)
        console.log('Device orientation access granted.')
      }
      console.log(window)
    },
    handleOrientation (event) {
      this.alpha = event.alpha
      this.beta = event.beta
      this.gamma = event.gamma
      console.log(`Alpha: ${this.alpha}, Beta: ${this.beta}, Gamma: ${this.gamma}`)
    },
    async requestDeviceMotion () {
      await window.addEventListener('devicemotion', this.handleMotion)
    },
    handleMotion (event) {
      this.accelerationX = event.acceleration.x
      this.accelerationY = event.acceleration.y
      this.accelerationZ = event.acceleration.z
      console.log(event)
      console.log(`Acceleration - X: ${this.accelerationX}, Y: ${this.accelerationY}, Z: ${this.accelerationZ}`)
    },
    requestMagnetometer () {
      console.log(navigator)
      if ('Magnetometer' in navigator) {
        const magnetometer = navigator.magnetometer
        console.log(magnetometer)
        magnetometer.addEventListener('reading', this.handleMagnetometer)
        magnetometer.start()
      } else {
        console.log('Magnetometer not supported.')
      }
    },
    handleMagnetometer (event) {
      this.magneticFieldX = event.magneticField.x
      this.magneticFieldY = event.magneticField.y
      this.magneticFieldZ = event.magneticField.z
      console.log(`Magnetic Field - X: ${this.magneticFieldX}, Y: ${this.magneticFieldY}, Z: ${this.magneticFieldZ}`)
    },
    requestGeolocation () {
      if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            this.handleGeolocation(position)
          }
        )
      } else {
        console.log('Geolocation not supported.')
      }
    },
    handleGeolocation (position) {
      this.latitude = position.coords.latitude
      this.longitude = position.coords.longitude
      console.log(`Location - Lat: ${this.latitude}, Long: ${this.longitude}`)
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
