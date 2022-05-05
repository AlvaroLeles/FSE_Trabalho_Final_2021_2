#include <stdio.h>
#include <string.h>

#include "nvs_flash.h"
#include "esp_wifi.h"
#include "esp_event.h"
#include "esp_http_client.h"
#include "esp_log.h"
#include "esp_mac.h"
#include "freertos/semphr.h"
#include "driver/gpio.h"

#include "wifi.h"
#include "mqtt.h"

#define LED 2
#define BOTAO 0

SemaphoreHandle_t conexaoWifiSemaphore;
SemaphoreHandle_t conexaoMQTTSemaphore;
SemaphoreHandle_t msgConfigMQTTSemaphore;
QueueHandle_t filaDeInterrupcao;;

char idDispositivo[19];
char topicoDispositivo[50];
char topicoEstado[50];
char comodo[15];
char estadoCentral[3];

int estadoLed = 0;

void defineMacAdress() {
  uint8_t mac_base[6];
  esp_efuse_mac_get_default(mac_base);
  sprintf(idDispositivo,"%02x:%02x:%02x:%02x:%02x:%02x", mac_base[0] & 0xff, mac_base[1] & 0xff, mac_base[2] & 0xff, mac_base[3] & 0xff, mac_base[4] & 0xff, mac_base[5] & 0xff);
  ESP_LOGI("MAC ADRESS", "ID DISPOSITIVO: %s", idDispositivo);
}

void enviaMensagemInicializacao() {
  mqtt_envia_mensagem(topicoDispositivo, idDispositivo);
}

void enviaMensagemEstado() {
  char mensagem[100];
  char estado[2];
  sprintf(estado, "%d", estadoLed);
  strcpy(mensagem, idDispositivo);
  strcat(mensagem, "+");
  strcat(mensagem, estado);
  strcat(mensagem, "+");
  strcat(mensagem, comodo);
  mqtt_envia_mensagem(topicoDispositivo, mensagem);
}

void conectadoWifi(void * params) {
  while(true) {
    if(xSemaphoreTake(conexaoWifiSemaphore, portMAX_DELAY)) {
      // Processamento Internet
      mqtt_start();

      if(xSemaphoreTake(conexaoMQTTSemaphore, portMAX_DELAY)){
        mqtt_inicia_cliente();
        mqtt_inscreve_cliente(topicoDispositivo);
        enviaMensagemInicializacao();
      
        if(xSemaphoreTake(msgConfigMQTTSemaphore, portMAX_DELAY)) {
          strcpy(topicoEstado, "fse2021/180096991/");
          strcat(topicoEstado, comodo);
          strcat(topicoEstado, "/estado");
          mqtt_inscreve_cliente(topicoEstado);
          ESP_LOGI("TOPICO", "topico para estado: %s", topicoEstado);
        }

      }
        
    }
  }
}

static void IRAM_ATTR gpio_isr_handler(void *args){
    int pino = (int)args;
    xQueueSendFromISR(filaDeInterrupcao, &pino, NULL);
}

void trataGpio(void * params) {
  int pino;
  while(true) {
    if (xQueueReceive(filaDeInterrupcao, &pino, portMAX_DELAY)) {
      int estado = gpio_get_level(pino);
      if (estado == 0) {
        gpio_isr_handler_remove(pino);

        while(gpio_get_level(pino) == estado) {
          vTaskDelay(1 / portTICK_PERIOD_MS);
          gpio_set_level(LED, !estadoLed);
        }
        estadoLed = !estadoLed;
        ESP_LOGI("ESTAADOO", "topicoEstado: %s", topicoEstado);
        enviaMensagemEstado();

        vTaskDelay(50 / portTICK_PERIOD_MS);
        gpio_isr_handler_add(pino, gpio_isr_handler, (void *) pino);

      }
      else {
        gpio_set_level(LED, 0);
      }
    }
  }
}

void configuraInterrupcao(){
    filaDeInterrupcao = xQueueCreate(10, sizeof(int));
    xTaskCreate(trataGpio, "Trata Botao", 2048, NULL, 1, NULL);

    gpio_install_isr_service(0);
    gpio_isr_handler_add(BOTAO, gpio_isr_handler, (void *) BOTAO);
}

void configuraBotaoLed() {
  esp_rom_gpio_pad_select_gpio(LED);
  gpio_set_direction(LED, GPIO_MODE_OUTPUT);

  esp_rom_gpio_pad_select_gpio(BOTAO);
  gpio_set_direction(BOTAO, GPIO_MODE_INPUT);

  gpio_pulldown_en(BOTAO);
  gpio_pullup_dis(BOTAO);

  gpio_set_intr_type(BOTAO, GPIO_INTR_NEGEDGE);
  configuraInterrupcao();
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

    configuraBotaoLed();
    
    conexaoWifiSemaphore = xSemaphoreCreateBinary();
    conexaoMQTTSemaphore = xSemaphoreCreateBinary();
    msgConfigMQTTSemaphore = xSemaphoreCreateBinary();

    wifi_start();

    defineMacAdress();
    strcpy(topicoDispositivo, "fse2021/180096991/dispositivos/");
    strcat(topicoDispositivo, idDispositivo);

    xTaskCreate(&conectadoWifi,  "Conexão ao MQTT", 4096, NULL, 1, NULL);
    // filaDeInterrupcao = xQueueCreate(10, sizeof(int));
    // xTaskCreate(&trataGpio, "Trata GPIO", 2048, NULL, 1, NULL);
    
}
