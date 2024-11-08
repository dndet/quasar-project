// src/boot/firebase.js

import { requestPermission } from 'src/firebase'

export default async ({ app, router, Vue }) => {
  const token = await requestPermission()
  console.log(token)
}
