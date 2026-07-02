<script setup lang="ts">
import { ref, computed, watch, nextTick, onMounted } from 'vue';
import { useDebounceFn, onClickOutside } from '@vueuse/core';
import { useId } from '#app';

interface AutocompleteOption {
  value: string | number;
  label: string;
}

interface Props {
  modelValue?: string | number | null;
  options?: AutocompleteOption[];
  placeholder?: string;
  label?: string;
  error?: string;
  disabled?: boolean;
  required?: boolean;
  loading?: boolean;
  id?: string;
  minChars?: number;
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: null,
  options: () => [],
  placeholder: '',
  label: '',
  error: '',
  disabled: false,
  required: false,
  loading: false,
  id: '',
  minChars: 1,
});

const emit = defineEmits<{
  'update:modelValue': [value: string | number | null];
  search: [query: string];
}>();

// Refs
const containerRef = ref<HTMLDivElement | null>(null);
const inputRef = ref<HTMLInputElement | null>(null);
const isOpen = ref(false);
const highlightedIndex = ref(-1);
const query = ref('');
const hasSearched = ref(false);

// SSR-safe unique ID
const uid = useId();
const inputId = computed(() => props.id || `b-autocomplete-${uid}`);
const listboxId = computed(() => `${inputId.value}-listbox`);
const activeDescendantId = computed(() =>
  highlightedIndex.value >= 0
    ? `${listboxId.value}-option-${highlightedIndex.value}`
    : undefined,
);

// Computed
const filteredOptions = computed(() => props.options);

const showNoResults = computed(
  () => !props.loading
    && filteredOptions.value.length === 0
    && query.value.length >= props.minChars
    && hasSearched.value,
);

const showDropdown = computed(
  () => filteredOptions.value.length > 0
    || props.loading
    || showNoResults.value,
);

const selectedLabel = computed(() => {
  if (props.modelValue == null) return '';
  const found = props.options.find((o) => o.value === props.modelValue);
  return found ? found.label : '';
});

// Initialize query from modelValue
onMounted(() => {
  if (props.modelValue != null) {
    query.value = selectedLabel.value;
  }
});

// Watch modelValue changes from parent
watch(
  () => props.modelValue,
  (val) => {
    if (val == null) {
      query.value = '';
    } else {
      const found = props.options.find((o) => o.value === val);
      if (found) {
        query.value = found.label;
      }
    }
  },
);

// Debounced search emit
const debouncedSearch = useDebounceFn((value: string) => {
  hasSearched.value = true;
  emit('search', value);
}, 300);

// Handlers
function onInput() {
  isOpen.value = true;
  highlightedIndex.value = -1;

  if (query.value.length >= props.minChars) {
    debouncedSearch(query.value);
  } else {
    hasSearched.value = false;
  }

  if (!query.value) {
    emit('update:modelValue', null);
    hasSearched.value = false;
  }
}

function onFocus() {
  if (query.value.length >= props.minChars && filteredOptions.value.length > 0) {
    isOpen.value = true;
  }
}

function onKeydown(event: KeyboardEvent) {
  if (!isOpen.value) {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      isOpen.value = true;
      event.preventDefault();
    }
    return;
  }

  switch (event.key) {
    case 'ArrowDown':
      event.preventDefault();
      highlightedIndex.value =
        highlightedIndex.value < filteredOptions.value.length - 1
          ? highlightedIndex.value + 1
          : 0;
      scrollToHighlighted();
      break;

    case 'ArrowUp':
      event.preventDefault();
      highlightedIndex.value =
        highlightedIndex.value > 0
          ? highlightedIndex.value - 1
          : filteredOptions.value.length - 1;
      scrollToHighlighted();
      break;

    case 'Enter':
      event.preventDefault();
      if (
        highlightedIndex.value >= 0
        && highlightedIndex.value < filteredOptions.value.length
      ) {
        selectOption(filteredOptions.value[highlightedIndex.value]);
      }
      break;

    case 'Escape':
      event.preventDefault();
      close();
      break;

    case 'Tab':
      close();
      break;
  }
}

function selectOption(option: AutocompleteOption) {
  query.value = option.label;
  emit('update:modelValue', option.value);
  close();
}

function onClear() {
  query.value = '';
  emit('update:modelValue', null);
  isOpen.value = false;
  highlightedIndex.value = -1;
  hasSearched.value = false;
  inputRef.value?.focus();
}

function close() {
  isOpen.value = false;
  highlightedIndex.value = -1;
}

