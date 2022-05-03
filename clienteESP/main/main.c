#include <stdio.h>
#include <string.h>

#include "nvs_flash.h"
#include "esp_wifi.h"
#include "esp_event.h"
#include "esp_http_client.h"
#include "esp_log.h"
#include "esp_mac.h"
#include "freertos/semphr.h"

#include "wifi.h"
#include "mqtt.h"

SemaphoreHandle_t conexaoWifiSemaphore;
SemaphoreHandle_t conexaoMQTTSemaphore;

char idDispositivo[19];
char topicoDispositivo[50];


void defineMacAdress() {
  uint8_t mac_base[6];
  esp_efuse_mac_get_default(mac_base);
  sprintf(idDispositivo,"%02x:%02x:%02x:%02x:%02x:%02x", mac_base[0] & 0xff, mac_base[1] & 0xff, mac_base[2] & 0xff, mac_base[3] & 0xff, mac_base[4] & 0xff, mac_base[5] & 0xff);
  ESP_LOGI("MAC ADRESS", "ID DISPOSITIVO: %s", idDispositivo);
}

void envia_mensagem_inicializacao() {
  mqtt_envia_mensagem(topicoDispositivo, idDispositivo);
}

void conectadoWifi(void * params) {
  while(true) {
    if(xSemaphoreTake(conexaoWifiSemaphore, portMAX_DELAY)) {
      // Processamento Internet
      mqtt_start();
      mqtt_inicia_cliente();
      mqtt_inscreve_cliente(topicoDispositivo);
      envia_mensagem_inicializacao();
    }
  }
}

void app_main(void)
{
    // Inicializa o NVS
    esp_err_t ret = nvs_flash_init();
    if (ret == ESP_ERR_NVS_NO_FREE_PAGES || ret == ESP_ERR_NVS_NEW_VERSION_FOUND) {
      ESP_ERROR_CHECK(nvs_flash_erase());
      ret = nvs_flash_init();
    }
    ESP_ERROR_CHECK(ret);
    
    conexaoWifiSemaphore = xSemaphoreCreateBinary();
    conexaoMQTTSemaphore = xSemaphoreCreateBinary();
    wifi_start();

    defineMacAdress();
    strcpy(topicoDispositivo, "fse2021/180096991/dispositivos/");
    strcat(topicoDispositivo, idDispositivo);

    xTaskCreate(&conectadoWifi,  "Conexão ao MQTT", 4096, NULL, 1, NULL);
    
}
