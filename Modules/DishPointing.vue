<template>
    <div class="row">
        <div class="col-6">
            <p class="m-0 text-muted">Select satellite:</p>
            <select id="" class="form-select" v-model="selectedSateliteId" @change="setSat()">
                <option :value="sat.sat_id" v-for="sat in availableSatellites">{{sat.sat_degree}}{{sat.direction}} {{sat.sat_name}}</option>
            </select>
            <p class="m-0 text-muted">Transponder:</p>
            <select id="" class="form-select" v-model="selectedTransponder">
                <option :value="transponder.id" v-for="transponder in transponders">{{ transponder.freq }} {{transponder.polarity===1?"V":"H"}} {{transponder.sr}}</option>
            </select>
            <button class="btn btn-primary w-100 my-1" @click="signalAnalyse()">Signal Analyse</button>
            <button class="btn btn-primary w-100 my-1" @click="qualityAnalyse()">Quality Analyse</button>
        </div>
        <div class="col-6">
            <div class="row">
                <div class="col-6 text-muted">LNB, mA</div>
                <div class="col-6 text-end">{{LNBAmper}}</div>
                <div class="col-6 text-muted">LNB, V</div>
                <div class="col-6 text-end">{{lnbV}}</div>
                <div class="col-6 text-muted"  v-show="progressMode">SNR, db</div>
                <div class="col-6 text-end"  v-show="progressMode">{{SNR}}</div>
                <div class="col-6 text-muted"  v-show="progressMode">LM, db</div>
                <div class="col-6 text-end"  v-show="progressMode">{{LMSNR}}</div>
            </div>
            <div id="spectre" v-show="spectreMode">
                <canvas id="myChart" height="100"></canvas>
            </div>
            <div class="progress" v-show="progressMode">
                <div class="progress-bar bg-danger" id="progressbar" style="width: 0; transition:none" ></div>
                <div class="progress-bar bg-success" id="progressbar2" style="width: 0; transition:none" ></div>
            </div>
            <hr>
            <div id="foundedServicesBlock" v-if="availableServices.length>0">
                <h4 class="text-muted">Founded Services:</h4>
                <ul class="list-group">
                    <li class="list-group-item d-flex justify-content-between align-items-start" v-for="service in availableServices">
                        {{service.name}} <span class="text-muted">{{service.provider}}</span>
                    </li>
                </ul>
            </div>

        </div>
    </div>
</template>

<script>
export default {
    name: "DishPointing",
    data(){
        return {
            spectreMode:false,
            progressMode:false,
            ip:"",
            selectedSateliteId:null,
            selectedTransponder:0,
            lnbV:0,
            SNR:0,
            LMSNR:0,
            LNBAmper:0,
            availableSatellites:[],
            availableServices:[],
            transponders:[],
            transponders2:[]
        }
    },
    methods:{
        setSat(){
            let _this = this;
            fetch("http://"+this.ip+"/public?command=returnTPList&sat_id="+this.selectedSateliteId).then(response=>response.json()).then(response=> {
                this.transponders = response.tp_list;
                response.tp_list.forEach(function (item) {
                    _this.transponders2[item.id] = item;
                })
            });
        },
        qualityAnalyse(){
            this.spectreMode = false;
            this.progressMode = true;
            let transponderId = this.selectedTransponder
            let freq = this.transponders2[transponderId].freq-9750;
            let sr = this.transponders2[transponderId].sr;
            let pol = this.transponders2[transponderId].polarity;
            fetch("http://"+this.ip+"/public?command=initSmartSNR&state=on&mode=snr&freq="+freq+"&sr="+sr+"&pol="+pol+"&tone=0&smart_lnb_enabled=0&diseqc_hex=E01038F4");
        },
        signalAnalyse(){
            this.spectreMode = true;
            this.progressMode = false;
            let transponderId = this.selectedTransponder
            let freq = this.transponders2[transponderId].freq-9750;
            let sr = this.transponders2[transponderId].sr;
            let pol = this.transponders2[transponderId].polarity;
            fetch("http://"+this.ip+"/public?command=initSmartSNR&state=on&mode=spectrum&freq="+freq+"&sr=63000&pol="+pol+"&tone=0&smart_lnb_enabled=0&diseqc_hex=E01038F4");
        }
    },
    mounted() {
        this.ip = localStorage.getItem("ip");
        if(this.ip===null){
            this.$router.push("/connect");
            return;
        }
        let _this = this;
        fetch("http://"+this.ip+"/public?command=commonEvent");
        fetch("http://"+this.ip+"/public?command=returnSATList").then(response=>response.json()).then(response=> {
            this.availableSatellites = response.sat_list;
        });

        const ctx = document.getElementById('myChart').getContext('2d');
        let labels480 = [];
        let labels480zero = [];
        for (let i = 0; i < 480; i++) {
            labels480.push('');
            labels480zero.push(0);
        }
        this.chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels480,
                datasets: [{
                    label: '',
                    data: labels480zero,
                    borderWidth: 1
                }]
            },
            options: {
                animation: {
                    duration: 0
                },
                scales: {
                    xAxis: {
                        display: false,
                    },
                    yAxis: {
                        display: false,
                    },
                }
            }
        });


        const evtSource = new EventSource("http://"+this.ip+"/public?command=startEvents" );
        evtSource.addEventListener("update",function (e){
            let parsedData = JSON.parse(e.data);
            if(parsedData.lnb_voltage!==undefined){
                _this.lnbV = parsedData.lnb_voltage/1000
                _this.LNBAmper = parsedData.lnb_current;
                if(parsedData.spectrum_array!==undefined){
                    _this.chart.data.datasets[0] = {
                        label: '',
                        data: parsedData.spectrum_array,
                        pointRadius: 0,
                        borderColor: "#0d6efd",
                        borderWidth: 2
                    }
                    _this.chart.update();
                } else {
                    _this.SNR = parsedData.snr
                    _this.LMSNR = parsedData.lm_snr
                    document.getElementById("progressbar").style.width = Math.round((_this.SNR-_this.LMSNR)*100/20)+"%";
                    document.getElementById("progressbar2").style.width = Math.round(_this.LMSNR*100/20)+"%";
                    if(parsedData.service_data!==undefined && parsedData.service_data.scan_status==="SCAN_DONE"){
                        _this.availableServices = parsedData.service_data.channel_list;
                    }
                }
            }

        });



    }
}
</script>

<style scoped>

</style>