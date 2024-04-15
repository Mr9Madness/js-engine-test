<script setup>
function doChange() {
    console.log('change')
}
</script>

<template>
    <div>
        <button @click="doChange">
            Test
        </button>
    </div>
</template>