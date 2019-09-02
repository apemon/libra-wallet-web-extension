<template>
    <section class="wallet-main container hero is-medium">
        hello world
    </section>
</template>

<script>
import { Route } from 'vue-router'

export default {
    filters: {
        toDecimal (value) {
            return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        }
    },
    data() {
        return {
            balance: 0
        }
    },
    async mounted() {
        
    },
    methods: {

    }
}
</script>

<style lang="css" scoped>
.wallet-username {
    font-size: 32px;
}
.wallet-balance {
    font-size: 40px;
}
</style>