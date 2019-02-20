export default {
    "baseUrl": 'http://chenyufen1.edusoho.cn/api/drag_captcha',
    "requestOtption": {
        "async": true,
        "crossDomain": true,
        "headers": {
            "Accept": "application/vnd.edusoho.v2+json",
            // "cache-control": "no-cache",
            // "Postman-Token": "a8d07797-7410-4b79-98eb-f342f4087bfa"
        },
    },
    "boxStyle": {
        "width": "100%",
        "height": "250px",
    },
    "dragImgBoxStyle": {
        "width": "320px",
        "height": "144px",
    },
    "switchBoxStyle": {
        "width": "320px",
        "height": "40px",
    },
    "loadingStyle": {
        "background": "url('../images/loading-bg.png)no-repeat",
        "background-color": "#f7f9fa",
        "background-position": "50%",
        "background-size": 'cover',
        // "background": "url('../images/qm.log.jpg')no-repeat",
        // "background-size": "45%",
        // "background-position": "50% 0px"
    }
}