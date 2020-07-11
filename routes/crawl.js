/**
 * Created by Administrator on 2018/3/20 0020.
 */
var router = require('koa-router')();
var Crawler = require("crawler");
var DB=require('../model/db.js');
var tools=require('../model/tools.js');

var c = new Crawler({
    maxConnections : 10,
    // This will be called for each crawled page
    callback : function (error, res, done) {
        if(error){
            console.log(error);
        }else{
            var $ = res.$;
            // $ is Cheerio by default
            //a lean implementation of core jQuery designed specifically for the server
            
        }
        done();
    }
});


router.get('/',async (ctx)=>{
        // Queue just one URL, with default callback
    // c.queue('http://www.baidu.com');
    
    // Queue a list of URLs
    // c.queue(['http://www.baidu.com.com/','http://www.yahoo.com']);
    
    // Queue URLs with custom callbacks & parameters

    for(n=1;n<=10;n++){

        let burl = 'https://www.liepin.com/zhaopin/?init=-1&headckid=9dd21afd0ae11168&fromSearchBtn=2&ckid=9dd21afd0ae11168&degradeFlag=0&sfrom=click-pc_homepage-centre_searchbox-search_new&key=node&siTag=NsRTaZbKVhXc-ZEfBoeG3A%7EfA9rXquZc5IkJpXC-Ycixw&d_sfrom=search_fp&d_ckId=27ff7dbca18213b4b6f4f83aa944fc52&d_curPage='+(n+1)+'&d_pageSize=40&d_headId=27ff7dbca18213b4b6f4f83aa944fc52&curPage='+n;
console.log(burl)
        c.queue([{
            uri: burl,
            jQuery: true,
        
            // The global callback won't be called
            callback: function (error, res, done) {
                if(error){
                    console.log(error);
                }else{
                    let links = [];
                    $ = res.$;
                    let l = $('.job-info').length;
                    let pre = 'https://www.liepin.com/'
                    for(var i=0;i<l;i++){
                        let hrefs = $('.job-info h3 a').eq(i).attr('href');
                        if(hrefs.indexOf(pre)==-1){
                            hrefs = pre + hrefs
                        }
                        links.push(hrefs)
    
                        let title,content;
                            c.queue([{
                                uri: links[i],
                                jQuery: true,
                            
                                // The global callback won't be called
                                callback: function (error, res, done) {
                                    if(error){
                                        console.log(error);
                                    }else{
                                        $ = res.$;
                                            title=$('.job-note h5').text().replace(/\s+/g, '     ');
                                    //    console.log(title)
                                       content=$(' .content-word').html();
                                        // console.log(content)
                                        let pid='5e54066817c2d5dca8cbf35a';
                                        let catename="ES5/6/7";
                                        let author='';
                                        // let pic=ctx.req.body.author;
                                        let status='1';
                                        let is_best='0';
                                        let is_hot='1';
                                        let is_new='0';
                                        let keywords='';
                                        let description= '';
                                        let img_url=ctx.req.file? ctx.req.file.path.substr(7) :'';
                                    
                                        let add_time=tools.getTime();
                                        
                                        let json={
                                            pid,catename,title,author,status,is_best,is_hot,is_new,keywords,description,content,img_url,add_time
                                        }
                                    
                                        var result=DB.insert('article',json);
                                    }
                                    done();
                                }
                            }]);
                    }
                }
                done();
            }
        }]);
    }
    



    
    // Queue some HTML code directly without grabbing (mostly for tests)
    c.queue([{
        html: '<p>This is a <strong>test</strong></p>',
    }]);
})
module.exports=router.routes();