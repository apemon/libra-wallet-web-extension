<template>
    <section class="wallet-main container hero is-medium is-primary">
        <div v-if="isNewWallet" class="wallet-body">
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
        <div v-else class="wallet-body">
            <div class="unlock-title">
                <span>Welcome Back!</span>
            </div>
            <div class="wallet-form">
                <b-field label="Password">
                    <b-input type="password" v-model="password"></b-input>
                </b-field>
            </div>
                <div class="button-group">
                    <b-button class="wallet-button"
                    size="is-medium"
                    type="is-success"
                    @click="unlockWallet"
                    inverted outlined>
                        Confirm
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
        return {
            isNewWallet: false,
            password: ''
        }
    },
    async created() {
        // check that wallet is created
        this.libra = new LibraService()
        try {
            await this.libra.checkWalletExist()
            await this.libra.getWalletInfo()
            this.$router.push({name:'wallet'})
        } catch (err) {
            if(err == 'LOCKED') this.isNewWallet = false
            else this.isNewWallet = true
        }
    },
    methods: {
        openCreate() {
            this.$router.push({name: 'create'})
        },
        openImport() {
            this.$router.push({name: 'import'})
        },
        async unlockWallet () {
            try {
                await this.libra.unlockWallet(this.password)
                let wallet = await this.libra.getWalletInfo()
                this.$router.push({name:'wallet', query: {
                    address: wallet.address
                }})
            } catch (err) {
                this.$buefy.toast.open({
                    message: 'password not correct',
                    type: 'is-danger',
                    position: 'is-bottom'
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
    text-align: center;
}
.button-group {
    padding: 25px 0px;
    text-align: center;
}
.welcome-title {
    font-size: 48px;
}
.unlock-title {
    font-size: 36px;
}
.wallet-button {
    width: 100%;
    margin: 0px 0px 20px 0px;
}
</style>