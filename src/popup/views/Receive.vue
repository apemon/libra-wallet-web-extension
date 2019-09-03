<template>
    <section class="container hero is-medium">
        <div class="wallet-qr">
            <qrcode-vue :value="address" :size="size" level="H"></qrcode-vue>
        </div>
        <div class="wallet-body">
            <div class="wallet-address">
                <span>{{address}}</span>
                <b-icon size="is-small" icon="copy"></b-icon>
            </div>
            <div class="button-group">
                <b-button class="wallet-button"
                 size="is-medium"
                 @click="back">
                    Back
                </b-button>
            </div>
        </div>
    </section>
</template>

<script>
import { Route } from 'vue-router'
import LibraService from '../service/libra_service'
import QrcodeVue from 'qrcode.vue'

export default {
    components: {
        QrcodeVue
    },
    filters: {
        shortUserAddress (x) {
            const first = x.substr(0, 7)
            const last = x.substr(x.length - 7, x.length)
            return first + '...' + last
        }
    },
    data() {
        return {
            address: '',
            size: '260'
        }
    },
    async created() {
        this.libra = new LibraService()
        this.wallet = this.libra.loadWallet()
        this.address = this.wallet.address
    },
    methods: {
        back () {
            this.$router.back()
        }
    }
}
</script>

<style lang="css" scoped>
.wallet-qr {
    padding: 20px;
}
.wallet-address {
    word-break: break-all;
    padding: 20px;
}
</style>