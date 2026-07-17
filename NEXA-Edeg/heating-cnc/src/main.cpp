/**
 * Heating CNC Edge — Phase 2 scaffold
 *
 * Replace with FluidNC fork + tri_link_watchdog + stall_guard integration.
 * Until then, use NEXA-Platform device-sim for WSS device leg testing.
 */

#include <Arduino.h>

#ifndef HEATING_CNC_DEVICE_ID
#define HEATING_CNC_DEVICE_ID "turning-01"
#endif

void setup() {
  Serial.begin(115200);
  delay(500);
  Serial.println("[heating-cnc] scaffold — use device-sim until firmware Phase 2.1");
  Serial.printf("device_id=%s\n", HEATING_CNC_DEVICE_ID);
}

void loop() {
  delay(1000);
}
