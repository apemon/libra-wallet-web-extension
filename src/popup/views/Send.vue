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
                <div class="wallet-form">
                    <b-field label="Destination Address">
                        <b-input v-model="dest"></b-input>
                    </b-field>
                    <b-field label="Amount">
                        <b-input v-model="amount" 
                        type="number"
                        step="0.000001"></b-input>
                    </b-field>
                </div>
                <div class="button-group">
                    <b-button class="wallet-button"
                    size="is-medium"
                    type="is-primary"
                    @click="back"
                    inverted outlined>
                        Cancel
                    </b-button>
                    <b-button class="wallet-button"
                    size="is-medium"
                    type="is-success"
                    @click="transfer"
                    inverted outlined>
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
        this.client = this.libra.getClient()
        this.wallet = this.libra.loadWallet()
    },
    methods: {
        back () {
            this.$router.back()
        },
        async transfer () {
            let amount = this.amount
            let destAddress = this.dest
            try {
                this.isTransfering = true
                await this.libra.transfer(this.client, this.wallet.mnemonic, destAddress, amount)
                this.isTransfering = false
                this.$router.push({name:'wallet'})
            } catch (err) {
                this.isTransfering = false
                this.$buefy.toast.open({
                    message: err,
                    type: 'is-danger'
                })
            }
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
</style>
<style>
.label {
    color:white;
}
</style>