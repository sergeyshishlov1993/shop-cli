<script setup lang="ts">
import { adminApi, getAdminError } from '~/modules/admin/adminApi'
import { useSettingsStore } from '~/modules/settings/settingsStore'
import { getPublicMediaUrl } from '~/modules/common/helpers/fileUrl'
import { rules, useFormValidation } from '~/modules/common/composables/useFormValidation'
definePageMeta({layout:'admin',middleware:'admin'})
const toast=useToast();const loading=ref(true);const saving=ref('');const apiKey=ref('');const hasApiKey=ref(false);const testing=ref(false);const telegramToken=ref('');const settingsStore=useSettingsStore()
const general=reactive({storePhone:'',storeEmail:'',storeAddress:'',currency:'UAH',defaultLowStockThreshold:3,instagram:'',telegram:'',facebook:'',seoTitle:'',seoDescription:''})
type ThemeColorKey='backgroundColor'|'surfaceColor'|'textColor'|'primaryColor'|'primarySoftColor'|'primaryStrongColor'
type ThemeColors=Pick<StoreTheme,ThemeColorKey>
const defaultThemeColors:ThemeColors={backgroundColor:'#fbf6f3',surfaceColor:'#ffffff',textColor:'#3a3230',primaryColor:'#d8a7a0',primarySoftColor:'#f3e3df',primaryStrongColor:'#a8665f'}
const defaultTheme: StoreTheme={...defaultThemeColors,backgroundMediaType:'NONE',backgroundMediaUrl:'',backgroundMediaPosition:'center center',backgroundMediaOpacity:'0.18'}
const theme=reactive<StoreTheme>({...defaultTheme})
const themePresets=[
  {name:'Stella',colors:{...defaultThemeColors}},
  {name:'Шампань',colors:{...defaultThemeColors,backgroundColor:'#fbf8f3',surfaceColor:'#ffffff',textColor:'#312b27',primaryColor:'#b9936c',primarySoftColor:'#f2e7da',primaryStrongColor:'#806144'}},
  {name:'Графіт',colors:{...defaultThemeColors,backgroundColor:'#f4f4f4',surfaceColor:'#ffffff',textColor:'#171717',primaryColor:'#333333',primarySoftColor:'#e5e5e5',primaryStrongColor:'#111111'}},
]
const themeFields: Array<{key:ThemeColorKey,label:string}>=[{key:'backgroundColor',label:'Фон сторінок'},{key:'surfaceColor',label:'Фон блоків'},{key:'textColor',label:'Основний текст'},{key:'primaryColor',label:'Акцент'},{key:'primarySoftColor',label:'Світлий акцент'},{key:'primaryStrongColor',label:'Темний акцент'}]
const themeMediaFile=ref<File|null>(null)
const uploadingThemeMedia=ref(false)
const localThemePreviewUrl=ref('')
const themePreviewUrl=computed(()=>localThemePreviewUrl.value||getPublicMediaUrl(theme.backgroundMediaUrl))
const themePreviewType=computed(()=>themeMediaFile.value?.type.startsWith('video/')||theme.backgroundMediaType==='VIDEO'?'VIDEO':'IMAGE')
const notifications=reactive({telegramChatId:'',hasTelegramBotToken:false,notifyOnNewOrder:true,notifyOnNewReview:true,notifyOnNewFeedback:true,notifyOnLowStock:true})
const generalV=useFormValidation({storeEmail:[()=>general.storeEmail,[rules.email()]],defaultLowStockThreshold:[()=>general.defaultLowStockThreshold,[rules.required('Вкажіть поріг'),rules.integer(),rules.min(0)]]})
const novaV=useFormValidation({novaPoshtaApiKey:[()=>apiKey.value,[rules.required('Вкажіть ключ'),rules.minLength(10)]]})
// Мапимо помилки бекенду на поля; тост — лише якщо лишились нерозпізнані
function handleFormError(v:{applyServerErrors:(e:unknown)=>string[],errors:Record<string,string>},e:unknown){const rest=v.applyServerErrors(e);if(rest.length||!Object.values(v.errors).some(Boolean))toast.error(getAdminError(e))}
async function load(){loading.value=true;try{const [settings,notify]=await Promise.all([adminApi.settings(),adminApi.notificationSettings()]);Object.assign(returnsForm,{returnsEnabled:settings.returnsEnabled!==false,returnWindowDays:settings.returnWindowDays??14});Object.assign(general,{storePhone:settings.storePhone||'',storeEmail:settings.storeEmail||'',storeAddress:settings.storeAddress||'',currency:settings.currency,defaultLowStockThreshold:settings.defaultLowStockThreshold,instagram:settings.socialLinksJson?.instagram||'',telegram:settings.socialLinksJson?.telegram||'',facebook:settings.socialLinksJson?.facebook||'',seoTitle:settings.seoDefaultsJson?.title||'',seoDescription:settings.seoDefaultsJson?.description||''});Object.assign(theme,defaultTheme,settings.themeJson||{});hasApiKey.value=settings.hasNovaPoshtaApiKey;Object.assign(notifications,{telegramChatId:notify.telegramChatId||'',hasTelegramBotToken:notify.hasTelegramBotToken,notifyOnNewOrder:notify.notifyOnNewOrder,notifyOnNewReview:notify.notifyOnNewReview,notifyOnNewFeedback:notify.notifyOnNewFeedback,notifyOnLowStock:notify.notifyOnLowStock})}catch(e){toast.error(getAdminError(e))}finally{loading.value=false}}
async function saveGeneral(){if(!generalV.validate())return;saving.value='general';try{await adminApi.updateSettings({storePhone:general.storePhone,storeEmail:general.storeEmail,storeAddress:general.storeAddress,currency:general.currency,defaultLowStockThreshold:Number(general.defaultLowStockThreshold),socialLinksJson:{telegram:general.telegram,instagram:general.instagram,facebook:general.facebook},seoDefaultsJson:{title:general.seoTitle,description:general.seoDescription}});toast.success('Налаштування магазину збережено')}catch(e){handleFormError(generalV,e)}finally{saving.value=''}}
// Повернення: тумблер блоку й строк
const returnsForm=reactive({returnsEnabled:true,returnWindowDays:14})
const returnsV=useFormValidation({returnWindowDays:[()=>returnsForm.returnWindowDays,[rules.required('Вкажіть строк'),rules.integer(),rules.min(1),rules.max(365)]]})
async function saveReturns(){if(!returnsV.validate())return;saving.value='returns';try{await adminApi.updateSettings({returnsEnabled:returnsForm.returnsEnabled,returnWindowDays:Number(returnsForm.returnWindowDays)});await settingsStore.fetch(true);toast.success(returnsForm.returnsEnabled?'Повернення увімкнено':'Повернення вимкнено')}catch(e){handleFormError(returnsV,e)}finally{saving.value=''}}
async function saveTheme(){saving.value='theme';try{await adminApi.updateSettings({themeJson:{...theme}});await settingsStore.fetch(true);toast.success('Кольорову схему збережено')}catch(e){toast.error(getAdminError(e))}finally{saving.value=''}}
function applyPreset(preset:ThemeColors){Object.assign(theme,preset)}
function inferMediaType(url:string):'IMAGE'|'VIDEO'{return /\.(mp4|mov|webm)(?:[?#].*)?$/i.test(url.trim())?'VIDEO':'IMAGE'}
async function uploadThemeMedia(){if(!themeMediaFile.value)return;uploadingThemeMedia.value=true;try{const file=await adminApi.uploadFile(themeMediaFile.value);theme.backgroundMediaUrl=file.url;theme.backgroundMediaType=file.fileType;themeMediaFile.value=null;await saveTheme()}catch(e){toast.error(getAdminError(e))}finally{uploadingThemeMedia.value=false}}
async function applyThemeUrl(){if(!theme.backgroundMediaUrl.trim())return toast.error('Вставте посилання');theme.backgroundMediaType=inferMediaType(theme.backgroundMediaUrl);await saveTheme()}
async function removeThemeMedia(){theme.backgroundMediaType='NONE';theme.backgroundMediaUrl='';themeMediaFile.value=null;await saveTheme()}
watch(themeMediaFile,file=>{if(localThemePreviewUrl.value)URL.revokeObjectURL(localThemePreviewUrl.value);localThemePreviewUrl.value=file&&import.meta.client?URL.createObjectURL(file):''})
onBeforeUnmount(()=>{if(localThemePreviewUrl.value)URL.revokeObjectURL(localThemePreviewUrl.value)})
async function saveNova(){if(!novaV.validate())return;saving.value='nova';try{const s=await adminApi.updateSettings({novaPoshtaApiKey:apiKey.value.trim()});hasApiKey.value=s.hasNovaPoshtaApiKey;apiKey.value='';novaV.reset();toast.success('Ключ Нової пошти оновлено')}catch(e){handleFormError(novaV,e)}finally{saving.value=''}}
async function testNova(){testing.value=true;try{const cities=await adminApi.testNovaPoshta();toast.success(`Підключення працює: ${cities.length} результатів`)}catch(e){toast.error(getAdminError(e))}finally{testing.value=false}}
async function saveNotifications(){saving.value='telegram';try{const result=await adminApi.updateNotificationSettings({telegramBotToken:telegramToken.value.trim()||undefined,telegramChatId:notifications.telegramChatId.trim()||undefined,notifyOnNewOrder:notifications.notifyOnNewOrder,notifyOnNewReview:notifications.notifyOnNewReview,notifyOnNewFeedback:notifications.notifyOnNewFeedback,notifyOnLowStock:notifications.notifyOnLowStock});notifications.hasTelegramBotToken=result.hasTelegramBotToken;telegramToken.value='';toast.success('Telegram-сповіщення оновлено')}catch(e){toast.error(getAdminError(e))}finally{saving.value=''}}
await load()
</script>
<template>
  <div class="mx-auto max-w-5xl space-y-6">
    <div><h1 class="text-3xl font-bold">Налаштування</h1><p class="text-sm text-secondary-500">Контакти, SEO та інтеграції без редагування коду.</p></div>
    <div v-if="loading" class="rounded-xl border border-secondary-200 bg-white p-12 text-center">Завантаження…</div>
    <template v-else>
      <section class="rounded-xl border border-secondary-200 bg-white p-6"><h2 class="text-lg font-semibold">Магазин</h2><form novalidate class="mt-5 grid gap-4 sm:grid-cols-2" @submit.prevent="saveGeneral"><BInput v-model="general.storePhone" label="Телефон"/><BInput v-model="general.storeEmail" type="email" label="Email" :error="generalV.errors.storeEmail" @blur="generalV.touch('storeEmail')"/><BInput v-model="general.storeAddress" label="Адреса" class="sm:col-span-2"/><BInput v-model="general.currency" label="Валюта"/><BInput v-model.number="general.defaultLowStockThreshold" type="number" min="0" label="Поріг низького залишку" required :error="generalV.errors.defaultLowStockThreshold" @blur="generalV.touch('defaultLowStockThreshold')"/><BInput v-model="general.telegram" label="Telegram (https://t.me/...)"/><BInput v-model="general.instagram" label="Instagram"/><BInput v-model="general.facebook" label="Facebook"/><BInput v-model="general.seoTitle" label="SEO title за замовчуванням" class="sm:col-span-2"/><BTextarea v-model="general.seoDescription" label="SEO description" class="sm:col-span-2"/><div class="flex justify-end sm:col-span-2"><BBtn type="submit" :loading="saving==='general'">Зберегти</BBtn></div></form></section>

      <section class="rounded-xl border border-secondary-200 bg-white p-6">
        <h2 class="text-lg font-semibold">Повернення</h2>
        <p class="mt-1 text-sm text-secondary-500">Якщо вимкнути — зникнуть вкладка «Повернення» в кабінеті, кнопки «Оформити повернення» і розділ в адмінці; API клієнта відповідатиме «недоступно». Наявні заявки збережуться.</p>
        <form novalidate class="mt-5 grid gap-4 sm:grid-cols-[auto_12rem_auto] sm:items-end" @submit.prevent="saveReturns">
          <BToggle v-model="returnsForm.returnsEnabled" label="Повернення увімкнені" />
          <BInput v-model="returnsForm.returnWindowDays" type="number" label="Строк, днів після доставки" :disabled="!returnsForm.returnsEnabled" required :error="returnsV.errors.returnWindowDays" @blur="returnsV.touch('returnWindowDays')" />
          <BBtn type="submit" :loading="saving==='returns'">Зберегти</BBtn>
        </form>
      </section>
      <section class="rounded-xl border border-secondary-200 bg-white p-6">
        <div><h2 class="text-lg font-semibold">Вигляд сайту</h2><p class="text-sm text-secondary-500">Фон, поверхні, текст і акцентні кольори вітрини.</p></div>
        <div class="mt-5 flex flex-wrap gap-2">
          <button v-for="preset in themePresets" :key="preset.name" type="button" class="flex items-center gap-2 rounded-xl border border-secondary-200 px-3 py-2 text-sm hover:border-secondary-400" @click="applyPreset(preset.colors)">
            <span class="size-5 rounded-full border border-secondary-200" :style="{background: `linear-gradient(135deg, ${preset.colors.backgroundColor} 50%, ${preset.colors.primaryColor} 50%)`}" />{{ preset.name }}
          </button>
        </div>
        <form novalidate class="mt-5 grid gap-4 sm:grid-cols-2" @submit.prevent="saveTheme()">
          <label v-for="field in themeFields" :key="field.key" class="flex items-center justify-between gap-4 rounded-xl border border-secondary-200 p-3 text-sm">
            <span>{{ field.label }}</span><span class="flex items-center gap-2 font-mono text-xs text-secondary-500"><input v-model="theme[field.key]" type="color" class="h-9 w-12 cursor-pointer rounded border-0 bg-transparent" />{{ theme[field.key] }}</span>
          </label>
          <div class="space-y-4 rounded-xl border border-secondary-200 p-4 sm:col-span-2">
            <div><h3 class="font-semibold">Фон body</h3><p class="text-sm text-secondary-500">Колір, зображення або анімація під сторінками. Головний слайдер налаштовується окремо в розділі «Контент».</p></div>
            <div class="grid gap-4 sm:grid-cols-2">
              <BSelect v-model="theme.backgroundMediaType" label="Тип фону" :options="[{label:'Тільки колір',value:'NONE'},{label:'Зображення',value:'IMAGE'},{label:'Анімація / відео',value:'VIDEO'}]" />
              <BInput v-model="theme.backgroundMediaPosition" label="Позиція" placeholder="center center" />
              <div class="flex flex-col gap-2 sm:col-span-2 sm:flex-row sm:items-end"><BInput v-model="theme.backgroundMediaUrl" label="URL зображення або відео" class="min-w-0 flex-1" /><BBtn type="button" variant="outline" :loading="saving==='theme'" @click="applyThemeUrl">Застосувати</BBtn></div>
              <label class="text-sm font-medium sm:col-span-2">Видимість медіа: {{ Math.round(Number(theme.backgroundMediaOpacity || 0)*100) }}%
                <input v-model="theme.backgroundMediaOpacity" type="range" min="0" max="1" step="0.05" class="mt-2 w-full accent-primary-500" />
              </label>
              <BFile v-model="themeMediaFile" label="Завантажити зображення або відео" accept="image/jpeg,image/png,image/webp,video/mp4,video/quicktime" :max-size="50*1024*1024" class="sm:col-span-2" />
              <div v-if="themePreviewUrl" class="flex items-start gap-4 rounded-xl bg-secondary-50 p-4 sm:col-span-2">
                <video v-if="themePreviewType==='VIDEO'" :src="themePreviewUrl" class="h-36 w-36 rounded-lg object-cover" muted autoplay loop playsinline />
                <BPreview v-else :src="themePreviewUrl" alt="Попередній перегляд фону body" size="lg" removable @remove="removeThemeMedia" />
                <div class="min-w-0 text-sm"><p class="font-semibold">Попередній перегляд медіа</p><p class="mt-1 break-all text-secondary-500">{{ themeMediaFile?.name||theme.backgroundMediaUrl }}</p></div>
              </div>
            </div>
            <div class="flex justify-end gap-2"><BBtn v-if="theme.backgroundMediaUrl" type="button" variant="outline" @click="removeThemeMedia">Прибрати медіа</BBtn><BBtn type="button" :disabled="!themeMediaFile" :loading="uploadingThemeMedia" @click="uploadThemeMedia">Завантажити</BBtn></div>
          </div>
          <div class="overflow-hidden rounded-xl border border-secondary-200 p-5 sm:col-span-2" :style="{backgroundColor:theme.backgroundColor,color:theme.textColor}">
            <div class="rounded-xl p-4 shadow-sm" :style="{backgroundColor:theme.surfaceColor}"><p class="font-semibold">Попередній перегляд</p><p class="mt-1 text-sm opacity-70">Так виглядатиме базова кольорова схема.</p><button type="button" class="mt-4 rounded-full px-5 py-2 text-sm font-semibold text-white" :style="{backgroundColor:theme.primaryColor}">Основна кнопка</button></div>
          </div>
          <div class="flex justify-end sm:col-span-2"><BBtn type="submit" :loading="saving==='theme'">Зберегти схему</BBtn></div>
        </form>
      </section>

      <section class="rounded-xl border border-secondary-200 bg-white p-6"><div class="flex flex-wrap justify-between gap-4"><div><h2 class="text-lg font-semibold">Нова пошта</h2><p class="text-sm text-secondary-500">Міста, відділення та трекінг.</p></div><span class="rounded-full px-3 py-1 text-xs" :class="hasApiKey?'bg-emerald-50 text-emerald-700':'bg-amber-50 text-amber-700'">{{ hasApiKey?'Ключ налаштований':'Ключ не заданий' }}</span></div><form novalidate class="mt-5 space-y-4" @submit.prevent="saveNova"><BPasswordInput v-model="apiKey" label="Новий API-ключ" autocomplete="new-password" :error="novaV.errors.novaPoshtaApiKey"/><p class="text-xs text-secondary-500">Поточний ключ не відображається і не повертається API.</p><div class="flex justify-end gap-3"><BBtn type="button" variant="outline" :disabled="!hasApiKey" :loading="testing" @click="testNova">Перевірити</BBtn><BBtn type="submit" :disabled="apiKey.trim().length<10" :loading="saving==='nova'">Оновити ключ</BBtn></div></form></section>

      <section class="rounded-xl border border-secondary-200 bg-white p-6"><div class="flex flex-wrap justify-between gap-2"><div><h2 class="text-lg font-semibold">Telegram</h2><p class="text-sm text-secondary-500">Канал та типи адміністративних сповіщень.</p></div><span class="text-xs" :class="notifications.hasTelegramBotToken?'text-emerald-700':'text-amber-700'">{{ notifications.hasTelegramBotToken?'Токен заданий':'Токен не заданий' }}</span></div><form novalidate class="mt-5 grid gap-4 sm:grid-cols-2" @submit.prevent="saveNotifications"><BPasswordInput v-model="telegramToken" label="Новий bot token"/><BInput v-model="notifications.telegramChatId" label="Chat ID"/><div class="grid gap-3 sm:col-span-2 sm:grid-cols-2"><BCheckbox v-model="notifications.notifyOnNewOrder" label="Нові замовлення"/><BCheckbox v-model="notifications.notifyOnNewReview" label="Нові відгуки"/><BCheckbox v-model="notifications.notifyOnNewFeedback" label="Нові звернення"/><BCheckbox v-model="notifications.notifyOnLowStock" label="Низькі залишки"/></div><p class="text-xs text-secondary-500 sm:col-span-2">При зміні токена або Chat ID backend відправить тестове повідомлення. Значення зберігаються лише після успішної перевірки.</p><div class="flex justify-end sm:col-span-2"><BBtn type="submit" :loading="saving==='telegram'">Зберегти сповіщення</BBtn></div></form></section>
    </template>
  </div>
</template>
