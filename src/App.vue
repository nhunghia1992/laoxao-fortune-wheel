<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { FortuneWheel } from 'vue3-fortune-wheel'
import type { Data, ImgParams } from 'vue3-fortune-wheel'
import logoSrc from '@/imgs/laoxao-logo.png'
import axios from 'axios'

const formData = ref<{
  name: string
  phone: string
}>({
  name: '',
  phone: ''
})
const isSubmitting = ref<boolean>(false)

const gift = ref<number>(0)
const wheel = ref<InstanceType<typeof FortuneWheel> | null>(null)
const data = ref<Data[]>([])
const logo: ImgParams = {
  src: logoSrc,
  width: 100,
  height: 100
}

const done = (r: Data) => {
  console.log('done', r)
}

async function handleFormSubmit() {
  isSubmitting.value = true
  const randomGiftIndex = Math.floor(Math.random() * data.value.length)
  const randomGift = data.value[randomGiftIndex]

  await axios.post('https://docs.google.com/forms/d/e/1FAIpQLSceCDJpQyNzJWWEbmaLeOiCN2xQkXRJRt5AfXdcoMPETK1xpQ/formResponse', {
    'entry.514126671': formData.value.name,
    'entry.226783967': formData.value.phone,
    'entry.847178989': randomGift.value
  }, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  }).catch(() => { })

  isSubmitting.value = false
  gift.value = randomGift.id as number
}

onMounted(async () => {
  const res = await axios.get(`https://sheets.googleapis.com/v4/spreadsheets/1lXyTT6xqprmSOp5DvTN2etoEKv-zZvkn0EetvZp7TG4/values/Prize!A2:D?key=${import.meta.env.VITE_GOOGLE_API_KEY}`)
  data.value = res.data.values.map((row: [string, string, string, string]) => ({
    id: parseInt(row[0]),
    value: row[1],
    bgColor: row[2],
    color: row[3]
  }))
})
</script>

<template>
  <div v-show="gift" class="wrap">
    <FortuneWheel v-if="data.length" ref="wheel" v-model="gift" :auto-spin="true" :middle-circle="true"
      :imgParams="logo" :data="data" :anim-duration="8000" @done="done" />
  </div>
  <form v-show="!gift" class="form" @submit.prevent="handleFormSubmit">
    <label>Họ và tên</label>
    <input v-model="formData.name" required />
    <label>Số điện thoại</label>
    <input v-model="formData.phone" required />
    <button type="submit" :disabled="isSubmitting">Bắt đầu</button>
  </form>
</template>

<style>
.form label {
  display: block;
  font-weight: 700;
  margin-bottom: 0.25rem;
}

.form input {
  display: block;
  margin-bottom: 1rem;
}

.wrap {
  transform: rotate(180deg);
  display: flex;
  width: 100%;
}

.wheelholder image {
  transform: rotate(180deg);
}

.middleArcText textPath {
  font-size: 16px;
}
</style>
