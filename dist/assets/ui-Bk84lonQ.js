import{r as c,g as m,a as E}from"./vendor-DeqkGhWy.js";var u={exports:{}},t={};/**
 * @license React
 * react-jsx-runtime.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */var f;function O(){if(f)return t;f=1;var R=c(),x=Symbol.for("react.element"),l=Symbol.for("react.fragment"),v=Object.prototype.hasOwnProperty,d=R.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ReactCurrentOwner,y={key:!0,ref:!0,__self:!0,__source:!0};function i(o,r,a){var e,n={},s=null,p=null;a!==void 0&&(s=""+a),r.key!==void 0&&(s=""+r.key),r.ref!==void 0&&(p=r.ref);for(e in r)v.call(r,e)&&!y.hasOwnProperty(e)&&(n[e]=r[e]);if(o&&o.defaultProps)for(e in r=o.defaultProps,r)n[e]===void 0&&(n[e]=r[e]);return{$$typeof:x,type:o,key:s,ref:p,props:n,_owner:d.current}}return t.Fragment=l,t.jsx=i,t.jsxs=i,t}var _;function j(){return _||(_=1,u.exports=O()),u.exports}var k=j(),q=c();const J=m(q);var D=E();const S=m(D);export{J as R,S as a,k as j,q as r};
