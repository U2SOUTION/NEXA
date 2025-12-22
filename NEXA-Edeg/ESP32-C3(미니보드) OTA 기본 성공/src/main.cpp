#include <Arduino.h>
#include <WiFi.h>
#include <ESPmDNS.h>
#include <WiFiUdp.h>
#include <ArduinoOTA.h>

// WiFi 설정 (본인의 WiFi 정보로 변경)
const char* ssid = "U2";
const char* password = "";

// ESP32-C3 내장 LED
#define LED_PIN 8

void setup() {
    // USB CDC 시리얼 초기화
    Serial.begin(115200);
    delay(2000);
    Serial.println("ESP32-C3 OTA 테스트 시작!");
    
    // LED 설정
    pinMode(LED_PIN, OUTPUT);
    digitalWrite(LED_PIN, HIGH); // OFF (Active Low)
    
    // WiFi 네트워크 스캔 (디버깅용)
    Serial.println("WiFi 네트워크 스캔 중...");
    int n = WiFi.scanNetworks();
    Serial.printf("발견된 네트워크: %d개\n", n);
    
    for (int i = 0; i < n; ++i) {
        Serial.printf("%d: %s (%d dBm) %s\n", 
                     i + 1, 
                     WiFi.SSID(i).c_str(), 
                     WiFi.RSSI(i),
                     WiFi.encryptionType(i) == WIFI_AUTH_OPEN ? "개방" : "암호화");
    }
    Serial.println("");
    
    // WiFi 연결
    WiFi.mode(WIFI_STA);
    
    // 개방형 WiFi 연결 (패스워드 없음)
    if (strlen(password) == 0) {
        WiFi.begin(ssid);
        Serial.printf("개방형 WiFi '%s'에 연결 시도...\n", ssid);
    } else {
        WiFi.begin(ssid, password);
        Serial.printf("WiFi '%s'에 연결 시도...\n", ssid);
    }
    
    int attempts = 0;
    while (WiFi.status() != WL_CONNECTED && attempts < 40) {
        delay(500);
        Serial.print(".");
        digitalWrite(LED_PIN, !digitalRead(LED_PIN));
        attempts++;
        
        // 20초마다 상태 출력
        if (attempts % 40 == 0) {
            Serial.printf("\n연결 시도 %d번째, 상태: %d\n", attempts, WiFi.status());
        }
    }
    
    if (WiFi.status() != WL_CONNECTED) {
        Serial.println("\nWiFi 연결 실패!");
        Serial.println("가능한 원인:");
        Serial.println("1. SSID 이름 확인");
        Serial.println("2. WiFi 신호 강도 확인");
        Serial.println("3. 라우터 설정 확인");
        return; // setup() 종료
    }
    
    Serial.println("");
    Serial.println("WiFi 연결 성공!");
    Serial.print("IP 주소: ");
    Serial.println(WiFi.localIP());
    
    // LED 켜짐 (연결 성공)
    digitalWrite(LED_PIN, LOW);
    
    // OTA 설정
    ArduinoOTA.setHostname("ESP32-C3-OTA");
    ArduinoOTA.setPassword("admin"); // OTA 비밀번호 설정
    
    ArduinoOTA.onStart([]() {
        String type;
        if (ArduinoOTA.getCommand() == U_FLASH) {
            type = "sketch";
        } else { // U_SPIFFS
            type = "filesystem";
        }
        Serial.println("OTA 업데이트 시작: " + type);
        digitalWrite(LED_PIN, HIGH); // LED OFF
    });
    
    ArduinoOTA.onEnd([]() {
        Serial.println("\nOTA 업데이트 완료!");
        digitalWrite(LED_PIN, LOW); // LED ON
    });
    
    ArduinoOTA.onProgress([](unsigned int progress, unsigned int total) {
        unsigned int percent = (progress / (total / 100));
        Serial.printf("진행률: %u%%\r", percent);
        
        // 진행률에 따라 LED 깜빡임 속도 변경
        if (percent % 10 == 0) {
            digitalWrite(LED_PIN, !digitalRead(LED_PIN));
        }
    });
    
    ArduinoOTA.onError([](ota_error_t error) {
        Serial.printf("OTA 오류[%u]: ", error);
        if (error == OTA_AUTH_ERROR) {
            Serial.println("인증 실패");
        } else if (error == OTA_BEGIN_ERROR) {
            Serial.println("시작 실패");
        } else if (error == OTA_CONNECT_ERROR) {
            Serial.println("연결 실패");
        } else if (error == OTA_RECEIVE_ERROR) {
            Serial.println("수신 실패");
        } else if (error == OTA_END_ERROR) {
            Serial.println("종료 실패");
        }
        
        // 오류시 빠른 깜빡임
        for (int i = 0; i < 10; i++) {
            digitalWrite(LED_PIN, !digitalRead(LED_PIN));
            delay(100);
        }
    });
    
    ArduinoOTA.begin();
    Serial.println("OTA 준비 완료!");
    Serial.println("네트워크에서 'ESP32-C3-OTA' 장치를 찾을 수 있습니다.");
}

void loop() {
    ArduinoOTA.handle();
    
    // 일반 동작 (LED 천천히 깜빡임)
    static unsigned long lastBlink = 0;
    if (millis() - lastBlink > 2000) {
        digitalWrite(LED_PIN, !digitalRead(LED_PIN));
        lastBlink = millis();
        
        Serial.print("업타임: ");
        Serial.print(millis() / 1000);
        Serial.print("초, IP: ");
        Serial.println(WiFi.localIP());
    }
    
    delay(100);
}
