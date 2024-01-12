(function () {
    'use strict';
    var node, arr, time;
    node = document.getElementsByClassName('random-quotes');
    if (node.length === 0) {
        /*global console:false */
        console.error('random-quotes is undefined');
        return false;
    }
    time = 40000;
    arr = [];
    arr[0] = '仰望星空，脚踏实地';
    arr[1] = '聚散云相似，圆缺月依然';
    arr[2] = '如竟此后没有炬火，我便是那唯一的光';
    arr[3] = '海内存知己，天涯若比邻';
    arr[4] = 'Flee as a bird to your mountain.';
    arr[5] = '我本将心向明月，奈何明月照沟渠';
    arr[6] = 'I would rather share one life time with you, than face all the ages of this world alone.';
    arr[7] = '随风潜入夜，润物细无声';
    arr[8] = '我见过那样的春天，大地飞花，你在面前';
    arr[9] = '蓦然回首，那人却在，灯火阑珊处';
    function random() {
        var i, num;
        /*jslint plusplus: true */
        for (i = 0; i < node.length; i++) {
            num = Math.floor(Math.random() * arr.length);
            if (node[i].getAttribute('random-time') && !isNaN(node[i].getAttribute('random-time'))) {
                time = node[i].getAttribute('random-time');
            }
            node[i].innerHTML = arr[num];
        }
        setTimeout(random, time);
    }
    random();
}());