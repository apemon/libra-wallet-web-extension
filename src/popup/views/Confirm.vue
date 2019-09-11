<template>
    <div>
        <VueElementLoading
            :active="isTransfering"
            spinner="bar-fade-scale"
            color="#9b67df"
            text="Transfering ..."
            is-full-screen
        />
        <section class="wallet-main container hero is-medium is-primary">
            <div class="wallet-body">
                <div>
                    <div class="wallet-label">Destination Address: </div>
                    <div class="wallet-content">{{destAddress}}</div>
                    <div class="wallet-label" style="margin-top:20px;">Amount: </div>
                    <div class="wallet-content">{{amount}}</div>
                </div>
                <div class="button-group">
                    <b-button class="wallet-button"
                    size="is-medium"
                    type="is-danger"
                    @click="reject">
                        Reject
                    </b-button>
                    <b-button class="wallet-button"
                    size="is-medium"
                    type="is-success"
                    @click="transfer">
                        Confirm
                    </b-button>
                </div>
            </div>
        </section>
    </div>
</template>

<script>
import { Route } from 'vue-router'
import VueElementLoading from 'vue-element-loading'
import LibraService from '../service/libra_service'

export default {
    components: {
        VueElementLoading
    },
    filters: {

    },
    data() {
        return {
            dest: '',
            amount: 0,
            isTransfering: false
        }
    },
    async created() {
        this.libra = new LibraService()
        this.amount = this.$route.query.amount
        this.destAddress = this.$route.query.destination
        this.requestId = this.$route.query.id
    },
    methods: {
        async transfer () {
            try {
                this.isTransfering = true
                let result = await this.libra.transfer(this.destAddress, this.amount)
                this.isTransfering = false
                await this.libra.notifyInpageTransferSuccess(this.requestId, this.destAddress, this.amount, result.expirationTime)
            } catch (err) {
                this.isTransfering = false
                this.$buefy.toast.open({
                    message: err,
                    type: 'is-danger'
                })
            }
        },
        async reject () {
            await this.libra.notifyInpageTransferReject(this.requestId, this.destAddress, this.amount)
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
    text-align: left;
}
.button-group {
    padding: 25px 0px;
    text-align: center;
}
.wallet-content {
    font-size: 24px;
    word-break: break-all;
    margin-left: 10px;
}
.wallet-label {
    font-size: 20px;
}
</style>