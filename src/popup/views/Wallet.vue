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
                <div class="wallet-address">
                    <span>{{userAddress | shortUserAddress }}</span>
                </div>
                <div v-if="balance" class="wallet-balance">
                    <img :src="getImagePath('libra-ic.png')" class="wallet-balance-image" />
                    <span>{{ balance | numberWithCommas }}</span>
                </div>
                <div v-else class="wallet-balance">
                    <span>Loading ...</span>
                </div>
                <!-- button -->
                <div class="wallet-button-group">
                    <b-button type="is-primary" size="is-medium" class="wallet-button"
                        @click="openReceive()" inverted outlined>
                        Receive
                    </b-button>
                    <b-button type="is-primary" size="is-medium" class="wallet-button"
                        @click="openSend()" inverted outlined>
                        Send
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
                <div v-for="transaction in transactions" class="transaction-list" @click="openExplorer(transaction.explorerLink)">
                    <div class="transaction-header">
                        <span>{{transaction.date}}</span>
                    </div>
                    <div class="transaction-body" v-bind:style= "[transaction.event === 'sent' ? {'color': '#483DB1'} : { 'color': '#55C81F' }]">
                        <span>{{transaction.event.toUpperCase()}}</span>
                        <span class="transaction-amount">{{transaction.amount | numberWithCommas}} Coins</span>
                    </div>
                    <div class="transaction-footer">
                        <span v-if="transaction.event === 'sent'">To: {{transaction.toAddress | shortUserAddress}}</span>
                        <span v-else>From: {{transaction.fromAddress | shortUserAddress}}</span>
                    </div>
                </div>
            </div>
        </div>
    </section>
</template>

<script>
import { Route } from 'vue-router'
import Avatar from '../components/Avatar.vue'
import LibraService from '../service/libra_service'

export default {
    components: {
        Avatar
    },
    filters: {
        numberWithCommas (x) {
            let parts = x.toString().split('.')
            parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',')
            return parts.join('.')
        },
        shortUserAddress (x) {
            const first = x.substr(0, 7)
            const last = x.substr(x.length - 7, x.length)
            return first + '...' + last
        }
    },
    data() {
        return {
            balance: '0',
            isLoadingTransactions: true,
            userAddress: this.$route.query.address,
            transactions: []
        }
    },
    async created() {
        this.libra = new LibraService()
        try {
            this.wallet = await this.libra.getWalletInfo()
            this.userAddress = this.wallet.address
            // get balance from cavhe
            this.balance = await this.libra.inquiryBalance(this.userAddress)
            // get transaction from cache
            this.transactions = await this.libra.inquiryTransaction(this.userAddress)
            this.isLoadingTransactions = false
            // update balance
            this.balance = await this.libra.updateBalance(this.userAddress)
            // update transaction
            this.transactions = await this.libra.updateTransaction(this.userAddress)
        } catch(err) {
            alert(err)
        }
    },
    methods: {
        getImagePath(img) {
            return chrome.extension.getURL('popup/assets/img/' + img)
        },
        openSend() {
            this.$router.push({name:'send'})
        },
        openReceive() {
            this.$router.push({name:'receive'})
        },
        openExplorer(link) {
            chrome.tabs.create({url:link})
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