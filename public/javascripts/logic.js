// const swal = require('sweetalert')

var app = new Vue({
    el: "#log",
    data: {
        worker_name: "佘国榛",
        logs: [],
        content: {},
        show_table: true,
        show_detail: false
    },
    methods: {
        search: function () {
            var that = this;
            $.ajax({
                method: 'POST',
                url: '/log/worker/search_log',
                data: {worker_name: this.worker_name},
                success: function (res) {
                    console.log(res);
                    that.logs = res;
                },
            });

            that.show_table = true;
            that.show_detail = false;
        },


        //从web端上传日志
        submit: function () {
            var that = this;
            console.log(that.content);
            swal({
                title: '提交成功',
                text: '新的一天要开心',
                type: 'success',
                confirmButtonText: 'Cool'
            })
            $.ajax({
                method: 'POST',
                url: '/log/worker/words',
                data: that.content,
                success: function (res) {
                    console.log(res);
                },
            });
        },


        detail: function (index) {
            var that = this;
            that.content = that.logs[index];
            console.log(index);
            console.log(that.content);
            that.show_table = false;
            that.show_detail = true;
        },

        backToDetail: function () {
            var that = this;
            that.show_table = true;
            that.show_detail = false;
        }
    }

});
