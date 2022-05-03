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

char idDispositivo[13];

void conectadoWifi(void * params) {
  while(true) {
    if(xSemaphoreTake(conexaoWifiSemaphore, portMAX_DELAY)) {
      // Processamento Internet
      mqtt_start();
    }
  }
}

void defineMacAdress() {
  uint8_t mac_base[6] = {0};
  esp_efuse_mac_get_default(mac_base);
  sprintf(idDispositivo,"%02x:%02x:%02x:%02x:%02x:%02x", mac_base[0], mac_base[1], mac_base[2], mac_base[3], mac_base[4], mac_base[5]);
  ESP_LOGI("MAC ADRESS", "ID DISPOSITIVO: %s", idDispositivo);
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

    xTaskCreate(&conectadoWifi,  "Conexão ao MQTT", 4096, NULL, 1, NULL);
    
}
