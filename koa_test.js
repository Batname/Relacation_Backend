var koa = require('koa');
var app = koa();

app.use(function *(next){
  console.log('>> one');
  this.varbl = "my var";
  yield next;
  console.log('<< one');
});

app.use(function *(next){
  console.log('>> two');
  this.body = 'two';
  console.log('<< two', this.varbl);
});

app.use(function *(next){
  console.log('>> three');
  yield next;
  console.log('<< three');
});

app.listen(3000);