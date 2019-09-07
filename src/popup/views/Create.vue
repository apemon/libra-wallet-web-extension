<template>
    <div>
        <VueElementLoading
            :active="isCreating"
            spinner="bar-fade-scale"
            color="#9b67df"
            text="Creating ..."
            is-full-screen
        />
        <section class="wallet-main container hero is-medium is-primary">
            <div v-if="!showSeed" class="wallet-body">
                <div class="wallet-form">
                    <b-field label="Password">
                        <b-input type="password" v-model="password"></b-input>
                    </b-field>
                    <b-field label="Repeat Password">
                        <b-input type="password" v-model="repeatPassword"></b-input>
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
                    @click="createWallet"
                    inverted outlined>
                        Confirm
                    </b-button>
                </div>
            </div>
            <div v-else class="wallet-body">
                <div class="mnemonic-title">
                    <span>Mnemonic</span>
                </div>
                <div class="mnemonic-body">
                    {{mnemonic}}
                </div>
                <div class="button-group">
                    <b-button class="wallet-button"
                    size="is-medium"
                    type="is-primary"
                    @click="home"
                    inverted outlined>
                        Ok, I'm have noted it
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
    data() {
        return {
            password: '',
            repeatPassword: '',
            isCreating: false,
            showSeed: false
        }
    },
    async created() {
        this.libra = new LibraService()
    },
    methods: {
        back () {
            this.$router.back()
        },
        home() {
            this.$router.push({name:'wallet'})
        },
        async createWallet () {
            if(this.password != '' && this.password == this.repeatPassword) {
                this.isCreating = true
                let wallet = await this.libra.createWallet(this.password)
                this.isCreating = false
                this.mnemonic = wallet.mnemonic
                this.showSeed = true
            } else {
                this.$buefy.toast.open({
                    message: 'password is empty or not matched',
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
    text-align: left;
}
.button-group {
    padding: 25px 0px;
    text-align: center;
}
.mnemonic-title {
    font-size: 48px;
}
.mnemonic-body {
    font-size: 36px;
}
</style>
<style>
.label {
    color:white;
}
</style>