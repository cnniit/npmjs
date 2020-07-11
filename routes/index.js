
var router = require('koa-router')();


var DB=require('../model/db.js');

var url=require('url');

var tools=require('../model/tools.js');


//配置中间件 获取url的地址
router.use(async (ctx,next)=>{
    //console.log(ctx.request.header.host);
    var pathname=url.parse(ctx.request.url).pathname;

    //导航条的数据
    var navResult=await DB.find('nav',{$or:[{'status':1},{'status':'1'}]},{},{

        sortJson:{'sort':1}
    })

    var cateResult=await  DB.find('articlecate',{'pid':'5ab3209bdf373acae5da097e'});
    ctx.state.cateResult=cateResult;
    var serviceList=await DB.find('article',{'pid':'5ab34b61c1348e1148e9b8c2'});
    ctx.state.serviceList=serviceList;
    var newsResult=await  DB.find('articlecate',{'pid':'5afa56bb416f21368039b05d'});
    ctx.state.newsResult=newsResult;

    var languageResult=await  DB.find('articlecate',{'pid':'5e54065517c2d5dca8cbf359'});
    ctx.state.languageResult=languageResult;
    var frameworkResult=await DB.find('articlecate',{'pid':'5e54072b17c2d5dca8cbf35c'});
    ctx.state.frameworkResult=frameworkResult;
    var middlewareList=await DB.find('article',{'pid':'5e54097317c2d5dca8cbf35f'});
    ctx.state.middlewareList=middlewareList;

    
        //导航条的数据
        var links=await DB.find('link',{$or:[{'status':1},{'status':'1'}]},{},{

            sortJson:{'sort':1}
        })
        ctx.state.links=links;

    //获取系统信息

    var setting=await DB.find('setting',{});


    //模板引擎配置全局的变量
    ctx.state.nav=navResult;
    ctx.state.pathname=pathname;

    ctx.state.setting=setting[0];

    await  next()
})


router.get('/',async (ctx)=>{

    //ctx.body="前台首页";
    console.time('start');

    //轮播图  注意状态数据不一致问题  建议在后台增加数据的时候状态 转化成number类型
    var focusResult=await DB.find('focus',{$or:[{'status':1},{'status':'1'}]},{},{

        sortJson:{'sort':1}
    })

        //获取成功案例下面的分类
        var cateResult_lang=await  DB.find('articlecate',{'pid':'5e54065517c2d5dca8cbf359',$or:[{'status':1},{'status':'1'}]});
        var cateResult_fw=await  DB.find('articlecate',{'pid':'5e54072b17c2d5dca8cbf35c',$or:[{'status':1},{'status':'1'}]});
        var page=1;
    
        var pageSize=3;
        // if(pid){
            /*如果存在*/
            // var  articleResult=await DB.find('article',{"pid":pid,$or:[{'status':1},{'status':'1'}]},{},{
            //     page,
            //     pageSize,
            //     sortJson:{
            //         'sort':-1
            //     }
            // });
            // var  articleNum=await DB.count('article',{"pid":pid,$or:[{'status':1},{'status':'1'}]});
        // }else{
    
            //循环子分类获取子分类下面的所有的内容
            var subCateArr=[];
            for(var i=0;i<cateResult_lang.length;i++){
                subCateArr.push(cateResult_lang[i]._id.toString());
            }
            for(var i=0;i<cateResult_fw.length;i++){
                subCateArr.push(cateResult_fw[i]._id.toString());
            }
            subCateArr.push('5e54097317c2d5dca8cbf35f');
            var  articleResult_hot=await DB.find('article',{
                       "pid":{$in:subCateArr},
                       $and: [

                        {$or: [{"status": 1}, {"status": '1'}]}, 
                        {$or: [{"is_hot": 1}, {"is_hot": '1'}]}
                        ]
                    },{},{
                    page,
                    pageSize,
                    sortJson:{
                        'add_time':-1
                    }
                });
    
                var  articleResult_best=await DB.find('article',{
                    "pid":{$in:subCateArr},
                    $and: [

                     {$or: [{"status": 1}, {"status": '1'}]}, 
                     {$or: [{"is_best": 1}, {"is_best": '1'}]}
                     ]
                 },{},{
                 page,
                 pageSize,
                 sortJson:{
                     'add_time':-1
                 }
             });

             var  articleResult_new=await DB.find('article',{
                "pid":{$in:subCateArr},
                $and: [

                 {$or: [{"status": 1}, {"status": '1'}]}, 
                 {$or: [{"is_new": 1}, {"is_new": '1'}]}
                 ]
             },{},{
             page,
             pageSize,
             sortJson:{
                 'add_time':-1
             }
         });
            // var  articleNum=await DB.count('article',{"pid":{$in:subCateArr},$or:[{'status':1},{'status':'1'}]});
        // }

    ctx.render('default/index',{
        // catelist:cateResult,
        articleResult_hot:articleResult_hot,
        articleResult_best:articleResult_best,
        articleResult_new:articleResult_new,

        focus:focusResult,
        // links:links
    });

})
router.get('/news',async (ctx)=>{


    var page=ctx.query.page ||1;
    var pid=ctx.query.pid;

    var pageSize=3;

    ctx.state.setting.site_title='xxx新闻页面';
    ctx.state.setting.site_keywords='xxx新闻页面';
    ctx.state.setting.site_description='xxx新闻页面';

    //获取分类
    var cateResult=await  DB.find('articlecate',{'pid':'5afa56bb416f21368039b05d'});

    if(pid){
        var  articleResult=await DB.find('article',{"pid":pid,$or:[{'status':1},{'status':'1'}]},{},{

            pageSize,
            page
        });
        var  articleNum=await DB.count('article',{"pid":pid});


    }else{

        //获取所有子分类的id
        var subCateArr=[];
        for(var i=0;i<cateResult.length;i++){
            subCateArr.push(cateResult[i]._id.toString());
        }
        var  articleResult=await DB.find('article',{"pid":{$in:subCateArr},$or:[{'status':1},{'status':'1'}]},{},{
            pageSize,
            page
        });

        var  articleNum=await DB.count('article',{"pid":{$in:subCateArr}});
    }

    ctx.render('default/news',{

        catelist:cateResult,
        newslist:articleResult,
        pid:pid,
        page:page,
        totalPages:Math.ceil(articleNum/pageSize)

    });

})

