<template>
    <div class="row">
        <div class="col-6 text-muted">Connected to</div>
        <div class="col-6">{{ ip }}</div>
        <div class="col-6 text-muted">STB Serial number</div>
        <div class="col-6">{{ serialNumber }}</div>
        <div class="col-6 text-muted">Card Inserted</div>
        <div class="col-6">{{ card_inserted?"Yes":"No" }}</div>
        <div class="col-6 text-muted">Firmware Version</div>
        <div class="col-6">{{ firmware }}</div>
        <div class="col-6 text-muted">OpenWeb Api Version</div>
        <div class="col-6">{{ openapiVer }}</div>
    </div>
</template>

<script>
export default {
    data(){
        return {
            ip:"",
            serialNumber:"",
            openapiVer:"",
            firmware:"",
            card_inserted:false,
        }
    },
    name: "About",
    mounted:function () {
        this.ip = localStorage.getItem("ip");
        if(this.ip===null){
            this.$router.push("/connect");
            return;
        }
        fetch("http://"+this.ip+"/public?command=version").then(response=>response.json()).then(response=>{
            this.firmware = response.version.stb
            this.openapiVer = response.version.web_api
            this.serialNumber = response.serial
            this.card_inserted = response.card_inserted==="true"
        })
    }
}
</script>

<style scoped>

</style>