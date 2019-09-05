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
        this.wallet = this.libra.loadWallet()
        this.amount = this.$route.query.amount
        this.destAddress = this.$route.query.destination
    },
    methods: {
        async transfer () {
            let amount = this.amount
            let destAddress = this.dest
            try {
                this.isTransfering = true
                let response = await this.libra.transfer(this.wallet.mnemonic, destAddress, amount)
                this.isTransfering = false
                let msg = {
                    type: 'PAYMENT_SUCCESS',
                    response: response
                }

                chrome.tabs.query({active: true}, (tabs) => {
                    let activeTab = tabs[0];
                    alert(JSON.stringify(activeTab))
                    chrome.tabs.sendMessage(activeTab.id, {type:'PAYMENT_SUCCESS'}, (res) => {
                        window.close()
                    })
                });
            } catch (err) {
                this.isTransfering = false
                this.$buefy.toast.open({
                    message: err,
                    type: 'is-danger'
                })
            }
        },
        reject () {

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