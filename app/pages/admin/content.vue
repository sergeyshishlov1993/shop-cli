<script setup lang="ts">
import { adminApi, getAdminError, type AdminHeroSlide, type AdminPageContent, type AdminPromoBlock } from '~/modules/admin/adminApi'
import AdminDialog from '~/modules/admin/components/AdminDialog.vue'
import { catalogApi } from '~/modules/catalog/catalogApi'
import { useConfirm } from '~/modules/ui/composables/useConfirm'
import { rules, useFormValidation } from '~/modules/common/composables/useFormValidation'
definePageMeta({layout:'admin',middleware:'admin'})
const { confirm: confirmDialog }=useConfirm();
const toast=useToast();const tab=ref<'hero'|'promo'|'pages'>('hero');const heroes=ref<AdminHeroSlide[]>([]);const promos=ref<AdminPromoBlock[]>([]);const pages=ref<AdminPageContent[]>([])
const contentTabs = [{ k: 'hero', l: 'Головний банер' }, { k: 'promo', l: 'Промо-блоки' }, { k: 'pages', l: 'Сторінки' }] as const
const heroDialog=ref(false);const heroId=ref<number|null>(null);const heroFile=shallowRef<File|null>(null);const heroForm=reactive({title:'',subtitle:'',buttonText:'',buttonLink:'',mediaFileId:0,mediaType:'IMAGE' as 'IMAGE'|'VIDEO',isActive:true,sortOrder:0,focalX:0.5,focalY:0.5,focalXTablet:0.5,focalYTablet:0.5,focalXMobile:0.5,focalYMobile:0.5})
// Превʼю: щойно обраний файл (ще не збережений) або вже завантажене медіа слайда
const heroFilePreview=computed(()=>heroFile.value&&heroFile.value.type.startsWith('image/')&&import.meta.client?URL.createObjectURL(heroFile.value):'')
watch(heroFilePreview,(_,old)=>{if(old)URL.revokeObjectURL(old)})
const heroMediaUrl=computed(()=>{if(heroFilePreview.value)return heroFilePreview.value;const h=heroes.value.find(x=>x.id===heroId.value);return h?.mediaFile&&h.mediaType==='IMAGE'?getFileUrl(h.mediaFile,'medium'):''})
const promoDialog=ref(false);const promoId=ref<number|null>(null);const promoForm=reactive({type:'CUSTOM' as AdminPromoBlock['type'],title:'',isActive:true,sortOrder:0,imageFileId:null as number|null,focalX:0.5,focalY:0.5,focalXTablet:0.5,focalYTablet:0.5,focalXMobile:0.5,focalYMobile:0.5});
// Пропорції промо-банера на вітрині: 1440×512, 768×512, 375×464
const promoRatios={desktop:1440/512,tablet:768/512,mobile:375/464}
const promoImageUrl=computed(()=>{const p=promos.value.find(x=>x.id===promoId.value);return p?.imageFile?getFileUrl(p.imageFile,'medium'):''})
const pageDialog=ref(false);const pageSlug=ref<'about'|'delivery'>('about');const pageExists=ref(false);const pageForm=reactive({title:'',contentText:'',metaTitle:'',metaDescription:'',isActive:true})
const heroV=useFormValidation({title:[()=>heroForm.title,[rules.required('Вкажіть заголовок')]],buttonLink:[()=>heroForm.buttonLink,[rules.url()]]})
const promoV=useFormValidation({title:[()=>promoForm.title,[rules.required('Вкажіть назву')]]})
const pageV=useFormValidation({title:[()=>pageForm.title,[rules.required('Вкажіть заголовок')]]})
// Мапимо помилки бекенду на поля; тост — лише якщо лишились нерозпізнані
function handleFormError(v:{applyServerErrors:(e:unknown)=>string[],errors:Record<string,string>},e:unknown){const rest=v.applyServerErrors(e);if(rest.length||!Object.values(v.errors).some(Boolean))toast.error(getAdminError(e))}
async function load(){try{[heroes.value,promos.value,pages.value]=await Promise.all([adminApi.heroSlides(),adminApi.promoBlocks(),adminApi.pages()])}catch(e){toast.error(getAdminError(e))}}
function editHero(item?:AdminHeroSlide){heroId.value=item?.id??null;heroFile.value=null;Object.assign(heroForm,item?{title:item.title,subtitle:item.subtitle||'',buttonText:item.buttonText||'',buttonLink:item.buttonLink||'',mediaFileId:item.mediaFileId,mediaType:item.mediaType,isActive:item.isActive,sortOrder:item.sortOrder,focalX:item.focalX??0.5,focalY:item.focalY??0.5,focalXTablet:item.focalXTablet??item.focalX??0.5,focalYTablet:item.focalYTablet??item.focalY??0.5,focalXMobile:item.focalXMobile??item.focalX??0.5,focalYMobile:item.focalYMobile??item.focalY??0.5}:{title:'',subtitle:'',buttonText:'',buttonLink:'',mediaFileId:0,mediaType:'IMAGE',isActive:true,sortOrder:heroes.value.length,focalX:0.5,focalY:0.5,focalXTablet:0.5,focalYTablet:0.5,focalXMobile:0.5,focalYMobile:0.5});heroV.reset();heroDialog.value=true}
async function saveHero(){if(!heroV.validate())return;try{if(heroFile.value){const file=await adminApi.uploadFile(heroFile.value);heroForm.mediaFileId=file.id;heroForm.mediaType=file.fileType}if(!heroForm.mediaFileId)return toast.error('Оберіть фото або відео');if(heroId.value)await adminApi.updateHeroSlide(heroId.value,heroForm);else await adminApi.createHeroSlide(heroForm);heroDialog.value=false;await load()}catch(e){handleFormError(heroV,e)}}
async function removeHero(id:number){if(!(await confirmDialog({title:'Видалити слайд?',message:'Цю дію не можна скасувати.',variant:'danger',confirmText:'Видалити'})))return;await adminApi.deleteHeroSlide(id);await load()}
function editPromo(item?:AdminPromoBlock){promoId.value=item?.id??null;Object.assign(promoForm,item?{type:item.type,title:item.title,isActive:item.isActive,sortOrder:item.sortOrder,imageFileId:item.imageFileId??null,focalX:item.focalX??0.5,focalY:item.focalY??0.5,focalXTablet:item.focalXTablet??0.5,focalYTablet:item.focalYTablet??0.5,focalXMobile:item.focalXMobile??0.5,focalYMobile:item.focalYMobile??0.5}:{type:'CUSTOM',title:'',isActive:true,sortOrder:promos.value.length,imageFileId:null,focalX:0.5,focalY:0.5,focalXTablet:0.5,focalYTablet:0.5,focalXMobile:0.5,focalYMobile:0.5});promoV.reset();promoDialog.value=true}
async function savePromo(){if(!promoV.validate())return;try{if(promoId.value)await adminApi.updatePromoBlock(promoId.value,promoForm);else await adminApi.createPromoBlock(promoForm);promoDialog.value=false;await load()}catch(e){handleFormError(promoV,e)}}
// Товар прив'язуємо за посиланням на сторінку товару (…/product/<slug>) — зручніше, ніж шукати ID
const promoLinks=reactive<Record<number,string>>({})
async function addProduct(block:AdminPromoBlock){
  const slug=promoLinks[block.id]?.trim().match(/\/product\/([^/?#\s]+)/)?.[1]
  if(!slug){toast.error('Вставте посилання на сторінку товару, напр. https://…/product/nazva-tovaru');return}
  try{
    const product=await catalogApi.getProductBySlug(decodeURIComponent(slug))
    if(block.products?.some(p=>p.productId===product.id)){toast.warning('Цей товар уже в блоці');return}
    await adminApi.addPromoProduct(block.id,product.id,block.products?.length||0)
    promoLinks[block.id]=''
    await load()
    toast.success(`Додано: ${product.name}`)
  }catch(e){toast.error(getAdminError(e,'Товар за посиланням не знайдено'))}
}
async function removePromo(id:number){if(!(await confirmDialog({title:'Видалити промо-блок?',message:'Цю дію не можна скасувати.',variant:'danger',confirmText:'Видалити'})))return;await adminApi.deletePromoBlock(id);await load()}
function editPage(slug:'about'|'delivery'){pageSlug.value=slug;const item=pages.value.find(p=>p.slug===slug);pageExists.value=Boolean(item);Object.assign(pageForm,{title:item?.title||(slug==='about'?'Про нас':'Доставка і оплата'),contentText:typeof item?.contentJson?.text==='string'?item.contentJson.text:'',metaTitle:item?.metaTitle||'',metaDescription:item?.metaDescription||'',isActive:item?.isActive??true});pageV.reset();pageDialog.value=true}
async function savePage(){if(!pageV.validate())return;const dto={title:pageForm.title,contentJson:{text:pageForm.contentText},metaTitle:pageForm.metaTitle||undefined,metaDescription:pageForm.metaDescription||undefined,isActive:pageForm.isActive};try{if(pageExists.value)await adminApi.savePage(pageSlug.value,dto);else await adminApi.createPage(pageSlug.value,dto);pageDialog.value=false;await load();toast.success('Сторінку збережено')}catch(e){handleFormError(pageV,e)}}
await load()
</script>
<template>
  <div class="mx-auto max-w-7xl space-y-6">
    <div><h1 class="text-3xl font-bold">Контент</h1><p class="text-sm text-secondary-500">Головний банер, промо-добірки та інформаційні сторінки.</p></div>
    <BTabs :model-value="tab" :tabs="contentTabs.map(item => ({ key: item.k, label: item.l }))" @update:model-value="tab = $event as 'hero' | 'promo' | 'pages'" />

    <section v-if="tab==='hero'" class="space-y-4">
      <div class="flex justify-end"><BBtn @click="editHero()">Додати слайд</BBtn></div>
      <div class="grid gap-4 lg:grid-cols-2">
        <article v-for="item in heroes" :key="item.id" class="flex gap-4 rounded-xl border border-secondary-200 bg-white p-4">
          <div class="flex-1"><b>{{ item.title }}</b><p class="text-sm text-secondary-500">{{ item.subtitle }}</p><p class="mt-3 text-xs">{{ item.mediaType }} · №{{ item.sortOrder }} · {{ item.isActive?'Активний':'Прихований' }}</p></div>
          <BBtn variant="icon" size="sm" @click="editHero(item)"><Icon name="lucide:pencil"/></BBtn>
          <BBtn variant="icon" size="sm" class="!text-red-600" @click="removeHero(item.id)"><Icon name="lucide:trash-2"/></BBtn>
        </article>
      </div>
    </section>

    <section v-else-if="tab==='promo'" class="space-y-4">
      <div class="flex justify-end"><BBtn @click="editPromo()">Додати блок</BBtn></div>
      <article v-for="block in promos" :key="block.id" class="rounded-xl border border-secondary-200 bg-white p-5">
        <div class="flex items-center gap-3">
          <div class="flex-1"><b>{{ block.title }}</b><p class="text-xs text-secondary-500">{{ block.type }} · {{ block.isActive?'Активний':'Прихований' }} · товарів: {{ block.products?.length||0 }}</p></div>
          <BBtn variant="icon" size="sm" @click="editPromo(block)"><Icon name="lucide:pencil"/></BBtn>
          <BBtn variant="icon" size="sm" class="!text-red-600" @click="removePromo(block.id)"><Icon name="lucide:trash-2"/></BBtn>
        </div>
        <div class="mt-4 flex flex-col gap-2 sm:flex-row sm:items-end">
          <BInput v-model="promoLinks[block.id]" label="Посилання на товар" placeholder="https://…/product/nazva-tovaru" class="w-full sm:max-w-md" @keydown.enter.prevent="addProduct(block)" />
          <BBtn variant="outline" @click="addProduct(block)">Прив’язати товар</BBtn>
        </div>
        <div class="mt-3 flex flex-wrap gap-2"><span v-for="link in block.products" :key="link.id" class="rounded-full bg-secondary-100 px-3 py-1 text-xs">{{ link.product?.name||`Товар #${link.productId}` }} <button class="ml-1" @click="adminApi.removePromoProduct(block.id,link.productId).then(load)">×</button></span></div>
      </article>
    </section>

    <section v-else class="grid gap-4 sm:grid-cols-2">
      <button v-for="item in [{slug:'about',title:'Про нас'},{slug:'delivery',title:'Доставка і оплата'}]" :key="item.slug" class="rounded-xl border border-secondary-200 bg-white p-6 text-left hover:border-secondary-400" @click="editPage(item.slug as 'about'|'delivery')">
        <Icon name="lucide:file-text" size="28"/><b class="mt-4 block">{{ item.title }}</b><span class="text-sm text-secondary-500">Редагувати текст та SEO</span>
      </button>
    </section>
<AdminDialog v-model="heroDialog" :title="heroId?'Редагувати слайд':'Новий слайд'" wide><form novalidate class="grid gap-4 sm:grid-cols-2" @submit.prevent="saveHero"><BInput v-model="heroForm.title" label="Заголовок" required :error="heroV.errors.title" @blur="heroV.touch('title')"/><BInput v-model="heroForm.subtitle" label="Підзаголовок"/><BInput v-model="heroForm.buttonText" label="Текст кнопки"/><BInput v-model="heroForm.buttonLink" label="Посилання" :error="heroV.errors.buttonLink" @blur="heroV.touch('buttonLink')"/><BInput v-model.number="heroForm.sortOrder" type="number" label="Порядок"/><BCheckbox v-model="heroForm.isActive" label="Активний"/><BFile v-model="heroFile" class="sm:col-span-2" label="Фото або відео" accept="image/*,video/mp4,video/quicktime" :max-size="50*1024*1024"/><div v-if="heroMediaUrl" class="sm:col-span-2"><p class="mb-2 text-sm font-medium text-gray-700">Кадрування на екранах</p><BannerFocalEditor :src="heroMediaUrl" :form="heroForm"/></div><div class="flex justify-end sm:col-span-2"><BBtn type="submit">Зберегти</BBtn></div></form></AdminDialog>
<AdminDialog v-model="promoDialog" :title="promoId?'Редагувати блок':'Новий блок'"><form novalidate class="space-y-4" @submit.prevent="savePromo"><BInput v-model="promoForm.title" label="Назва" required :error="promoV.errors.title" @blur="promoV.touch('title')"/><AdminImageFocalField :form="promoForm" :current-url="promoImageUrl" :ratios="promoRatios" label="Фото банера (якщо не задано — фото першого товару)"/><BSelect v-model="promoForm.type" label="Тип" :disabled="Boolean(promoId)" :options="[{label:'Новинки',value:'NEW'},{label:'Хіти',value:'HIT'},{label:'Сезонне',value:'SEASONAL'},{label:'Власна добірка',value:'CUSTOM'}]"/><BInput v-model.number="promoForm.sortOrder" type="number" label="Порядок"/><BCheckbox v-model="promoForm.isActive" label="Активний"/><div class="flex justify-end"><BBtn type="submit">Зберегти</BBtn></div></form></AdminDialog>
<AdminDialog v-model="pageDialog" :title="pageSlug==='about'?'Про нас':'Доставка і оплата'" wide><div class="space-y-4"><BInput v-model="pageForm.title" label="Заголовок" required :error="pageV.errors.title" @blur="pageV.touch('title')"/><BTextarea v-model="pageForm.contentText" label="Текст сторінки" :rows="10"/><BInput v-model="pageForm.metaTitle" label="SEO title"/><BTextarea v-model="pageForm.metaDescription" label="SEO description"/><BCheckbox v-model="pageForm.isActive" label="Опублікована"/><div class="flex justify-end"><BBtn @click="savePage">Зберегти</BBtn></div></div></AdminDialog></div></template>
