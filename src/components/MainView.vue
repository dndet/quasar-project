<template>
  <div class="main-container">
    <div v-if="!showWebGL">
      <transition name="fade">
        <q-card style="width: 650px; max-width: 100%;">
          <q-card-section>
            <WebcamView />
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
        <q-card>
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
  </div>
  </div>
</template>

<script>
import WebcamView from './WebcamView.vue'
import WebGLView from './WebGLView.vue'
import { QBtn, QDialog, QCard, QCardSection } from 'quasar'

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
      options: []
    }
  },
  methods: {
    toggleWebGL () {
      if (!this.selectedCamera) return
      this.showWebGL = !this.showWebGL
    },
    async getCameras () {
      const devices = await navigator.mediaDevices.enumerateDevices()
      return devices.filter(device => device.kind === 'videoinput')
    }
  },
  async mounted () {
    const videoDevices = await this.getCameras()
    this.options = videoDevices.map(device => ({
      label: device.label || `Camera ${this.options.length + 1}`,
      value: device.deviceId
    }))
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
