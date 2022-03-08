// 1. Define route components.
// These can be imported from other files
import {createApp} from 'vue'
import {createRouter, createWebHashHistory} from "vue-router";
import Home from "../Modules/Home.vue";
import Dashboard from "../Modules/Dashboard.vue";
import Channels from "../Modules/Channels.vue";
import DishPointing from "../Modules/DishPointing.vue";
import Connect from "../Modules/Connect.vue";

// 2. Define some routes
// Each route should map to a component.
// We'll talk about nested routes later.
const routes = [
    { path: '/', component: Home },
    { path: '/connect', component: Connect },
    { path: '/channels', component: Channels },
    { path: '/dishpointing', component: DishPointing },
]

// 3. Create the router instance and pass the `routes` option
// You can pass in additional options here, but let's
// keep it simple for now.
const router = createRouter({
    // 4. Provide the history implementation to use. We are using the hash history for simplicity here.
    history: createWebHashHistory(),
    routes, // short for `routes: routes`
})

// 5. Create and mount the root instance.
const app = createApp(Dashboard)
// Make sure to _use_ the router instance to make the
// whole app router-aware.
app.use(router)

app.mount('#app')

// Now the app has started!