router.get('/service',async (ctx)=>{


    ctx.state.setting.site_title='xxx新闻页面';
    ctx.state.setting.site_keywords='xxx新闻页面';
    ctx.state.setting.site_description='xxx新闻页面';

    //查询
    var serviceList=await DB.find('article',{'pid':'5ab34b61c1348e1148e9b8c2'});
    // console.log(serviceList);
    ctx.render('default/service',{
        serviceList:serviceList
    });



})

router.get('/content/:id',async (ctx)=>{

    var id=ctx.params.id;var content;
    try {
         content=await  DB.find('article',{'_id':DB.getObjectId(id)});
        
    } catch (error) {
        ctx.render('default/content',{
            list:{'title':'404','content':'404'}
        });
        return
    }


    /*
    1.根据文章获取文章的分类信息

    2、根据文章的分类信息，去导航表里面查找当前分类信息的url

    3、把url赋值给 pathname
    * */

    //获取当前文章的分类信息
    var cateResult=await  DB.find('articlecate',{'_id':DB.getObjectId(content[0].pid)});

    // console.log(cateResult[0].pid);


    if(cateResult[0].pid!=0){  /*子分类*/
        //找到当前分类的父亲分类
        var parentCateResult=await  DB.find('articlecate',{'_id':DB.getObjectId(cateResult[0].pid)});

        var navResult=await  DB.find('nav',{$or:[{'title':cateResult[0].title},{'title':parentCateResult[0].title}]});

    }else{  /*父分类*/

        //在导航表查找当前分类对应的url信息
        var navResult=await  DB.find('nav',{'title':cateResult[0].title});

    }

    if(navResult.length>0){
        //把url赋值给 pathname
        ctx.state.pathname=navResult[0]['url'];

    }else{
        ctx.state.pathname='/';
    }


    ctx.render('default/content',{
        list:content[0]
    });

})

router.get('/about',async (ctx)=>{

    ctx.render('default/about');

})

