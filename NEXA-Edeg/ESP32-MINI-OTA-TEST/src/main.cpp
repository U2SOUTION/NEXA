#include <Arduino.h>
#include <WiFi.h>
#include <ArduinoOTA.h>

// 현재 동작 모드: WiFi 클라이언트 모드 (DHCP 사용)
// - 외부 WiFi 네트워크에 연결
// - DHCP를 통한 자동 IP 할당
// - OTA 기능은 클라이언트 모드에서도 작동 가능
//
// 향후 계획:
// - 외부 웹소켓 서버와 연결
// - 서버로부터 업데이트 신호 수신
// - 서버에 있는 펌웨어 데이터를 받아 업데이트

// WiFi 설정 (개방형 WiFi)
const char* ssid = "U2";
const char* password = "";

// OTA 설정
const char* hostname = "ESP32-C3-OTA";

// LED 핀 정의 (ESP32-C3 SuperMini의 내장 LED는 GPIO8)
#define LED_PIN 8

void setup() {
  // 시리얼 통신 시작
  Serial.begin(115200);
  delay(2000);  // 시리얼 통신 안정화를 위한 대기
  Serial.println("\n시작합니다...");

  // LED 핀을 출력으로 설정
  pinMode(LED_PIN, OUTPUT);

  // WiFi 초기화
  Serial.println("WiFi 초기화 중...");
  WiFi.disconnect(true);  // 이전 연결 정보 삭제
  delay(3000);  // 초기화 대기 시간 증가
  WiFi.mode(WIFI_STA);    // Station 모드로 설정
  delay(3000);  // 모드 설정 대기 시간 증가

  // WiFi 연결 (DHCP 사용)
  Serial.println("WiFi 연결 시도 중...");
  Serial.print("SSID: ");
  Serial.println(ssid);
  Serial.print("초기 WiFi 상태: ");
  Serial.println(WiFi.status());
  
  // 연결 시도
  WiFi.begin(ssid);
  delay(3000);  // 연결 시도 전 대기
  
  // 연결 시도 중 LED 깜빡임
  int attempts = 0;
  bool connected = false;
  
  while (!connected && attempts < 20) {  // 시도 횟수 감소
    digitalWrite(LED_PIN, HIGH);
    delay(200);
    digitalWrite(LED_PIN, LOW);
    delay(200);
    attempts++;
    Serial.print(".");
    
    // 5번 시도마다 상태 출력
    if (attempts % 5 == 0) {
      Serial.println();
      Serial.print("연결 시도 횟수: ");
      Serial.println(attempts);
      Serial.print("현재 WiFi 상태: ");
      switch(WiFi.status()) {
        case WL_IDLE_STATUS: Serial.println("대기 중"); break;
        case WL_NO_SSID_AVAIL: Serial.println("SSID를 찾을 수 없음"); break;
        case WL_CONNECT_FAILED: Serial.println("연결 실패"); break;
        case WL_CONNECTION_LOST: Serial.println("연결 끊김"); break;
        case WL_DISCONNECTED: Serial.println("연결 해제됨"); break;
        case WL_CONNECTED: 
          Serial.println("연결됨!");
          connected = true;
          break;
        default: Serial.println(WiFi.status()); break;
      }
      
      // 연결이 계속 실패하면 WiFi 재시작
      if (attempts == 10) {
        Serial.println("WiFi 재시작 시도...");
        WiFi.disconnect();
        delay(3000);
        WiFi.mode(WIFI_STA);
        delay(3000);
        WiFi.begin(ssid);
        delay(3000);
      }
    }
  }
  Serial.println();

  // WiFi 연결 상태 확인
  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("WiFi 연결됨!");
    Serial.print("할당된 IP 주소: ");
    Serial.println(WiFi.localIP());
    Serial.print("WiFi 신호 강도: ");
    Serial.println(WiFi.RSSI());
    Serial.print("게이트웨이 IP: ");
    Serial.println(WiFi.gatewayIP());
  } else {
    Serial.println("WiFi 연결 실패!");
    Serial.print("연결 상태 코드: ");
    Serial.println(WiFi.status());
    Serial.println("ESP32를 재시작해주세요.");
  }

  // OTA 설정
  ArduinoOTA.setHostname(hostname);
  ArduinoOTA.begin();
  Serial.println("OTA 준비 완료!");
}

void loop() {
  // WiFi 연결 상태 확인
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("WiFi 연결이 끊어졌습니다. 재연결 시도...");
    WiFi.disconnect();
    delay(3000);
    WiFi.mode(WIFI_STA);
    delay(3000);
    WiFi.begin(ssid);
    delay(5000);  // 재연결 시도 전 대기
    return;
  }

  // LED 켜기
  digitalWrite(LED_PIN, HIGH);
  delay(1000);

  // LED 끄기
  digitalWrite(LED_PIN, LOW);
  delay(2000);

  Serial.print("현재 IP 주소: ");
  Serial.println(WiFi.localIP());

  // OTA 요청 처리
  ArduinoOTA.handle();
}