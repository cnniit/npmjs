/**
 * Created by Administrator on 2018/3/20 0020.
 */
var router = require('koa-router')();
var elasticsearch = require('elasticsearch');
var client = new elasticsearch.Client({
  host: 'localhost:9200',
//   log: 'trace',
  // apiVersion: '5.6', // use the same version of your Elasticsearch instance
});

router.get('/',async (ctx)=>{
  if(client.client == undefined){
    await ctx.render('default/search', { 
      title: 'Elasticsearch WARNING: '+new Date()+' Unable to revive connection',
      // q:q,
      // page:page,
      // totalPages:Math.ceil(articleNum/pageSize)
  });
  return;
  }

  var page=ctx.query.page ||1;
    // var pid=ctx.query.pid;

    var pageSize=10;

    ctx.state.setting.site_title='全站搜索';
    ctx.state.setting.site_keywords='全站搜索';
    ctx.state.setting.site_description='全站搜索';

    let q = ctx.query.q;
    const response = await client.search({
      index: 'koa',
      type: 'article',
      body: {
        query: {
          multi_match: {
            query: q||'',  
            fields: ['title','content']  //多个field上面搜索
          }
        },
        from:(page-1)*pageSize,
        size:pageSize,
        highlight: {
          require_field_match: false,
          fields: {
            "*": {
              pre_tags: [
                "<font color='blue'>"
              ],
              post_tags: [
                "</font>"
              ]
            }
          }
        }
      }
    })
    let hits_content='';
    let articleNum=0;
    for (var i=0;i<response.hits.hits.length;i++ ) {
      let hits = response.hits.hits;
      articleNum = response.hits.total;
      let _id = hits[i]._id;
      let  hit_title= hits[i].highlight.title;
      let  hit_content= hits[i].highlight.content;
      // let t=JSON.stringify(tweet,null,2);
      let hit_title_a = '<a href=search_content?_id='+_id+'>'+hit_title+'</a>'
      // if(hit_title && hit_content){
  
      //   hits_content += hit_title_a+'========<br>'+hit_content+'<br>';
      // }else if(hit_title){
        
      //   hits_content += hit_title_a+'<br>';
      // }else if(hit_content){
        
      //   hits_content += hit_content+'<br>';
      // }else{
      //   // hits_content += '<br>';
      // }
      if(!hit_title){
        hit_title_a= '<a href=search_content?_id='+_id+'>'+hits[i]._source.title+'</a>'  ;
      }
      hits_content += hit_title_a+'========<br>'+hit_content+'<br>';
    }
    

    // var  articleNum=await DB.count('article',{"pid":{$in:subCateArr}});
// }

  await ctx.render('default/search', { 
      title: hits_content,
      q:q,
      page:page,
      totalPages:Math.ceil(articleNum/pageSize)
  });
})
module.exports=router.routes();