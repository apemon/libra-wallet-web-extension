<template>
    <section class="container hero is-medium is-primary">
        <div class="wallet-body">
            <!-- generate new wallet if not exist -->
            <!-- wallet -->
            <div>
                <Avatar
                    :seed="userAddress"
                    :size="20"
                />
                <div v-if="balance" class="wallet-balance">
                    <img :src="getImagePath('libra-ic.png')" class="wallet-balance-image" />
                    <span>{{ balance | numberWithCommas() }}</span>
                </div>
                <div v-else class="wallet-balance">
                    <span>Loading ...</span>
                </div>
                <!-- button -->
                <div class="wallet-button-group">
                    <b-button type="is-primary" size="is-medium"
                        @click="send" inverted outlined>
                        Send
                    </b-button>
                    <b-button type="is-primary" size="is-medium"
                            @click="receive" inverted outlined>
                            Receive
                    </b-button>
                </div>
            </div>
        </div>
        <div class="transaction-card">
            <div v-if="isLoadingTransactions">Loading Transactions ...</div>
            <div v-if="!isLoadingTransactions">
                <div class="transaction-title">
                    <span>History</span>
                </div>
                <div class="transaction-list">
                    <div class="transaction-header">
                        <span>24 Aug 2019 at 12:20</span>
                    </div>
                    <div class="transaction-body">
                        <span>RECEIVED</span>
                        <span class="transaction-amount">100.000 Coins</span>
                    </div>
                    <div class="transaction-footer">
                        <span>From: xxxx....xxxx</span>
                    </div>
                </div>
                <div class="transaction-list">
                    <div class="transaction-header">
                        <span>24 Aug 2019 at 12:20</span>
                    </div>
                    <div class="transaction-body">
                        <span>RECEIVED</span>
                        <span class="transaction-amount">100.000 Coins</span>
                    </div>
                    <div class="transaction-footer">
                        <span>From: xxxx....xxxx</span>
                    </div>
                </div>
            </div>
        </div>
    </section>
</template>

<script>
import { Route } from 'vue-router'
import Avatar from '../components/Avatar.vue'

export default {
    components: {
        Avatar
    },
    filters: {
        numberWithCommas (x) {
            let parts = x.toString().split('.')
            parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',')
            return parts.join('.')
        }
    },
    data() {
        return {
            userAddress: '6d8f6e8f478f4833b6730e3207ead67c9be6757df52f97207570fbd55b76655a',
            balance: 1000.123456,
            isLoadingTransactions: false
        }
    },
    async mounted() {
        
    },
    methods: {
        getImagePath(img) {
            return chrome.extension.getURL('popup/assets/img/' + img)
        },
        send() {

        },
        receive() {

        }
    }
}
</script>

<style lang="css" scoped>
.wallet-body {
    padding: 20px;
}
.wallet-balance {
    font-size: 32px;
}
.wallet-balance-image {
    height: 22px;
    width: 22px;
}
.wallet-button-group {
    margin-top: 20px;
}
.wallet-button {
    font-size: 18px;
    margin: 0px 20px;
}
.transaction-card {
    background-color: white;
    color: black;
}
.transaction-title {
    text-align: left;
    padding: 5px 20px;
}
.transaction-list {
    text-align: left;
    padding: 5px 20px;
    border-top-color: rgba((0), 0, 0, 0.7);
    border-top-style: solid;
    border-top-width: thin;
}
.transaction-list:hover {
    background-color: rgba(121, 87, 213, 0.1);
}
.transaction-header {
    font-size: 12px;
}
.transaction-body {
    font-size: 16px;
}
.transaction-amount {
    float: right;
}
.transaction-footer {
    font-size: 12px;
}
.text-left {
    text-align: left;
}
</style>