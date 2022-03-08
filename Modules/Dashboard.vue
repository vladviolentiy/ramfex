<template>
    <Header></Header>
    <router-view></router-view>
</template>

<script>
import Header from "./Header.vue";
export default {
    name: "Dashboard",
    components: {Header}
}
</script>

<style scoped>

</style>