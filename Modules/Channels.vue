<template>
    <h2 class="text-center">Channel list</h2>
    <div class="row">
        <div class="col-9">
            <ul class="list-group">
                <li class="list-group-item d-flex justify-content-between align-items-start channelItem" :data-channel-id="channel.id.channel" v-for="channel in channelList">
                    <div class="channelName">{{channel.name}}</div>
                    <div class="channelParams">
                        <span class="badge mx-2 bg-primary" v-if="tpTable[channel.id.tp]!==undefined">{{tpTable[channel.id.tp].freq}} {{tpTable[channel.id.tp].polarity===1?"V":"H"}} {{tpTable[channel.id.tp].sr}}</span>
                        <span class="badge mx-2 bg-secondary">{{channel.flag.tv===1?"TV":"Radio"}}</span>
                        <span class="badge mx-2 bg-info">{{satList[channel.id.sat].sat_name}}</span>
                        <span class="badge mx-2 bg-danger" v-if="channel.scrambled===1">$ {{cas[channel.id.cas]}}</span>
                    </div>
                </li>
            </ul>
        </div>
        <div class="col-3">
            <p class="m-0">Choose satellite:</p>
            <select id="availableSatellites" class="form-select" @change="changeSat()" v-model="chooseSat">
                <option value="0">All</option>
                <option :value="sat" v-for="sat in availableSatelites">{{satList[sat].sat_degree}}{{satList[sat].direction}} {{satList[sat].sat_name}}</option>
            </select>
        </div>
    </div>

</template>

<script>
export default {
    data(){
        return {
            cas:{
                9728: "BISS",
                1280: "Viaccess",
            },
            chooseSat:0,
            availableSatelites:[],
            channelList:[],
            satList:[],
            tpTable:[],
        }
    },
    methods:{
        changeSat(){
            let _this = this;
            if(parseInt(this.chooseSat)===0) {
                console.log(1)
                let elements = document.getElementsByClassName("channelItem");
                Array.prototype.forEach.call(elements, function(item) {
                    item.classList.remove("d-none");
                    item.classList.add("d-flex");
                });

            } else {
                let elements = document.getElementsByClassName("channelItem");
                Array.prototype.forEach.call(elements, function(item) {
                    item.classList.add("d-none");
                    item.classList.remove("d-flex");
                });
                this.channelList.forEach(function (item){
                    if(item.id.sat===_this.chooseSat){
                        console.log("add")
                        document.querySelector("[data-channel-id='"+item.id.channel+"']").classList.remove("d-none");
                        document.querySelector("[data-channel-id='"+item.id.channel+"']").classList.add("d-flex")
                    }
                });
            }
        }
    },
    mounted() {
        let ip = localStorage.getItem("ip");
        if(ip===null){
            this.$router.push("/connect");
            return;
        }
        let _this = this;
        fetch("http://"+ip+"/public?command=returnSATList").then(response=>response.json()).then(response=>{
            response.sat_list.forEach(function (item) {
                _this.satList[item.sat_id] = item
            })
        });
        fetch("http://"+ip+"/public?command=channelList").then(response=>response.json()).then(response=>{
            this.channelList = response.channel_list;
            this.channelList.forEach(function (item){
                if(_this.availableSatelites.indexOf(item.id.sat)===-1) _this.availableSatelites.push(item.id.sat);
            });
            this.availableSatelites.forEach(function (item){
                fetch("http://"+ip+"/public?command=returnTPList&sat_id="+item).then(response=>response.json()).then(response=> {
                    response.tp_list.forEach(function (item) {
                        _this.tpTable[item.id] = item;
                    })
                });
            });
        });

    },
    name: "Channels"
}
</script>

<style scoped>

</style>