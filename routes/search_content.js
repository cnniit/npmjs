/**
 * Created by Administrator on 2018/3/20 0020.
 */
var router = require('koa-router')();
var elasticsearch = require('elasticsearch');
var client = new elasticsearch.Client({
  host: 'localhost:9200',
  // log: 'trace',
  // apiVersion: '5.6', // use the same version of your Elasticsearch instance
});

router.get('/',async (ctx)=>{
    let _id = ctx.query._id;

    const response = await client.search({
      index: 'koa',
      type: 'article',
      body: {
          "query" :{
            "bool": {
               "must" : [
                {"term" : {"_id":_id}}
                ]
            }
          }
        }
    })
    let hits_content=response.hits.hits[0]._source.content
  
    
    await ctx.render('default/search_content', { content: hits_content});
})
module.exports=router.routes();