<template>
    <div class="row">
        <div class="col-6">
            <p class="m-0 text-muted">STB IP Address:</p>
            <input type="text" class="form-control" v-model="ip">
            <button class="btn btn-primary w-100 my-2" @click="saveStb()">Save</button>
            <p class="m-0 text-center text-danger">{{errorText}}</p>
        </div>
    </div>

</template>

<script>
export default {
    name: "Connect",
    data(){
        return {
            "ip":"",
            "errorText":""
        }
    },
    methods:{
        saveStb: function (){
            fetch("http://"+this.ip+"/public?command=version").then(response=>response.json()).then(response=>{
                localStorage.setItem("ip",this.ip)
                this.$router.push("/");
            }).catch(function (){
                this.errorText = "Error connection to STB";
            })
        }
    }
}
</script>

<style scoped>

</style>