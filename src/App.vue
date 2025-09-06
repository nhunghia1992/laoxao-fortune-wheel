<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { Roulette } from 'vue3-roulette'
import logoSrc from '@/imgs/laoxao-logo.png'
import axios from 'axios'
import type { Item } from './vue3-roulette'
import { useUserStore } from './stores/user'

const user = useUserStore()

const isSubmitting = ref<boolean>(false)
const wheel = ref<InstanceType<typeof Roulette> | null>(null)
const items = ref<Item[]>([])
const giftIndex = ref<{ value: number } | null>(null)

async function handleFormSubmit() {
  isSubmitting.value = true
  const res = await axios.get(`https://sheets.googleapis.com/v4/spreadsheets/1lXyTT6xqprmSOp5DvTN2etoEKv-zZvkn0EetvZp7TG4/values/Form Responses 1!A2:D?key=${import.meta.env.VITE_GOOGLE_API_KEY}`)
  do {
    giftIndex.value = { value: Math.floor(Math.random() * items.value.length) }
  } while (validateGift(res.data.values) === false)

  isSubmitting.value = false
}

function validateGift(results: [string, string, string, string]) {
  const selectedGift = items.value[giftIndex.value!.value]
  const usedCount = results.filter(row => row[3] === selectedGift.name).length
  return selectedGift.limit === 0 || usedCount < selectedGift.limit
}

function handleWheelStart() {
  if (user.giftCode) return;
  wheel.value?.launchWheel()
}

const handleWheelEnd = (result: Item) => {
  if (user.giftCode) return;
  setTimeout(async () => {
    user.giftCode = Array.from({ length: 6 }, () => 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'[Math.floor(Math.random() * 36)]).join('')
    user.gift = result
    await axios.post('https://docs.google.com/forms/d/e/1FAIpQLSceCDJpQyNzJWWEbmaLeOiCN2xQkXRJRt5AfXdcoMPETK1xpQ/formResponse', {
      'entry.514126671': user.name,
      'entry.226783967': user.phone,
      'entry.847178989': result.name,
      'entry.1710385820': user.giftCode
    }, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    }).catch(() => { })
  }, 1500)
}

onMounted(async () => {
  const res = await axios.get(`https://sheets.googleapis.com/v4/spreadsheets/1lXyTT6xqprmSOp5DvTN2etoEKv-zZvkn0EetvZp7TG4/values/Prize!A2:F?key=${import.meta.env.VITE_GOOGLE_API_KEY}`)
  items.value = res.data.values.map((row: [string, string, string, string, string, string]) => ({
    id: parseInt(row[0]),
    name: row[1],
    htmlContent: row[2],
    background: row[3],
    textColor: row[4],
    limit: parseInt(row[5])
  }))
})
</script>

<template>
  <Roulette v-if="giftIndex && !user.giftCode" ref="wheel" :items="items" :wheel-result-index="giftIndex"
    :display-border="true" :display-shadow="true" :result-variation="50" :duration="6" :size="350" :base-display="true"
    :base-display-indicator="true" base-background="#ffffff" :base-display-shadow="true" @wheel-end="handleWheelEnd">
    <template #baseContent>
      <img :src="logoSrc" @click="handleWheelStart" style="width: 100%; padding: 5px;" />
    </template>
  </Roulette>
  <section v-else class="card">
    <template v-if="!user.giftCode">
      <h2>Chào Tân sinh viên Ngoại Thương</h2>
      <p class="muted">Vui lòng điền thông tin để nhận phần quà</p>

      <form @submit.prevent="handleFormSubmit">
        <div class="field">
          <input id="name" v-model="user.name" placeholder="Họ và tên" required />
          <label for="name">Họ và tên</label>
        </div>

        <div class="field">
          <input id="phone" v-model="user.phone" type="tel" pattern="^(0|\+84|84)\d{9}$" placeholder="Số điện thoại"
            required />
          <label for="phone">Số điện thoại</label>
        </div>

        <button class="btn" type="submit" :disabled="isSubmitting">Bắt đầu</button>
      </form>
    </template>
    <template v-else>
      <h2>Xin chúc mừng {{ user.name }}!</h2>
      <p class="muted">Bạn đã nhận được phần quà:</p>
      <p style="margin-bottom: 22px; font-weight: 700;">{{ user.gift?.name }}</p>
      <p class="muted" style="margin-top: 16px;">Mã quà tặng của bạn là:</p>
      <h2 style="letter-spacing: 4px; margin-bottom: 8px;">{{ user.giftCode }}</h2>
      <p class="muted">Vui lòng đưa mã này cho nhân viên để nhận quà.</p>
    </template>
  </section>