function scrollToHighlighted() {
  nextTick(() => {
    const el = document.getElementById(
      `${listboxId.value}-option-${highlightedIndex.value}`,
    );
    el?.scrollIntoView({ block: 'nearest' });
  });
}

function highlightMatch(text: string): string {
  if (!query.value) return text;
  const escaped = query.value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`(${escaped})`, 'gi');
  return text.replace(
    regex,
    '<mark class="bg-primary-100 text-primary-800 rounded-sm px-0.5">$1</mark>',
  );
}

// Click outside
onClickOutside(containerRef, () => {
  if (isOpen.value) {
    close();
    if (props.modelValue != null && query.value !== selectedLabel.value) {
      query.value = selectedLabel.value;
    }
  }
});
</script>

<template>
  <div ref="containerRef" class="relative w-full">
    <!-- Label -->
    <label
      v-if="label"
      :for="inputId"
      class="mb-1.5 block text-sm font-medium text-secondary-700"
    >
      {{ label }}
      <span v-if="required" class="text-danger">*</span>
    </label>

    <!-- Input -->
    <div class="relative">
      <input
        :id="inputId"
        ref="inputRef"
        v-model="query"
        type="text"
        :placeholder="placeholder"
        :disabled="disabled"
        :required="required"
        autocomplete="off"
        role="combobox"
        :aria-expanded="isOpen"
        :aria-activedescendant="activeDescendantId"
        aria-autocomplete="list"
        :aria-controls="listboxId"
        :class="[
          'w-full rounded-lg border px-3 py-2.5 text-sm transition-colors duration-150',
          'placeholder:text-secondary-400',
          disabled
            ? 'cursor-not-allowed border-secondary-200 bg-secondary-100 text-secondary-400'
            : error
              ? 'border-danger bg-white focus:border-danger focus:ring-2 focus:ring-danger/20'
              : 'border-secondary-300 bg-white focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20',
        ]"
        @input="onInput"
        @focus="onFocus"
        @keydown="onKeydown"
      />

      <!-- Loading spinner -->
      <div
        v-if="loading"
        class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3"
      >
        <svg
          class="h-4 w-4 animate-spin text-secondary-400"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            class="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            stroke-width="4"
          />
          <path
            class="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      </div>

      <!-- Clear button -->
      <button
        v-else-if="query && !disabled"
        type="button"
        class="absolute inset-y-0 right-0 flex items-center pr-3 text-secondary-400 transition-colors hover:text-secondary-600"
        tabindex="-1"
        @click="onClear"
      >
        <svg class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
          <path
            fill-rule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
            clip-rule="evenodd"
          />
        </svg>
      </button>
    </div>

    <!-- Dropdown -->
    <Transition
      enter-active-class="transition duration-150 ease-out origin-top"
      enter-from-class="scale-y-95 opacity-0"
      enter-to-class="scale-y-100 opacity-100"
      leave-active-class="transition duration-100 ease-in origin-top"
      leave-from-class="scale-y-100 opacity-100"
      leave-to-class="scale-y-95 opacity-0"
    >
      <ul
        v-if="isOpen && showDropdown"
        :id="listboxId"
        role="listbox"
        class="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-lg border border-secondary-200 bg-white py-1 shadow-lg"
      >
        <!-- Loading state inside dropdown -->
        <li
          v-if="loading && filteredOptions.length === 0"
          class="flex items-center gap-2 px-3 py-2.5 text-sm text-secondary-500"
        >
          <svg
            class="h-4 w-4 animate-spin"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              class="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              stroke-width="4"
            />
            <path
              class="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          Завантаження...
        </li>

        <!-- Options -->
        <li
          v-for="(option, index) in filteredOptions"
          :id="`${listboxId}-option-${index}`"
          :key="option.value"
          role="option"
          :aria-selected="option.value === modelValue"
          :class="[
            'cursor-pointer px-3 py-2.5 text-sm transition-colors',
            index === highlightedIndex
              ? 'bg-primary-50 text-primary-700'
              : 'text-secondary-700 hover:bg-secondary-50',
            option.value === modelValue && 'font-medium',
          ]"
          @click="selectOption(option)"
          @mouseenter="highlightedIndex = index"
        >
          <span v-html="highlightMatch(option.label)" />
        </li>

        <!-- No results -->
        <li
          v-if="showNoResults"
          class="px-3 py-2.5 text-sm text-secondary-500"
        >
          Нічого не знайдено
        </li>
      </ul>
    </Transition>

    <!-- Error message -->
    <p v-if="error" class="mt-1.5 text-sm text-danger">
      {{ error }}
    </p>
  </div>
</template>
