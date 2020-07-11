/**
 * Created by Administrator on 2018/3/21 0021.
 */
var md5 = require('md5');
//�ϴ�ͼƬ��ģ��
const multer = require('koa-multer');
let tools={
    multer(){  /*�ϴ�ͼƬ������*/
        var storage = multer.diskStorage({
            destination: function (req, file, cb) {
                cb(null, 'public/upload')
            },
            filename: function (req, file, cb) {
                var fileFormat = (file.originalname).split(".");   /*��ȡ��׺��  �ָ�����*/
                cb(null,Date.now() + "." + fileFormat[fileFormat.length - 1]);
            }
        })
        var upload = multer({ storage: storage });
        return upload

    },
    getTime(){

        return new Date()
    },
    md5(str){
        return md5(str)
    },
    cateToList(data){


        //1����ȡһ������

        var firstArr=[];

        for(var i=0;i<data.length;i++){
            if(data[i].pid=='0'){
                firstArr.push(data[i]);
            }
        }
        //2����ȡ��������
        //console.log(firstArr);

        for(var i=0;i<firstArr.length;i++){

            firstArr[i].list=[];
            //�������е�����  ���Ǹ����ݵ�pid���ڵ�ǰ������_id
            for(var j=0;j<data.length;j++){
                if(firstArr[i]._id==data[j].pid){
                    firstArr[i].list.push(data[j]);
                }
            }

        }

        //console.log(firstArr);

        return firstArr;
    },
    htmlHexEncode(str) {//HTML hex encode.
        var res=[];
        for(var i=0;i < str.length;i++)
            res[i]=str.charCodeAt(i).toString(16);
        return "&#"+String.fromCharCode(0x78)+res.join(";&#"+String.fromCharCode(0x78))+";";//x ，防止ff下&#x 转义
    }
}

module.exports=tools;