</template>

<style>
#app {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-image: url('@/imgs/bg.jpg');
  background-size: cover;
  background-position: top center;
  background-repeat: no-repeat;
  background-attachment: fixed;
}

:root {
  /* Palette inspired by the artwork */
  --bg-1: #F6E8DA;
  /* light peach */
  --bg-2: #F1E2D3;
  /* warm cream */
  --card: #FFF9F2;
  /* paper cream */
  --line: #E9D9C7;
  /* sand line */
  --green-700: #1F4F3B;
  /* forest */
  --green-600: #2E6A52;
  /* leaf */
  --green-100: #E4EFEA;
  /* pale mint */
  --text: #3C463F;
  /* soft charcoal */
  --shadow: 0 12px 30px rgba(31, 79, 59, .12), 0 2px 6px rgba(31, 79, 59, .08);
  --radius: 18px;
}

.card {
  background: var(--card);
  border: 1px solid var(--line);
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  padding: clamp(22px, 4.2vw, 36px);
}

.card h2 {
  margin: 0 0 4px;
  font-size: clamp(20px, 2.4vw, 24px);
  color: var(--green-700);
  letter-spacing: .3px;
}

.muted {
  color: #7a7a7a;
  margin-bottom: 22px;
}

/* Floating inputs */
.field {
  position: relative;
  margin: 18px 0 22px;
}

.field input {
  width: 100%;
  padding: 16px 14px 14px;
  background: #FFFDF8;
  border: 1.5px solid #E7D9C9;
  border-radius: 14px;
  outline: none;
  font-size: 16px;
  transition: .2s border, .2s box-shadow, .2s background;
  color: var(--text);
  box-shadow: inset 0 2px 6px rgba(31, 79, 59, .05);
}

.field input::placeholder {
  color: transparent;
}

.field label {
  position: absolute;
  left: 14px;
  top: 50%;
  transform: translateY(-50%);
  background: linear-gradient(180deg, #FFFDF8 0%, #FFF9F2 100%);
  padding: 0 6px;
  color: #8a8a8a;
  transition: .2s ease;
  pointer-events: none;
  border-radius: 6px;
}

.field input:focus {
  border-color: var(--green-600);
  box-shadow: 0 0 0 6px var(--green-100);
  background: #FFFCF5;
}

.field input:focus+label,
.field input:not(:placeholder-shown)+label {
  top: 0;
  transform: translateY(-50%) scale(.92);
  color: var(--green-700);
}

/* Small row */
.row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin: -4px 0 16px;
  font-size: 14px;
}

.row a {
  color: var(--green-600);
  text-decoration: none
}

.row a:hover {
  text-decoration: underline
}

/* Button */
.btn {
  width: 100%;
  appearance: none;
  border: none;
  border-radius: 14px;
  padding: 14px 16px;
  background: linear-gradient(180deg, var(--green-600), var(--green-700));
  color: #fff;
  font-weight: 700;
  letter-spacing: .4px;
  cursor: pointer;
  transition: transform .05s ease, filter .2s;
  box-shadow: 0 10px 24px rgba(31, 79, 59, .25), 0 2px 6px rgba(31, 79, 59, .2);
  font-family: "Montserrat", sans-serif;
  font-size: 16px;
}

.btn:active {
  transform: translateY(1px);
}

.btn:focus-visible {
  outline: 3px solid var(--green-100);
  outline-offset: 3px;
}

/* Secondary links */
.alt {
  margin-top: 14px;
  font-size: 14px;
  text-align: center;
  color: #7a7a7a;
}

.alt a {
  color: var(--green-600);
  text-decoration: none
}

.alt a:hover {
  text-decoration: underline
}

.wheel-base-indicator::before {
  left: 50%;
}
</style>
