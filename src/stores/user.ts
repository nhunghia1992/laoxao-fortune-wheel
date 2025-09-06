import type { Item } from '@/vue3-roulette';
import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useUserStore = defineStore('user', () => {
  const name = ref<string>('');
  const phone = ref<string>('');
  const gift = ref<Item | null>(null)
  const giftCode = ref<string | null>(null);

  return {
    name,
    phone,
    gift,
    giftCode
  }
}, {
  persist: true,
});
