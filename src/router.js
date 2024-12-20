import Vue from 'vue';
import Router from 'vue-router';
import store from '@/store/store';
import i18n from '@/config/i18n.config';
import config from '@/config/app.config';

Vue.use(Router);

const routes = [
  {
    path: '/',
    name: 'dashboard',
    redirect: 'invoices',
    component: () => import(/* webpackChunkName: "dashboard" */ '@/views/dashboard/Dashboard.vue'),
    beforeEnter: async (to, from, next) => {
      await store.dispatch('teams/init');
      next();
    },
    children: [
      {
        path: '/invoices',
        name: 'invoices',
        component: () => import(/* webpackChunkName: "invoices" */ '@/views/dashboard/Invoices.vue'),
      },
      {
        path: '/invoice/:id',
        name: 'invoice',
        component: () => import(/* webpackChunkName: "invoice" */ '@/views/dashboard/Invoice.vue'),
      },
    ],
  },
  {
    path: '/invoices/:id/print',
    name: 'invoice-print',
    component: () => import(/* webpackChunkName: "invoice" */ '@/views/InvoicePrint.vue'),
  },
  {
    path: '**',
    redirect: 'invoices',
  },
];

const router = new Router({
  mode: 'history',
  base: config.base_url,
  routes,
});

try {
  router.beforeEach((to, from, next) => {
    if (!to.query.hasOwnProperty('lang')) {
      i18n.initialized.then(() => {
        to.query.lang = i18n.i18next.language;
        next(to);
      }).catch(() => {});
    } else {
      next();
    }
  });
} catch (err) {
  console.log(err);
}

export default router;
