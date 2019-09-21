<template>
    <div>
        <VueElementLoading
            :active="isSigning"
            spinner="bar-fade-scale"
            color="#9b67df"
            text="Signing ..."
            is-full-screen
        />
        <section class="wallet-main container hero is-medium is-primary">
            <div class="wallet-body">
                <div>
                    <div class="wallet-title">Your signature is being requested</div>
                    <div class="wallet-label"> Hostname: </div>
                    <div class="wallet-content">{{hostname}}</div>
                    <div class="wallet-label"> Message: </div>
                    <div class="wallet-content">{{text}}</div>
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
                    @click="sign">
                        Sign
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
            isSigning: false
        }
    },
    async created() {
        this.libra = new LibraService()
        this.hostname = this.$route.query.hostname
        this.text = this.$route.query.text
        this.requestId = this.$route.query.id
    },
    methods: {
        async sign () {
            try {
                this.isSigning = true
                let signature = await this.libra.sign(this.text)
                this.isSigning = false
                await this.libra.notifyInpageSignSuccess(this.requestId, signature)
            } catch (err) {
                this.isSigning = false
                this.$buefy.toast.open({
                    message: err,
                    type: 'is-danger'
                })
            }
        },
        async reject () {
            await this.libra.notifyInpageSignSuccess(this.requestId)
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
    font-size: 18px;
    word-break: break-all;
    margin-left: 10px;
}
.wallet-title {
    font-size: 20px;
    text-align: center;
}
.wallet-label {
    font-size: 24px;
}
</style>