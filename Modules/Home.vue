<template>
    <div class="row">
        <div class="col-6">Connected to</div>
        <div class="col-6">127.0.0.1:8008</div>
        <div class="col-6">STB Serial number</div>
        <div class="col-6">{{ serialNumber }}</div>
        <div class="col-6">Card Inserted</div>
        <div class="col-6">{{ card_inserted?"Yes":"No" }}</div>
        <div class="col-6">Firmware Version</div>
        <div class="col-6">{{ firmware }}</div>
        <div class="col-6">OpenWeb Api Version</div>
        <div class="col-6">{{ openapiVer }}</div>
    </div>
</template>

<script>
export default {
    data(){
        return {
            serialNumber:"",
            openapiVer:"",
            firmware:"",
            card_inserted:false,
        }
    },
    name: "About",
    mounted:function () {
        let ip = localStorage.getItem("ip");

        fetch("http://127.0.0.1:8008/public?command=version").then(response=>response.json()).then(response=>{
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