<template>
  <div class="main-container">
    <div v-if="!showWebGL">
      <transition name="fade">
        <q-card style="width: 650px; max-width: 100%;">
          <q-card-section>
            <WebcamView :selectedCamera = this.model :stateUnity = this.showWebGL />
          </q-card-section>
          <q-card-actions align="center">
            <q-btn
              @click="toggleWebGL"
              :label="'Open WebGL'"
              color="primary"
              class="toggle-button"
            />
          </q-card-actions>
        </q-card>
      </transition>
    </div>
    <div v-else>
      <q-dialog v-model="showWebGL" persistent maximized transition-show="scale" transition-hide="scale">
        <q-card style="min-width: 100vh">
          <q-card-section>
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <div class="text-h6"></div>
              <q-btn icon="close" flat round dense @click="toggleWebGL" />
            </div>
            <div class="webgl-container">
              <WebGLView :selectedCamera = 'model' />
            </div>
          </q-card-section>
        </q-card>
      </q-dialog>
    </div>
    <div class="q-pa-md">
    <div class="q-gutter-md row">
      <q-select
        label="Cameras"
        transition-show="scale"
        transition-hide="scale"
        filled
        v-model="model"
        :options="options"
        style="width: 250px"
      ></q-select>
    </div>
    <div>
      Alpha: {{this.alpha}}, Beta: {{this.beta}}, Gamma: {{this.gamma}}
      <br>
      {{ this.targetDevice }}
      <br>
      Acceleration - X: {{this.accelerationX}}, Y: {{this.accelerationY}}, Z: {{this.accelerationZ}}
      <br>
      Magnetic Field - X: {{this.magneticFieldX}}, Y: {{this.magneticFieldY}}, Z: {{this.magneticFieldZ}}
      <br>
      Location - Lat: {{this.latitude}}, Long: {{this.longitude}}
    </div>
  </div>
  </div>
</template>

<script>
import WebcamView from './WebcamView.vue'
import WebGLView from './WebGLView.vue'
import { QBtn, QDialog, QCard, QCardSection } from 'quasar'
import Vue from 'vue'

Vue.directive('device-orientation',
  {
    bind (el, binding) {
      const handleOrientation = (event) => {
        binding.value(event)
      }
      window.addEventListener('deviceorientation', handleOrientation)
      el._handleOrientation = handleOrientation
    },
    unbind (el) {
      window.removeEventListener('deviceorientation', el._handleOrientation)
    }
  }
)

export default {
  name: 'MainView',
  components: {
    WebcamView,
    WebGLView,
    QBtn,
    QDialog,
    QCard,
    QCardSection
  },
  data () {
    return {
      showWebGL: false,
      model: null,
      options: [],
      alpha: null,
      beta: null,
      gamma: null,
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
  methods: {
    checkOrientation () {
      if ((this.isIOS() || this.isAndroidDevice()) && this.showWebGL) {
        if (screen.orientation.type === 'portrait-primary' || screen.orientation.type === 'portrait-secondary') {
          document.body.style.transform = 'rotate(90deg)'
          document.querySelector('q-card').style = 'min-width: 100vh'
          screen.orientation.lock('landscape-primary')
        } else {
          document.body.style.transform = ''
        }
      }
    },
    toggleWebGL () {
      if (!this.model) return
      this.showWebGL = !this.showWebGL
      this.checkOrientation()
    },
    async getCameras () {
      const devices = await navigator.mediaDevices.enumerateDevices()
      return devices.filter(device => device.kind === 'videoinput')
    },
    isIOS () {
      return /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream
    },
    isAndroidDevice () {
      return /Android/.test(navigator.userAgent)
    },
    async requestDeviceOrientation () {
      if (typeof DeviceOrientationEvent.requestPermission === 'function') {
        DeviceOrientationEvent.requestPermission()
          .then(permissionState => {
            if (permissionState === 'granted') {
              window.addEventListener('deviceorientation', this.handleOrientation)
              alert('Device orientation access granted.')
            } else {
              alert('Device orientation access denied.')
            }
          })
          .catch(console.error)
      } else {
        window.addEventListener('deviceorientation', this.handleOrientation)
        alert('Device orientation access granted.')
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
  },
  async mounted () {
    if ('Gyroscope' in window) {
      console.log('Gyroscope is supported')
    } else {
      console.log('Gyroscope is not supported')
    }
    const videoDevices = await this.getCameras()
    console.log(videoDevices)
    this.options = videoDevices.map(device => ({
      label: device.label || `Camera ${this.options.length + 1}`,
      value: device.deviceId
    }))
    console.log(this.options)
    this.requestDeviceOrientation()
    this.requestDeviceMotion()
    this.requestMagnetometer()
    this.requestGeolocation()
  }
}
</script>

<style scoped>
.main-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
}

.webcam-section {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.webcam-section video {
  width: 640px;
  height: 480px;
  max-width: 100%;
  border: 1px solid #ccc;
  border-radius: 8px;
}

.toggle-button {
  margin-top: 10px;
}

.webgl-container {
  width: 100%;
  height: auto;
}
</style>
