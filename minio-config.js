var Minio = require('minio');

module.exports = function(RED) {
    function MinioConfigNode(n) {
        RED.nodes.createNode(this,n);
        this.name = n.name;
	    this.host = n.host;
	    this.port = n.port;
        this.useSsl = n.useSsl;
    }
    RED.nodes.registerType("minio-config",MinioConfigNode,{
        credentials: {
            accessKey: {type:"text"},
            secretKey: {type:"password"}
        }
    });

    // var minioClient = new Minio.Client({
    //     endPoint: 'play.min.io',
    //     port: 9000,
    //     useSSL: true,
    //     accessKey: 'Q3AM3UQ867SPQQA43P2F',
    //     secretKey: 'zuf+tfteSlswRu7BJ86wekitnifILbZam1KYY3TG'
    // });

    // function sleep(ms) {
    //     return new Promise(resolve => setTimeout(resolve, ms));
    // }

    // var x = 0;
    // while (true) {
    //     this.status({fill:"blue",shape:"ring",text:"Connecting..."});
    //     if (minioClient || x > 100) {
    //         break;
    //     }
    //     x += 1;
    //     await sleep(100);
    // }

    // if (minioClient) {
    //     this.status({fill:"green",shape:"dot",text:"Connected"});
    // } else {
    //     this.status({fill:"red",shape:"ring",text:"Connection Error"});
    // }

}