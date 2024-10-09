<template>
  <div>
    <!-- Unity Container -->
    <div id="unity-container" ref="unityContainer" class="unity-container">
      <canvas id="unity-canvas" ref="unityCanvas" style="width: 100%; height: 100%;"></canvas>
    </div>

    <!-- Video canvas sẽ hiển thị stream của canvas Unity -->
    <video id="webcam-video" ref="webcamVideo" muted autoplay playsinline style="width: 1px; position: absolute;"></video>
    <canvas id="video-canvas" ref="videoCanvas" style="width: 100%; height: 100%; object-fit: cover; position: absolute;"></canvas>

    <!-- Button để bắt đầu AR -->
    <div id="startARDiv" class="ctaDiv" ref="startARDiv">
        <p style="text-align: center; width:60vw">
            This augmented reality experience requires access to your device's camera and motion sensors.
        </p>
        <button @click="startAR" id="startARButton" style="display: block">ALLOW ACCESS</button>
    </div>

    <!-- Div để hiển thị lỗi nếu có -->
    <div id="errorDiv" ref="errorDiv" class="ctaDiv" style="display: none; background:#aaa">
      <p id="errorText" ref="errorText" style="text-align: center; width:60vw; color:white"></p>
    </div>

    <!-- Video element để hiển thị Unity canvas stream -->
    <video ref="unityStreamVideo" autoplay playsinline style="width: 100%; height: 300px;"></video>
  </div>
</template>

<script>
export default {
  data () {
    return {
      unityInstance: null,
      arCamera: null,
      wTracker: null,
      unityStream: null,
      cameraStream: null
    }
  },
  props: ['selected-Camera'],
  mounted () {
    this.loadExternalScripts() // Nạp các script bên ngoài
  },
  methods: {
    // Nạp các script bên ngoài như arcamera.js, wtracker.js, và Unity loader.js
    loadExternalScripts () {
      this.loadScript('/webgl/arcamera.js')
        .then(() => {
          return this.loadScript('/webgl/wtracker.js')
        })
        .then(() => {
          return this.loadScript('/webgl/Build/MaskTrackBuild_1109.loader.js')
        })
        .then(() => {
          this.initializeUnity() // Khởi tạo Unity sau khi đã nạp đủ script
        })
        .catch((error) => {
          console.error('Failed to load external scripts:', error)
          this.showError('Failed to load necessary scripts.')
        })
    },

    // Hàm dùng để nạp các script bằng cách tạo thẻ <script>
    loadScript (src) {
      return new Promise((resolve, reject) => {
        const script = document.createElement('script')
        script.src = src
        script.type = 'text/javascript'
        script.onload = resolve
        script.onerror = reject
        document.body.appendChild(script)
      })
    },

    async initializeUnity () {
      const buildUrl = '/webgl/Build/'
      const config = {
        dataUrl: buildUrl + 'MaskTrackBuild_1109.data',
        frameworkUrl: buildUrl + 'MaskTrackBuild_1109.framework.js',
        codeUrl: buildUrl + 'MaskTrackBuild_1109.wasm',
        streamingAssetsUrl: 'StreamingAssets',
        companyName: 'SpecialCompany',
        productName: 'TestImageWorldTracker',
        productVersion: '0.1',
        webglContextAttributes: { preserveDrawingBuffer: true }
      }

      const unityCanvas = this.$refs.unityCanvas

      // Khởi tạo Unity WebGL sau khi loader script đã nạp thành công
      window.createUnityInstance(unityCanvas, config).then((unityInstance) => {
        this.unityInstance = unityInstance
        this.initializeARCamera() // Khởi tạo AR camera sau khi Unity đã khởi động
      })
    },

    async initializeARCamera () {
      const unityCanvas = this.$refs.unityCanvas
      const videoCanvas = this.$refs.videoCanvas

      try {
        this.arCamera = new ARCamera(unityCanvas, videoCanvas)
        console.log(this.arCamera)
        console.log('ARCamera initialized:', this.arCamera)

        this.wTracker = new WorldTracker(this.arCamera)
        console.log(this.wTracker)
        console.log('WorldTracker initialized:', this.wTracker)
      } catch (error) {
        console.error('Error initializing ARCamera or WorldTracker:', error)
      }

      try {
        await this.wTracker.initialize('/webgl/opencv.js')
        console.log('World Tracker initialized')
      } catch (error) {
        console.error('Failed to initialize World Tracker', error)
        this.showError('Failed to initialize the World Tracker.')
        return
      }

      await this.requestCameraAccess()
    },

    async requestCameraAccess () {
      try {
        const webcamVideoElement = this.$refs.webcamVideo
        webcamVideoElement.srcObject = selected-Camera

        console.log('Camera access granted')
      } catch (error) {
        console.error('Failed to access camera', error)
        this.showError('Failed to start the experience. Camera permission was denied.')
      }
    },

    startAR () {
    // Kiểm tra sự tồn tại của $refs.startARDiv
      if (this.$refs.startARDiv) {
        this.$refs.startARDiv.style.display = 'none' // Ẩn nút "ALLOW ACCESS"
      } else {
        console.error('startARDiv ref not found')
      }

      // Tiếp tục xử lý AR
      const unityCanvas = this.$refs.unityCanvas
      this.unityStream = unityCanvas.captureStream(30) // 30 FPS
      const unityStreamVideoElement = this.$refs.unityStreamVideo
      unityStreamVideoElement.srcObject = this.unityStream

      console.log('Started streaming Unity canvas')
    },

    showError (message) {
      this.$refs.errorDiv.style.display = 'flex'
      this.$refs.errorText.innerText = message
    }
  }
}
</script>

<style scoped>
.unity-container {
  width: 100%;
  height: 500px;
}

.ctaDiv {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  background: #fffa;
  z-index: 99;
}

#video-canvas {
  position: absolute;
  z-index: -1;
}
</style>