router.get('/case',async (ctx)=>{


    var pid=ctx.query.pid;

    var page=ctx.query.page || 1;

    var pageSize=3;


    //获取成功案例下面的分类
    var cateResult=await  DB.find('articlecate',{'pid':'5ab3209bdf373acae5da097e',$or:[{'status':1},{'status':'1'}]});

    if(pid){
        /*如果存在*/
        var  articleResult=await DB.find('article',{"pid":pid},{},{
            page,
            pageSize,
            sortJson:{
                'sort':-1
            }
        });
        var  articleNum=await DB.count('article',{"pid":pid});
    }else{

        //循环子分类获取子分类下面的所有的内容
        var subCateArr=[];
        for(var i=0;i<cateResult.length;i++){
            subCateArr.push(cateResult[i]._id.toString());
        }
        var  articleResult=await DB.find('article',{"pid":{$in:subCateArr}},{},{
            page,
            pageSize,
            sortJson:{
                'sort':1
            }
        });

        var  articleNum=await DB.count('article',{"pid":{$in:subCateArr}});
    }

    ctx.render('default/case',{
        catelist:cateResult,
        articlelist:articleResult,
        pid:pid,
        page:page,
        totalPages:Math.ceil(articleNum/pageSize)
    });

})

router.get('/connect',async (ctx)=>{

    ctx.render('default/connect');
})


router.get('/language',async (ctx)=>{


    var pid=ctx.query.pid;

    var page=ctx.query.page || 1;

    var pageSize=3;

    //获取成功案例下面的分类
    var cateResult=await  DB.find('articlecate',{'pid':'5e54065517c2d5dca8cbf359',$or:[{'status':1},{'status':'1'}]});


    if(pid){
        /*如果存在*/
        var  articleResult=await DB.find('article',{"pid":pid,$or:[{'status':1},{'status':'1'}]},{},{
            page,
            pageSize,
            sortJson:{
                'sort':-1
            }
        });
        var  articleNum=await DB.count('article',{"pid":pid,$or:[{'status':1},{'status':'1'}]});
    }else{

        //循环子分类获取子分类下面的所有的内容
        var subCateArr=[];
        for(var i=0;i<cateResult.length;i++){
            subCateArr.push(cateResult[i]._id.toString());
        }
        var  articleResult=await DB.find('article',{"pid":{$in:subCateArr},$or:[{'status':1},{'status':'1'}]},{},{
            page,
            pageSize,
            sortJson:{
                'sort':1
            }
        });

        var  articleNum=await DB.count('article',{"pid":{$in:subCateArr},$or:[{'status':1},{'status':'1'}]});
    }

    ctx.render('default/language',{
        catelist:cateResult,
        articlelist:articleResult,
        pid:pid,
        page:page,
        totalPages:Math.ceil(articleNum/pageSize)
    });

})

router.get('/framework',async (ctx)=>{


    var pid=ctx.query.pid;

    var page=ctx.query.page || 1;

    var pageSize=3;


    //获取成功案例下面的分类
    var cateResult=await  DB.find('articlecate',{'pid':'5e54072b17c2d5dca8cbf35c',$or:[{'status':1},{'status':'1'}]});

    if(pid){
        /*如果存在*/
        var  articleResult=await DB.find('article',{"pid":pid,$or:[{'status':1},{'status':'1'}]},{},{
            page,
            pageSize,
            sortJson:{
                'sort':-1
            }
        });
        var  articleNum=await DB.count('article',{"pid":pid,$or:[{'status':1},{'status':'1'}]});
    }else{

        //循环子分类获取子分类下面的所有的内容
        var subCateArr=[];
        for(var i=0;i<cateResult.length;i++){
            subCateArr.push(cateResult[i]._id.toString());
        }
        var  articleResult=await DB.find('article',{"pid":{$in:subCateArr},$or:[{'status':1},{'status':'1'}]},{},{
            page,
            pageSize,
            sortJson:{
                'sort':1
            }
        });

        var  articleNum=await DB.count('article',{"pid":{$in:subCateArr},$or:[{'status':1},{'status':'1'}]});
    }

    ctx.render('default/framework',{
        catelist:cateResult,
        articlelist:articleResult,
        pid:pid,
        page:page,
        totalPages:Math.ceil(articleNum/pageSize)
    });

})

router.get('/middleware',async (ctx)=>{


    ctx.state.setting.site_title='xxx新闻页面';
    ctx.state.setting.site_keywords='xxx新闻页面';
    ctx.state.setting.site_description='xxx新闻页面';

    //查询
    var middlewareList=await DB.find('article',{'pid':'5e54097317c2d5dca8cbf35f',$or:[{'status':1},{'status':'1'}]});
    // console.log(serviceList);
    ctx.render('default/middleware',{
        middlewareList:middlewareList
    });



})




module.exports=router.routes();