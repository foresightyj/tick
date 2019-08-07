import Vue from 'vue';

Vue.directive('click-outside', {
    bind: function (el: any, binding: any, vnode: any) {
        const exp = binding.expression;
        const handler = vnode.context[exp];
        if (typeof handler !== 'function') {
            throw new Error("v-click-outside only accepts a function argument but was passed: " + exp);
        }
        el.__vueClickOutsideHandler__ = function (event: any) {
            if (!(el == event.target || el.contains(event.target))) {
                handler.call(el, event);
            }
        };
        document.addEventListener('click', el.__vueClickOutsideHandler__)
    },
    unbind: function (el: any) {
        document.removeEventListener('click', el.__vueClickOutsideHandler__);
    },
});
