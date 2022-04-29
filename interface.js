var mqtt;

document.addEventListener("DOMContentLoaded", function(e) {
    conectaMQTT();
});

function conectaMQTT() {
    mqtt = new Paho.MQTT.Client("broker.hivemq.com", 8000, "clientjs");
    var options = {
        timeout: 3,
        onSuccess: inscreveMQTT,
    };
    mqtt.onMessageArrived = recebeMensagem;
    mqtt.connect(options);
}

function inscreveMQTT() {
    console.log("inscreve");
    mqtt.subscribe("fse2021/180096991/#");
    mqtt.subscribe("fse2021/180096991/dispositivos/#");
}

function recebeMensagem(msg) {
    let mensagem = msg.payloadString;
    console.log('mensagem: ',mensagem);
}