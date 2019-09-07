<template>
    <section class="wallet-main container hero is-medium is-primary">
        <div class="wallet-body">
            <div class="welcome-title">
                <span>Welcome to Libra Chrome Extension</span>
            </div>
            <div class="button-group">
                <b-button class="wallet-button"
                size="is-large"
                type="is-primary"
                @click="openCreate"
                inverted outlined>
                    Create New Wallet
                </b-button>
                <b-button class="wallet-button"
                size="is-large"
                type="is-primary"
                @click="openImport"
                inverted outlined>
                    Import Existing Wallet
                </b-button>
            </div>
        </div>
    </section>
</template>

<script>
import { Route } from 'vue-router'
import LibraService from '../service/libra_service'

export default {
    data() {

    },
    async created() {
        // check that wallet is created


    },
    methods: {
        openCreate() {
            this.$router.push({name: 'create'})
        },
        openImport() {
            this.$router.push({name: 'import'})
        }
    }
}
</script>

<style lang="css" scoped>
.wallet-main {
    min-height: 540px;
}
.wallet-body {
    padding: 20px;
    text-align: center;
}
.button-group {
    padding: 25px 0px;
    text-align: center;
}
.welcome-title {
    font-size: 48px;
}
.wallet-button {
    width: 100%;
    margin: 0px 0px 20px 0px;
}
</style>