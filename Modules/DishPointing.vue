<template>
    <div class="row">
        <div class="col-6">
            <p class="m-0 text-muted">Select satellite:</p>
            <select id="" class="form-select" v-model="selectedSateliteId">
                <option value="1210">36E</option>
                <option value="1260">14W</option>
            </select>
            <p class="m-0 text-muted">Transponder:</p>
            <select id="" class="form-select" @change="setTransponder()" v-model="selectedTransponder">
                <option :value="transponder.id" v-for="transponder in transponders">{{ transponder.freq }} {{transponder.polarity===1?"V":"H"}} {{transponder.sr}}</option>
            </select>
        </div>
        <div class="col-6">
            <div class="row">
                <div class="col-6 text-muted">LNB, mA</div>
                <div class="col-6 text-end">{{LNBAmper}}</div>
                <div class="col-6 text-muted">LNB, V</div>
                <div class="col-6 text-end">{{lnbV}}</div>
                <div class="col-6 text-muted">SNR, db</div>
                <div class="col-6 text-end">{{SNR}}</div>
                <div class="col-6 text-muted">LM, db</div>
                <div class="col-6 text-end">{{LMSNR}}</div>
            </div>
            <div class="progress">
                <div class="progress-bar bg-danger" id="progressbar" style="width: 0" ></div>
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
            selectedSateliteId:1260,
            selectedTransponder:0,
            lnbV:0,
            SNR:0,
            LMSNR:0,
            LNBAmper:0,
            availableServices:[],
            transponders:[],
            transponders2:[],
        }
    },
    methods:{
        setTransponder(){
            let transponderId = this.selectedTransponder
            let freq = this.transponders2[transponderId].freq-9750;
            let sr = this.transponders2[transponderId].sr;
            let pol = this.transponders2[transponderId].polarity;
            //http://127.0.0.1:8008/public?command=initSmartSNR&state=on&mode=snr&freq=1877&sr=2984&pol=1&tone=0&smart_lnb_enabled=0&diseqc_hex=E01038F4
            fetch("http://127.0.0.1:8008/public?command=initSmartSNR&state=on&mode=snr&freq="+freq+"&sr="+sr+"&pol="+pol+"&tone=0&smart_lnb_enabled=0&diseqc_hex=E01038F4");

        }
    },
    mounted() {
        let _this = this;
        fetch("http://127.0.0.1:8008/public?command=commonEvent");
        fetch("http://127.0.0.1:8008/public?command=returnTPList&sat_id="+this.selectedSateliteId).then(response=>response.json()).then(response=> {
            _this.transponders = response.tp_list;
            response.tp_list.forEach(function (item) {
                _this.transponders2[item.id] = item;

            })
        });
        const evtSource = new EventSource("http://127.0.0.1:8008/public?command=startEvents" );
        evtSource.addEventListener("update",function (e){
            let parsedData = JSON.parse(e.data);
            if(parsedData.lnb_voltage!==undefined){
                _this.lnbV = parsedData.lnb_voltage/1000
                _this.SNR = parsedData.snr
                _this.LMSNR = parsedData.lm_snr
                _this.LNBAmper = parsedData.lnb_current;
                if(Math.random()>0.7){
                    document.getElementById("progressbar").style.width = Math.round((_this.SNR-_this.LMSNR)*100/20)+"%";
                    document.getElementById("progressbar2").style.width = Math.round(_this.LMSNR*100/20)+"%";
                }
                if(parsedData.service_data!==undefined && parsedData.service_data.scan_status==="SCAN_DONE"){
                    _this.availableServices = parsedData.service_data.channel_list;
                }
            }
        });
        //{"lock": 0, "mode": 0, "tune_mode": 0, "carrier_offset": 65535, "lpg": 4484, "snr": 9.0, "lm_snr": 0.0, "alfa": 360.0, "beta": 360.0, "gamma": 360.0, "version": "0000","lnb3d_voltage": 0, "lnb_current": 122, "lnb_voltage": 13608, "psu_voltage": 11910, "scan_status": "SCAN_WAITING_LOCK"}
    }
}
</script>

<style scoped>

</style>