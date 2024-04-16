<script setup>
import { ref } from 'vue'

const visible = ref(true)
function doChange() {
    visible.value = false
    console.log('change')
}
</script>

<template>
    <div>
        <button class="btn" @click="doChange">
            Test
        </button>
        <div v-if="visible">
            Is Visible
        </div>
    </div>
</template>

<style>
.btn {
    padding: 1rem;
    border: 1px solid #ccc;
    border-radius: 5px;
}
</style>